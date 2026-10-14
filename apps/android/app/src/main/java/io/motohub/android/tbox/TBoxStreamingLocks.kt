// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vincenzo Buonomano and the MOTO-HUB contributors.
// Part of MOTO-HUB. Free software under the GNU AGPL v3; see LICENSE.
package io.motohub.android.tbox

import android.content.Context
import android.net.wifi.WifiManager
import android.os.PowerManager
import io.motohub.android.session.ProjectionEventLog

/** Keeps the phone CPU and Wi-Fi path awake while a T-Box video stream is active. */
class TBoxStreamingLocks(
    context: Context,
    private val logTag: String
) {
    // A Service may instantiate this helper before attachBaseContext(). Do not touch the context
    // until acquire(), which runs after the service is attached and in the foreground.
    private val componentContext = context
    private var wifiManager: WifiManager? = null
    private var powerManager: PowerManager? = null
    private var lowLatencyLock: WifiManager.WifiLock? = null
    private var highPerformanceLock: WifiManager.WifiLock? = null
    private var cpuWakeLock: PowerManager.WakeLock? = null

    fun acquire() {
        try {
            val manager = wifiManager ?: componentContext.getSystemService(WifiManager::class.java)
                ?.also { wifiManager = it }
            val pManager = powerManager ?: componentContext.getSystemService(PowerManager::class.java)
                ?.also { powerManager = it }

            if (pManager != null && cpuWakeLock == null) {
                cpuWakeLock = pManager.newWakeLock(
                    PowerManager.PARTIAL_WAKE_LOCK,
                    "MOTO-HUB:$logTag:cpu-streaming"
                ).apply { setReferenceCounted(false) }
            }
            if (cpuWakeLock?.isHeld != true) {
                // Cap wake lock to 4 hours as a safety net against orphaned processes
                cpuWakeLock?.acquire(STREAMING_WAKE_LOCK_TIMEOUT_MS)
            }

            if (manager != null) {
                @Suppress("DEPRECATION")
                if (lowLatencyLock == null) {
                    lowLatencyLock = manager.createWifiLock(
                        WifiManager.WIFI_MODE_FULL_LOW_LATENCY,
                        "MOTO-HUB:$logTag:low-latency"
                    ).apply { setReferenceCounted(false) }
                }
                @Suppress("DEPRECATION")
                if (highPerformanceLock == null) {
                    highPerformanceLock = manager.createWifiLock(
                        WifiManager.WIFI_MODE_FULL_HIGH_PERF,
                        "MOTO-HUB:$logTag:high-performance"
                    ).apply { setReferenceCounted(false) }
                }
                var acquired = false
                if (lowLatencyLock?.isHeld != true) {
                    lowLatencyLock?.acquire()
                    acquired = true
                }
                if (highPerformanceLock?.isHeld != true) {
                    highPerformanceLock?.acquire()
                    acquired = true
                }
                if (acquired) {
                    ProjectionEventLog.record("NETWORK", "$logTag Wi-Fi streaming locks acquired.")
                }
            }
        } catch (failure: Throwable) {
            ProjectionEventLog.warning(
                "NETWORK",
                "$logTag streaming locks unavailable; continuing with Android defaults.",
                failure
            )
        }
    }

    fun release() {
        runCatching { if (lowLatencyLock?.isHeld == true) lowLatencyLock?.release() }
        runCatching { if (highPerformanceLock?.isHeld == true) highPerformanceLock?.release() }
        runCatching { if (cpuWakeLock?.isHeld == true) cpuWakeLock?.release() }
        lowLatencyLock = null
        highPerformanceLock = null
        cpuWakeLock = null
    }

    companion object {
        private const val STREAMING_WAKE_LOCK_TIMEOUT_MS = 4 * 60 * 60 * 1_000L
    }
}

// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vincenzo Buonomano and the MOTO-HUB contributors.
// Part of MOTO-HUB. Free software under the GNU AGPL v3; see LICENSE.
package io.motohub.android.tbox

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emptyFlow
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import io.motohub.android.tbox.TBoxSessionHandle
import io.motohub.android.tbox.TBoxHost
import io.motohub.android.tbox.TBoxTransport
import io.motohub.android.tbox.TBoxLink
import io.motohub.android.tbox.TBoxNetworkConnector
import io.motohub.android.session.MotorcycleProfile
import io.motohub.android.session.ProjectionEventLog
import java.net.InetAddress
import java.net.Inet4Address

/**
 * The rule that stops one mode from ending a session another mode is still streaming on.
 *
 * Covers the bookkeeping only; matching the handle and dropping the link need a Context and stay
 * outside unit tests.
 */
class TBoxSessionRegistryClaimTest {
    private val consumers = SessionConsumers()

    @Before
    fun setUp() {
        ProjectionEventLog.setIsLoggingEnabledForTests(false)
    }

    @After
    fun tearDown() {
        ProjectionEventLog.setIsLoggingEnabledForTests(null)
    }

    @Test
    fun `the only holder releasing is the last one out`() {
        consumers.claim("ride-dashboard")

        assertTrue(consumers.releaseIsLast("ride-dashboard"))
    }

    @Test
    fun `a second holder keeps the session alive`() {
        consumers.claim("ride-dashboard")
        consumers.claim("android-auto")

        assertFalse(consumers.releaseIsLast("android-auto"))
        assertEquals("ride-dashboard", consumers.describe())
    }

    @Test
    fun `releasing a mode that never claimed does not free the session`() {
        consumers.claim("ride-dashboard")

        assertFalse(consumers.releaseIsLast("mirroring"))
    }

    @Test
    fun `claiming twice is idempotent so one release still frees the session`() {
        assertTrue(consumers.claim("android-auto"))
        assertFalse(consumers.claim("android-auto"))

        assertTrue(consumers.releaseIsLast("android-auto"))
    }

    @Test
    fun `a fresh session starts with no holders`() {
        consumers.claim("android-auto")
        consumers.clear()

        assertTrue(consumers.releaseIsLast("ride-dashboard"))
        assertEquals("", consumers.describe())
    }

    /**
     * What the AIDL connect guard asks before it takes the dash: a companion reconnecting on the
     * session it already holds is not a conflict, a mode inside Core is. Field log adb68a95
     * (2026-08-31) is the case where the question was never asked at all.
     */
    @Test
    fun `the companion's own claim does not count as somebody else holding the dash`() {
        consumers.claim("companion-app")

        assertEquals("", consumers.describeOthers("companion-app"))
    }

    @Test
    fun `a mode inside Core does count, even beside the companion's own claim`() {
        consumers.claim("companion-app")
        consumers.claim("android-auto")

        assertEquals("android-auto", consumers.describeOthers("companion-app"))
    }

    @Test
    fun `every other holder is named, in the order they claimed`() {
        consumers.claim("android-auto")
        consumers.claim("companion-app")
        consumers.claim("mirroring")

        assertEquals("android-auto, mirroring", consumers.describeOthers("companion-app"))
    }

    /**
     * A release with a stale handle must not remove the consumer from the current session.
     *
     * This is the regression for the bug where `releaseAndClear("AA", handleSession1)` would call
     * `releaseIsLast("AA")` — already removing "AA" from consumers — before checking that the
     * passed handle does not match `activeHandle`. The consumer was "burned": removed from the set
     * but no action taken because the handles did not match.
     */
    @Test
    fun `releaseAndClear with a stale handle leaves the consumer on the current session`() {
        val session1 = TBoxSessionHandle(
            transport = mockTransport,
            host = TBoxHost("192.168.1.1", 5000, "io.motohub.android.tbox.test"),
            networkConnector = mockConnector,
            motorcycle = MotorcycleProfile("ssid-1", "pw-1"),
            link = mockLink
        )
        val session2 = TBoxSessionHandle(
            transport = mockTransport,
            host = TBoxHost("192.168.1.2", 5000, "io.motohub.android.tbox.test"),
            networkConnector = mockConnector,
            motorcycle = MotorcycleProfile("ssid-2", "pw-2"),
            link = mockLink
        )

        // Session 1 installed and claimed by "AA"
        TBoxSessionRegistry.install(session1)
        assertTrue(TBoxSessionRegistry.claim("android-auto"))
        assertEquals("android-auto", TBoxSessionRegistry.activeConsumers())

        // Session 2 replaces session 1, still claimed by "AA"
        TBoxSessionRegistry.install(session2)
        assertEquals("android-auto", TBoxSessionRegistry.activeConsumers())

        // Release AA with the OLD handle — should return false and leave AA on session2
        val result = TBoxSessionRegistry.releaseAndClear("android-auto", session1)
        assertFalse("stale handle must not clear the session", result)
        assertEquals(
            "consumer must remain on the current (session2) registry",
            "android-auto",
            TBoxSessionRegistry.activeConsumers()
        )

        // Now releasing with the CORRECT handle works
        val result2 = TBoxSessionRegistry.releaseAndClear("android-auto", session2)
        assertTrue("release with correct handle must clear", result2)
        assertEquals("", TBoxSessionRegistry.activeConsumers())
    }
}

// --- Test doubles (top-level to avoid Gradle BuildToolsApiClasspathEntrySnapshotTransform) ---

private object mockTransport : TBoxTransport {
    override suspend fun discover(link: TBoxLink, expectedModelId: String?): Result<TBoxHost> =
        Result.failure(IllegalStateException("mock"))

    override suspend fun start(host: TBoxHost): Result<Unit> =
        Result.success(Unit)

    override fun offerAccessUnit(avcc: ByteArray): Boolean = true

    override suspend fun stop() = Unit

    override val events: Flow<TBoxEvent> = emptyFlow()
}

private val mockLink: TBoxLink = TBoxLink.WifiDirect(
    bindIp = InetAddress.getByName("127.0.0.1") as Inet4Address,
    gatewayIp = InetAddress.getByName("127.0.0.1") as Inet4Address,
    leaveGroup = { /* no-op */ }
)

/**
 * Minimal Connector for unit tests: no Context means ConnectivityManager/WifiManager are never
 * reachable, but these tests exercise only bookkeeping (claim/release), never network calls.
 */
private val mockConnector: TBoxNetworkConnector = TBoxNetworkConnector()

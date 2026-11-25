import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActiveProjectionMode,
  AndroidAutoDisplayMode,
  AutostartService,
  ConnectionState,
  HubDestination,
  HubTab,
  MotoHubSettingsState,
  MotorcycleProfile,
  ProjectionEvent,
  SessionPhase,
  TBoxConnectionMode,
} from './types/motohub';
import {
  loadActiveProfileId,
  loadLogs,
  loadProfiles,
  loadSettings,
  saveActiveProfileId,
  saveLogs,
  saveProfiles,
  saveSettings,
} from './lib/storage';
import { TBoxQrPayload } from './lib/qrParser';
import { ConnectionRail, HubAppBar, HubBottomNavigation } from './components/MotoHubUi';
import { RideScreen } from './screens/RideScreen';
import { GarageScreen } from './screens/GarageScreen';
import { SettingsDetail, SettingsScreen } from './screens/SettingsScreen';
import { ManualPairingScreen, QrPairingScreen } from './screens/PairingFlows';

type PairingOverlay = null | 'scan' | 'import' | 'manual';

function resolveDestination(
  motorcycle: MotorcycleProfile | null,
  phase: SessionPhase,
  activeMode: ActiveProjectionMode
): HubDestination {
  if (!motorcycle) return HubDestination.PAIRING;
  if (
    phase === SessionPhase.CONNECTING_NETWORK ||
    phase === SessionPhase.DISCOVERING_TBOX
  ) {
    return HubDestination.CONNECTING;
  }
  if (
    activeMode !== 'NONE' ||
    phase === SessionPhase.REQUESTING_PROJECTION ||
    phase === SessionPhase.CAPTURING
  ) {
    return HubDestination.ACTIVE_SESSION;
  }
  if (phase === SessionPhase.READY) {
    return HubDestination.MODE_SELECTION;
  }
  return HubDestination.CONNECTION;
}

function resolveConnectionState(
  phase: SessionPhase,
  activeMode: ActiveProjectionMode
): ConnectionState {
  if (
    phase === SessionPhase.CONNECTING_NETWORK ||
    phase === SessionPhase.DISCOVERING_TBOX ||
    phase === SessionPhase.REQUESTING_PROJECTION
  ) {
    return ConnectionState.CONNECTING;
  }
  if (
    phase === SessionPhase.READY ||
    phase === SessionPhase.CAPTURING ||
    activeMode !== 'NONE'
  ) {
    return ConnectionState.CONNECTED;
  }
  return ConnectionState.DISCONNECTED;
}

function makeProfileId(ssid: string): string {
  const slug = ssid
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'bike'}-${Date.now().toString(36)}`;
}

export default function App() {
  const [profiles, setProfiles] = useState<MotorcycleProfile[]>(() => loadProfiles());
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() =>
    loadActiveProfileId(loadProfiles())
  );
  const [settings, setSettings] = useState<MotoHubSettingsState>(() => loadSettings());
  const [logs, setLogs] = useState<ProjectionEvent[]>(() => loadLogs());

  const [selectedTab, setSelectedTab] = useState<HubTab>(HubTab.RIDE);
  const [settingsDetail, setSettingsDetail] = useState<SettingsDetail>(null);
  const [pairingOverlay, setPairingOverlay] = useState<PairingOverlay>(null);

  const [phase, setPhase] = useState<SessionPhase>(SessionPhase.IDLE);
  const [activeMode, setActiveMode] = useState<ActiveProjectionMode>('NONE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dimDisplayEnabled, setDimDisplayEnabled] = useState(false);
  const [aoaAccessoryConnected, setAoaAccessoryConnected] = useState(false);

  const timersRef = useRef<number[]>([]);

  const clearPendingTimers = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearPendingTimers(), [clearPendingTimers]);

  useEffect(() => {
    saveProfiles(profiles);
  }, [profiles]);

  useEffect(() => {
    saveActiveProfileId(activeProfileId);
  }, [activeProfileId]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  const activeMotorcycle = useMemo(() => {
    if (!activeProfileId) return profiles[0] ?? null;
    return profiles.find((p) => p.id === activeProfileId) ?? profiles[0] ?? null;
  }, [profiles, activeProfileId]);

  const appendLog = useCallback(
    (source: string, message: string) => {
      if (!settings.loggingEnabled && source !== 'APP') return;
      const entry: ProjectionEvent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        source,
        message,
      };
      setLogs((prev) => [...prev.slice(-199), entry]);
    },
    [settings.loggingEnabled]
  );

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timersRef.current.push(id);
  }, []);

  const launchProjection = useCallback(
    (mode: Exclude<ActiveProjectionMode, 'NONE'>, label: string) => {
      clearPendingTimers();
      setErrorMessage(null);
      setActiveMode(mode);
      setPhase(SessionPhase.REQUESTING_PROJECTION);
      appendLog('PROJECTION', `Starting ${label} session...`);

      schedule(() => {
        setPhase(SessionPhase.CAPTURING);
        appendLog(
          'PROJECTION',
          `${label} streaming live (${settings.videoQuality} · ${settings.videoPowerMode}).`
        );
      }, 650);
    },
    [appendLog, clearPendingTimers, schedule, settings.videoPowerMode, settings.videoQuality]
  );

  const handleConnect = useCallback(() => {
    if (!activeMotorcycle) return;
    clearPendingTimers();
    setErrorMessage(null);
    setActiveMode('NONE');
    setPhase(SessionPhase.CONNECTING_NETWORK);
    appendLog(
      'TBOX',
      `Connecting to ${activeMotorcycle.displayName || activeMotorcycle.ssid} (${activeMotorcycle.ssid})...`
    );

    schedule(() => {
      setPhase(SessionPhase.DISCOVERING_TBOX);
      appendLog('TBOX', 'Wi-Fi link up. Discovering T-Box endpoints via NSD / TCP probe...');

      schedule(() => {
        setPhase(SessionPhase.READY);
        const host = activeMotorcycle.capabilitySnapshot?.hostIp ?? '192.168.43.1';
        const port = activeMotorcycle.capabilitySnapshot?.hostPort ?? 10925;
        appendLog('TBOX', `T-Box ready at ${host}:${port}. Handshake acknowledged.`);

        if (settings.dashClockSync) {
          appendLog('CLOCK', 'Synchronized motorcycle dash clock with phone time.');
        }

        if (settings.autostartEnabled) {
          const isAa = settings.autostartService === AutostartService.ANDROID_AUTO;
          launchProjection(
            isAa ? 'ANDROID_AUTO' : 'MIRROR',
            isAa ? 'Android Auto' : 'Screen Mirroring'
          );
        }
      }, 1050);
    }, 950);
  }, [
    activeMotorcycle,
    appendLog,
    clearPendingTimers,
    launchProjection,
    schedule,
    settings.autostartEnabled,
    settings.autostartService,
    settings.dashClockSync,
  ]);

  const handleCancelConnection = useCallback(() => {
    clearPendingTimers();
    setPhase(SessionPhase.IDLE);
    setActiveMode('NONE');
    appendLog('TBOX', 'Connection cancelled by user.');
  }, [appendLog, clearPendingTimers]);

  const handleDisconnect = useCallback(() => {
    clearPendingTimers();
    setPhase(SessionPhase.IDLE);
    setActiveMode('NONE');
    setDimDisplayEnabled(false);
    appendLog('TBOX', 'Disconnected from motorcycle T-Box.');
  }, [appendLog, clearPendingTimers]);

  const handleStopSession = useCallback(() => {
    clearPendingTimers();
    const wasPhoneOnly = activeMode === 'PHONE_ONLY_AA' || activeMode === 'EXTERNAL_USB';
    setActiveMode('NONE');
    setDimDisplayEnabled(false);
    setPhase(wasPhoneOnly ? SessionPhase.IDLE : SessionPhase.READY);
    appendLog('PROJECTION', 'Projection session stopped.');
  }, [activeMode, appendLog, clearPendingTimers]);

  const handleQrPaired = useCallback(
    (payload: TBoxQrPayload) => {
      const existing = profiles.find(
        (p) => p.ssid.toLowerCase() === payload.ssid.toLowerCase()
      );
      if (existing) {
        const updated: MotorcycleProfile = {
          ...existing,
          password: payload.password || existing.password,
          modelId: payload.modelId ?? existing.modelId,
          connectionMode: payload.suggestedConnectionMode ?? existing.connectionMode,
        };
        setProfiles((prev) => prev.map((p) => (p.id === existing.id ? updated : p)));
        setActiveProfileId(existing.id);
        appendLog('PAIRING', `Updated existing profile "${updated.displayName || updated.ssid}" from QR (${payload.dialect}).`);
      } else {
        const displayName = payload.displayName || payload.ssid;
        const created: MotorcycleProfile = {
          id: makeProfileId(payload.ssid),
          ssid: payload.ssid,
          password: payload.password,
          modelId: payload.modelId,
          displayName,
          photoUrl: null,
          fuelTankRangeKm: null,
          profileOverrideKey: null,
          connectionMode: payload.suggestedConnectionMode ?? TBoxConnectionMode.AUTO,
          displayMode: AndroidAutoDisplayMode.STRETCH,
          screenMargins: { top: 0, bottom: 0, left: 0, right: 0 },
        };
        setProfiles((prev) => [created, ...prev]);
        setActiveProfileId(created.id);
        appendLog('PAIRING', `Paired new motorcycle "${created.displayName}" (${payload.dialect}).`);
      }
      setPairingOverlay(null);
      setPhase(SessionPhase.IDLE);
      setActiveMode('NONE');
      setSelectedTab(HubTab.RIDE);
    },
    [appendLog, profiles]
  );

  const handleManualPaired = useCallback(
    (data: { ssid: string; password: string; connectionMode: TBoxConnectionMode }) => {
      const created: MotorcycleProfile = {
        id: makeProfileId(data.ssid),
        ssid: data.ssid,
        password: data.password,
        modelId: null,
        displayName: data.ssid,
        photoUrl: null,
        fuelTankRangeKm: null,
        profileOverrideKey: null,
        connectionMode: data.connectionMode,
        displayMode: AndroidAutoDisplayMode.STRETCH,
        screenMargins: { top: 0, bottom: 0, left: 0, right: 0 },
      };
      setProfiles((prev) => [created, ...prev]);
      setActiveProfileId(created.id);
      setPairingOverlay(null);
      setPhase(SessionPhase.IDLE);
      setActiveMode('NONE');
      setSelectedTab(HubTab.RIDE);
      appendLog('PAIRING', `Added manual profile "${created.ssid}" (${created.connectionMode}).`);
    },
    [appendLog]
  );

  const handleSelectMotorcycle = useCallback(
    (id: string) => {
      if (id === activeProfileId) return;
      clearPendingTimers();
      setActiveProfileId(id);
      setPhase(SessionPhase.IDLE);
      setActiveMode('NONE');
      setDimDisplayEnabled(false);
      const picked = profiles.find((p) => p.id === id);
      if (picked) {
        appendLog('GARAGE', `Active motorcycle switched to "${picked.displayName || picked.ssid}".`);
      }
    },
    [activeProfileId, appendLog, clearPendingTimers, profiles]
  );

  const handleUpdateProfile = useCallback(
    (updated: MotorcycleProfile) => {
      setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    },
    []
  );

  const handleDeleteProfile = useCallback(
    (id: string) => {
      const target = profiles.find((p) => p.id === id);
      const remaining = profiles.filter((p) => p.id !== id);
      setProfiles(remaining);
      if (activeProfileId === id) {
        clearPendingTimers();
        setActiveProfileId(remaining[0]?.id ?? null);
        setPhase(SessionPhase.IDLE);
        setActiveMode('NONE');
        setDimDisplayEnabled(false);
      }
      if (target) {
        appendLog('GARAGE', `Removed motorcycle profile "${target.displayName || target.ssid}".`);
      }
    },
    [activeProfileId, appendLog, clearPendingTimers, profiles]
  );

  const destination = resolveDestination(activeMotorcycle, phase, activeMode);
  const connectionState = resolveConnectionState(phase, activeMode);
  const isConnected = connectionState === ConnectionState.CONNECTED;

  return (
    <div className="flex h-dvh w-full items-center justify-center bg-[#060805] text-[#E8ECE2]">
      <div className="relative flex h-full w-full max-w-[460px] flex-col overflow-hidden bg-[#0B0D09] sm:h-[min(920px,96dvh)] sm:rounded-[30px] sm:border sm:border-[#1F241B] sm:shadow-[0_24px_80px_rgba(0,0,0,0.75)]">
        {pairingOverlay ? (
          pairingOverlay === 'manual' ? (
            <ManualPairingScreen
              onSave={handleManualPaired}
              onClose={() => setPairingOverlay(null)}
            />
          ) : (
            <QrPairingScreen
              mode={pairingOverlay}
              onPaired={handleQrPaired}
              onClose={() => setPairingOverlay(null)}
            />
          )
        ) : (
          <>
            <ConnectionRail state={connectionState} />
            <HubAppBar
              motorcycleName={
                activeMotorcycle
                  ? activeMotorcycle.displayName || activeMotorcycle.ssid
                  : null
              }
              isConnected={isConnected}
              onMotorcycleTap={() => setSelectedTab(HubTab.GARAGE)}
            />

            <main className="min-h-0 flex-1 overflow-hidden">
              {selectedTab === HubTab.RIDE && (
                <RideScreen
                  motorcycle={activeMotorcycle}
                  phase={phase}
                  destination={destination}
                  errorMessage={errorMessage}
                  activeMode={activeMode}
                  dimDisplayEnabled={dimDisplayEnabled}
                  aoaAccessoryConnected={aoaAccessoryConnected}
                  settings={settings}
                  onScanQr={() => setPairingOverlay('scan')}
                  onImportQrPhoto={() => setPairingOverlay('import')}
                  onManualPairing={() => setPairingOverlay('manual')}
                  onConnect={handleConnect}
                  onCancelConnection={handleCancelConnection}
                  onDisconnect={handleDisconnect}
                  onStartMirror={() => launchProjection('MIRROR', 'Screen Mirroring')}
                  onStartAndroidAuto={() => launchProjection('ANDROID_AUTO', 'Android Auto')}
                  onStartPhoneOnlyAndroidAuto={() =>
                    launchProjection('PHONE_ONLY_AA', 'Phone-only Android Auto')
                  }
                  onStartExternalDisplay={() =>
                    launchProjection('EXTERNAL_USB', 'USB External Display')
                  }
                  onStopSession={handleStopSession}
                  onDimDisplayChanged={(v) => {
                    setDimDisplayEnabled(v);
                    appendLog('DISPLAY', v ? 'Phone screen dimmed for riding.' : 'Phone screen brightness restored.');
                  }}
                  onToggleAoaAccessory={() => {
                    setAoaAccessoryConnected((prev) => {
                      const next = !prev;
                      appendLog(
                        'USB-AOA',
                        next
                          ? 'Simulated USB AOA external TFT display attached.'
                          : 'USB AOA external TFT display detached.'
                      );
                      return next;
                    });
                  }}
                  onOpenAndroidAutoHelp={() => {
                    setSelectedTab(HubTab.SETTINGS);
                    setSettingsDetail('ANDROID_AUTO_HELP');
                  }}
                  onLogEvent={appendLog}
                />
              )}

              {selectedTab === HubTab.GARAGE && (
                <GarageScreen
                  profiles={profiles}
                  activeProfileId={activeMotorcycle?.id ?? null}
                  onAddMotorcycleQr={() => setPairingOverlay('scan')}
                  onAddMotorcycleManual={() => setPairingOverlay('manual')}
                  onSelectMotorcycle={handleSelectMotorcycle}
                  onUpdateProfile={handleUpdateProfile}
                  onDeleteProfile={handleDeleteProfile}
                  onLogEvent={appendLog}
                />
              )}

              {selectedTab === HubTab.SETTINGS && (
                <SettingsScreen
                  settings={settings}
                  detail={settingsDetail}
                  activeMotorcycle={activeMotorcycle}
                  logs={logs}
                  onOpenDetail={setSettingsDetail}
                  onUpdateSettings={setSettings}
                  onLogEvent={appendLog}
                  onClearLogs={() => {
                    setLogs([
                      {
                        id: `clear-${Date.now()}`,
                        timestamp: Date.now(),
                        source: 'APP',
                        message: 'Diagnostic log cleared.',
                      },
                    ]);
                  }}
                />
              )}
            </main>

            <HubBottomNavigation
              selected={selectedTab}
              onSelect={(tab) => {
                setSelectedTab(tab);
                if (tab !== HubTab.SETTINGS) {
                  setSettingsDetail(null);
                }
              }}
            />

            {dimDisplayEnabled && (
              <button
                type="button"
                onClick={() => setDimDisplayEnabled(false)}
                className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-2 bg-black/82 text-center backdrop-blur-[1px] transition-opacity"
                aria-label="Wake dimmed screen"
              >
                <span className="font-mono text-xs font-bold tracking-[0.12em] text-[#C8F240]/70">
                  DIM DISPLAY ACTIVE
                </span>
                <span className="text-xs text-[#7E876E]">
                  Projection continues on TFT · Tap anywhere to wake phone
                </span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

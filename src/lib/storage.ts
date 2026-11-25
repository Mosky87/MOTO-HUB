import {
  AndroidAutoAspectMatchingMode,
  AndroidAutoDensityMode,
  AndroidAutoDisplayMode,
  AndroidAutoResolutionMode,
  AutostartService,
  HandlebarAction,
  HandlebarButton,
  HandlebarConfig,
  HandlebarInputMode,
  MotoHubSettingsState,
  MotorcycleProfile,
  PressKind,
  ProjectionEvent,
  TBoxConnectionMode,
  VideoPowerMode,
  VideoQuality,
} from '../types/motohub';

const STORAGE_KEYS = {
  PROFILES: 'motohub_profiles_v1',
  ACTIVE_ID: 'motohub_active_id_v1',
  SETTINGS: 'motohub_settings_v1',
  LOGS: 'motohub_logs_v1',
};

export function pressKey(button: HandlebarButton, kind: PressKind): string {
  return `${button}_${kind}`;
}

export function defaultHandlebarConfig(): HandlebarConfig {
  return {
    enabled: true,
    inputMode: HandlebarInputMode.AVRCP,
    listeningVolume: 11,
    snappySingles: false,
    holdsEnabled: true,
    doubleTapMs: 320,
    holdMs: 550,
    calibrated: true,
    mappings: {
      [pressKey(HandlebarButton.UP, PressKind.PRESS)]: HandlebarAction.SCROLL_BACK,
      [pressKey(HandlebarButton.UP, PressKind.DOUBLE)]: HandlebarAction.HOME,
      [pressKey(HandlebarButton.DOWN, PressKind.PRESS)]: HandlebarAction.SCROLL_FORWARD,
      [pressKey(HandlebarButton.DOWN, PressKind.DOUBLE)]: HandlebarAction.BACK,
      [pressKey(HandlebarButton.LEFT, PressKind.PRESS)]: HandlebarAction.SCROLL_BACK,
      [pressKey(HandlebarButton.LEFT, PressKind.DOUBLE)]: HandlebarAction.HOME,
      [pressKey(HandlebarButton.LEFT, PressKind.HOLD)]: HandlebarAction.NONE,
      [pressKey(HandlebarButton.RIGHT, PressKind.PRESS)]: HandlebarAction.SCROLL_FORWARD,
      [pressKey(HandlebarButton.RIGHT, PressKind.DOUBLE)]: HandlebarAction.BACK,
      [pressKey(HandlebarButton.RIGHT, PressKind.HOLD)]: HandlebarAction.NONE,
      [pressKey(HandlebarButton.SELECT, PressKind.PRESS)]: HandlebarAction.SELECT,
      [pressKey(HandlebarButton.SELECT, PressKind.DOUBLE)]: HandlebarAction.BACK,
      [pressKey(HandlebarButton.SELECT, PressKind.HOLD)]: HandlebarAction.HOME,
    },
    missing: {
      [pressKey(HandlebarButton.UP, PressKind.HOLD)]: true,
      [pressKey(HandlebarButton.DOWN, PressKind.HOLD)]: true,
    },
  };
}

export function defaultSettings(): MotoHubSettingsState {
  return {
    language: 'system',
    autostartEnabled: false,
    autostartService: AutostartService.ANDROID_AUTO,
    autoUpdateChecks: true,
    seamlessResume: false,
    videoQuality: VideoQuality.BALANCED,
    videoPowerMode: VideoPowerMode.AUTO,
    disableTouchscreen: false,
    androidAutoResolution: AndroidAutoResolutionMode.AUTO,
    androidAutoDensity: AndroidAutoDensityMode.AUTO,
    androidAutoAspectMatching: AndroidAutoAspectMatchingMode.AUTO,
    autoConnect: false,
    autoRecovery: true,
    dashClockSync: true,
    bluetoothClockSync: false,
    keepWifiDirectAfterDisconnect: false,
    loggingEnabled: true,
    verboseTBoxLogging: true,
    showPressBanner: true,
    handlebar: defaultHandlebarConfig(),
  };
}

export function createDefaultProfiles(): MotorcycleProfile[] {
  const now = Date.now();
  return [
    {
      id: 'cfmoto-700mt-adv',
      ssid: 'CFMOTO_700MT_8F2A',
      password: '********',
      modelId: '66660742',
      displayName: 'CFMOTO 700MT-ADV',
      photoUrl: '/media/hero-bike.jpg',
      fuelTankRangeKm: 360,
      profileOverrideKey: null,
      connectionMode: TBoxConnectionMode.AUTO,
      displayMode: AndroidAutoDisplayMode.STRETCH,
      screenMargins: { top: 0, bottom: 0, left: 0, right: 0 },
      capabilitySnapshot: {
        hostIp: '192.168.43.1',
        hostPort: 10925,
        nsdPackage: 'net.easyconn.carman',
        discoveredAt: now - 3600_000,
        observedAt: now - 3550_000,
        width: 1280,
        height: 480,
        capabilities: {
          dpi: 160,
          dpiEnabled: true,
          screenType: 1,
          huName: 'CFDL26-MT700',
          carBrand: 'CFMOTO',
          carModel: '700MT-ADV',
          pxcVersion: '3.2.1',
          sdkVersion: '1.4.8.2',
          versionName: '2.18.0',
          versionCode: '218',
          packageName: 'net.easyconn.carman',
          productType: 2,
          transportType: 1,
          supportFunction: 0x0f3b,
          socketTimeoutPeriodWifi: 5000,
          screenMirroring: true,
          screenTouch: false,
          mirrorOverlayTouch: false,
          mirrorReconnect: true,
          landscapeAdaptive: true,
          socketServerAuth: false,
          microphone: true,
          hid: false,
          thirdPartyApps: true,
          phoneSignal: true,
          syncCorrectTime: true,
          bluetoothCall: true,
          bluetoothSettings: false,
        },
      },
    },
    {
      id: 'benelli-trk-702x',
      ssid: 'TRK702X_CARBIT_4C11',
      password: '********',
      modelId: '00319',
      displayName: 'Benelli TRK 702X',
      photoUrl: null,
      fuelTankRangeKm: 340,
      profileOverrideKey: null,
      connectionMode: TBoxConnectionMode.AUTO,
      displayMode: AndroidAutoDisplayMode.LETTERBOX,
      screenMargins: { top: 12, bottom: 0, left: 0, right: 0 },
    },
  ];
}

export function loadProfiles(): MotorcycleProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (!raw) return createDefaultProfiles();
    const parsed = JSON.parse(raw) as MotorcycleProfile[];
    return Array.isArray(parsed) ? parsed : createDefaultProfiles();
  } catch {
    return createDefaultProfiles();
  }
}

export function saveProfiles(profiles: MotorcycleProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  } catch {
    // ignore quota errors
  }
}

export function loadActiveProfileId(profiles: MotorcycleProfile[]): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
    if (stored && profiles.some((p) => p.id === stored)) return stored;
    return profiles[0]?.id ?? null;
  } catch {
    return profiles[0]?.id ?? null;
  }
}

export function saveActiveProfileId(id: string | null): void {
  try {
    if (id === null) localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
    else localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, id);
  } catch {
    // ignore
  }
}

export function loadSettings(): MotoHubSettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw) as Partial<MotoHubSettingsState>;
    const defaults = defaultSettings();
    return {
      ...defaults,
      ...parsed,
      handlebar: {
        ...defaults.handlebar,
        ...(parsed.handlebar ?? {}),
        mappings: {
          ...defaults.handlebar.mappings,
          ...(parsed.handlebar?.mappings ?? {}),
        },
        missing: {
          ...defaults.handlebar.missing,
          ...(parsed.handlebar?.missing ?? {}),
        },
      },
    };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings: MotoHubSettingsState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadLogs(): ProjectionEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (raw) {
      const parsed = JSON.parse(raw) as ProjectionEvent[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  const now = Date.now();
  return [
    {
      id: 'init-1',
      timestamp: now - 12000,
      source: 'APP',
      message: 'MOTO-HUB CORE v1.1.130 (224) started.',
    },
    {
      id: 'init-2',
      timestamp: now - 11200,
      source: 'GARAGE',
      message: 'Loaded 2 motorcycle profiles; active = CFMOTO_700MT_8F2A.',
    },
    {
      id: 'init-3',
      timestamp: now - 9500,
      source: 'CONTROLS',
      message: 'Handlebar capture ready (protocol=AVRCP, calibrated=true).',
    },
  ];
}

export function saveLogs(logs: ProjectionEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(-200)));
  } catch {
    // ignore
  }
}

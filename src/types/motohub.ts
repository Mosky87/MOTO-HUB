export enum HubTab {
  RIDE = 'RIDE',
  GARAGE = 'GARAGE',
  SETTINGS = 'SETTINGS',
}

export enum SessionPhase {
  IDLE = 'IDLE',
  CONNECTING_NETWORK = 'CONNECTING_NETWORK',
  DISCOVERING_TBOX = 'DISCOVERING_TBOX',
  READY = 'READY',
  REQUESTING_PROJECTION = 'REQUESTING_PROJECTION',
  CAPTURING = 'CAPTURING',
  ERROR = 'ERROR',
}

export enum HubDestination {
  PAIRING = 'PAIRING',
  CONNECTING = 'CONNECTING',
  CONNECTION = 'CONNECTION',
  MODE_SELECTION = 'MODE_SELECTION',
  ACTIVE_SESSION = 'ACTIVE_SESSION',
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
}

export enum TBoxConnectionMode {
  AUTO = 'AUTO',
  ACCESS_POINT = 'ACCESS_POINT',
  WIFI_DIRECT = 'WIFI_DIRECT',
  PHONE_HOTSPOT = 'PHONE_HOTSPOT',
  BLE_PROVISIONED = 'BLE_PROVISIONED',
  THINKERRIDE = 'THINKERRIDE',
  MYSPIN = 'MYSPIN',
}

export const TBOX_CONNECTION_MODE_LABELS: Record<TBoxConnectionMode, string> = {
  [TBoxConnectionMode.AUTO]: 'Auto',
  [TBoxConnectionMode.ACCESS_POINT]: 'Access point',
  [TBoxConnectionMode.WIFI_DIRECT]: 'Wi-Fi Direct (P2P)',
  [TBoxConnectionMode.PHONE_HOTSPOT]: 'My phone hosts the hotspot',
  [TBoxConnectionMode.BLE_PROVISIONED]: 'Set up over Bluetooth (no network shown)',
  [TBoxConnectionMode.THINKERRIDE]: 'KOVE / ThinkerRide (Bluetooth)',
  [TBoxConnectionMode.MYSPIN]: 'Ducati / Suzuki / Kawasaki / BMW mySPIN (Bluetooth)',
};

export enum AndroidAutoDisplayMode {
  LETTERBOX = 'LETTERBOX',
  STRETCH = 'STRETCH',
  FILL = 'FILL',
}

export const DISPLAY_MODE_INFO: Record<
  AndroidAutoDisplayMode,
  { shortLabel: string; description: string }
> = {
  [AndroidAutoDisplayMode.LETTERBOX]: {
    shortLabel: 'FIT',
    description: 'Preserve the complete Android Auto image with black bars when aspect ratios differ.',
  },
  [AndroidAutoDisplayMode.STRETCH]: {
    shortLabel: 'STRETCH',
    description: 'Fill the usable TFT projection area using active Android Auto content.',
  },
  [AndroidAutoDisplayMode.FILL]: {
    shortLabel: 'CROP',
    description: 'Fill the usable TFT projection area without stretching, cropping edges when necessary.',
  },
};

export interface TBoxScreenMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface ProfileOverrideOption {
  key: string;
  label: string;
  description: string;
  experimental?: boolean;
}

export const PROFILE_OVERRIDES: ProfileOverrideOption[] = [
  { key: 'auto', label: 'Auto', description: 'Detect from the motorcycle (recommended)' },
  { key: 'generic', label: 'Generic dashboard', description: 'Neutral defaults for a dashboard that is not recognised' },
  { key: 'legacy_cfdl16', label: 'CFDL16 / Legacy', description: 'CFDL16 / 450SR-style non-touch' },
  { key: 'cfmoto_800nk', label: 'CFMOTO 800NK', description: 'CRCP / sdk 0.9.23.x non-touch' },
  { key: 'cfmoto_mtx800', label: 'CFMOTO MTX800', description: 'Portrait Wi-Fi Direct dashboard, modelId 66660732' },
  { key: 'cfdl26_landscape', label: '800MT (CFDL26)', description: 'CFDL26 MotoPlay landscape touch' },
  { key: 'cfdl26_portrait', label: '1000 MT-X (CFDL26)', description: 'CFDL26 MotoPlay portrait touch panel' },
  { key: 'cfdl26_nk_touch', label: '800NK Advanced (CFDL26)', description: 'Near-square touch panel, 720x712' },
  { key: 'cfdl16_motoplay_landscape', label: 'MotoPlay Landscape (CFDL16)', description: 'modelId 66660742, Wi-Fi Direct, non-touch' },
  { key: 'cl_c450', label: 'CL-C450', description: 'Near-square panel, 544x512' },
  { key: 'kove_800x', label: 'KOVE 800X (ThinkerRide)', description: 'BLE-paired ThinkerRide dash, 600x1024 portrait' },
  { key: 'kove_450_rally', label: 'KOVE 450 Rally (ThinkerRide)', description: 'Same BLE-paired ThinkerRide dash, 1280x640 landscape panel' },
  { key: 'morini_xcape_1200', label: 'X-Cape 1200 (Yunmo)', description: 'Moto Morini X-Cape 1200 SoftAP dash on Yunmo :8200' },
  { key: 'kove_625x', label: 'KOVE 625X (JPEG)', description: 'Wi-Fi dash speaking the X-Cape 1200 protocol with still images' },
  { key: 'zontes_368g_test', label: 'Zontes 368G (test)', description: 'Experiment for JCDZ dashes stuck on the QR page: indexed framing + 1s GOP', experimental: true },
  { key: 'voge_test', label: 'Voge (test)', description: 'Experiment for Voge dashes that reboot mid-ride: 1s plain-IDR GOP', experimental: true },
];

export interface TBoxCapabilities {
  dpi: number;
  dpiEnabled: boolean;
  screenType: number;
  huName: string;
  carBrand: string;
  carModel: string;
  pxcVersion: string;
  sdkVersion: string;
  versionName: string;
  versionCode: string;
  packageName: string;
  productType: number;
  transportType: number;
  supportFunction: number;
  socketTimeoutPeriodWifi: number;
  screenMirroring: boolean;
  screenTouch: boolean;
  mirrorOverlayTouch: boolean;
  mirrorReconnect: boolean;
  landscapeAdaptive: boolean;
  socketServerAuth: boolean;
  microphone: boolean;
  hid: boolean;
  thirdPartyApps: boolean;
  phoneSignal: boolean;
  syncCorrectTime: boolean;
  bluetoothCall: boolean;
  bluetoothSettings: boolean;
}

export interface TBoxCapabilitySnapshot {
  hostIp: string;
  hostPort: number;
  nsdPackage: string;
  discoveredAt: number;
  observedAt: number;
  width: number;
  height: number;
  capabilities: TBoxCapabilities;
}

export interface MotorcycleProfile {
  id: string;
  ssid: string;
  password: string;
  modelId: string | null;
  displayName: string | null;
  photoUrl: string | null;
  fuelTankRangeKm: number | null;
  profileOverrideKey: string | null;
  connectionMode: TBoxConnectionMode;
  displayMode: AndroidAutoDisplayMode;
  screenMargins: TBoxScreenMargins;
  capabilitySnapshot?: TBoxCapabilitySnapshot;
}

export enum VideoQuality {
  SMOOTHER = 'SMOOTHER',
  BALANCED = 'BALANCED',
  SHARPER = 'SHARPER',
}

export enum VideoPowerMode {
  AUTO = 'AUTO',
  SMOOTH = 'SMOOTH',
  BALANCED = 'BALANCED',
  SAVER = 'SAVER',
}

export enum AndroidAutoResolutionMode {
  AUTO = 'AUTO',
  LANDSCAPE_SD = 'LANDSCAPE_SD',
  LANDSCAPE_HD = 'LANDSCAPE_HD',
  LANDSCAPE_FHD = 'LANDSCAPE_FHD',
  LANDSCAPE_QHD = 'LANDSCAPE_QHD',
  LANDSCAPE_UHD = 'LANDSCAPE_UHD',
  PORTRAIT_SD = 'PORTRAIT_SD',
  PORTRAIT_HD = 'PORTRAIT_HD',
  PORTRAIT_QHD = 'PORTRAIT_QHD',
  PORTRAIT_UHD = 'PORTRAIT_UHD',
}

export enum AndroidAutoDensityMode {
  AUTO = 'AUTO',
  DPI_120 = 'DPI_120',
  DPI_160 = 'DPI_160',
  DPI_213 = 'DPI_213',
  DPI_240 = 'DPI_240',
  DPI_320 = 'DPI_320',
  DPI_480 = 'DPI_480',
}

export enum AndroidAutoAspectMatchingMode {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
}

export enum AutostartService {
  MIRRORING = 'MIRRORING',
  ANDROID_AUTO = 'ANDROID_AUTO',
}

export enum HandlebarInputMode {
  AVRCP = 'AVRCP',
  HID = 'HID',
}

export enum HandlebarButton {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  SELECT = 'SELECT',
}

export enum PressKind {
  PRESS = 'PRESS',
  DOUBLE = 'DOUBLE',
  HOLD = 'HOLD',
}

export enum HandlebarAction {
  NONE = 'none',
  SCROLL_FORWARD = 'scrollForward',
  SCROLL_BACK = 'scrollBack',
  DPAD_UP = 'dpadUp',
  DPAD_DOWN = 'dpadDown',
  DPAD_LEFT = 'dpadLeft',
  DPAD_RIGHT = 'dpadRight',
  SELECT = 'select',
  BACK = 'back',
  HOME = 'home',
  ASSISTANT = 'assistant',
  NAV_1 = 'nav1',
  NAV_2 = 'nav2',
  NAV_3 = 'nav3',
  MEDIA_PLAY_PAUSE = 'mediaPlayPause',
  MEDIA_NEXT = 'mediaNext',
  MEDIA_PREVIOUS = 'mediaPrevious',
  MEDIA_VOLUME_UP = 'mediaVolumeUp',
  MEDIA_VOLUME_DOWN = 'mediaVolumeDown',
}

export const HANDLEBAR_ACTION_LABELS: Record<
  HandlebarAction,
  { label: string; shortLabel: string; family: 'nav' | 'aa' | 'media' | 'none' }
> = {
  [HandlebarAction.NONE]: { label: 'Do nothing', shortLabel: 'None', family: 'none' },
  [HandlebarAction.SCROLL_FORWARD]: { label: 'Rotary forward', shortLabel: 'Rotary +', family: 'aa' },
  [HandlebarAction.SCROLL_BACK]: { label: 'Rotary back', shortLabel: 'Rotary -', family: 'aa' },
  [HandlebarAction.DPAD_UP]: { label: 'D-pad up', shortLabel: 'D-pad Up', family: 'aa' },
  [HandlebarAction.DPAD_DOWN]: { label: 'D-pad down', shortLabel: 'D-pad Down', family: 'aa' },
  [HandlebarAction.DPAD_LEFT]: { label: 'D-pad left', shortLabel: 'D-pad Left', family: 'aa' },
  [HandlebarAction.DPAD_RIGHT]: { label: 'D-pad right', shortLabel: 'D-pad Right', family: 'aa' },
  [HandlebarAction.SELECT]: { label: 'Select / OK', shortLabel: 'Select', family: 'aa' },
  [HandlebarAction.BACK]: { label: 'Back', shortLabel: 'Back', family: 'aa' },
  [HandlebarAction.HOME]: { label: 'Home', shortLabel: 'Home', family: 'aa' },
  [HandlebarAction.ASSISTANT]: { label: 'Assistant', shortLabel: 'Assistant', family: 'aa' },
  [HandlebarAction.NAV_1]: { label: 'Navigate → place 1', shortLabel: 'Nav 1', family: 'nav' },
  [HandlebarAction.NAV_2]: { label: 'Navigate → place 2', shortLabel: 'Nav 2', family: 'nav' },
  [HandlebarAction.NAV_3]: { label: 'Navigate → place 3', shortLabel: 'Nav 3', family: 'nav' },
  [HandlebarAction.MEDIA_PLAY_PAUSE]: { label: 'Music: play / pause', shortLabel: 'Play/Pause', family: 'media' },
  [HandlebarAction.MEDIA_NEXT]: { label: 'Music: next track', shortLabel: 'Next track', family: 'media' },
  [HandlebarAction.MEDIA_PREVIOUS]: { label: 'Music: previous track', shortLabel: 'Prev track', family: 'media' },
  [HandlebarAction.MEDIA_VOLUME_UP]: { label: 'Music: volume up', shortLabel: 'Vol +', family: 'media' },
  [HandlebarAction.MEDIA_VOLUME_DOWN]: { label: 'Music: volume down', shortLabel: 'Vol -', family: 'media' },
};

export interface HandlebarConfig {
  enabled: boolean;
  inputMode: HandlebarInputMode;
  listeningVolume: number;
  snappySingles: boolean;
  holdsEnabled: boolean;
  doubleTapMs: number;
  holdMs: number;
  calibrated: boolean;
  /** Keyed by `${button}_${kind}` */
  mappings: Record<string, HandlebarAction>;
  /** Keyed by `${button}_${kind}` */
  missing: Record<string, boolean>;
}

export interface MotoHubSettingsState {
  language: string;
  autostartEnabled: boolean;
  autostartService: AutostartService;
  autoUpdateChecks: boolean;
  seamlessResume: boolean;
  videoQuality: VideoQuality;
  videoPowerMode: VideoPowerMode;
  disableTouchscreen: boolean;
  androidAutoResolution: AndroidAutoResolutionMode;
  androidAutoDensity: AndroidAutoDensityMode;
  androidAutoAspectMatching: AndroidAutoAspectMatchingMode;
  autoConnect: boolean;
  autoRecovery: boolean;
  dashClockSync: boolean;
  bluetoothClockSync: boolean;
  keepWifiDirectAfterDisconnect: boolean;
  loggingEnabled: boolean;
  verboseTBoxLogging: boolean;
  showPressBanner: boolean;
  handlebar: HandlebarConfig;
}

export interface ProjectionEvent {
  id: string;
  timestamp: number;
  source: string;
  message: string;
}

export enum DiagnosticStatus {
  NOT_RUN = 'NOT_RUN',
  RUNNING = 'RUNNING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export interface NetworkDiagnosticCheck {
  id: string;
  title: string;
  detail: string;
  status: DiagnosticStatus;
}

export type ActiveProjectionMode = 'NONE' | 'MIRROR' | 'ANDROID_AUTO' | 'PHONE_ONLY_AA' | 'EXTERNAL_USB';

import React, { useState } from 'react';
import {
  AndroidAutoAspectMatchingMode,
  AndroidAutoDensityMode,
  AndroidAutoResolutionMode,
  AutostartService,
  DiagnosticStatus,
  MotoHubSettingsState,
  MotorcycleProfile,
  NetworkDiagnosticCheck,
  ProjectionEvent,
  VideoPowerMode,
  VideoQuality,
} from '../types/motohub';
import {
  MonoLabel,
  MotoHubActionRow,
  MotoHubCardGroup,
  MotoHubDetailScreen,
  MotoHubRadioRow,
  ToggleRow,
} from '../components/MotoHubUi';
import { HandlebarControlsDetail, HandlebarMappingScreen } from './HandlebarScreen';

export type SettingsDetail =
  | null
  | 'GENERAL'
  | 'LANGUAGE'
  | 'AUTOSTART'
  | 'VIDEO'
  | 'ANDROID_AUTO'
  | 'ANDROID_AUTO_RESOLUTION'
  | 'ANDROID_AUTO_DENSITY'
  | 'HANDLEBAR'
  | 'HANDLEBAR_MAPPING'
  | 'AUTOMATION'
  | 'DIAGNOSTICS'
  | 'NETWORK_DIAGNOSTICS'
  | 'APPLICATION_LOGS'
  | 'ANDROID_AUTO_HELP'
  | 'ABOUT';

const LANGUAGES: Array<{ code: string; label: string; tag: string }> = [
  { code: 'system', label: 'System default', tag: 'Follow device language' },
  { code: 'en-US', label: 'English', tag: 'en-US' },
  { code: 'it-IT', label: 'Italiano', tag: 'it-IT' },
  { code: 'es-ES', label: 'Español', tag: 'es-ES' },
  { code: 'fr-FR', label: 'Français', tag: 'fr-FR' },
  { code: 'pt-PT', label: 'Português', tag: 'pt-PT' },
  { code: 'de-DE', label: 'Deutsch', tag: 'de-DE' },
  { code: 'nl-NL', label: 'Nederlands', tag: 'nl-NL' },
  { code: 'cs-CZ', label: 'Čeština', tag: 'cs-CZ' },
  { code: 'tr-TR', label: 'Türkçe', tag: 'tr-TR' },
  { code: 'ru-RU', label: 'Русский', tag: 'ru-RU' },
  { code: 'ko-KR', label: '한국어', tag: 'ko-KR' },
  { code: 'th-TH', label: 'ไทย', tag: 'th-TH' },
  { code: 'zh-CN', label: '中文', tag: 'zh-CN' },
];

const VIDEO_QUALITIES: Array<{ value: VideoQuality; label: string; description: string }> = [
  { value: VideoQuality.SMOOTHER, label: 'Smoother', description: 'Lower bitrate (70%), less heat and network load.' },
  { value: VideoQuality.BALANCED, label: 'Balanced', description: 'Current MOTO-HUB quality and recommended default.' },
  { value: VideoQuality.SHARPER, label: 'Sharper', description: 'Higher bitrate (160%) for crisper maps and text.' },
];

const POWER_MODES: Array<{ value: VideoPowerMode; label: string; description: string }> = [
  { value: VideoPowerMode.AUTO, label: 'Auto', description: 'Adapt bitrate and frame rate to phone temperature and Wi-Fi quality.' },
  { value: VideoPowerMode.SMOOTH, label: 'Smooth', description: '30 FPS with the selected video quality.' },
  { value: VideoPowerMode.BALANCED, label: 'Balanced', description: 'Stable 24 FPS with the selected video quality.' },
  { value: VideoPowerMode.SAVER, label: 'Saver', description: '20 FPS for reduced heat and battery use.' },
];

const AA_RESOLUTIONS: Array<{
  value: AndroidAutoResolutionMode;
  label: string;
  description: string;
  group: 'auto' | 'landscape' | 'portrait';
}> = [
  { value: AndroidAutoResolutionMode.AUTO, label: 'Auto', description: 'Keep MOTO-HUB automatic orientation based on the learned T-Box geometry.', group: 'auto' },
  { value: AndroidAutoResolutionMode.LANDSCAPE_SD, label: 'Landscape 800 x 480', description: 'Standard landscape Android Auto source.', group: 'landscape' },
  { value: AndroidAutoResolutionMode.LANDSCAPE_HD, label: 'Landscape 1280 x 720', description: 'Sharper HD landscape source with higher phone load.', group: 'landscape' },
  { value: AndroidAutoResolutionMode.LANDSCAPE_FHD, label: 'Landscape 1920 x 1080', description: 'Experimental · Full HD landscape source.', group: 'landscape' },
  { value: AndroidAutoResolutionMode.PORTRAIT_SD, label: 'Portrait 720 x 1280', description: 'Standard portrait Android Auto source.', group: 'portrait' },
  { value: AndroidAutoResolutionMode.PORTRAIT_HD, label: 'Portrait 1080 x 1920', description: 'Sharper HD portrait source with higher phone load.', group: 'portrait' },
];

const AA_DENSITIES: Array<{ value: AndroidAutoDensityMode; label: string; description: string }> = [
  { value: AndroidAutoDensityMode.AUTO, label: 'Auto', description: 'Use the density that comes with the selected resolution.' },
  { value: AndroidAutoDensityMode.DPI_120, label: '120 dpi', description: 'Smallest interface, most map on screen. Hard to read on a small TFT.' },
  { value: AndroidAutoDensityMode.DPI_160, label: '160 dpi', description: 'Small interface. The density landscape sources use by default.' },
  { value: AndroidAutoDensityMode.DPI_213, label: '213 dpi', description: 'Between small and standard.' },
  { value: AndroidAutoDensityMode.DPI_240, label: '240 dpi', description: 'Standard interface. The density portrait sources use by default.' },
  { value: AndroidAutoDensityMode.DPI_320, label: '320 dpi', description: 'Large interface, easier to read and hit with gloves.' },
  { value: AndroidAutoDensityMode.DPI_480, label: '480 dpi', description: 'Largest interface. Only sensible on high-resolution sources.' },
];

interface SettingsScreenProps {
  settings: MotoHubSettingsState;
  detail: SettingsDetail;
  activeMotorcycle: MotorcycleProfile | null;
  logs: ProjectionEvent[];
  onOpenDetail: (d: SettingsDetail) => void;
  onUpdateSettings: (next: MotoHubSettingsState) => void;
  onLogEvent: (source: string, message: string) => void;
  onClearLogs: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  detail,
  activeMotorcycle,
  logs,
  onOpenDetail,
  onUpdateSettings,
  onLogEvent,
  onClearLogs,
}) => {
  const update = (patch: Partial<MotoHubSettingsState>, logMsg?: string) => {
    onUpdateSettings({ ...settings, ...patch });
    if (logMsg) onLogEvent('SETTINGS', logMsg);
  };

  if (detail === 'GENERAL') {
    const langLabel = LANGUAGES.find((l) => l.code === settings.language)?.label ?? 'System default';
    return (
      <MotoHubDetailScreen title="General" backLabel="‹ Settings" onBack={() => onOpenDetail(null)}>
        <MotoHubCardGroup>
          <MotoHubActionRow
            title="Language"
            description="Choose the display language for MOTO-HUB"
            value={langLabel}
            onClick={() => onOpenDetail('LANGUAGE')}
          />
          <MotoHubActionRow
            title="Start automatically"
            description="Put a screen on the TFT as soon as the motorcycle connects"
            value={
              settings.autostartEnabled
                ? settings.autostartService === AutostartService.ANDROID_AUTO
                  ? 'Android Auto'
                  : 'Mirroring'
                : 'Off'
            }
            onClick={() => onOpenDetail('AUTOSTART')}
          />
        </MotoHubCardGroup>
        <ToggleRow
          title="Check for updates on launch"
          description="Check GitHub releases shortly after launch, at most once every 24 hours."
          checked={settings.autoUpdateChecks}
          onCheckedChange={(autoUpdateChecks) =>
            update({ autoUpdateChecks }, `Automatic update checks set to ${autoUpdateChecks}.`)
          }
        />
        <ToggleRow
          title="Seamless resume"
          description={
            settings.seamlessResume
              ? 'Keep the projection parked across longer T-Box interruptions and resume when the motorcycle returns.'
              : 'Stop the projection normally if the T-Box link drops for more than a few seconds.'
          }
          checked={settings.seamlessResume}
          onCheckedChange={(seamlessResume) =>
            update({ seamlessResume }, `Seamless resume set to ${seamlessResume}.`)
          }
        />
      </MotoHubDetailScreen>
    );
  }

  if (detail === 'LANGUAGE') {
    return (
      <MotoHubDetailScreen title="Language" backLabel="‹ General" onBack={() => onOpenDetail('GENERAL')}>
        <p className="text-sm text-[#7E876E]">
          MOTO-HUB supports 13 community-maintained translations or following the device language.
        </p>
        {LANGUAGES.map((lang) => (
          <MotoHubRadioRow
            key={lang.code}
            title={lang.label}
            description={lang.tag}
            selected={settings.language === lang.code}
            onClick={() => update({ language: lang.code }, `Application language changed to ${lang.code}.`)}
          />
        ))}
      </MotoHubDetailScreen>
    );
  }

  if (detail === 'AUTOSTART') {
    return (
      <MotoHubDetailScreen
        title="Start automatically"
        backLabel="‹ General"
        onBack={() => onOpenDetail('GENERAL')}
      >
        <p className="text-sm leading-relaxed text-[#7E876E]">
          With this on, MOTO-HUB skips the &ldquo;what should I show?&rdquo; screen and puts the chosen screen on the TFT as soon as the motorcycle link comes up.
        </p>
        <ToggleRow
          title="Start on connect"
          description="Off means the mode picker stays, exactly as before."
          checked={settings.autostartEnabled}
          onCheckedChange={(autostartEnabled) =>
            update({ autostartEnabled }, `Autostart on connect set to ${autostartEnabled}.`)
          }
        />
        <div className="h-px bg-[#2A3124]" />
        <MonoLabel>WHAT TO START</MonoLabel>
        <MotoHubRadioRow
          title="Mirroring"
          description="Share the phone screen. Android still asks for screen-capture permission each time."
          selected={settings.autostartService === AutostartService.MIRRORING}
          onClick={() =>
            update(
              { autostartService: AutostartService.MIRRORING },
              'Autostart service changed to MIRRORING.'
            )
          }
        />
        <MotoHubRadioRow
          title="Android Auto"
          description="Launch Android Auto on the dashboard."
          selected={settings.autostartService === AutostartService.ANDROID_AUTO}
          onClick={() =>
            update(
              { autostartService: AutostartService.ANDROID_AUTO },
              'Autostart service changed to ANDROID_AUTO.'
            )
          }
        />
      </MotoHubDetailScreen>
    );
  }

  if (detail === 'VIDEO') {
    return (
      <MotoHubDetailScreen
        title="Video quality"
        backLabel="‹ Settings"
        onBack={() => onOpenDetail(null)}
      >
        <p className="text-sm leading-relaxed text-[#7E876E]">
          Choose image detail and how MOTO-HUB balances smoothness, heat, battery, and Wi-Fi load.
        </p>
        {VIDEO_QUALITIES.map((q) => (
          <MotoHubRadioRow
            key={q.value}
            title={q.label}
            description={q.description}
            selected={settings.videoQuality === q.value}
            onClick={() => update({ videoQuality: q.value }, `Video quality changed to ${q.value}.`)}
          />
        ))}
        <div className="h-px bg-[#2A3124]" />
        <MonoLabel>POWER MODE</MonoLabel>
        {POWER_MODES.map((m) => (
          <MotoHubRadioRow
            key={m.value}
            title={m.label}
            description={m.description}
            selected={settings.videoPowerMode === m.value}
            onClick={() => update({ videoPowerMode: m.value }, `Video power mode changed to ${m.value}.`)}
          />
        ))}
        <div className="h-px bg-[#2A3124]" />
        <ToggleRow
          title="Disable touchscreen"
          description="Use focus and handlebar controls even when the T-Box reports a touch display"
          checked={settings.disableTouchscreen}
          onCheckedChange={(disableTouchscreen) =>
            update({ disableTouchscreen }, `Disable touchscreen set to ${disableTouchscreen}.`)
          }
        />
      </MotoHubDetailScreen>
    );
  }

  if (detail === 'ANDROID_AUTO') {
    const resLabel =
      AA_RESOLUTIONS.find((r) => r.value === settings.androidAutoResolution)?.label ?? 'Auto';
    const dpiLabel =
      AA_DENSITIES.find((d) => d.value === settings.androidAutoDensity)?.label ?? 'Auto';
    return (
      <MotoHubDetailScreen
        title="Android Auto"
        backLabel="‹ Settings"
        onBack={() => onOpenDetail(null)}
      >
        <MotoHubCardGroup>
          <MotoHubActionRow
            title="Resolution"
            description="The video source Android Auto sends to the dashboard"
            value={resLabel}
            onClick={() => onOpenDetail('ANDROID_AUTO_RESOLUTION')}
          />
          <MotoHubActionRow
            title="Interface size"
            description="How large Android Auto draws itself on that source"
            value={dpiLabel}
            onClick={() => onOpenDetail('ANDROID_AUTO_DENSITY')}
          />
        </MotoHubCardGroup>
        <div className="h-px bg-[#2A3124]" />
        <MonoLabel>ANDROID AUTO CONTENT INSETS</MonoLabel>
        <MotoHubRadioRow
          title="Auto"
          description="Match Android Auto's layout to the dashboard's real shape, so the map fills the panel instead of sitting between black bars."
          selected={settings.androidAutoAspectMatching === AndroidAutoAspectMatchingMode.AUTO}
          onClick={() =>
            update(
              { androidAutoAspectMatching: AndroidAutoAspectMatchingMode.AUTO },
              'Android Auto aspect matching changed to AUTO.'
            )
          }
        />
        <MotoHubRadioRow
          title="Manual"
          description="Advertise the per-motorcycle TFT Safe Margins to Android Auto."
          selected={settings.androidAutoAspectMatching === AndroidAutoAspectMatchingMode.MANUAL}
          onClick={() =>
            update(
              { androidAutoAspectMatching: AndroidAutoAspectMatchingMode.MANUAL },
              'Android Auto aspect matching changed to MANUAL.'
            )
          }
        />
      </MotoHubDetailScreen>
    );
  }

  if (detail === 'ANDROID_AUTO_RESOLUTION') {
    return (
      <MotoHubDetailScreen
        title="Resolution"
        backLabel="‹ Android Auto"
        onBack={() => onOpenDetail('ANDROID_AUTO')}
      >
        {AA_RESOLUTIONS.filter((r) => r.group === 'auto').map((r) => (
          <MotoHubRadioRow
            key={r.value}
            title={r.label}
            description={r.description}
            selected={settings.androidAutoResolution === r.value}
            onClick={() =>
              update({ androidAutoResolution: r.value }, `Android Auto resolution changed to ${r.value}.`)
            }
          />
        ))}
        <div className="h-px bg-[#2A3124]" />
        <MonoLabel>LANDSCAPE</MonoLabel>
        {AA_RESOLUTIONS.filter((r) => r.group === 'landscape').map((r) => (
          <MotoHubRadioRow
            key={r.value}
            title={r.label}
            description={r.description}
            selected={settings.androidAutoResolution === r.value}
            onClick={() =>
              update({ androidAutoResolution: r.value }, `Android Auto resolution changed to ${r.value}.`)
            }
          />
        ))}
        <div className="h-px bg-[#2A3124]" />
        <MonoLabel>PORTRAIT</MonoLabel>
        {AA_RESOLUTIONS.filter((r) => r.group === 'portrait').map((r) => (
          <MotoHubRadioRow
            key={r.value}
            title={r.label}
            description={r.description}
            selected={settings.androidAutoResolution === r.value}
            onClick={() =>
              update({ androidAutoResolution: r.value }, `Android Auto resolution changed to ${r.value}.`)
            }
          />
        ))}
      </MotoHubDetailScreen>
    );
  }

  if (detail === 'ANDROID_AUTO_DENSITY') {
    return (
      <MotoHubDetailScreen
        title="Interface size"
        backLabel="‹ Android Auto"
        onBack={() => onOpenDetail('ANDROID_AUTO')}
      >
        {AA_DENSITIES.map((d) => (
          <MotoHubRadioRow
            key={d.value}
            title={d.label}
            description={d.description}
            selected={settings.androidAutoDensity === d.value}
            onClick={() =>
              update({ androidAutoDensity: d.value }, `Android Auto density changed to ${d.value}.`)
            }
          />
        ))}
      </MotoHubDetailScreen>
    );
  }

  if (detail === 'HANDLEBAR') {
    return (
      <HandlebarControlsDetail
        config={settings.handlebar}
        onChange={(handlebar) => onUpdateSettings({ ...settings, handlebar })}
        onOpenMapping={() => onOpenDetail('HANDLEBAR_MAPPING')}
        onBack={() => onOpenDetail(null)}
        onLogEvent={onLogEvent}
      />
    );
  }

  if (detail === 'HANDLEBAR_MAPPING') {
    return (
      <HandlebarMappingScreen
        config={settings.handlebar}
        onChange={(handlebar) => onUpdateSettings({ ...settings, handlebar })}
        onBack={() => onOpenDetail('HANDLEBAR')}
        onLogEvent={onLogEvent}
      />
    );
  }

  if (detail === 'AUTOMATION') {
    return (
      <MotoHubDetailScreen
        title="Connection & automation"
        backLabel="‹ Settings"
        onBack={() => onOpenDetail(null)}
      >
        <ToggleRow
          title="Auto-connect on launch"
          description="Connect and discover T-Box when app opens"
          checked={settings.autoConnect}
          onCheckedChange={(autoConnect) =>
            update({ autoConnect }, `Auto-connect changed to enabled=${autoConnect}.`)
          }
        />
        <ToggleRow
          title="Recovery watchdog"
          description="Auto-recover stalled Android Auto streams"
          checked={settings.autoRecovery}
          onCheckedChange={(autoRecovery) =>
            update({ autoRecovery }, `Auto-recovery changed to enabled=${autoRecovery}.`)
          }
        />
        <ToggleRow
          title="Set the dash clock over Wi-Fi"
          description="On by default, and what sets the time on most dashboards. Turn it off only if your dash ignores the reply and resets to 01.01.1970."
          checked={settings.dashClockSync}
          onCheckedChange={(dashClockSync) =>
            update({ dashClockSync }, `Dash clock sync changed to enabled=${dashClockSync}.`)
          }
        />
        <ToggleRow
          title="Set the dash clock over Bluetooth (experimental)"
          description="Some dashboards ask for the time over Bluetooth instead of Wi-Fi, and sit at 00:00 without it."
          checked={settings.bluetoothClockSync}
          onCheckedChange={(bluetoothClockSync) =>
            update(
              { bluetoothClockSync },
              `Bluetooth clock sync changed to enabled=${bluetoothClockSync}.`
            )
          }
        />
        <ToggleRow
          title="Stay linked to the bike's Wi-Fi after disconnecting"
          description="Keeps the phone associated to the bike's Wi-Fi Direct network until you leave the app or turn Wi-Fi off."
          checked={settings.keepWifiDirectAfterDisconnect}
          onCheckedChange={(keepWifiDirectAfterDisconnect) =>
            update(
              { keepWifiDirectAfterDisconnect },
              `Keep Wi-Fi Direct after disconnect set to ${keepWifiDirectAfterDisconnect}.`
            )
          }
        />
      </MotoHubDetailScreen>
    );
  }

  if (detail === 'DIAGNOSTICS') {
    return (
      <MotoHubDetailScreen
        title="Diagnostics"
        backLabel="‹ Settings"
        onBack={() => onOpenDetail(null)}
      >
        <MotoHubCardGroup>
          <MotoHubActionRow
            title="Network diagnostics"
            description="T-Box discovery, Wi-Fi binding, cellular routes"
            onClick={() => onOpenDetail('NETWORK_DIAGNOSTICS')}
          />
          <MotoHubActionRow
            title="Application logs"
            description="Review, copy, export, or clear events"
            value={`${logs.length}`}
            onClick={() => onOpenDetail('APPLICATION_LOGS')}
          />
        </MotoHubCardGroup>

        <ToggleRow
          title="Enable logging"
          description="Master switch for the diagnostic log. Off means nothing is recorded at all."
          checked={settings.loggingEnabled}
          onCheckedChange={(loggingEnabled) => {
            if (loggingEnabled) {
              onUpdateSettings({ ...settings, loggingEnabled: true });
              onLogEvent('SETTINGS', 'Logging enabled.');
            } else {
              onLogEvent('SETTINGS', 'Logging disabled by the user.');
              onUpdateSettings({ ...settings, loggingEnabled: false });
            }
          }}
        />
        <ToggleRow
          title="Verbose T-Box logging"
          description="Full CLIENT_INFO, every candidate profile's score, unknown command hex dumps, and Wi-Fi link quality."
          checked={settings.verboseTBoxLogging}
          enabled={settings.loggingEnabled}
          onCheckedChange={(verboseTBoxLogging) =>
            update({ verboseTBoxLogging }, `Verbose T-Box logging set to ${verboseTBoxLogging}.`)
          }
        />
        <ToggleRow
          title="Show button presses on the dashboard"
          description="Puts a black banner on the TFT for one second naming the button and the action it ran."
          checked={settings.showPressBanner}
          onCheckedChange={(showPressBanner) =>
            update({ showPressBanner }, `Press banner set to ${showPressBanner}.`)
          }
        />
      </MotoHubDetailScreen>
    );
  }

  if (detail === 'NETWORK_DIAGNOSTICS') {
    return (
      <NetworkDiagnosticsView
        motorcycle={activeMotorcycle}
        logs={logs}
        onBack={() => onOpenDetail('DIAGNOSTICS')}
        onLogEvent={onLogEvent}
      />
    );
  }

  if (detail === 'APPLICATION_LOGS') {
    return (
      <ApplicationLogsView
        logs={logs}
        onClear={onClearLogs}
        onBack={() => onOpenDetail('DIAGNOSTICS')}
      />
    );
  }

  if (detail === 'ANDROID_AUTO_HELP') {
    return <AndroidAutoHelpView onBack={() => onOpenDetail(null)} />;
  }

  if (detail === 'ABOUT') {
    return <AboutView onBack={() => onOpenDetail(null)} />;
  }

  const qualityLabel =
    VIDEO_QUALITIES.find((q) => q.value === settings.videoQuality)?.label ?? 'Balanced';
  const powerLabel =
    POWER_MODES.find((m) => m.value === settings.videoPowerMode)?.label ?? 'Auto';
  const resLabel =
    AA_RESOLUTIONS.find((r) => r.value === settings.androidAutoResolution)?.label ?? 'Auto';
  const dpiLabel =
    AA_DENSITIES.find((d) => d.value === settings.androidAutoDensity)?.label ?? 'Auto';

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto px-6 pb-8 pt-1">
      <div className="flex flex-col gap-1">
        <MonoLabel>CONFIGURATION</MonoLabel>
        <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-[#E8ECE2]">
          Settings
        </h1>
      </div>

      <MotoHubCardGroup>
        <MotoHubActionRow
          title="General"
          description="Language, autostart, updates and seamless resume"
          onClick={() => onOpenDetail('GENERAL')}
        />
        <MotoHubActionRow
          title="Video quality"
          description="Encoder detail and power mode for all streams"
          value={`${qualityLabel} · ${powerLabel}`}
          onClick={() => onOpenDetail('VIDEO')}
        />
        <MotoHubActionRow
          title="Android Auto"
          description="Resolution and display mode"
          value={`${resLabel} · ${dpiLabel}`}
          onClick={() => onOpenDetail('ANDROID_AUTO')}
        />
        <MotoHubActionRow
          title="Handlebar buttons"
          description="Drive Android Auto with the motorcycle's buttons"
          value={settings.handlebar.enabled ? 'On' : 'Off'}
          onClick={() => onOpenDetail('HANDLEBAR')}
        />
        <MotoHubActionRow
          title="Connection & automation"
          description="Auto-connect and recovery"
          onClick={() => onOpenDetail('AUTOMATION')}
        />
      </MotoHubCardGroup>

      <MotoHubCardGroup>
        <MotoHubActionRow
          title="Diagnostics"
          description="Network tests and application logs"
          onClick={() => onOpenDetail('DIAGNOSTICS')}
        />
        <MotoHubActionRow
          title="Android Auto does not start"
          description="What to do when Android Auto refuses to project"
          onClick={() => onOpenDetail('ANDROID_AUTO_HELP')}
        />
        <MotoHubActionRow
          title="About MOTO-HUB"
          description="v1.1.130 (224)"
          onClick={() => onOpenDetail('ABOUT')}
        />
      </MotoHubCardGroup>
    </div>
  );
};

const NetworkDiagnosticsView: React.FC<{
  motorcycle: MotorcycleProfile | null;
  logs: ProjectionEvent[];
  onBack: () => void;
  onLogEvent: (source: string, message: string) => void;
}> = ({ motorcycle, logs, onBack, onLogEvent }) => {
  const [running, setRunning] = useState(false);
  const [conclusion, setConclusion] = useState(
    'Tap "Run network tests" to probe T-Box discovery, Wi-Fi binding, and cellular routing.'
  );
  const [checks, setChecks] = useState<NetworkDiagnosticCheck[]>([
    { id: 'profile', title: 'Saved motorcycle profile', detail: 'Check active T-Box credentials', status: DiagnosticStatus.NOT_RUN },
    { id: 'wifi', title: 'T-Box Wi-Fi association', detail: 'Verify local link and gateway route', status: DiagnosticStatus.NOT_RUN },
    { id: 'nsd', title: 'EasyConn NSD discovery', detail: 'Locate _easyconn._tcp endpoint on T-Box', status: DiagnosticStatus.NOT_RUN },
    { id: 'cell', title: 'Cellular internet coexistence', detail: 'Verify mobile data stays reachable while linked to T-Box', status: DiagnosticStatus.NOT_RUN },
  ]);

  const runTests = () => {
    setRunning(true);
    onLogEvent('DIAG', 'Started network diagnostics suite.');
    setChecks((prev) => prev.map((c) => ({ ...c, status: DiagnosticStatus.RUNNING })));
    window.setTimeout(() => {
      const hasBike = Boolean(motorcycle);
      setChecks([
        {
          id: 'profile',
          title: 'Saved motorcycle profile',
          detail: hasBike
            ? `Active profile ${motorcycle?.displayName || motorcycle?.ssid} (${motorcycle?.connectionMode})`
            : 'No motorcycle saved yet — pair a motorcycle first.',
          status: hasBike ? DiagnosticStatus.PASSED : DiagnosticStatus.FAILED,
        },
        {
          id: 'wifi',
          title: 'T-Box Wi-Fi association',
          detail: hasBike
            ? `Target SSID ${motorcycle?.ssid} — gateway 192.168.43.1 reachable (simulated in browser preview).`
            : 'Skipped because no profile is configured.',
          status: hasBike ? DiagnosticStatus.PASSED : DiagnosticStatus.SKIPPED,
        },
        {
          id: 'nsd',
          title: 'EasyConn NSD discovery',
          detail: hasBike
            ? 'Resolved net.easyconn.carman at 192.168.43.1:10925.'
            : 'Skipped.',
          status: hasBike ? DiagnosticStatus.PASSED : DiagnosticStatus.SKIPPED,
        },
        {
          id: 'cell',
          title: 'Cellular internet coexistence',
          detail: navigator.onLine
            ? 'Browser network online — split routing available.'
            : 'Browser reports offline.',
          status: navigator.onLine ? DiagnosticStatus.PASSED : DiagnosticStatus.FAILED,
        },
      ]);
      setConclusion(
        hasBike
          ? 'All diagnostic checks passed. T-Box transport and split cellular routing are ready.'
          : 'Pair a motorcycle first so MOTO-HUB has a target T-Box network to test.'
      );
      setRunning(false);
      onLogEvent('DIAG', 'Network diagnostics completed.');
    }, 850);
  };

  return (
    <MotoHubDetailScreen
      title="Network diagnostics"
      backLabel="‹ Diagnostics"
      onBack={onBack}
    >
      <p className="text-sm leading-relaxed text-[#7E876E]">
        Check T-Box and cellular routes without starting a VPN or changing the default network.
      </p>
      <button
        type="button"
        disabled={running}
        onClick={runTests}
        className="h-14 w-full rounded-[18px] bg-[#C8F240] text-sm font-bold text-[#0B0D09] disabled:opacity-60"
      >
        {running ? 'Tests running…' : 'Run network tests'}
      </button>

      <div className="rounded-[18px] bg-[#1C211A] p-4">
        <MonoLabel>RESULT</MonoLabel>
        <p className="mt-1.5 text-sm text-[#E8ECE2]">{conclusion}</p>
      </div>

      {checks.map((check) => {
        const color =
          check.status === DiagnosticStatus.PASSED
            ? '#2DD881'
            : check.status === DiagnosticStatus.FAILED
            ? '#F05545'
            : check.status === DiagnosticStatus.RUNNING
            ? '#C8F240'
            : '#7E876E';
        return (
          <div key={check.id} className="flex items-start gap-3 rounded-[18px] bg-[#151913] p-4">
            <span
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold text-[#E8ECE2]">{check.title}</div>
              <div className="mt-0.5 text-xs text-[#7E876E]">{check.detail}</div>
              <div
                className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.07em]"
                style={{ color }}
              >
                {check.status.replace('_', ' ')}
              </div>
            </div>
          </div>
        );
      })}

      <div className="rounded-[18px] bg-[#151913] p-4">
        <div className="flex items-center justify-between">
          <MonoLabel>RECENT SESSION EVENTS ({logs.length})</MonoLabel>
        </div>
        <div className="mt-2.5 flex max-h-48 flex-col gap-1.5 overflow-y-auto font-mono text-[11px] text-[#B9C4AB]">
          {logs
            .slice(-10)
            .reverse()
            .map((e) => (
              <div key={e.id} className="border-b border-[#2A3124]/50 pb-1 last:border-0">
                <span className="text-[#7E876E]">
                  {new Date(e.timestamp).toLocaleTimeString([], { hour12: false })}
                </span>{' '}
                <span className="text-[#C8F240]">{e.source}:</span> {e.message}
              </div>
            ))}
        </div>
      </div>
    </MotoHubDetailScreen>
  );
};

const ApplicationLogsView: React.FC<{
  logs: ProjectionEvent[];
  onClear: () => void;
  onBack: () => void;
}> = ({ logs, onClear, onBack }) => {
  const [copied, setCopied] = useState(false);

  const formatted = logs
    .map(
      (e) =>
        `${new Date(e.timestamp).toISOString()} [${e.source}] ${e.message}`
    )
    .join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked in restricted iframe
    }
  };

  return (
    <MotoHubDetailScreen
      title="Application logs"
      backLabel="‹ Diagnostics"
      onBack={onBack}
    >
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 rounded-xl bg-[#C8F240] py-2.5 text-xs font-bold text-[#0B0D09]"
        >
          {copied ? 'Copied!' : 'Copy log'}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="flex-1 rounded-xl border border-[#2A3124] py-2.5 text-xs font-semibold text-[#F05545] hover:bg-[#1C211A]"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-col gap-1.5 rounded-[18px] bg-[#151913] p-4 font-mono text-[11px]">
        {logs.length === 0 ? (
          <div className="text-[#7E876E]">No diagnostic events recorded.</div>
        ) : (
          [...logs].reverse().map((event) => (
            <div key={event.id} className="border-b border-[#2A3124]/40 pb-1.5 last:border-0">
              <span className="text-[#7E876E]">
                {new Date(event.timestamp).toLocaleTimeString([], { hour12: false })}
              </span>{' '}
              <span className="font-semibold text-[#C8F240]">{event.source}</span>{' '}
              <span className="text-[#E8ECE2]">{event.message}</span>
            </div>
          ))
        )}
      </div>
    </MotoHubDetailScreen>
  );
};

const AndroidAutoHelpView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const steps = [
    'Open the Android Auto app\'s settings, scroll to the bottom and tap "Version" ten times. That unlocks its developer options — you only have to do it once.',
    'Stay on that same Android Auto settings screen, open the three-dot menu at the top right and choose "Start head unit server". It is in that menu, not inside Developer settings.',
    'A notification confirms the server is running. Leave it running: it stays up until you stop it or restart the phone.',
    'Go back to MOTO-HUB and start Android Auto. It connects on its own within a couple of seconds — there is nothing else to press.',
  ];
  return (
    <MotoHubDetailScreen
      title="Android Auto does not start"
      backLabel="‹ Back"
      onBack={onBack}
    >
      <p className="text-sm leading-relaxed text-[#E8ECE2]">
        Android Auto 17.4 removed the way an app can ask it to project. MOTO-HUB still tries, and on older versions it works — but when it does not, the four steps below start Android Auto from its own developer menu instead.
      </p>
      <div className="h-px bg-[#2A3124]" />
      <MonoLabel>START ANDROID AUTO YOURSELF</MonoLabel>
      <div className="flex flex-col gap-3">
        {steps.map((text, idx) => (
          <div key={idx} className="flex gap-3">
            <span className="w-5 shrink-0 font-mono text-base font-bold text-[#C8F240]">
              {idx + 1}
            </span>
            <p className="text-sm leading-relaxed text-[#E8ECE2]">{text}</p>
          </div>
        ))}
      </div>
      <div className="h-px bg-[#2A3124]" />
      <MonoLabel>WHILE YOU ARE IN THERE</MonoLabel>
      <div className="flex gap-3">
        <span className="w-5 shrink-0 font-mono text-base font-bold text-[#C8F240]">5</span>
        <p className="text-sm leading-relaxed text-[#E8ECE2]">
          Open Developer settings from that same screen and turn on &ldquo;Add new cars to Android Auto&rdquo; (older versions call it &ldquo;Unknown sources&rdquo;).
        </p>
      </div>
    </MotoHubDetailScreen>
  );
};

const AboutView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <MotoHubDetailScreen title="About MOTO-HUB" backLabel="‹ Settings" onBack={onBack}>
    <MonoLabel>ABOUT THE PROJECT</MonoLabel>
    <h2 className="text-[22px] font-bold leading-snug text-[#E8ECE2]">
      Your phone.
      <br />
      Your motorcycle display.
    </h2>
    <p className="text-sm leading-relaxed text-[#7E876E]">
      MOTO-HUB connects an Android 12+ phone to a motorcycle dashboard that pairs over EasyConn — the Carbit software several manufacturers ship, CFMOTO among them. It supports screen and app mirroring, Android Auto projection, saved motorcycle profiles, and on-device diagnostics.
    </p>

    <div className="flex items-center justify-between rounded-[18px] border border-[#C8F240]/35 bg-[#C8F240]/10 px-4 py-3.5">
      <div>
        <MonoLabel>VERSION</MonoLabel>
        <div className="mt-0.5 font-mono text-sm font-bold text-[#E8ECE2]">1.1.130 (224)</div>
      </div>
      <div className="text-right">
        <MonoLabel>LICENSE</MonoLabel>
        <div className="mt-0.5 font-mono text-sm font-bold text-[#E8ECE2]">AGPL-3.0</div>
      </div>
    </div>

    <div className="flex flex-col gap-2.5 rounded-[22px] border border-[#2A3124] bg-[#151913] p-4">
      <MonoLabel>EXPERIMENTAL SOFTWARE</MonoLabel>
      <div className="text-sm font-bold text-[#E8ECE2]">
        MOTO-HUB is an experimental proof-of-concept, not a production-grade product.
      </div>
      <p className="text-xs leading-relaxed text-[#7E876E]">
        Development happens on a CFMOTO 700MT-ADV dashboard. Riders have also tested it on CFMOTO, Zontes, QJMOTOR, KOVE, Benelli, Voge, Moto Morini, Morbidelli, Keeway, and Rieju dashboards. Do not rely on it as your only source of critical navigation; configure while parked.
      </p>
    </div>
  </MotoHubDetailScreen>
);

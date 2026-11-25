import React, { useEffect, useState } from 'react';
import {
  ActiveProjectionMode,
  AndroidAutoDisplayMode,
  DISPLAY_MODE_INFO,
  HANDLEBAR_ACTION_LABELS,
  HandlebarButton,
  HubDestination,
  MotoHubSettingsState,
  MotorcycleProfile,
  PressKind,
  SessionPhase,
} from '../types/motohub';
import { pressKey } from '../lib/storage';
import { ModeIcon } from '../components/MotoHubIcons';
import {
  HeroOptionRow,
  HeroPrimaryAction,
  HeroTile,
  LivePill,
  MonoLabel,
  MotoHubCardGroup,
  MotoHubNotice,
  StatusPill,
  ToggleRow,
} from '../components/MotoHubUi';

interface RideScreenProps {
  motorcycle: MotorcycleProfile | null;
  phase: SessionPhase;
  destination: HubDestination;
  errorMessage: string | null;
  activeMode: ActiveProjectionMode;
  dimDisplayEnabled: boolean;
  aoaAccessoryConnected: boolean;
  settings: MotoHubSettingsState;
  onScanQr: () => void;
  onImportQrPhoto: () => void;
  onManualPairing: () => void;
  onConnect: () => void;
  onCancelConnection: () => void;
  onDisconnect: () => void;
  onStartMirror: () => void;
  onStartAndroidAuto: () => void;
  onStartPhoneOnlyAndroidAuto: () => void;
  onStartExternalDisplay: () => void;
  onStopSession: () => void;
  onDimDisplayChanged: (v: boolean) => void;
  onToggleAoaAccessory: () => void;
  onOpenAndroidAutoHelp: () => void;
  onLogEvent: (source: string, message: string) => void;
}

export const RideScreen: React.FC<RideScreenProps> = ({
  motorcycle,
  phase,
  destination,
  errorMessage,
  activeMode,
  dimDisplayEnabled,
  aoaAccessoryConnected,
  settings,
  onScanQr,
  onImportQrPhoto,
  onManualPairing,
  onConnect,
  onCancelConnection,
  onDisconnect,
  onStartMirror,
  onStartAndroidAuto,
  onStartPhoneOnlyAndroidAuto,
  onStartExternalDisplay,
  onStopSession,
  onDimDisplayChanged,
  onToggleAoaAccessory,
  onOpenAndroidAutoHelp,
  onLogEvent,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  const compactHero =
    destination === HubDestination.CONNECTING ||
    destination === HubDestination.ACTIVE_SESSION;

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto px-5 pb-6 pt-1">
      {motorcycle && <MotorcycleHero motorcycle={motorcycle} compact={compactHero} />}

      {destination === HubDestination.PAIRING && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <MonoLabel>FIRST-TIME SETUP</MonoLabel>
            <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-[#E8ECE2]">
              Connect your motorcycle.
            </h1>
            <p className="text-sm leading-relaxed text-[#7E876E]">
              Scan the T-Box QR code to save the network credentials automatically.
            </p>
          </div>
          <HeroPrimaryAction
            title="Scan motorcycle QR code"
            subtitle="Point the camera at the code on the dash"
            icon="QrScan"
            color="#C8F240"
            onClick={onScanQr}
          />
          <div className="grid grid-cols-2 gap-3">
            <HeroTile
              title="Import QR"
              subtitle="From a photo you already took"
              icon="Import"
              color="#FFA84B"
              onClick={onImportQrPhoto}
            />
            <HeroTile
              title="Manual setup"
              subtitle="Type the network name and password"
              icon="Manual"
              color="#B388FF"
              onClick={onManualPairing}
            />
          </div>
        </div>
      )}

      {destination === HubDestination.CONNECTION && (
        <div className="flex flex-col gap-4">
          {errorMessage && (
            <MotoHubNotice label="CONNECTION FAILED" tone="error" body={errorMessage} />
          )}
          <HeroPrimaryAction
            title="Connect"
            subtitle="Join the motorcycle network and find the T-Box"
            icon="Bike"
            color="#C8F240"
            onClick={onConnect}
          />
          <div className="grid grid-cols-2 gap-3">
            <HeroTile
              title="Scan new QR"
              subtitle="Replace the saved credentials"
              icon="QrScan"
              color="#5BA8F0"
              onClick={onScanQr}
            />
            <HeroTile
              title="Import QR"
              subtitle="From a photo you already took"
              icon="Import"
              color="#FFA84B"
              onClick={onImportQrPhoto}
            />
          </div>
          <MonoLabel className="mt-1">MORE WAYS TO START</MonoLabel>
          <MotoHubCardGroup>
            <HeroOptionRow
              title="Connect manually"
              description="No QR code - type the network name and password shown on the dash."
              icon="Manual"
              color="#B388FF"
              onClick={onManualPairing}
            />
            <HeroOptionRow
              title="Android Auto on this phone"
              description="No T-Box and no motorcycle: Android Auto runs on this screen."
              icon="Auto"
              color="#3EC8D0"
              onClick={() => {
                onStartPhoneOnlyAndroidAuto();
                setPreviewOpen(true);
              }}
            />
          </MotoHubCardGroup>
        </div>
      )}

      {destination === HubDestination.CONNECTING && motorcycle && (
        <div className="flex flex-col items-center pt-3">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#2A3124] border-t-[#C8F240]" />
          <h2 className="mt-4 text-[22px] font-bold text-[#E8ECE2]">Connecting</h2>
          <p className="mt-1 text-sm text-[#7E876E]">Setting up network and T-Box</p>

          <div className="mt-6 w-full divide-y divide-[#2A3124] rounded-[22px] bg-[#151913] px-[18px] py-1">
            <ConnectionStep label="Profile loaded" done />
            <ConnectionStep
              label={`Connecting to ${motorcycle.ssid}`}
              done={phase === SessionPhase.DISCOVERING_TBOX}
              current={phase === SessionPhase.CONNECTING_NETWORK}
            />
            <ConnectionStep
              label="Finding T-Box service"
              current={phase === SessionPhase.DISCOVERING_TBOX}
            />
          </div>

          <button
            type="button"
            onClick={onCancelConnection}
            className="mt-5 w-3/5 rounded-[14px] border border-[#2A3124] py-3 text-sm font-semibold text-[#E8ECE2] transition-colors hover:bg-[#1C211A]"
          >
            Cancel
          </button>
        </div>
      )}

      {destination === HubDestination.MODE_SELECTION && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-start gap-2">
            <LivePill text="T-Box connected" />
            <h1 className="text-[28px] font-bold leading-tight text-[#E8ECE2]">What to show?</h1>
          </div>

          <div className={`grid gap-3 ${aoaAccessoryConnected ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <ModeGridItem name="Mirror" color="#5BA8F0" onClick={onStartMirror} />
            <ModeGridItem name="Auto" color="#3EC8D0" onClick={onStartAndroidAuto} />
            {aoaAccessoryConnected && (
              <ModeGridItem name="External" color="#5BA8F0" onClick={onStartExternalDisplay} />
            )}
          </div>

          <div className="flex items-center justify-between rounded-[16px] bg-[#151913] px-4 py-3 text-xs text-[#7E876E]">
            <span>USB AOA accessory attached</span>
            <button
              type="button"
              onClick={onToggleAoaAccessory}
              className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors ${
                aoaAccessoryConnected
                  ? 'bg-[#2DD881]/15 text-[#2DD881]'
                  : 'bg-[#1C211A] text-[#7E876E] hover:text-[#E8ECE2]'
              }`}
            >
              {aoaAccessoryConnected ? 'CONNECTED' : 'SIMULATE USB'}
            </button>
          </div>

          <button
            type="button"
            onClick={onDisconnect}
            className="w-full rounded-[14px] py-3.5 text-center text-sm font-medium text-[#7E876E] transition-colors hover:bg-[#151913] hover:text-[#E8ECE2]"
          >
            Disconnect
          </button>
        </div>
      )}

      {destination === HubDestination.ACTIVE_SESSION && (
        <ActiveSessionContent
          motorcycle={motorcycle}
          activeMode={activeMode}
          dimDisplayEnabled={dimDisplayEnabled}
          settings={settings}
          onDimDisplayChanged={onDimDisplayChanged}
          onOpenPreview={() => setPreviewOpen(true)}
          onOpenHelp={onOpenAndroidAutoHelp}
          onStop={onStopSession}
        />
      )}

      {previewOpen && (
        <ProjectionPreviewModal
          motorcycle={motorcycle}
          activeMode={activeMode}
          settings={settings}
          onClose={() => setPreviewOpen(false)}
          onLogEvent={onLogEvent}
        />
      )}
    </div>
  );
};

const MotorcycleHero: React.FC<{ motorcycle: MotorcycleProfile; compact: boolean }> = ({
  motorcycle,
  compact,
}) => {
  const displayName = motorcycle.displayName?.trim() || 'My motorcycle';
  const monogram = displayName.slice(0, 1).toUpperCase() || 'M';

  if (compact) {
    return (
      <div className="flex w-full items-center gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#151913]">
          {motorcycle.photoUrl ? (
            <img
              src={motorcycle.photoUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <ModeIcon mode="Bike" color="#C8F240" size={24} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[17px] font-bold text-[#E8ECE2]">{displayName}</div>
          <div className="truncate font-mono text-[11px] text-[#7E876E]">{motorcycle.ssid}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[210px] w-full overflow-hidden rounded-[22px] bg-[#151913]">
      {motorcycle.photoUrl && (
        <img
          src={motorcycle.photoUrl}
          alt={displayName}
          className="h-full w-full object-cover"
        />
      )}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-3 -top-7 select-none text-[145px] font-bold leading-none ${
          motorcycle.photoUrl ? 'text-[#E8ECE2]/10' : 'text-[#E8ECE2]/15'
        }`}
      >
        {monogram}
      </div>
      <div
        className="absolute inset-x-0 bottom-0 px-4 py-4"
        style={{
          background:
            'linear-gradient(180deg, rgba(11,13,9,0) 0%, rgba(11,13,9,0.58) 45%, rgba(11,13,9,0.95) 100%)',
        }}
      >
        <div className="truncate text-[26px] font-bold leading-tight tracking-[-0.02em] text-[#E8ECE2]">
          {displayName}
        </div>
        <span className="mt-1 inline-block rounded-lg bg-[#151913]/80 px-2 py-0.5 font-mono text-[11px] text-[#7E876E]">
          {motorcycle.ssid}
        </span>
      </div>
    </div>
  );
};

const ConnectionStep: React.FC<{ label: string; done?: boolean; current?: boolean }> = ({
  label,
  done,
  current,
}) => (
  <div className="flex items-center justify-between py-3.5 text-sm">
    <span className={done || current ? 'font-medium text-[#E8ECE2]' : 'text-[#7E876E]'}>
      {label}
    </span>
    {done ? (
      <span className="font-mono text-xs font-bold text-[#2DD881]">OK</span>
    ) : current ? (
      <span className="h-2 w-2 animate-pulse rounded-full bg-[#C8F240]" />
    ) : (
      <span className="h-2 w-2 rounded-full bg-[#2A3124]" />
    )}
  </div>
);

const ModeGridItem: React.FC<{
  name: 'Mirror' | 'Auto' | 'External';
  color: string;
  onClick: () => void;
}> = ({ name, color, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex flex-col items-center gap-3.5 rounded-[22px] bg-[#151913] px-2 py-6 transition-colors hover:bg-[#1C211A] active:scale-[0.98]"
  >
    <div
      className="flex h-16 w-16 items-center justify-center rounded-[22px]"
      style={{ backgroundColor: `${color}20` }}
    >
      <ModeIcon mode={name} color={color} size={32} />
    </div>
    <span className="text-[15px] font-semibold text-[#E8ECE2]">{name}</span>
  </button>
);

const ActiveSessionContent: React.FC<{
  motorcycle: MotorcycleProfile | null;
  activeMode: ActiveProjectionMode;
  dimDisplayEnabled: boolean;
  settings: MotoHubSettingsState;
  onDimDisplayChanged: (v: boolean) => void;
  onOpenPreview: () => void;
  onOpenHelp: () => void;
  onStop: () => void;
}> = ({
  motorcycle,
  activeMode,
  dimDisplayEnabled,
  settings,
  onDimDisplayChanged,
  onOpenPreview,
  onOpenHelp,
  onStop,
}) => {
  const [frames, setFrames] = useState(0);
  const fps =
    settings.videoPowerMode === 'SAVER'
      ? 20
      : settings.videoPowerMode === 'BALANCED'
      ? 24
      : 30;

  useEffect(() => {
    const id = window.setInterval(() => {
      setFrames((f) => f + fps);
    }, 1000);
    return () => window.clearInterval(id);
  }, [fps]);

  const isAA = activeMode === 'ANDROID_AUTO' || activeMode === 'PHONE_ONLY_AA';
  const modeLabel =
    activeMode === 'ANDROID_AUTO'
      ? 'Android Auto streaming'
      : activeMode === 'PHONE_ONLY_AA'
      ? 'Android Auto (phone only)'
      : activeMode === 'EXTERNAL_USB'
      ? 'USB External Display (AOA)'
      : 'Screen mirroring active';

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[22px] border border-[#2DD881]/35 bg-[#151913] p-5">
        <div className="flex items-center justify-between">
          <LivePill text={modeLabel} />
          <StatusPill text={`${fps} FPS`} color="#3EC8D0" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-[#1C211A] p-3 font-mono text-xs">
          <div>
            <div className="text-[10px] text-[#7E876E]">FRAMES</div>
            <div className="mt-0.5 font-bold text-[#E8ECE2]">{frames.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#7E876E]">LAYOUT</div>
            <div className="mt-0.5 font-bold text-[#C8F240]">
              {motorcycle ? DISPLAY_MODE_INFO[motorcycle.displayMode].shortLabel : 'FIT'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#7E876E]">QUALITY</div>
            <div className="mt-0.5 font-bold text-[#E8ECE2]">{settings.videoQuality}</div>
          </div>
        </div>
      </div>

      <HeroPrimaryAction
        title={isAA ? 'Open Android Auto preview' : 'Open TFT stream preview'}
        subtitle="Inspect safe margins, aspect layout, and test handlebar buttons"
        icon="Preview"
        color="#3EC8D0"
        onClick={onOpenPreview}
      />

      <div className="rounded-[22px] bg-[#151913] px-4 py-2">
        <ToggleRow
          title="Dim phone display"
          description="Reduce phone screen brightness while the motorcycle TFT receives the stream"
          checked={dimDisplayEnabled}
          onCheckedChange={onDimDisplayChanged}
        />
      </div>

      {isAA && (
        <button
          type="button"
          onClick={onOpenHelp}
          className="text-left text-xs font-medium text-[#7E876E] underline decoration-[#2A3124] underline-offset-4 hover:text-[#C8F240]"
        >
          Android Auto does not start? View head unit server steps
        </button>
      )}

      <button
        type="button"
        onClick={onStop}
        className="h-14 w-full rounded-[16px] border border-[#F05545]/60 bg-[#F05545]/15 text-sm font-bold text-[#F05545] transition-colors hover:bg-[#F05545]/25"
      >
        Stop projection
      </button>
    </div>
  );
};

const ProjectionPreviewModal: React.FC<{
  motorcycle: MotorcycleProfile | null;
  activeMode: ActiveProjectionMode;
  settings: MotoHubSettingsState;
  onClose: () => void;
  onLogEvent: (source: string, message: string) => void;
}> = ({ motorcycle, activeMode, settings, onClose, onLogEvent }) => {
  const [bannerText, setBannerText] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const displayMode = motorcycle?.displayMode ?? AndroidAutoDisplayMode.STRETCH;
  const margins = motorcycle?.screenMargins ?? { top: 0, bottom: 0, left: 0, right: 0 };

  const objectFitClass =
    displayMode === AndroidAutoDisplayMode.LETTERBOX
      ? 'object-contain'
      : displayMode === AndroidAutoDisplayMode.FILL
      ? 'object-cover'
      : 'object-fill';

  const triggerHandlebar = (button: HandlebarButton, kind: PressKind = PressKind.PRESS) => {
    const action = settings.handlebar.mappings[pressKey(button, kind)];
    const actionInfo = action ? HANDLEBAR_ACTION_LABELS[action] : null;
    if (button === HandlebarButton.UP || button === HandlebarButton.LEFT) {
      setFocusedIndex((i) => (i + 3) % 4);
    } else if (button === HandlebarButton.DOWN || button === HandlebarButton.RIGHT) {
      setFocusedIndex((i) => (i + 1) % 4);
    }
    const label = `${button} ${kind.toLowerCase()} → ${actionInfo?.shortLabel ?? 'Unmapped'}`;
    onLogEvent('CONTROLS', `Handlebar press during preview: ${label}`);
    if (settings.showPressBanner) {
      setBannerText(label);
      window.setTimeout(() => setBannerText(null), 1300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="flex w-full max-w-2xl flex-col gap-4 rounded-[24px] border border-[#2A3124] bg-[#0B0D09] p-5">
        <div className="flex items-center justify-between">
          <div>
            <MonoLabel>
              {activeMode === 'MIRROR' ? 'TFT MIRROR PREVIEW' : 'ANDROID AUTO TFT PREVIEW'}
            </MonoLabel>
            <div className="text-base font-bold text-[#E8ECE2]">
              {motorcycle?.displayName ?? 'Phone-only preview'} ·{' '}
              {DISPLAY_MODE_INFO[displayMode].shortLabel}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#1C211A] px-3.5 py-2 text-xs font-semibold text-[#E8ECE2] hover:bg-[#262C22]"
          >
            Close
          </button>
        </div>

        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl border border-[#2A3124] bg-black">
          <div
            className="h-full w-full"
            style={{
              paddingTop: `${Math.min(margins.top, 60) / 3}px`,
              paddingBottom: `${Math.min(margins.bottom, 60) / 3}px`,
              paddingLeft: `${Math.min(margins.left, 60) / 3}px`,
              paddingRight: `${Math.min(margins.right, 60) / 3}px`,
            }}
          >
            <img
              src="/media/tft-android-auto.png"
              alt="Android Auto on motorcycle TFT"
              className={`h-full w-full ${objectFitClass}`}
            />
          </div>

          <div className="pointer-events-none absolute left-3 top-3 flex gap-1.5">
            {['Maps', 'Music', 'Phone', 'Home'].map((item, idx) => (
              <span
                key={item}
                className={`rounded-lg px-2 py-0.5 font-mono text-[10px] font-bold ${
                  focusedIndex === idx
                    ? 'bg-[#C8F240] text-[#0B0D09]'
                    : 'bg-black/70 text-[#B9C4AB]'
                }`}
              >
                {item}
              </span>
            ))}
          </div>

          {bannerText && (
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-xl border border-[#C8F240]/50 bg-black/90 px-4 py-2.5 text-center font-mono text-xs font-bold text-[#C8F240]">
              {bannerText}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-[#7E876E]">
            <span>Simulate handlebar buttons ({settings.handlebar.inputMode})</span>
            <span className="font-mono">
              Margins T:{margins.top} B:{margins.bottom} L:{margins.left} R:{margins.right}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[
              HandlebarButton.UP,
              HandlebarButton.DOWN,
              HandlebarButton.LEFT,
              HandlebarButton.RIGHT,
              HandlebarButton.SELECT,
            ].map((btn) => (
              <button
                key={btn}
                type="button"
                onClick={() => triggerHandlebar(btn)}
                className="rounded-xl border border-[#2A3124] bg-[#151913] py-2.5 font-mono text-xs font-semibold text-[#E8ECE2] transition-colors hover:border-[#C8F240] hover:text-[#C8F240]"
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

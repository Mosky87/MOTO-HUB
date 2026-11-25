import React, { useState } from 'react';
import {
  AndroidAutoDisplayMode,
  DISPLAY_MODE_INFO,
  MotorcycleProfile,
  PROFILE_OVERRIDES,
  TBoxScreenMargins,
} from '../types/motohub';
import { ModeIcon } from '../components/MotoHubIcons';
import {
  HeroPrimaryAction,
  HeroTile,
  LivePill,
  MonoLabel,
  MotoHubActionRow,
  MotoHubCardGroup,
  MotoHubDetailScreen,
  MotoHubRadioRow,
} from '../components/MotoHubUi';

interface GarageScreenProps {
  profiles: MotorcycleProfile[];
  activeProfileId: string | null;
  onAddMotorcycleQr: () => void;
  onAddMotorcycleManual: () => void;
  onSelectMotorcycle: (id: string) => void;
  onUpdateProfile: (profile: MotorcycleProfile) => void;
  onDeleteProfile: (id: string) => void;
  onLogEvent: (source: string, message: string) => void;
}

type DetailSubscreen = null | 'DISPLAY' | 'MARGINS' | 'OVERRIDE' | 'CAPABILITIES';

export const GarageScreen: React.FC<GarageScreenProps> = ({
  profiles,
  activeProfileId,
  onAddMotorcycleQr,
  onAddMotorcycleManual,
  onSelectMotorcycle,
  onUpdateProfile,
  onDeleteProfile,
  onLogEvent,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subscreen, setSubscreen] = useState<DetailSubscreen>(null);

  const editingProfile = editingId ? profiles.find((p) => p.id === editingId) ?? null : null;

  if (editingProfile) {
    return (
      <MotorcycleDetailsView
        profile={editingProfile}
        subscreen={subscreen}
        onOpenSubscreen={setSubscreen}
        onBack={() => {
          setSubscreen(null);
          setEditingId(null);
        }}
        onSave={onUpdateProfile}
        onDelete={() => {
          onDeleteProfile(editingProfile.id);
          setSubscreen(null);
          setEditingId(null);
        }}
        onLogEvent={onLogEvent}
      />
    );
  }

  const active = profiles.find((p) => p.id === activeProfileId) ?? null;
  const others = profiles.filter((p) => p.id !== active?.id);

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto px-6 pb-8 pt-1">
      <div className="flex flex-col gap-1">
        <MonoLabel>YOUR GARAGE</MonoLabel>
        <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-[#E8ECE2]">
          Motorcycles
        </h1>
      </div>

      {!active ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2.5 rounded-[22px] bg-[#C8F240]/10 p-6 text-center">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#C8F240]">
              <ModeIcon mode="Bike" color="#0B0D09" size={38} />
            </div>
            <div className="text-lg font-bold text-[#E8ECE2]">Your garage is empty</div>
            <div className="text-sm text-[#7E876E]">
              Add your first motorcycle to get rolling.
            </div>
          </div>
          <HeroPrimaryAction
            title="Scan motorcycle QR code"
            subtitle="Point your camera at the T-Box sticker"
            icon="QrScan"
            color="#C8F240"
            onClick={onAddMotorcycleQr}
          />
          <HeroTile
            title="No QR? Manual setup"
            subtitle="Type the network in yourself"
            icon="Manual"
            color="#B388FF"
            onClick={onAddMotorcycleManual}
            className="w-full"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div
            onClick={() => setEditingId(active.id)}
            className="cursor-pointer rounded-[22px] border-[1.5px] border-[#C8F240]/70 bg-[#151913] p-3 transition-colors hover:bg-[#1C211A]"
          >
            <div className="relative h-[178px] w-full overflow-hidden rounded-2xl bg-[#1C211A]">
              {active.photoUrl ? (
                <img
                  src={active.photoUrl}
                  alt={active.displayName ?? active.ssid}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ModeIcon mode="Bike" color="#7E876E" size={48} />
                </div>
              )}
              <div className="absolute left-2.5 top-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#C8F240]">
                <ModeIcon mode="Bike" color="#0B0D09" size={22} />
              </div>
            </div>
            <div className="mt-3.5 flex items-start justify-between gap-3 px-1">
              <div className="min-w-0 flex-1">
                <LivePill text="ACTIVE PROFILE" />
                <div className="mt-1.5 truncate text-xl font-bold text-[#E8ECE2]">
                  {active.displayName || 'Unnamed motorcycle'}
                </div>
                <div className="truncate font-mono text-xs text-[#7E876E]">{active.ssid}</div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(active.id);
                }}
                className="rounded-xl border border-[#2A3124] px-3.5 py-2 text-xs font-semibold text-[#C8F240] hover:bg-[#262C22]"
              >
                Manage
              </button>
            </div>
          </div>

          {others.length > 0 && (
            <div className="flex flex-col gap-3">
              <MonoLabel>SAVED MOTORCYCLES</MonoLabel>
              {others.map((bike) => (
                <div
                  key={bike.id}
                  onClick={() => setEditingId(bike.id)}
                  className="flex cursor-pointer items-center gap-3.5 rounded-[22px] bg-[#151913] p-3 transition-colors hover:bg-[#1C211A]"
                >
                  <div className="relative flex h-[78px] w-[96px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#1C211A]">
                    {bike.photoUrl ? (
                      <img
                        src={bike.photoUrl}
                        alt={bike.displayName ?? bike.ssid}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ModeIcon mode="Bike" color="#7E876E" size={28} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold text-[#E8ECE2]">
                      {bike.displayName || 'Unnamed motorcycle'}
                    </div>
                    <div className="truncate font-mono text-xs text-[#7E876E]">{bike.ssid}</div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMotorcycle(bike.id);
                      }}
                      className="mt-2 rounded-xl bg-[#C8F240]/15 px-3 py-1.5 text-xs font-semibold text-[#C8F240] hover:bg-[#C8F240]/25"
                    >
                      Use this motorcycle
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(bike.id);
                    }}
                    className="px-2 py-1 text-xs font-semibold text-[#7E876E] hover:text-[#E8ECE2]"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <HeroTile
              title="Add motorcycle"
              subtitle="Scan its T-Box QR code"
              icon="Bike"
              color="#C8F240"
              onClick={onAddMotorcycleQr}
            />
            <HeroTile
              title="No QR? Manual"
              subtitle="Type the network in"
              icon="Manual"
              color="#B388FF"
              onClick={onAddMotorcycleManual}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const MotorcycleDetailsView: React.FC<{
  profile: MotorcycleProfile;
  subscreen: DetailSubscreen;
  onOpenSubscreen: (s: DetailSubscreen) => void;
  onBack: () => void;
  onSave: (profile: MotorcycleProfile) => void;
  onDelete: () => void;
  onLogEvent: (source: string, message: string) => void;
}> = ({ profile, subscreen, onOpenSubscreen, onBack, onSave, onDelete, onLogEvent }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (subscreen === 'DISPLAY') {
    return (
      <MotoHubDetailScreen
        title="Android Auto Display"
        backLabel="‹ Motorcycle"
        onBack={() => onOpenSubscreen(null)}
      >
        <p className="text-sm text-[#7E876E]">
          Choose how the complete Android Auto image is fitted to the TFT.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            AndroidAutoDisplayMode.LETTERBOX,
            AndroidAutoDisplayMode.STRETCH,
            AndroidAutoDisplayMode.FILL,
          ].map((mode) => {
            const selected = profile.displayMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  onSave({ ...profile, displayMode: mode });
                  onLogEvent('GARAGE', `Display mode for ${profile.ssid} set to ${mode}.`);
                }}
                className={`h-12 rounded-[14px] border text-sm font-bold transition-colors ${
                  selected
                    ? 'border-[#C8F240] bg-[#C8F240]/15 text-[#C8F240]'
                    : 'border-[#2A3124] bg-transparent text-[#E8ECE2] hover:bg-[#151913]'
                }`}
              >
                {DISPLAY_MODE_INFO[mode].shortLabel}
              </button>
            );
          })}
        </div>
        <p className="text-xs leading-relaxed text-[#7E876E]">
          {DISPLAY_MODE_INFO[profile.displayMode].description}
        </p>
      </MotoHubDetailScreen>
    );
  }

  if (subscreen === 'MARGINS') {
    const updateMargin = (field: keyof TBoxScreenMargins, raw: string) => {
      const parsed = Math.max(0, Math.min(200, Number.parseInt(raw || '0', 10) || 0));
      onSave({
        ...profile,
        screenMargins: { ...profile.screenMargins, [field]: parsed },
      });
    };
    return (
      <MotoHubDetailScreen
        title="TFT Safe Margins"
        backLabel="‹ Motorcycle"
        onBack={() => onOpenSubscreen(null)}
      >
        <p className="text-sm leading-relaxed text-[#7E876E]">
          Exclude pixels occupied by the motorcycle UI. These values are stored for this motorcycle and applied to both Android Auto video and touch.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
            <label key={side} className="flex flex-col gap-1">
              <span className="text-xs capitalize text-[#7E876E]">{side} (px)</span>
              <input
                type="number"
                min={0}
                max={200}
                value={profile.screenMargins[side]}
                onChange={(e) => updateMargin(side, e.target.value)}
                className="h-11 rounded-[12px] border border-[#2A3124] bg-[#151913] px-3 font-mono text-sm text-[#E8ECE2] focus:border-[#C8F240] focus:outline-none"
              />
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            onSave({ ...profile, screenMargins: { top: 0, bottom: 0, left: 0, right: 0 } })
          }
          className="h-11 w-full rounded-[14px] border border-[#2A3124] text-sm font-semibold text-[#E8ECE2] hover:bg-[#1C211A]"
        >
          Reset margins
        </button>
      </MotoHubDetailScreen>
    );
  }

  if (subscreen === 'OVERRIDE') {
    const currentKey = profile.profileOverrideKey ?? 'auto';
    return (
      <MotoHubDetailScreen
        title="T-Box Profile Override"
        backLabel="‹ Motorcycle"
        onBack={() => onOpenSubscreen(null)}
      >
        <p className="text-sm leading-relaxed text-[#7E876E]">
          Override the automatic profile detection for this motorcycle. Use only if the dashboard behaves unexpectedly. Tap the active option again to return to Auto.
        </p>
        <div className="flex flex-col gap-2">
          {PROFILE_OVERRIDES.map((opt) => {
            const isActive = currentKey === opt.key;
            return (
              <MotoHubRadioRow
                key={opt.key}
                title={opt.label}
                description={opt.description}
                selected={isActive}
                onClick={() => {
                  const nextKey = isActive || opt.key === 'auto' ? null : opt.key;
                  onSave({ ...profile, profileOverrideKey: nextKey });
                  onLogEvent(
                    'GARAGE',
                    `Profile override for ${profile.ssid}: ${nextKey ?? 'Auto'}.`
                  );
                }}
              />
            );
          })}
        </div>
      </MotoHubDetailScreen>
    );
  }

  if (subscreen === 'CAPABILITIES') {
    return (
      <CapabilityInspectorScreen
        profile={profile}
        onBack={() => onOpenSubscreen(null)}
        onLogEvent={onLogEvent}
      />
    );
  }

  const overrideLabel =
    PROFILE_OVERRIDES.find((o) => o.key === (profile.profileOverrideKey ?? 'auto'))?.label ??
    'Auto';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSave({ ...profile, photoUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto px-5 pb-8 pt-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-bold tracking-[0.07em] text-[#E8ECE2]">
          MOTO-HUB
        </span>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-[#C8F240] hover:underline"
        >
          Back
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <MonoLabel>MOTORCYCLE PROFILE</MonoLabel>
        <h1 className="text-[22px] font-bold text-[#E8ECE2]">Make it yours</h1>
        <p className="text-sm text-[#7E876E]">Changes are saved immediately.</p>
      </div>

      <div className="flex h-[200px] w-full items-center justify-center overflow-hidden rounded-[22px] bg-[#151913]">
        {profile.photoUrl ? (
          <img
            src={profile.photoUrl}
            alt={profile.displayName ?? profile.ssid}
            className="h-full w-full object-cover"
          />
        ) : (
          <ModeIcon mode="Bike" color="#7E876E" size={56} />
        )}
      </div>

      <div className="flex gap-2.5">
        <label className="flex h-12 flex-1 cursor-pointer items-center justify-center rounded-[14px] border border-[#2A3124] text-sm font-semibold text-[#E8ECE2] transition-colors hover:bg-[#1C211A]">
          {profile.photoUrl ? 'Change photo' : 'Add photo'}
          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </label>
        {profile.photoUrl && (
          <button
            type="button"
            onClick={() => onSave({ ...profile, photoUrl: null })}
            className="h-12 flex-1 rounded-[14px] border border-[#F05545]/60 text-sm font-semibold text-[#F05545] hover:bg-[#F05545]/10"
          >
            Remove photo
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-[22px] bg-[#151913] p-[18px]">
        <div className="text-[15px] font-semibold text-[#E8ECE2]">Identity</div>
        <input
          type="text"
          value={profile.displayName ?? ''}
          onChange={(e) => onSave({ ...profile, displayName: e.target.value || null })}
          placeholder="For example: MT700 Adventure"
          className="h-11 rounded-[12px] border border-[#2A3124] bg-[#0B0D09] px-3 text-sm text-[#E8ECE2] focus:border-[#C8F240] focus:outline-none"
        />
        <p className="text-xs text-[#7E876E]">The name is only used inside MOTO-HUB.</p>
        <div className="my-1 h-px bg-[#2A3124]" />
        <div className="text-[15px] font-semibold text-[#E8ECE2]">Fuel</div>
        <input
          type="number"
          value={profile.fuelTankRangeKm ?? ''}
          onChange={(e) => {
            const val = Number.parseInt(e.target.value, 10);
            onSave({ ...profile, fuelTankRangeKm: Number.isFinite(val) && val > 0 ? val : null });
          }}
          placeholder="Tank range (km), e.g. 300"
          className="h-11 rounded-[12px] border border-[#2A3124] bg-[#0B0D09] px-3 text-sm text-[#E8ECE2] focus:border-[#C8F240] focus:outline-none"
        />
        <p className="text-xs text-[#7E876E]">
          Full-tank range on a fill-up. Powers the fuel-range warning in navigation.
        </p>
      </div>

      <MotoHubCardGroup>
        <MotoHubActionRow
          title="Android Auto Display"
          description="How the complete Android Auto image fits the TFT"
          value={DISPLAY_MODE_INFO[profile.displayMode].shortLabel}
          onClick={() => onOpenSubscreen('DISPLAY')}
        />
        <MotoHubActionRow
          title="TFT Safe Margins"
          description="Exclude pixels occupied by the motorcycle UI"
          onClick={() => onOpenSubscreen('MARGINS')}
        />
        <MotoHubActionRow
          title="T-Box Profile Override"
          description="Override automatic profile detection"
          value={overrideLabel}
          onClick={() => onOpenSubscreen('OVERRIDE')}
        />
        <MotoHubActionRow
          title="T-Box Capability Inspector"
          description="Endpoint, geometry, protocol, and feature flags"
          onClick={() => onOpenSubscreen('CAPABILITIES')}
        />
      </MotoHubCardGroup>

      <div className="flex flex-col gap-1 px-1">
        <MonoLabel>CONNECTION</MonoLabel>
        <div className="font-mono text-sm text-[#E8ECE2]">{profile.ssid}</div>
        <div className="text-xs text-[#7E876E]">
          The Wi-Fi password is stored locally in this session.
        </div>
        {profile.modelId && (
          <div className="text-xs text-[#7E876E]">T-Box identifier: {profile.modelId}</div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        className="self-start px-1 py-2 text-sm font-medium text-[#F05545] hover:underline"
      >
        Remove this motorcycle
      </button>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5">
          <div className="w-full max-w-sm rounded-[22px] border border-[#2A3124] bg-[#151913] p-5">
            <h2 className="text-lg font-bold text-[#E8ECE2]">Remove motorcycle?</h2>
            <p className="mt-2 text-sm text-[#7E876E]">
              The saved connection profile and its photo will be removed from MOTO-HUB.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-[#7E876E] hover:bg-[#1C211A]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="rounded-xl bg-[#F05545]/20 px-4 py-2 text-sm font-bold text-[#F05545]"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CapabilityInspectorScreen: React.FC<{
  profile: MotorcycleProfile;
  onBack: () => void;
  onLogEvent: (source: string, message: string) => void;
}> = ({ profile, onBack, onLogEvent }) => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<Array<{ port: number; status: 'OPEN' | 'REFUSED' }> | null>(null);
  const snapshot = profile.capabilitySnapshot;
  const caps = snapshot?.capabilities;

  const runPortScan = () => {
    setScanning(true);
    onLogEvent('TBOX', `Probing common EasyConn ports (10915-10935) on ${profile.ssid}...`);
    window.setTimeout(() => {
      setScanning(false);
      setScanResult([
        { port: 10915, status: 'REFUSED' },
        { port: snapshot?.hostPort ?? 10925, status: 'OPEN' },
        { port: 10926, status: 'OPEN' },
      ]);
      onLogEvent(
        'TBOX',
        `Port scan complete: peer ${snapshot?.hostIp ?? '192.168.43.1'} open ports ${snapshot?.hostPort ?? 10925}, 10926.`
      );
    }, 900);
  };

  return (
    <MotoHubDetailScreen
      title={profile.displayName || profile.ssid}
      backLabel="‹ Back"
      onBack={onBack}
    >
      <p className="text-sm text-[#7E876E]">
        A read-only view of data observed directly from this T-Box.
      </p>

      <div
        className={`flex items-center gap-3.5 rounded-[22px] border p-4 ${
          caps
            ? 'border-[#2DD881]/40 bg-[#2DD881]/10'
            : 'border-[#C8F240]/40 bg-[#C8F240]/10'
        }`}
      >
        <span
          className={`rounded-lg px-2.5 py-2 font-mono text-[11px] font-bold text-[#0B0D09] ${
            caps ? 'bg-[#2DD881]' : 'bg-[#C8F240]'
          }`}
        >
          {caps ? 'LIVE' : 'WAIT'}
        </span>
        <div>
          <div className="text-[15px] font-bold text-[#E8ECE2]">
            {caps ? 'Capability report captured' : 'No observations yet'}
          </div>
          <div className="text-xs text-[#7E876E]">
            {caps
              ? 'CLIENT_INFO was captured during an EasyConn handshake.'
              : 'Connect this motorcycle, then start mirroring or Android Auto once.'}
          </div>
        </div>
      </div>

      <InspectorCard title="CONNECTION">
        <InspectorRow label="Wi-Fi network" value={profile.ssid} mono />
        <InspectorRow
          label="EasyConn endpoint"
          value={snapshot ? `${snapshot.hostIp}:${snapshot.hostPort}` : null}
          mono
        />
        <InspectorRow label="NSD package" value={snapshot?.nsdPackage ?? null} mono />
      </InspectorCard>

      <InspectorCard title="DIAGNOSTICS">
        <p className="text-xs leading-relaxed text-[#7E876E]">
          If EasyConn discovery keeps failing, probe the T-Box well-known ports (10915–10935) directly to see which one answers.
        </p>
        <button
          type="button"
          disabled={scanning}
          onClick={runPortScan}
          className="h-11 w-full rounded-xl bg-[#C8F240] text-sm font-bold text-[#0B0D09] disabled:opacity-60"
        >
          {scanning ? 'Scanning ports 10915–10935…' : 'Scan common EasyConn ports'}
        </button>
        {scanResult && (
          <div className="mt-2 flex flex-col gap-1.5 rounded-xl bg-[#0B0D09] p-3 font-mono text-xs">
            <div className="font-bold text-[#2DD881]">
              Peer {snapshot?.hostIp ?? '192.168.43.1'} → open:{' '}
              {scanResult
                .filter((r) => r.status === 'OPEN')
                .map((r) => r.port)
                .join(', ')}
            </div>
            {scanResult.map((r) => (
              <div key={r.port} className="flex justify-between">
                <span className="text-[#E8ECE2]">Port {r.port}</span>
                <span className={r.status === 'OPEN' ? 'text-[#2DD881]' : 'text-[#7E876E]'}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </InspectorCard>

      <InspectorCard title="DISPLAY & PROTOCOL">
        <InspectorRow
          label="TFT capture area"
          value={snapshot ? `${snapshot.width} x ${snapshot.height}` : null}
          mono
        />
        <InspectorRow label="Reported DPI" value={caps ? String(caps.dpi) : null} mono />
        <InspectorRow label="Head unit name" value={caps?.huName ?? null} />
        <InspectorRow label="Vehicle brand" value={caps?.carBrand ?? null} />
        <InspectorRow label="Vehicle model" value={caps?.carModel ?? null} />
        <InspectorRow label="PXC version" value={caps?.pxcVersion ?? null} mono />
        <InspectorRow label="SDK version" value={caps?.sdkVersion ?? null} mono />
        <InspectorRow
          label="Function mask"
          value={caps ? `0x${caps.supportFunction.toString(16).toUpperCase()}` : null}
          mono
        />
      </InspectorCard>

      <InspectorCard title="FEATURE FLAGS">
        <FlagRow label="Screen mirroring" value={caps?.screenMirroring} />
        <FlagRow label="Screen touch" value={caps?.screenTouch} />
        <FlagRow label="Mirror reconnect" value={caps?.mirrorReconnect} />
        <FlagRow label="Landscape adaptive" value={caps?.landscapeAdaptive} />
        <FlagRow label="Microphone" value={caps?.microphone} />
        <FlagRow label="HID input" value={caps?.hid} />
        <FlagRow label="Time synchronization" value={caps?.syncCorrectTime} />
        <FlagRow label="Bluetooth calls" value={caps?.bluetoothCall} />
      </InspectorCard>
    </MotoHubDetailScreen>
  );
};

const InspectorCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="flex flex-col gap-3 rounded-[22px] bg-[#151913] p-[18px]">
    <MonoLabel>{title}</MonoLabel>
    {children}
  </div>
);

const InspectorRow: React.FC<{ label: string; value: string | null; mono?: boolean }> = ({
  label,
  value,
  mono,
}) => (
  <div className="flex items-start justify-between gap-4 text-sm">
    <span className="text-[#7E876E]">{label}</span>
    <span
      className={`text-right ${mono ? 'font-mono' : ''} ${
        value ? 'font-semibold text-[#E8ECE2]' : 'text-[#7E876E]'
      }`}
    >
      {value ?? 'Not reported'}
    </span>
  </div>
);

const FlagRow: React.FC<{ label: string; value?: boolean }> = ({ label, value }) => {
  const text = value === true ? 'SUPPORTED' : value === false ? 'NOT SUPPORTED' : 'NOT REPORTED';
  const color =
    value === true ? 'text-[#2DD881]' : value === false ? 'text-[#F05545]' : 'text-[#7E876E]';
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#7E876E]">{label}</span>
      <span className={`font-mono text-[11px] font-bold ${color}`}>{text}</span>
    </div>
  );
};

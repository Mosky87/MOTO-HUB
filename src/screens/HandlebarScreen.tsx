import React, { useState } from 'react';
import {
  HANDLEBAR_ACTION_LABELS,
  HandlebarAction,
  HandlebarButton,
  HandlebarConfig,
  HandlebarInputMode,
  PressKind,
} from '../types/motohub';
import { defaultHandlebarConfig, pressKey } from '../lib/storage';
import {
  MonoLabel,
  MotoHubActionRow,
  MotoHubDetailScreen,
  MotoHubRadioRow,
  ToggleRow,
} from '../components/MotoHubUi';

const BUTTON_META: Record<
  HandlebarButton,
  { label: string; glyph: string; accent: string }
> = {
  [HandlebarButton.UP]: { label: 'Up', glyph: '▲', accent: '#2DD881' },
  [HandlebarButton.DOWN]: { label: 'Down', glyph: '▼', accent: '#5BA8F0' },
  [HandlebarButton.LEFT]: { label: 'Left', glyph: '◀', accent: '#FFA84B' },
  [HandlebarButton.RIGHT]: { label: 'Right', glyph: '▶', accent: '#B388FF' },
  [HandlebarButton.SELECT]: { label: 'Select', glyph: '●', accent: '#FFD24C' },
};

const PRESS_KIND_LABELS: Record<PressKind, string> = {
  [PressKind.PRESS]: 'Press',
  [PressKind.DOUBLE]: 'Double press',
  [PressKind.HOLD]: 'Hold',
};

const FAMILY_COLORS: Record<'nav' | 'aa' | 'media' | 'none', string> = {
  aa: '#3EC8D0',
  nav: '#C8F240',
  media: '#B388FF',
  none: '#7E876E',
};

const ALL_PHYSICAL_PRESSES: Array<{ button: HandlebarButton; kind: PressKind; label: string }> =
  Object.values(HandlebarButton).flatMap((button) =>
    Object.values(PressKind).map((kind) => ({
      button,
      kind,
      label: `${BUTTON_META[button].label} — ${PRESS_KIND_LABELS[kind]}`,
    }))
  );

interface HandlebarControlsDetailProps {
  config: HandlebarConfig;
  onChange: (next: HandlebarConfig) => void;
  onOpenMapping: () => void;
  onBack: () => void;
  onLogEvent: (source: string, message: string) => void;
}

export const HandlebarControlsDetail: React.FC<HandlebarControlsDetailProps> = ({
  config,
  onChange,
  onOpenMapping,
  onBack,
  onLogEvent,
}) => {
  return (
    <MotoHubDetailScreen
      title="Handlebar buttons"
      backLabel="‹ Settings"
      onBack={onBack}
    >
      <p className="text-sm leading-relaxed text-[#7E876E]">
        The motorcycle&apos;s buttons reach the phone over Bluetooth as media keys. While a session is streaming, MOTO-HUB can capture them and drive Android Auto navigation instead of the music player.
      </p>

      <MonoLabel>INPUT PROTOCOL</MonoLabel>
      <p className="text-sm leading-relaxed text-[#7E876E]">
        Most dashboards send buttons as AVRCP media keys — leave this on AVRCP. Pick HID only if the remote pairs as a Bluetooth keyboard.
      </p>
      <MotoHubRadioRow
        title="AVRCP (media keys)"
        description="Default. The dashboard sends Bluetooth media-key commands for play/pause, track and volume."
        selected={config.inputMode === HandlebarInputMode.AVRCP}
        onClick={() => {
          onChange({ ...config, inputMode: HandlebarInputMode.AVRCP });
          onLogEvent('SETTINGS', 'Handlebar input mode changed to AVRCP.');
        }}
      />
      <MotoHubRadioRow
        title="HID (D-pad)"
        description="For remotes that pair as a Bluetooth keyboard and send D-pad presses."
        selected={config.inputMode === HandlebarInputMode.HID}
        onClick={() => {
          onChange({ ...config, inputMode: HandlebarInputMode.HID });
          onLogEvent('SETTINGS', 'Handlebar input mode changed to HID.');
        }}
      />

      <div className="my-1 h-px bg-[#2A3124]" />

      <ToggleRow
        title="Buttons control Android Auto"
        description="Requires the phone paired to the motorcycle's Bluetooth. Music keeps playing but its buttons are captured while a session runs."
        checked={config.enabled}
        onCheckedChange={(enabled) => {
          onChange({ ...config, enabled });
          onLogEvent('SETTINGS', `Handlebar capture changed to enabled=${enabled}.`);
        }}
      />

      <div className="overflow-hidden rounded-[22px] bg-[#151913]">
        <MotoHubActionRow
          title="Button mapping"
          description="What each press, double press and hold does"
          onClick={onOpenMapping}
        />
      </div>

      <div className="my-1 h-px bg-[#2A3124]" />

      <MonoLabel>MUSIC VOLUME</MonoLabel>
      <p className="text-sm leading-relaxed text-[#7E876E]">
        While capture is on, the volume buttons navigate instead of changing volume — set your listening level here.
      </p>
      <div className="flex items-center gap-3 rounded-[16px] bg-[#151913] px-4 py-3">
        <input
          type="range"
          min={0}
          max={15}
          value={config.listeningVolume}
          onChange={(e) =>
            onChange({ ...config, listeningVolume: Number.parseInt(e.target.value, 10) })
          }
          className="flex-1 accent-[#C8F240]"
        />
        <span className="w-10 text-right font-mono text-xs font-bold text-[#C8F240]">
          {config.listeningVolume}/15
        </span>
      </div>
    </MotoHubDetailScreen>
  );
};

interface HandlebarMappingScreenProps {
  config: HandlebarConfig;
  onChange: (next: HandlebarConfig) => void;
  onBack: () => void;
  onLogEvent: (source: string, message: string) => void;
}

export const HandlebarMappingScreen: React.FC<HandlebarMappingScreenProps> = ({
  config,
  onChange,
  onBack,
  onLogEvent,
}) => {
  const [editing, setEditing] = useState<{ button: HandlebarButton; kind: PressKind } | null>(null);
  const [calibrating, setCalibrating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  const [litKey, setLitKey] = useState<string | null>(null);

  if (calibrating) {
    const current = ALL_PHYSICAL_PRESSES[stepIndex] ?? null;
    return (
      <MotoHubDetailScreen
        title="Teach my handlebar"
        backLabel="‹ Handlebar"
        onBack={() => setCalibrating(false)}
      >
        {!current ? (
          <div className="flex flex-col gap-4">
            <div className="text-base font-bold text-[#E8ECE2]">
              Done - {learnedCount} presses learned.
            </div>
            <p className="text-xs leading-relaxed text-[#7E876E]">
              Every card now describes your handlebar. Buttons you marked as absent are gone.
            </p>
            <button
              type="button"
              onClick={() => {
                onChange({ ...config, calibrated: true });
                setCalibrating(false);
              }}
              className="h-13 w-full rounded-[16px] bg-[#C8F240] text-sm font-bold text-[#0B0D09]"
            >
              Finish
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <MonoLabel>
              STEP {stepIndex + 1} OF {ALL_PHYSICAL_PRESSES.length}
            </MonoLabel>
            <div className="rounded-[20px] bg-[#2DD881]/15 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.07em] text-[#7E876E]">
                On the motorcycle, do this
              </div>
              <div className="mt-1.5 text-xl font-bold text-[#E8ECE2]">{current.label}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                const key = pressKey(current.button, current.kind);
                const nextMissing = { ...config.missing };
                delete nextMissing[key];
                const nextMappings = {
                  ...config.mappings,
                  [key]: config.mappings[key] ?? HandlebarAction.SELECT,
                };
                onChange({ ...config, missing: nextMissing, mappings: nextMappings, calibrated: true });
                onLogEvent('CONTROLS', `Calibrated ${key}.`);
                setLearnedCount((c) => c + 1);
                setStepIndex((i) => i + 1);
              }}
              className="h-12 w-full rounded-[14px] bg-[#C8F240] text-sm font-bold text-[#0B0D09]"
            >
              Simulate press received
            </button>
            <p className="text-xs leading-relaxed text-[#7E876E]">
              Nothing happens? Some dashboards keep a button for themselves and send the phone nothing at all. Mark it as absent and it stops taking up space.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const key = pressKey(current.button, current.kind);
                  onChange({
                    ...config,
                    missing: { ...config.missing, [key]: true },
                  });
                  onLogEvent('CONTROLS', `Marked ${key} as absent from this handlebar.`);
                  setStepIndex((i) => i + 1);
                }}
                className="h-11 rounded-[14px] border border-[#2A3124] text-xs font-semibold text-[#E8ECE2] hover:bg-[#1C211A]"
              >
                Not on my bike
              </button>
              <button
                type="button"
                onClick={() => setStepIndex((i) => i + 1)}
                className="h-11 rounded-[14px] border border-[#2A3124] text-xs font-semibold text-[#E8ECE2] hover:bg-[#1C211A]"
              >
                Skip
              </button>
            </div>
            <button
              type="button"
              onClick={() => setCalibrating(false)}
              className="h-11 w-full rounded-[14px] border border-[#2A3124] text-xs font-semibold text-[#7E876E] hover:text-[#E8ECE2]"
            >
              Stop here
            </button>
          </div>
        )}
      </MotoHubDetailScreen>
    );
  }

  if (editing) {
    const key = pressKey(editing.button, editing.kind);
    const currentAction = config.mappings[key] ?? HandlebarAction.NONE;
    return (
      <MotoHubDetailScreen
        title={`${BUTTON_META[editing.button].label} — ${PRESS_KIND_LABELS[editing.kind]}`}
        backLabel="‹ Handlebar"
        onBack={() => setEditing(null)}
      >
        <div className="flex flex-col gap-2">
          {Object.values(HandlebarAction).map((action) => {
            const info = HANDLEBAR_ACTION_LABELS[action];
            return (
              <MotoHubRadioRow
                key={action}
                title={info.label}
                description={
                  info.family === 'aa'
                    ? 'Android Auto control'
                    : info.family === 'nav'
                    ? 'One-press saved destination'
                    : info.family === 'media'
                    ? 'Media playback'
                    : 'Ignore this press'
                }
                selected={currentAction === action}
                onClick={() => {
                  onChange({
                    ...config,
                    mappings: { ...config.mappings, [key]: action },
                  });
                  onLogEvent('CONTROLS', `Handlebar ${key} -> ${action}`);
                  setEditing(null);
                }}
              />
            );
          })}
        </div>
      </MotoHubDetailScreen>
    );
  }

  const pulseButton = (button: HandlebarButton, kind: PressKind) => {
    const key = pressKey(button, kind);
    setLitKey(key);
    const action = config.mappings[key] ?? HandlebarAction.NONE;
    onLogEvent('CONTROLS', `Test press ${button} ${kind} -> ${HANDLEBAR_ACTION_LABELS[action].label}`);
    window.setTimeout(() => setLitKey((prev) => (prev === key ? null : prev)), 900);
  };

  return (
    <MotoHubDetailScreen
      title="Handlebar"
      backLabel="‹ Handlebar buttons"
      onBack={onBack}
    >
      <p className="text-xs leading-relaxed text-[#7E876E]">
        Your motorcycle&apos;s own handlebar drives MOTO-HUB. Teach it once, then give each button the action you want.
      </p>

      {!config.enabled && (
        <div className="rounded-[22px] border border-[#B388FF]/45 bg-[#B388FF]/10 p-4">
          <div className="font-mono text-[11px] font-semibold tracking-[0.07em] text-[#B388FF]">
            BUTTON PRESSES ARE OFF
          </div>
          <p className="mt-1.5 text-sm text-[#E8ECE2]">
            Presses still arrive and still show up on this page - nothing is performed with them.
          </p>
          <button
            type="button"
            onClick={() => onChange({ ...config, enabled: true })}
            className="mt-3 h-11 w-full rounded-[14px] border border-[#B388FF]/50 text-xs font-semibold text-[#E8ECE2] hover:bg-[#B388FF]/15"
          >
            Turn presses back on
          </button>
        </div>
      )}

      <MonoLabel>MOTORCYCLE HANDLEBAR</MonoLabel>

      <div className="rounded-2xl bg-[#2DD881]/12 p-4">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2DD881]" />
          <span className="font-mono text-[11px] text-[#7E876E]">Motorcycle Bluetooth</span>
        </div>
        <p className="mt-2 text-sm text-[#E8ECE2]">
          {config.inputMode === HandlebarInputMode.AVRCP
            ? 'AVRCP media-key bridge ready. Tap any press row below to remap, or run the calibration wizard.'
            : 'HID keyboard mode selected. Presses are read from the paired Bluetooth remote.'}
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setStepIndex(0);
          setLearnedCount(0);
          setCalibrating(true);
        }}
        className="h-13 w-full rounded-2xl bg-[#C8F240] text-sm font-bold text-[#0B0D09]"
      >
        {config.calibrated ? 'Teach again' : 'Teach my handlebar'}
      </button>

      {Object.values(HandlebarButton).map((button) => {
        const meta = BUTTON_META[button];
        const visibleKinds = Object.values(PressKind).filter(
          (kind) => !config.missing[pressKey(button, kind)]
        );
        if (visibleKinds.length === 0) return null;

        return (
          <div key={button} className="flex flex-col gap-2.5 rounded-[22px] bg-[#151913] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
                  style={{ backgroundColor: `${meta.accent}28`, color: meta.accent }}
                >
                  {meta.glyph}
                </span>
                <span className="text-[15px] font-bold text-[#E8ECE2]">{meta.label}</span>
              </div>
              <button
                type="button"
                onClick={() => pulseButton(button, PressKind.PRESS)}
                className="rounded-lg bg-[#1C211A] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#7E876E] hover:text-[#C8F240]"
              >
                TEST
              </button>
            </div>

            {visibleKinds.map((kind) => {
              const key = pressKey(button, kind);
              const action = config.mappings[key] ?? HandlebarAction.NONE;
              const info = HANDLEBAR_ACTION_LABELS[action];
              const color = FAMILY_COLORS[info.family];
              const isLit = litKey === key;

              return (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setEditing({ button, kind })}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                    isLit
                      ? 'border-[#2DD881] bg-[#2DD881]/15'
                      : 'border-transparent bg-[#1C211A]/60 hover:bg-[#1C211A]'
                  }`}
                >
                  <span className="flex-1 text-sm text-[#E8ECE2]">{PRESS_KIND_LABELS[kind]}</span>
                  <span
                    className="rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold"
                    style={{ backgroundColor: `${color}26`, color }}
                  >
                    {info.shortLabel}
                  </span>
                  <span className="text-base text-[#7E876E]">›</span>
                </button>
              );
            })}
          </div>
        );
      })}

      <div className="mt-2 flex flex-col gap-2">
        <MonoLabel>TIMING</MonoLabel>
        <p className="text-xs text-[#7E876E]">
          How long the app waits before deciding a press was double, or held.
        </p>
        <ToggleRow
          title="Snappy singles"
          description="A single press acts immediately instead of waiting out the double-press window."
          checked={config.snappySingles}
          onCheckedChange={(snappySingles) => onChange({ ...config, snappySingles })}
        />
        <ToggleRow
          title="Hold gestures"
          description="Turn off if your handlebar needs a long physical press for every click."
          checked={config.holdsEnabled}
          onCheckedChange={(holdsEnabled) => onChange({ ...config, holdsEnabled })}
        />
        <SegmentedRow
          title="Double press window"
          options={[
            { label: 'Fast (240ms)', value: 240 },
            { label: 'Standard (320ms)', value: 320 },
            { label: 'Relaxed (450ms)', value: 450 },
          ]}
          value={config.doubleTapMs}
          accent="#5BA8F0"
          onSelect={(doubleTapMs) => onChange({ ...config, doubleTapMs })}
        />
        <SegmentedRow
          title="Hold time"
          options={[
            { label: 'Short (400ms)', value: 400 },
            { label: 'Standard (550ms)', value: 550 },
            { label: 'Long (800ms)', value: 800 },
          ]}
          value={config.holdMs}
          accent="#FFD24C"
          onSelect={(holdMs) => onChange({ ...config, holdMs })}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          onChange(defaultHandlebarConfig());
          onLogEvent('CONTROLS', 'Handlebar mapping reset to defaults.');
        }}
        className="mt-2 h-11 w-full rounded-[14px] border border-[#2A3124] text-sm font-semibold text-[#E8ECE2] hover:bg-[#1C211A]"
      >
        Reset actions to defaults
      </button>
    </MotoHubDetailScreen>
  );
};

const SegmentedRow: React.FC<{
  title: string;
  options: Array<{ label: string; value: number }>;
  value: number;
  accent: string;
  onSelect: (v: number) => void;
}> = ({ title, options, value, accent, onSelect }) => (
  <div className="flex flex-col gap-1.5 py-1">
    <div className="text-xs font-medium text-[#B9C4AB]">{title}</div>
    <div className="grid grid-cols-3 gap-1.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className="rounded-xl border px-2 py-2 text-[11px] font-semibold transition-colors"
            style={{
              borderColor: active ? accent : '#2A3124',
              backgroundColor: active ? `${accent}20` : '#151913',
              color: active ? accent : '#7E876E',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);

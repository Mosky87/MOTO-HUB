import React from 'react';
import { ConnectionState, HubTab } from '../types/motohub';
import { ModeIcon, ModeIconName, NavIcon } from './MotoHubIcons';

export const ConnectionRail: React.FC<{ state: ConnectionState }> = ({ state }) => {
  if (state === ConnectionState.CONNECTED) {
    return <div className="h-[2px] w-full bg-[#2DD881] transition-colors duration-300" />;
  }
  if (state === ConnectionState.CONNECTING) {
    return (
      <div className="relative h-[2px] w-full overflow-hidden bg-[#2A3124]">
        <div
          className="animate-rail-shimmer absolute inset-y-0 w-1/2"
          style={{
            background: 'linear-gradient(90deg, transparent, #C8F240, transparent)',
          }}
        />
      </div>
    );
  }
  return <div className="h-[2px] w-full bg-[#2A3124] transition-colors duration-300" />;
};

export const HubAppBar: React.FC<{
  motorcycleName: string | null;
  isConnected: boolean;
  onMotorcycleTap: () => void;
}> = ({ motorcycleName, isConnected, onMotorcycleTap }) => (
  <header className="flex w-full items-center justify-between px-6 py-2.5">
    <span
      className="animate-edition-drop font-mono text-xs font-bold tracking-[0.07em] text-[#C8F240]"
      style={{ textShadow: '0 3px 10px rgba(200, 242, 64, 0.45)' }}
    >
      MOTO-HUB CORE
    </span>
    <button
      type="button"
      onClick={onMotorcycleTap}
      className="flex max-w-[55%] items-center gap-1.5 rounded-full bg-[#1C211A] px-2.5 py-1 text-xs font-medium text-[#7E876E] transition-colors hover:bg-[#262C22] hover:text-[#E8ECE2]"
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
          isConnected ? 'bg-[#2DD881]' : 'bg-[#7E876E]'
        }`}
      />
      <span className="truncate">{motorcycleName || 'No motorcycle'}</span>
    </button>
  </header>
);

export const HubBottomNavigation: React.FC<{
  selected: HubTab;
  onSelect: (tab: HubTab) => void;
}> = ({ selected, onSelect }) => {
  const items: Array<{ tab: HubTab; label: 'Ride' | 'Garage' | 'Settings' }> = [
    { tab: HubTab.RIDE, label: 'Ride' },
    { tab: HubTab.GARAGE, label: 'Garage' },
    { tab: HubTab.SETTINGS, label: 'Settings' },
  ];
  return (
    <nav className="flex w-full items-center justify-evenly border-t border-[#1F241B] bg-[#0B0D09]/95 px-1 py-1.5 backdrop-blur-sm">
      {items.map(({ tab, label }) => {
        const active = selected === tab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onSelect(tab)}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#151913]"
          >
            <NavIcon tab={label} active={active} />
            <span
              className={`text-[11px] leading-tight ${
                active ? 'font-semibold text-[#C8F240]' : 'font-normal text-[#7E876E]'
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export const MonoLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`font-mono text-[11px] font-semibold uppercase tracking-[0.07em] text-[#C8F240] ${className}`}
  >
    {children}
  </div>
);

export const LivePill: React.FC<{ text: string }> = ({ text }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2DD881]/10 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.06em] text-[#2DD881]">
    <span className="animate-live-blink h-1.5 w-1.5 rounded-full bg-[#2DD881]" />
    {text}
  </span>
);

export const StatusPill: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <span
    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.06em]"
    style={{ backgroundColor: `${color}18`, color }}
  >
    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
    {text}
  </span>
);

export const MotoHubCardGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="divide-y divide-[#2A3124]/60 overflow-hidden rounded-[22px] bg-[#151913]">
    {children}
  </div>
);

export const MotoHubActionRow: React.FC<{
  title: string;
  description: string;
  value?: string | null;
  onClick: () => void;
}> = ({ title, description, value, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-2.5 px-[18px] py-4 text-left transition-colors hover:bg-[#1C211A]"
  >
    <div className="min-w-0 flex-1">
      <div className="truncate text-[15px] font-semibold leading-snug text-[#E8ECE2]">{title}</div>
      <div className="mt-0.5 text-xs leading-relaxed text-[#7E876E]">{description}</div>
    </div>
    {value && (
      <div className="max-w-[116px] text-right text-xs font-medium leading-tight text-[#C8F240]">
        {value}
      </div>
    )}
    <span className="text-lg font-semibold text-[#7E876E]" aria-hidden="true">
      ›
    </span>
  </button>
);

export const ToggleRow: React.FC<{
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  enabled?: boolean;
}> = ({ title, description, checked, onCheckedChange, enabled = true }) => (
  <div className="flex w-full items-center gap-3.5 py-2">
    <div className="min-w-0 flex-1">
      <div
        className={`text-[15px] font-semibold leading-snug ${
          enabled ? 'text-[#E8ECE2]' : 'text-[#7E876E]/50'
        }`}
      >
        {title}
      </div>
      <div
        className={`mt-0.5 text-xs leading-relaxed ${
          enabled ? 'text-[#7E876E]' : 'text-[#7E876E]/50'
        }`}
      >
        {description}
      </div>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={!enabled}
      onClick={() => enabled && onCheckedChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors ${
        !enabled
          ? 'cursor-not-allowed border-[#2A3124] bg-[#1C211A] opacity-40'
          : checked
          ? 'border-[#C8F240] bg-[#C8F240]'
          : 'border-[#2A3124] bg-[#262C22]'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full transition-transform ${
          checked
            ? 'translate-x-6 bg-[#0B0D09]'
            : 'translate-x-1 bg-[#7E876E]'
        }`}
      />
    </button>
  </div>
);

export const MotoHubRadioRow: React.FC<{
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}> = ({ title, description, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-[14px] border-[1.5px] px-3.5 py-3 text-left transition-colors ${
      selected
        ? 'border-[#C8F240] bg-[#C8F240]/[0.08]'
        : 'border-[#2A3124] bg-[#151913] hover:bg-[#1C211A]'
    }`}
  >
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
        selected ? 'border-[#C8F240]' : 'border-[#7E876E]'
      }`}
    >
      {selected && <span className="h-2.5 w-2.5 rounded-full bg-[#C8F240]" />}
    </span>
    <div className="min-w-0 flex-1">
      <div className="text-[15px] font-semibold leading-snug text-[#E8ECE2]">{title}</div>
      <div className="mt-0.5 text-xs leading-relaxed text-[#7E876E]">{description}</div>
    </div>
  </button>
);

export const MotoHubDetailScreen: React.FC<{
  title: string;
  backLabel?: string;
  onBack: () => void;
  children: React.ReactNode;
}> = ({ title, backLabel = '‹ Back', onBack, children }) => (
  <div className="flex h-full flex-col overflow-y-auto px-6 pb-8 pt-2">
    <button
      type="button"
      onClick={onBack}
      className="mb-3 self-start py-1 text-sm font-semibold text-[#C8F240] hover:underline"
    >
      {backLabel}
    </button>
    <h1 className="mb-4 text-[26px] font-bold leading-tight tracking-[-0.02em] text-[#E8ECE2]">
      {title}
    </h1>
    <div className="flex flex-col gap-4">{children}</div>
  </div>
);

export const HeroPrimaryAction: React.FC<{
  title: string;
  subtitle: string;
  icon: ModeIconName;
  color?: string;
  onClick: () => void;
}> = ({ title, subtitle, icon, color = '#C8F240', onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-4 rounded-[22px] p-5 text-left transition-transform active:scale-[0.99]"
    style={{ backgroundColor: color }}
  >
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black/15">
      <ModeIcon mode={icon} color="#0B0D09" size={30} />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-[17px] font-bold leading-snug text-[#0B0D09]">{title}</div>
      <div className="mt-0.5 text-xs leading-relaxed text-black/70">{subtitle}</div>
    </div>
  </button>
);

export const HeroTile: React.FC<{
  title: string;
  subtitle: string;
  icon: ModeIconName;
  color: string;
  onClick: () => void;
  className?: string;
}> = ({ title, subtitle, icon, color, onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-start gap-2.5 rounded-[22px] bg-[#151913] p-4 text-left transition-colors hover:bg-[#1C211A] active:scale-[0.99] ${className}`}
  >
    <div
      className="flex h-11 w-11 items-center justify-center rounded-[14px]"
      style={{ backgroundColor: `${color}26` }}
    >
      <ModeIcon mode={icon} color={color} size={24} />
    </div>
    <div className="text-sm font-semibold leading-snug text-[#E8ECE2]">{title}</div>
    <div className="line-clamp-2 text-xs leading-relaxed text-[#7E876E]">{subtitle}</div>
  </button>
);

export const HeroOptionRow: React.FC<{
  title: string;
  description: string;
  icon: ModeIconName;
  color: string;
  onClick: () => void;
}> = ({ title, description, icon, color, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-[#1C211A]"
  >
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px]"
      style={{ backgroundColor: `${color}20` }}
    >
      <ModeIcon mode={icon} color={color} size={21} />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-[15px] font-semibold leading-snug text-[#E8ECE2]">{title}</div>
      <div className="mt-0.5 text-xs leading-relaxed text-[#7E876E]">{description}</div>
    </div>
    <span className="text-lg font-semibold text-[#7E876E]" aria-hidden="true">
      ›
    </span>
  </button>
);

export const MotoHubNotice: React.FC<{
  label: string;
  tone: 'error' | 'action' | 'info';
  body: string;
  children?: React.ReactNode;
}> = ({ label, tone, body, children }) => {
  const palette =
    tone === 'error'
      ? { border: 'border-[#F05545]/45', bg: 'bg-[#F05545]/10', text: 'text-[#F05545]' }
      : tone === 'action'
      ? { border: 'border-[#C8F240]/45', bg: 'bg-[#C8F240]/10', text: 'text-[#C8F240]' }
      : { border: 'border-[#3EC8D0]/45', bg: 'bg-[#3EC8D0]/10', text: 'text-[#3EC8D0]' };
  return (
    <div className={`rounded-[20px] border p-4 ${palette.border} ${palette.bg}`}>
      <div className={`font-mono text-[11px] font-semibold tracking-[0.07em] ${palette.text}`}>
        {label}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-[#E8ECE2]">{body}</p>
      {children && <div className="mt-3 flex flex-col gap-2">{children}</div>}
    </div>
  );
};

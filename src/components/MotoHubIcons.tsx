import React from 'react';

export type ModeIconName =
  | 'Mirror'
  | 'Auto'
  | 'External'
  | 'QrScan'
  | 'Import'
  | 'Manual'
  | 'Bike'
  | 'Preview'
  | 'Controls'
  | 'Customize'
  | 'Dashboard';

interface ModeIconProps {
  mode: ModeIconName;
  color: string;
  size?: number;
}

/** Exact SVG port of MOTO-HUB's hand-drawn Canvas ModeIcon set from MotoHubHero.kt. */
export const ModeIcon: React.FC<ModeIconProps> = ({ mode, color, size = 24 }) => {
  const sw = 1.9;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {mode === 'Mirror' && (
        <>
          <rect x="6.7" y="1.5" width="10.6" height="21" rx="2" />
          <line x1="10.1" y1="19.7" x2="13.9" y2="19.7" />
        </>
      )}
      {mode === 'Auto' && (
        <>
          <path d="M2.9 14.4 L5.3 9.1 L9.1 6.7 L14.9 6.7 L18.7 9.1 L21.1 14.4 Z" />
          <circle cx="6.7" cy="14.9" r="2.2" fill="#151913" />
          <circle cx="17.3" cy="14.9" r="2.2" fill="#151913" />
        </>
      )}
      {mode === 'External' && (
        <>
          <rect x="5.3" y="4.3" width="13.4" height="10.6" rx="1.5" />
          <line x1="12" y1="14.9" x2="12" y2="20.2" />
          <line x1="8.6" y1="17.3" x2="12" y2="20.2" />
          <line x1="15.4" y1="17.3" x2="12" y2="20.2" />
        </>
      )}
      {mode === 'QrScan' && (
        <>
          <rect x="2.9" y="2.9" width="5.8" height="5.8" rx="1.2" />
          <rect x="15.3" y="2.9" width="5.8" height="5.8" rx="1.2" />
          <rect x="2.9" y="15.3" width="5.8" height="5.8" rx="1.2" />
          <rect x="14.4" y="14.4" width="6.7" height="6.7" rx="1.2" />
        </>
      )}
      {mode === 'Import' && (
        <>
          <line x1="12" y1="2.9" x2="12" y2="13.9" />
          <polyline points="7.7,10.1 12,14.4 16.3,10.1" />
          <polyline points="3.4,15.8 3.4,20.6 20.6,20.6 20.6,15.8" />
        </>
      )}
      {mode === 'Manual' && (
        <>
          <rect x="2.4" y="6.2" width="19.2" height="11.5" rx="2" />
          <line x1="5.3" y1="10.1" x2="7.2" y2="10.1" />
          <line x1="9.1" y1="10.1" x2="11.0" y2="10.1" />
          <line x1="13.0" y1="10.1" x2="14.9" y2="10.1" />
          <line x1="16.8" y1="10.1" x2="18.7" y2="10.1" />
          <line x1="7.2" y1="13.9" x2="16.8" y2="13.9" />
        </>
      )}
      {mode === 'Bike' && (
        <>
          <circle cx="6.2" cy="17.3" r="3.8" />
          <circle cx="17.8" cy="17.3" r="3.8" />
          <polyline points="6.2,17.3 10.1,11.0 16.3,11.0 17.8,17.3" />
          <line x1="10.1" y1="11.0" x2="8.2" y2="7.2" />
          <line x1="14.4" y1="11.0" x2="14.4" y2="7.2" />
          <circle cx="8.2" cy="6.7" r="1.1" fill={color} stroke="none" />
        </>
      )}
      {mode === 'Preview' && (
        <>
          <rect x="2.9" y="3.4" width="18.2" height="13.9" rx="2" />
          <line x1="9.1" y1="20.6" x2="14.9" y2="20.6" />
          <line x1="12" y1="17.3" x2="12" y2="20.6" />
          <polygon points="10.6,7.4 15.4,10.3 10.6,13.2" fill="none" />
        </>
      )}
      {mode === 'Controls' && (
        <>
          <line x1="2.9" y1="8.2" x2="7.2" y2="8.2" />
          <line x1="16.8" y1="8.2" x2="21.1" y2="8.2" />
          <polyline points="7.2,8.2 9.6,11.5 14.4,11.5 16.8,8.2" />
          <line x1="12" y1="11.5" x2="12" y2="19.7" />
          <circle cx="6.7" cy="8.2" r="1.1" fill={color} stroke="none" />
          <circle cx="17.3" cy="8.2" r="1.1" fill={color} stroke="none" />
        </>
      )}
      {mode === 'Customize' && (
        <>
          <line x1="3.4" y1="6.7" x2="20.6" y2="6.7" />
          <circle cx="15.8" cy="6.7" r="2" fill="#151913" />
          <line x1="3.4" y1="12" x2="20.6" y2="12" />
          <circle cx="9.1" cy="12" r="2" fill="#151913" />
          <line x1="3.4" y1="17.3" x2="20.6" y2="17.3" />
          <circle cx="13.4" cy="17.3" r="2" fill="#151913" />
        </>
      )}
      {mode === 'Dashboard' && (
        <>
          <path d="M4.2 17.6 A 9 9 0 1 1 19.8 17.6" />
          <line x1="12" y1="13" x2="16.8" y2="7.7" />
          <circle cx="12" cy="13" r="1.3" fill={color} stroke="none" />
        </>
      )}
    </svg>
  );
};

interface NavIconProps {
  tab: 'Ride' | 'Garage' | 'Settings';
  active: boolean;
}

export const NavIcon: React.FC<NavIconProps> = ({ tab, active }) => {
  const color = active ? '#C8F240' : '#7E876E';
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {tab === 'Ride' && (
        <>
          <circle cx="12" cy="12" r="9.1" />
          <line x1="12" y1="6.7" x2="12" y2="12" />
          <line x1="12" y1="12" x2="15.8" y2="14.4" />
        </>
      )}
      {tab === 'Garage' && (
        <>
          <polyline points="2.4,10.1 12,2.9 21.6,10.1" />
          <line x1="4.3" y1="10.1" x2="4.3" y2="21.1" />
          <line x1="19.7" y1="10.1" x2="19.7" y2="21.1" />
          <line x1="4.3" y1="21.1" x2="19.7" y2="21.1" />
          <polyline points="9.1,21.1 9.1,13.4 14.9,13.4 14.9,21.1" />
        </>
      )}
      {tab === 'Settings' && (
        <>
          <circle cx="12" cy="12" r="3.4" />
          <circle cx="12" cy="12" r="8.6" />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = ((deg - 90) * Math.PI) / 180;
            const x1 = 12 + 8.6 * Math.cos(rad);
            const y1 = 12 + 8.6 * Math.sin(rad);
            const x2 = 12 + 11.4 * Math.cos(rad);
            const y2 = 12 + 11.4 * Math.sin(rad);
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </>
      )}
    </svg>
  );
};

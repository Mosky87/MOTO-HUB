import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  Gauge, 
  Bike, 
  Sliders, 
  Activity, 
  Gamepad2, 
  Globe, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { SupportedLanguage, LANGUAGES, STRINGS } from '../data/translations';
import { MotorcycleProfile } from '../data/motorcycles';

interface HeaderProps {
  currentLang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  activeTab: 'tft' | 'garage' | 'pairing' | 'controls' | 'telemetry' | 'diagnostics' | 'settings';
  setActiveTab: (tab: 'tft' | 'garage' | 'pairing' | 'controls' | 'telemetry' | 'diagnostics' | 'settings') => void;
  activeBike: MotorcycleProfile;
  connectionState: 'connected' | 'connecting' | 'disconnected';
  toggleConnection: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  setLang,
  activeTab,
  setActiveTab,
  activeBike,
  connectionState,
  toggleConnection,
}) => {
  const t = STRINGS[currentLang] || STRINGS.en;

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/20">
              <img 
                src="/media/logo.png" 
                alt="MOTO-HUB" 
                className="w-8 h-8 object-contain drop-shadow"
                onError={(e) => {
                  // Fallback icon if image path in dev has different relative resolution
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="font-black text-black text-sm absolute tracking-tighter">MH</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-wider text-white">MOTO-HUB</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  CORE v1.1.120
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                TFT Android Auto & Instrument Cluster Engine
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex space-x-1 lg:space-x-1.5">
            {[
              { id: 'tft', label: t.nav_tft, icon: Gauge },
              { id: 'controls', label: t.nav_controls, icon: Gamepad2 },
              { id: 'telemetry', label: t.nav_telemetry || 'Telemetry & TPMS', icon: Activity },
              { id: 'garage', label: t.nav_garage, icon: Bike },
              { id: 'pairing', label: t.nav_pairing, icon: Wifi },
              { id: 'diagnostics', label: t.nav_diagnostics, icon: Sliders },
              { id: 'settings', label: t.nav_settings, icon: Sliders },
            ].map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-orange-400 border border-orange-500/30 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-zinc-500'}`} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action & Status */}
          <div className="flex items-center space-x-3">
            {/* Active Bike Badge */}
            <div 
              onClick={() => setActiveTab('garage')}
              className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition"
              title="Click to manage garage"
            >
              <Bike className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-semibold text-zinc-200">{activeBike.brand} {activeBike.model}</span>
              <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1 rounded">{activeBike.protocol}</span>
            </div>

            {/* Connection Toggle Button */}
            <button
              onClick={toggleConnection}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                connectionState === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                  : connectionState === 'connecting'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                  : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-orange-500/50 hover:text-orange-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                connectionState === 'connected' ? 'bg-emerald-400 animate-ping' : 
                connectionState === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-zinc-600'
              }`} />
              {connectionState === 'connected' ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.status_connected}</span>
                  <span className="sm:hidden">LINKED</span>
                </>
              ) : connectionState === 'connecting' ? (
                <span>{t.status_connecting}</span>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>{t.connect}</span>
                </>
              )}
            </button>

            {/* Language Selector */}
            <div className="relative group">
              <button 
                className="flex items-center space-x-1 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-semibold"
                title="Change language"
              >
                <Globe className="w-3.5 h-3.5 text-orange-400" />
                <span className="uppercase">{currentLang}</span>
              </button>
              
              <div className="absolute right-0 mt-1 w-44 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 hidden group-hover:block z-50">
                <div className="px-3 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                  Select Language
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLang(lang.code)}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-800 ${
                        currentLang === lang.code ? 'text-orange-400 font-bold bg-zinc-800/60' : 'text-zinc-300'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                      {currentLang === lang.code && <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="md:hidden flex overflow-x-auto py-2 border-t border-zinc-900 space-x-2 scrollbar-none">
          {[
            { id: 'tft', label: t.nav_tft, icon: Gauge },
            { id: 'controls', label: t.nav_controls, icon: Gamepad2 },
            { id: 'telemetry', label: t.nav_telemetry || 'Telemetry & TPMS', icon: Activity },
            { id: 'garage', label: t.nav_garage, icon: Bike },
            { id: 'pairing', label: t.nav_pairing, icon: Wifi },
            { id: 'diagnostics', label: t.nav_diagnostics, icon: Sliders },
            { id: 'settings', label: t.nav_settings, icon: Sliders },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs whitespace-nowrap ${
                activeTab === id
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { 
  Sliders, 
  Video, 
  Battery, 
  RotateCcw, 
  Globe, 
  ShieldCheck, 
  Code2, 
  CheckCircle2, 
  RefreshCw,
  ExternalLink,
  Flame,
  Info,
  Cpu,
  Wifi,
  ShieldAlert
} from 'lucide-react';
import { SupportedLanguage, LANGUAGES, STRINGS } from '../data/translations';

interface SettingsViewProps {
  currentLang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentLang,
  setLang,
}) => {
  const t = STRINGS[currentLang] || STRINGS.en;

  const [videoQuality, setVideoQuality] = useState<'smoother' | 'balanced' | 'sharper'>('balanced');
  const [powerMode, setPowerMode] = useState<'auto' | 'smooth' | 'balanced' | 'saver'>('smooth');
  const [seamlessResume, setSeamlessResume] = useState<boolean>(true);
  const [autoConnect, setAutoConnect] = useState<boolean>(true);
  const [checkUpdateState, setCheckUpdateState] = useState<'idle' | 'checking' | 'updated'>('idle');

  const handleCheckUpdate = () => {
    setCheckUpdateState('checking');
    setTimeout(() => {
      setCheckUpdateState('updated');
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Settings Header */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-black text-white">{t.nav_settings}</h2>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Customize video encoder bitrate, frame rate, seamless background reconnection, and language options.
        </p>
      </div>

      {/* VIDEO QUALITY & ENCODER */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <Video className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-bold text-white">{t.video_quality}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'smoother', label: t.video_quality_smoother, desc: 'Lower bitrate (~3.5 Mbps), minimizes phone thermal load on long tours.' },
            { id: 'balanced', label: t.video_quality_balanced, desc: 'Recommended default (~6.0 Mbps), optimal compromise of crispness and stability.' },
            { id: 'sharper', label: t.video_quality_sharper, desc: 'High bitrate (~9.0 Mbps) for ultra-sharp map text and high-res dashboards.' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setVideoQuality(item.id as any)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                videoQuality === item.id
                  ? 'bg-orange-500/10 border-orange-500/80 text-white shadow-md shadow-orange-500/10'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div>
                <span className={`text-xs font-bold block ${videoQuality === item.id ? 'text-orange-400' : 'text-zinc-200'}`}>
                  {item.label}
                </span>
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  {item.desc}
                </span>
              </div>
              {videoQuality === item.id && (
                <CheckCircle2 className="w-4 h-4 text-orange-400 mt-3 self-end" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* FRAME RATE & POWER PRESETS */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <Battery className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Frame Rate & Thermal Optimization</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            { id: 'auto', label: 'Auto Adaptive', rate: 'Dynamic' },
            { id: 'smooth', label: t.fps_smooth, rate: '30 FPS' },
            { id: 'balanced', label: t.fps_balanced, rate: '24 FPS' },
            { id: 'saver', label: t.fps_saver, rate: '20 FPS' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setPowerMode(mode.id as any)}
              className={`p-3 rounded-xl border text-center transition ${
                powerMode === mode.id
                  ? 'bg-emerald-500/10 border-emerald-500/80 text-emerald-300 font-bold'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="text-sm font-black font-mono">{mode.rate}</div>
              <div className="text-[10px] mt-0.5">{mode.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* VIDEO CODEC SELECTION (H.265 HEVC vs H.264 AVC) */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <Cpu className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-bold text-white">Video Codec & Hardware Acceleration</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border bg-orange-500/10 border-orange-500/80 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-400">H.265 / HEVC</span>
                <span className="text-[10px] bg-orange-500 text-black px-1.5 py-0.5 rounded font-black">RACCOMANDATO</span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-1">
                40% in meno di carico termico sul telefono. Ideale per T-Box di ultima generazione (CFMOTO 800MT, Zontes 703F, Voge).
              </p>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-3">● Hardware Encoder attivo (MediaCodec)</div>
          </div>

          <div className="p-3 rounded-xl border bg-zinc-950 border-zinc-800 text-zinc-400 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-200">H.264 / AVC Baseline</span>
                <span className="text-[10px] text-zinc-500 font-mono">LEGACY</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Massima compatibilità retroattiva per T-Box con firmware 2020-2022.
              </p>
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-3">Profili 800x480 / 1024x600</div>
          </div>
        </div>
      </div>

      {/* NETWORK BINDING & CONGESTION CONTROL */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <Wifi className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Network Binding & Congestion Control</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <div>
              <div className="text-xs font-bold text-white">Multi-Network Cellular Binding (Aggressivo)</div>
              <div className="text-[11px] text-zinc-400">
                Forza mappe, Spotify e meteo sulla rete 4G/5G, impedendo ad Android di disconnettersi dal Wi-Fi della moto.
              </div>
            </div>
            <input 
              type="checkbox" 
              defaultChecked 
              className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <div>
              <div className="text-xs font-bold text-white">Controllo Congestione BBR (Dynamic ACK RTT)</div>
              <div className="text-[11px] text-zinc-400">
                Rileva la saturazione del buffer del cruscotto e abbassa istantaneamente il bitrate prevenendo freeze dello stream.
              </div>
            </div>
            <input 
              type="checkbox" 
              defaultChecked 
              className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <div>
              <div className="text-xs font-bold text-white">{t.seamless_resume}</div>
              <div className="text-[11px] text-zinc-400">
                Android Auto si riaggancia istantaneamente a schermo spento dopo una sosta rifornimento o spegnimento quadro.
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={seamlessResume} 
              onChange={(e) => setSeamlessResume(e.target.checked)}
              className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <div>
              <div className="text-xs font-bold text-white">{t.auto_connect}</div>
              <div className="text-[11px] text-zinc-400">
                Avvia il servizio non appena lo smartphone rileva l'SSID Wi-Fi della moto salvata.
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={autoConnect} 
              onChange={(e) => setAutoConnect(e.target.checked)}
              className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* CRASH SOS EMERGENCY CONTACT CONFIG */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-bold text-white">Crash Detection & Contatto SOS Emergenza</h3>
        </div>

        <p className="text-xs text-zinc-400">
          In caso di forte decelerazione e caduta moto non annullata entro 30 secondi, viene inviato un SMS automatico con le coordinate GPS esatte.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1 font-semibold">Nome Contatto</label>
            <input
              type="text"
              defaultValue="Elena (Famiglia)"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1 font-semibold">Numero di Telefono (con prefisso)</label>
            <input
              type="tel"
              defaultValue="+39 347 1234567"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* LANGUAGE SELECTOR */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <Globe className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-bold text-white">App Language</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLang(lang.code)}
              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition ${
                currentLang === lang.code
                  ? 'bg-orange-500/20 border-orange-500 text-orange-400 font-bold'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </span>
              {currentLang === lang.code && <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* GITHUB & UPDATES */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-200">
            <Code2 className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">MOTO-HUB CORE v1.1.120</div>
            <div className="text-[11px] text-zinc-400">
              Open-source release (AGPL-3.0) · Up to date with latest tag
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCheckUpdate}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkUpdateState === 'checking' ? 'animate-spin' : ''}`} />
            <span>{checkUpdateState === 'checking' ? 'Checking...' : checkUpdateState === 'updated' ? '✓ Up to Date' : 'Check for Updates'}</span>
          </button>
        </div>
      </div>

      {/* SAFE RIDING DISCLAIMER */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <strong className="font-bold block mb-0.5">Rider Safety Notice</strong>
          <span>{t.safe_riding_warning}</span>
        </div>
      </div>
    </div>
  );
};

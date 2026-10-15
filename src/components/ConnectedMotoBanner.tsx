import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Wifi, 
  Tv, 
  Activity, 
  Gauge, 
  Radio, 
  ChevronDown, 
  ChevronUp, 
  Maximize2, 
  Sparkles,
  ShieldCheck,
  Disc,
  X
} from 'lucide-react';
import { MotorcycleProfile } from '../data/motorcycles';
import { SupportedLanguage } from '../data/translations';

interface ConnectedMotoBannerProps {
  activeBike: MotorcycleProfile;
  currentLang: SupportedLanguage;
  onDisconnect: () => void;
  onSelectMode?: (mode: 'ride' | 'aa' | 'obd' | 'mirror') => void;
}

export const ConnectedMotoBanner: React.FC<ConnectedMotoBannerProps> = ({
  activeBike,
  currentLang,
  onDisconnect,
  onSelectMode,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isFullscreenPhoto, setIsFullscreenPhoto] = useState<boolean>(false);

  const photoSrc = activeBike.photoUrl || '/media/qj_srt_900_sx.png';

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900/95 via-zinc-900/90 to-zinc-950/95 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/10 transition-all duration-300">
        {/* Subtle accent glow line at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-orange-500 to-emerald-500 animate-pulse" />

        <div className="p-4 sm:p-5">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    COLLEGAMENTO MOTO STABILITO
                  </span>
                  <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
                    {activeBike.defaultSsid}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide mt-0.5">
                  {activeBike.brand} {activeBike.model}
                </h2>
              </div>
            </div>

            {/* Quick Actions & Expand Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFullscreenPhoto(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
                title="Visualizza foto a schermo intero"
              >
                <Maximize2 className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline">Foto Moto</span>
              </button>
              <button
                onClick={() => setIsExpanded((v) => !v)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                title={isExpanded ? 'Riduci banner' : 'Espandi banner'}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={onDisconnect}
                className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-bold transition"
              >
                Disconnetti
              </button>
            </div>
          </div>

          {/* Expanded Content with Motorcycle Photo & Telemetry Ready Badges */}
          {isExpanded && (
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              {/* Photo Showcase Container */}
              <div className="lg:col-span-5 relative group overflow-hidden rounded-xl border border-zinc-700/80 bg-black aspect-[16/9] shadow-xl">
                <img
                  src={photoSrc}
                  alt={`${activeBike.brand} ${activeBike.model}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-orange-400 tracking-wider uppercase block">
                        {activeBike.engine}
                      </span>
                      <span className="text-xs text-white font-mono font-bold">
                        TFT {activeBike.resolution.width}×{activeBike.resolution.height} · {activeBike.protocol}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsFullscreenPhoto(true)}
                      className="p-1.5 rounded-full bg-black/60 hover:bg-orange-500 text-white backdrop-blur transition"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Status and Telemetry Quick Launch Tiles */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block uppercase font-sans font-bold">Wi-Fi T-Box</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                      <Wifi className="w-3 h-3" /> 5.8 GHz Linked
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5 block">{activeBike.ip}:{activeBike.port}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block uppercase font-sans font-bold">Protocollo</span>
                    <span className="text-orange-400 font-bold flex items-center gap-1 mt-0.5">
                      <Radio className="w-3 h-3" /> {activeBike.protocol}
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5 block">Mirror 0x20030 OK</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block uppercase font-sans font-bold">Latenza Video</span>
                    <span className="text-cyan-400 font-bold flex items-center gap-1 mt-0.5">
                      <Activity className="w-3 h-3" /> 11 ms
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5 block">H.265 HEVC 60 FPS</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block uppercase font-sans font-bold">Pressione TPMS</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                      <Disc className="w-3 h-3" /> 2.5 / 2.9 bar
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5 block">Sensori Attivi</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block uppercase font-sans font-bold">Sicurezza & SSL</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3" /> Chiavi Valide
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5 block">Conscrypt TLS 1.3</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block uppercase font-sans font-bold">T-Box Batt / OBD</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3 h-3" /> 14.2 V
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5 block">Alternatore OK</span>
                  </div>
                </div>

                {/* Direct TFT Mode Switching Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-zinc-400 mr-1">Proiezione Schermo:</span>
                  <button
                    onClick={() => onSelectMode?.('ride')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow shadow-orange-500/20"
                  >
                    <Gauge className="w-3.5 h-3.5" />
                    <span>Cruscotto Guida (Visor)</span>
                  </button>
                  <button
                    onClick={() => onSelectMode?.('aa')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition"
                  >
                    <Tv className="w-3.5 h-3.5 text-blue-400" />
                    <span>Android Auto Nav</span>
                  </button>
                  <button
                    onClick={() => onSelectMode?.('obd')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition"
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Dati OBD Live</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal to view the Motorcycle photo in high definition */}
      {isFullscreenPhoto && (
        <div 
          onClick={() => setIsFullscreenPhoto(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-5xl w-full bg-zinc-950 rounded-3xl border border-zinc-700 overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/80">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">
                  {activeBike.brand} {activeBike.model} — Foto Ufficiale Moto Connessa
                </h3>
              </div>
              <button
                onClick={() => setIsFullscreenPhoto(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-[16/9] w-full bg-black">
              <img
                src={photoSrc}
                alt={`${activeBike.brand} ${activeBike.model}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span>{activeBike.engine} · {activeBike.protocol}</span>
              <span className="font-mono text-orange-400">Risoluzione TFT: {activeBike.resolution.width}×{activeBike.resolution.height}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Compass, 
  Navigation, 
  MapPin, 
  Phone, 
  Mic, 
  Radio, 
  Gauge, 
  Maximize2, 
  Sparkles, 
  Thermometer, 
  Fuel, 
  Zap, 
  Clock, 
  Layers, 
  Monitor, 
  Activity, 
  ArrowUpRight,
  Sun,
  Moon,
  Tv
} from 'lucide-react';
import { MotorcycleProfile } from '../data/motorcycles';
import { SupportedLanguage, STRINGS } from '../data/translations';

interface TftDisplayProps {
  activeBike: MotorcycleProfile;
  currentLang: SupportedLanguage;
  connectionState: 'connected' | 'connecting' | 'disconnected';
  onTriggerAction?: (actionName: string) => void;
  // External inputs from handlebar controller
  externalCommand?: { command: string; timestamp: number } | null;
}

export const TftDisplay: React.FC<TftDisplayProps> = ({
  activeBike,
  currentLang,
  connectionState,
  onTriggerAction,
  externalCommand,
}) => {
  const t = STRINGS[currentLang] || STRINGS.en;

  // Display & visibility options
  const [displayMode, setDisplayMode] = useState<'aa' | 'ride' | 'obd' | 'mirror'>('ride');
  const [speedUnit, setSpeedUnit] = useState<'kmh' | 'mph'>('kmh');
  const [nightMode, setNightMode] = useState<boolean>(true);
  const [sunlightMode, setSunlightMode] = useState<boolean>(false);
  const [activeCodec, setActiveCodec] = useState<'H.265 HEVC' | 'H.264 AVC'>('H.265 HEVC');
  const [weatherAlertDismissed, setWeatherAlertDismissed] = useState<boolean>(false);
  
  // Simulated vehicle metrics
  const [speed, setSpeed] = useState<number>(68);
  const [rpm, setRpm] = useState<number>(4350);
  const [gear, setGear] = useState<string>('4');
  const [leanAngle, setLeanAngle] = useState<number>(14);
  const [maxLean, setMaxLean] = useState<number>(38);
  const [isThrottleActive, setIsThrottleActive] = useState<boolean>(false);
  const [turnSignal, setTurnSignal] = useState<'none' | 'left' | 'right'>('none');
  const [highBeam, setHighBeam] = useState<boolean>(false);
  const [tpmsOk, setTpmsOk] = useState<boolean>(true);

  // Media playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [volume, setVolume] = useState<number>(75);

  const tracks = [
    { title: 'Passo dello Stelvio', artist: 'Alpine Riders OST', album: 'Mountain Echoes', duration: '3:45' },
    { title: 'Born to Be Wild', artist: 'Steppenwolf', album: 'Easy Rider Classics', duration: '3:30' },
    { title: 'Highway Star', artist: 'Deep Purple', album: 'Machine Head', duration: '6:05' },
    { title: 'Riders on the Storm', artist: 'The Doors', album: 'L.A. Woman', duration: '7:14' },
  ];

  // Handle external handlebar commands
  useEffect(() => {
    if (!externalCommand) return;
    const cmd = externalCommand.command;

    switch (cmd) {
      case 'MODE':
        setDisplayMode((prev) => {
          if (prev === 'ride') return 'aa';
          if (prev === 'aa') return 'obd';
          if (prev === 'obd') return 'mirror';
          return 'ride';
        });
        break;
      case 'SELECT':
        setIsPlaying((p) => !p);
        break;
      case 'UP':
        setGear((g) => {
          if (g === 'N') return '1';
          const n = parseInt(g, 10);
          return n < 6 ? String(n + 1) : '6';
        });
        setSpeed((s) => Math.min(s + 12, 195));
        setRpm((r) => Math.min(r + 1200, 11500));
        break;
      case 'DOWN':
        setGear((g) => {
          if (g === '1') return 'N';
          if (g === 'N') return 'N';
          const n = parseInt(g, 10);
          return n > 1 ? String(n - 1) : '1';
        });
        setSpeed((s) => Math.max(s - 12, 0));
        setRpm((r) => Math.max(r - 1200, 1200));
        break;
      case 'LEFT':
        setCurrentTrackIndex((idx) => (idx > 0 ? idx - 1 : tracks.length - 1));
        break;
      case 'RIGHT':
        setCurrentTrackIndex((idx) => (idx < tracks.length - 1 ? idx + 1 : 0));
        break;
      case 'VOL_UP':
        setVolume((v) => Math.min(v + 5, 100));
        break;
      case 'VOL_DOWN':
        setVolume((v) => Math.max(v - 5, 0));
        break;
      case 'PLAY_PAUSE':
        setIsPlaying((p) => !p);
        break;
      case 'HIGH_BEAM':
        setHighBeam((hb) => !hb);
        break;
      case 'LEAN_LEFT':
        setLeanAngle((a) => {
          const next = Math.max(a - 6, -42);
          setMaxLean((m) => Math.max(m, Math.abs(next)));
          return next;
        });
        break;
      case 'LEAN_RIGHT':
        setLeanAngle((a) => {
          const next = Math.min(a + 6, 42);
          setMaxLean((m) => Math.max(m, Math.abs(next)));
          return next;
        });
        break;
      default:
        break;
    }
  }, [externalCommand]);

  // Dynamic rev pulsing simulation when throttle is clicked/held
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isThrottleActive) {
      interval = setInterval(() => {
        setRpm((r) => Math.min(r + 400, 10800));
        setSpeed((s) => Math.min(s + 2, 185));
      }, 100);
    } else {
      interval = setInterval(() => {
        setRpm((r) => (r > 3800 ? r - 250 : 3800 + Math.sin(Date.now() / 300) * 80));
        setSpeed((s) => (s > 64 ? s - 0.5 : 64 + Math.sin(Date.now() / 500) * 1.5));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isThrottleActive]);

  // Turn signal flashing
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    if (turnSignal === 'none') return;
    const t = setInterval(() => setBlink((b) => !b), 400);
    return () => clearInterval(t);
  }, [turnSignal]);

  const activeTrack = tracks[currentTrackIndex];

  return (
    <div className="space-y-4">
      {/* TFT Control & Quick Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-900/80 rounded-xl border border-zinc-800">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-bold text-zinc-400 mr-1 flex items-center gap-1">
            <Tv className="w-3.5 h-3.5 text-orange-400" />
            Mode:
          </span>
          {[
            { id: 'ride', label: t.tft_mode_ride, icon: Gauge },
            { id: 'aa', label: t.tft_mode_aa, icon: Navigation },
            { id: 'obd', label: t.tft_mode_obd, icon: Activity },
            { id: 'mirror', label: t.tft_mode_mirror, icon: Layers },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setDisplayMode(id as any)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                displayMode === id
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center space-x-2">
          {/* High-Vis Sun Mode Toggle */}
          <button
            onClick={() => setSunlightMode((s) => !s)}
            className={`px-2.5 py-1 rounded text-xs font-bold flex items-center space-x-1 transition shadow-sm ${
              sunlightMode 
                ? 'bg-amber-400 text-black shadow-amber-400/30 ring-2 ring-amber-300' 
                : 'bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
            title="Toggle High-Visibility Direct Sunlight Mode"
          >
            <Sun className={`w-3.5 h-3.5 ${sunlightMode ? 'text-black fill-current' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">Sun Mode</span>
          </button>

          {/* Codec Toggle */}
          <button
            onClick={() => setActiveCodec((c) => (c === 'H.265 HEVC' ? 'H.264 AVC' : 'H.265 HEVC'))}
            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono font-bold"
            title="Toggle Active Video Codec"
          >
            {activeCodec}
          </button>

          {/* Unit Toggle */}
          <button
            onClick={() => setSpeedUnit((u) => (u === 'kmh' ? 'mph' : 'kmh'))}
            className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono font-bold"
            title="Toggle Speed Units"
          >
            {speedUnit.toUpperCase()}
          </button>

          {/* Night Mode Toggle */}
          <button
            onClick={() => setNightMode((n) => !n)}
            className="p-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white text-xs"
            title="Toggle Day/Night TFT Mode"
          >
            {nightMode ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* Turn Signal Sim */}
          <div className="flex items-center space-x-1 bg-zinc-800 p-0.5 rounded">
            <button
              onClick={() => setTurnSignal((s) => (s === 'left' ? 'none' : 'left'))}
              className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                turnSignal === 'left' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              ◀
            </button>
            <button
              onClick={() => setTurnSignal((s) => (s === 'right' ? 'none' : 'right'))}
              className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                turnSignal === 'right' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* PHYSICAL MOTORCYCLE TFT CLUSTER FRAME */}
      <div className="relative mx-auto max-w-5xl rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black shadow-2xl border-4 border-zinc-700/80 ring-1 ring-white/10">
        {/* Bezel Screw Details */}
        <div className="absolute top-2 left-3 w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-600 shadow-inner flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-zinc-500" />
        </div>
        <div className="absolute top-2 right-3 w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-600 shadow-inner flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-zinc-500" />
        </div>
        <div className="absolute bottom-2 left-3 w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-600 shadow-inner flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-zinc-500" />
        </div>
        <div className="absolute bottom-2 right-3 w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-600 shadow-inner flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-zinc-500" />
        </div>

        {/* TOP STATUS LAMPS BAR (Real physical motorcycle dash warning lights) */}
        <div className="flex items-center justify-between px-4 py-1.5 mb-2 bg-black/60 rounded-xl border border-zinc-800/80">
          {/* Left Indicator */}
          <div className={`flex items-center space-x-1 transition-opacity ${turnSignal === 'left' && blink ? 'opacity-100 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'opacity-20 text-zinc-600'}`}>
            <span className="text-xs font-black">◀</span>
          </div>

          <div className="flex items-center space-x-4 sm:space-x-8 text-[11px] font-bold tracking-wider">
            {/* ABS Light */}
            <span className="flex items-center space-x-1 text-amber-500/90 font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
              <span>ABS</span>
            </span>

            {/* Neutral Indicator (N) */}
            <span className={`flex items-center space-x-1 font-mono font-black ${gear === 'N' ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.9)] animate-pulse' : 'text-zinc-700'}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${gear === 'N' ? 'bg-emerald-400' : 'bg-zinc-800'} inline-block`} />
              <span className="text-xs">N</span>
            </span>

            {/* High Beam */}
            <span className={`flex items-center space-x-1 ${highBeam ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]' : 'text-zinc-700'}`}>
              <span className={`w-2 h-2 rounded-full ${highBeam ? 'bg-blue-400' : 'bg-zinc-800'} inline-block`} />
              <span>BEAM</span>
            </span>

            {/* Oil Warning */}
            <span className="flex items-center space-x-1 text-zinc-700">
              <span className="w-2 h-2 rounded-full bg-zinc-800 inline-block" />
              <span>OIL</span>
            </span>

            {/* TPMS Tire Sensor */}
            <span className={`flex items-center space-x-1 font-mono ${tpmsOk ? 'text-zinc-600' : 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse'}`}>
              <span className={`w-2 h-2 rounded-full ${tpmsOk ? 'bg-zinc-800' : 'bg-amber-400'} inline-block`} />
              <span>TPMS</span>
            </span>

            {/* Check Engine */}
            <span className="flex items-center space-x-1 text-zinc-700">
              <span className="w-2 h-2 rounded-full bg-zinc-800 inline-block" />
              <span>MIL</span>
            </span>
          </div>

          {/* Right Indicator */}
          <div className={`flex items-center space-x-1 transition-opacity ${turnSignal === 'right' && blink ? 'opacity-100 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'opacity-20 text-zinc-600'}`}>
            <span className="text-xs font-black">▶</span>
          </div>
        </div>

        {/* ACTIVE TFT SCREEN GLASS */}
        <div 
          className={`relative overflow-hidden rounded-2xl border-2 aspect-[16/9] min-h-[360px] sm:min-h-[460px] flex flex-col justify-between p-4 sm:p-6 transition-colors duration-300 ${
            sunlightMode
              ? 'bg-black text-amber-300 border-amber-400 ring-2 ring-amber-400/50'
              : nightMode 
              ? 'bg-gradient-to-br from-[#0c0d10] via-[#08090b] to-[#040405] text-zinc-100 border-zinc-800' 
              : 'bg-gradient-to-br from-[#1a1d24] via-[#12141a] to-[#0a0c10] text-zinc-100 border-zinc-800'
          }`}
          style={{
            boxShadow: sunlightMode 
              ? 'inset 0 0 50px rgba(0,0,0,1), 0 0 25px rgba(251,191,36,0.2)' 
              : 'inset 0 0 40px rgba(0,0,0,0.9), 0 0 15px rgba(255,100,0,0.05)',
          }}
        >
          {/* SPEED CAMERA / TUTOR RADAR HUD ALERT WIDGET */}
          <div className="absolute top-12 right-4 z-20 max-w-[240px] bg-zinc-950/95 border-2 border-red-500 rounded-xl p-2.5 shadow-2xl flex items-center space-x-2.5 backdrop-blur">
            <div className="w-8 h-8 rounded-full border-2 border-red-500 bg-white text-black font-black font-mono text-xs flex items-center justify-center shrink-0 shadow">
              70
            </div>
            <div className="flex-1 text-[10px] font-mono leading-tight">
              <div className="text-red-400 font-black flex items-center justify-between">
                <span>RADAR FISSO</span>
                <span className="text-white font-bold">450 m</span>
              </div>
              <div className="text-zinc-400 text-[9px] mt-0.5">
                Velocità: <strong className={speed > 70 ? 'text-red-400' : 'text-emerald-400'}>{Math.round(speed)} km/h</strong>
              </div>
            </div>
          </div>

          {/* LIVE WEATHER RADAR ALERT BANNER */}
          {!weatherAlertDismissed && (
            <div className="absolute top-12 left-4 z-20 max-w-xs bg-blue-950/95 border border-blue-400/60 rounded-xl px-2.5 py-1.5 shadow-2xl flex items-center justify-between space-x-2 text-xs backdrop-blur">
              <div className="flex items-center space-x-2 text-blue-200">
                <span className="text-base">🌧️</span>
                <span className="text-[10px] font-medium leading-tight">
                  <strong className="text-white font-bold block">ALLERTA PIOGGIA</strong>
                  Pioggia intensa tra 12 km (SS38)
                </span>
              </div>
              <button
                onClick={() => setWeatherAlertDismissed(true)}
                className="text-blue-300 hover:text-white text-xs px-1.5 py-0.5 rounded bg-blue-900/60"
              >
                ✕
              </button>
            </div>
          )}
          {/* Connection Watermark if disconnected */}
          {connectionState !== 'connected' && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-700 max-w-md shadow-2xl">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 animate-pulse">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {connectionState === 'connecting' ? t.status_connecting : t.status_disconnected}
                </h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Target T-Box: <span className="font-mono text-orange-400">{activeBike.defaultSsid}</span> ({activeBike.ip}:{activeBike.port})
                </p>
                <div className="flex justify-center gap-2">
                  <button 
                    onClick={() => onTriggerAction?.('reconnect')}
                    className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition"
                  >
                    Simulate Connect
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 1: RIDE DASHBOARD (Visor 3D / Split Layout) */}
          {displayMode === 'ride' && (
            <div className="h-full flex flex-col justify-between">
              {/* Top Bar on TFT */}
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-zinc-800/80 pb-2">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-white tracking-widest uppercase">{activeBike.brand}</span>
                  <span className="text-zinc-500">|</span>
                  <span className="text-orange-400">{activeBike.model}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                    <span>23°C</span>
                  </span>
                  <span className="flex items-center space-x-1 font-bold text-white">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>16:42</span>
                  </span>
                </div>
              </div>

              {/* Main Gauge Area: Tachometer, Speed, Gear & Gyro */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center my-auto py-2">
                {/* Left Telemetry: Gear & Lean Angle */}
                <div className="md:col-span-3 flex md:flex-col items-center justify-around md:justify-center gap-4">
                  {/* Big Gear Display */}
                  <div className="text-center p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 w-28">
                    <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase block">{t.gear}</span>
                    <span className={`text-5xl font-black font-mono leading-tight ${gear === 'N' ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]' : 'text-orange-400'}`}>
                      {gear}
                    </span>
                  </div>

                  {/* Lean Angle Gyro Gauge */}
                  <div className="text-center p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 w-28">
                    <span className="text-[9px] font-bold text-zinc-500 tracking-wider uppercase block">{t.lean_angle}</span>
                    <div className="relative my-1 w-full h-8 flex items-center justify-center">
                      <div 
                        className="w-12 h-1 bg-orange-500 rounded-full transition-transform duration-150 drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]"
                        style={{ transform: `rotate(${leanAngle}deg)` }}
                      />
                    </div>
                    <div className="text-xs font-mono font-bold text-white">
                      {Math.abs(leanAngle)}° <span className="text-[10px] text-zinc-400">{leanAngle < 0 ? 'L' : leanAngle > 0 ? 'R' : ''}</span>
                    </div>
                    <span className="text-[9px] text-zinc-500 font-mono">MAX: {maxLean}°</span>
                  </div>
                </div>

                {/* Center: Large Speedometer & RPM Arc */}
                <div className="md:col-span-6 flex flex-col items-center justify-center text-center">
                  {/* Dynamic RPM Arc Visualizer */}
                  <div className="w-full max-w-sm mb-2">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400 px-1 mb-1">
                      <span>0</span>
                      <span>3</span>
                      <span>6</span>
                      <span>9</span>
                      <span className="text-red-500 font-bold">12k</span>
                    </div>
                    {/* Segmented RPM bar */}
                    <div className="h-4 bg-zinc-900 rounded-md overflow-hidden p-0.5 border border-zinc-800 flex gap-0.5">
                      {Array.from({ length: 30 }).map((_, i) => {
                        const threshold = (i / 30) * 12000;
                        const isLit = rpm >= threshold;
                        const isRedline = i >= 24;
                        return (
                          <div
                            key={i}
                            className={`flex-1 rounded-[1px] transition-all duration-75 ${
                              isLit
                                ? isRedline
                                  ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                                  : i > 18
                                  ? 'bg-amber-400'
                                  : 'bg-orange-500'
                                : 'bg-zinc-800/60'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[10px] text-zinc-500 font-mono">x1000 RPM</span>
                      <span className="text-xs font-mono font-bold text-zinc-300">{Math.round(rpm)} RPM</span>
                    </div>
                  </div>

                  {/* Gigantic Digital Speed */}
                  <div className="my-1">
                    <div className="text-7xl sm:text-8xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] leading-none">
                      {Math.round(speedUnit === 'kmh' ? speed : speed * 0.621371)}
                    </div>
                    <div className="text-sm font-bold tracking-widest text-zinc-400 font-mono uppercase mt-1">
                      {speedUnit === 'kmh' ? t.speed_kmh : t.speed_mph}
                    </div>
                  </div>

                  {/* Interactive throttle pedal simulator button */}
                  <div className="mt-2">
                    <button
                      onMouseDown={() => setIsThrottleActive(true)}
                      onMouseUp={() => setIsThrottleActive(false)}
                      onTouchStart={() => setIsThrottleActive(true)}
                      onTouchEnd={() => setIsThrottleActive(false)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition select-none ${
                        isThrottleActive
                          ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.6)] scale-95'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      {isThrottleActive ? '🔥 ACCELERATING...' : '✊ Hold to Rev Throttle'}
                    </button>
                  </div>
                </div>

                {/* Right Telemetry: Fuel & Coolant Gauges */}
                <div className="md:col-span-3 flex md:flex-col items-center justify-around md:justify-center gap-4">
                  {/* Coolant Temp */}
                  <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 w-28 text-center">
                    <div className="flex items-center justify-center space-x-1 text-zinc-400 mb-1">
                      <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[9px] font-bold tracking-wider">{t.coolant}</span>
                    </div>
                    <div className="text-lg font-mono font-bold text-cyan-400">88°C</div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-cyan-400 h-full w-[65%]" />
                    </div>
                    <span className="text-[9px] text-zinc-500 block mt-0.5">OPTIMAL</span>
                  </div>

                  {/* Fuel Tank */}
                  <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 w-28 text-center">
                    <div className="flex items-center justify-center space-x-1 text-zinc-400 mb-1">
                      <Fuel className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[9px] font-bold tracking-wider">{t.fuel}</span>
                    </div>
                    <div className="text-lg font-mono font-bold text-amber-400">76%</div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-amber-400 h-full w-[76%]" />
                    </div>
                    <span className="text-[9px] text-zinc-400 block mt-0.5 font-mono">285 km</span>
                  </div>
                </div>
              </div>

              {/* Bottom Trip Computer Bar */}
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-t border-zinc-800/80 pt-2">
                <div className="flex space-x-6">
                  <span>{t.trip_a}: <strong className="text-white">142.6 km</strong></span>
                  <span>{t.trip_b}: <strong className="text-white">318.0 km</strong></span>
                </div>
                <div>
                  <span>{t.odo}: <strong className="text-white">12,480 km</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: ANDROID AUTO (Maps + Spotify Split View) */}
          {displayMode === 'aa' && (
            <div className="h-full flex flex-col justify-between">
              {/* AA Top Status Bar */}
              <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-2">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white">Android Auto</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">LIVE STREAM</span>
                </div>
                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span>5G • 84% 🔋</span>
                  <span className="font-bold text-white">16:42</span>
                </div>
              </div>

              {/* AA Main Content: Navigation Card + Music Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 my-auto py-2">
                {/* Navigation Card */}
                <div className="md:col-span-7 bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-500/30 shrink-0">
                      <ArrowUpRight className="w-7 h-7 stroke-[3]" />
                    </div>
                    <div>
                      <div className="text-lg font-black text-white leading-tight">In 350 m</div>
                      <div className="text-xs text-zinc-300 font-medium">Turn Right onto SS38 - Passo dello Stelvio</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">Next: hairpin bends ahead</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3 font-mono">
                      <span className="text-emerald-400 font-bold">28.4 km</span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-white font-bold">ETA 17:15</span>
                    </div>
                    {/* Speed Limit Badge */}
                    <div className="w-8 h-8 rounded-full border-2 border-red-500 bg-white text-black font-black font-mono text-xs flex items-center justify-center shadow-md">
                      70
                    </div>
                  </div>
                </div>

                {/* Spotify / Media Card */}
                <div className="md:col-span-5 bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white shadow-md shrink-0">
                      <Radio className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-bold text-white truncate">{activeTrack.title}</div>
                      <div className="text-xs text-zinc-400 truncate">{activeTrack.artist}</div>
                      <div className="text-[10px] text-zinc-500 truncate">{activeTrack.album}</div>
                    </div>
                  </div>

                  {/* Scrubber & Controls */}
                  <div className="mt-3">
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-2">
                      <div className="bg-green-500 h-full w-[45%]" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => setCurrentTrackIndex((i) => (i > 0 ? i - 1 : tracks.length - 1))}
                          className="p-1.5 text-zinc-400 hover:text-white"
                        >
                          <SkipBack className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setIsPlaying((p) => !p)}
                          className="p-2 bg-green-500 hover:bg-green-400 text-black rounded-full shadow-md"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                        </button>
                        <button 
                          onClick={() => setCurrentTrackIndex((i) => (i < tracks.length - 1 ? i + 1 : 0))}
                          className="p-1.5 text-zinc-400 hover:text-white"
                        >
                          <SkipForward className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Volume Slider */}
                      <div className="flex items-center space-x-1 text-zinc-400">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-mono text-zinc-300">{volume}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AA Bottom Dock Bar */}
              <div className="flex items-center justify-between bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-400">
                <div className="flex items-center space-x-4">
                  <button className="text-emerald-400 hover:text-emerald-300 p-1">
                    <Navigation className="w-5 h-5" />
                  </button>
                  <button className="text-green-500 hover:text-green-400 p-1">
                    <Radio className="w-5 h-5" />
                  </button>
                  <button className="text-blue-400 hover:text-blue-300 p-1">
                    <Phone className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="p-1.5 rounded-full bg-zinc-800 text-zinc-300 hover:text-white">
                    <Mic className="w-4 h-4 text-orange-400" />
                  </button>
                  <div className="text-[11px] font-mono text-zinc-300">
                    MOTO-HUB LINK
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: OBD-II LIVE TELEMETRY */}
          {displayMode === 'obd' && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-2">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white">ELM327 OBD-II Telemetry Feed</span>
                  <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">ISO 15765-4 CAN</span>
                </div>
                <div className="text-xs font-mono text-emerald-400">LINK: 500 kbps CAN-BUS</div>
              </div>

              {/* 6 Real-time OBD telemetry cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-auto py-2">
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Coolant Temp (PID 05)</span>
                  <div className="text-2xl font-black font-mono text-cyan-400 mt-1">88 °C</div>
                  <span className="text-[10px] text-zinc-400">Normal operating range</span>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Throttle Position (PID 11)</span>
                  <div className="text-2xl font-black font-mono text-orange-400 mt-1">34 %</div>
                  <span className="text-[10px] text-zinc-400">TPS Angle: 16.4°</span>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Intake Air Temp (PID 0F)</span>
                  <div className="text-2xl font-black font-mono text-emerald-400 mt-1">24 °C</div>
                  <span className="text-[10px] text-zinc-400">Ambient delta: +1°C</span>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Battery Voltage (PID 42)</span>
                  <div className="text-2xl font-black font-mono text-amber-400 mt-1">14.2 V</div>
                  <span className="text-[10px] text-zinc-400">Stator charge active</span>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Engine Load (PID 04)</span>
                  <div className="text-2xl font-black font-mono text-purple-400 mt-1">42 %</div>
                  <span className="text-[10px] text-zinc-400">Calculated manifold load</span>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Fault Codes (DTCs)</span>
                  <div className="text-xl font-black font-mono text-emerald-400 mt-1">0 CODES</div>
                  <span className="text-[10px] text-zinc-400">ECU status: P0000 Clean</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-t border-zinc-800/80 pt-2">
                <span>ECU: Bosch MSE 6.0 / Marelli</span>
                <span className="text-emerald-400">No MIL Check Engine flags active</span>
              </div>
            </div>
          )}

          {/* MODE 4: SCREEN MIRRORING (AOA / T-Box Video Stream) */}
          {displayMode === 'mirror' && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-2">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-orange-400" />
                  <span className="font-bold text-white">Screen Mirroring Cast Viewport</span>
                  <span className="text-[10px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">H.264 AVC</span>
                </div>
                <div className="text-xs font-mono text-zinc-400">
                  {activeBike.resolution.width} x {activeBike.resolution.height}
                </div>
              </div>

              {/* Cast Display preview with hero screenshot */}
              <div className="relative rounded-xl overflow-hidden border border-zinc-800 my-auto bg-zinc-950 flex items-center justify-center min-h-[220px]">
                <img 
                  src="/media/phone-dash-split.webp" 
                  alt="Phone Mirror" 
                  className="w-full h-full object-cover max-h-[260px] opacity-90"
                  onError={(e) => {
                    // Fallback visual if webp cannot load
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                
                {/* Overlay live stream stats */}
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur px-2.5 py-1.5 rounded-lg border border-zinc-700 text-[11px] font-mono space-y-0.5">
                  <div className="text-emerald-400 font-bold">● LIVE 60.0 FPS</div>
                  <div className="text-zinc-300">Bitrate: 4.8 Mbps (Smoother)</div>
                  <div className="text-zinc-300">Latency: 21 ms</div>
                  <div className="text-zinc-400">Dropped Frames: 0</div>
                </div>

                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur px-2.5 py-1.5 rounded-lg border border-zinc-700 text-[11px] font-mono text-zinc-300">
                  Protocol: {activeBike.protocol}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-t border-zinc-800/80 pt-2">
                <span>Adaptive video backpressure active</span>
                <span className="text-orange-400 font-bold">Touch pass-through enabled</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

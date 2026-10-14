import React, { useState } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  CornerDownLeft, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  PhoneCall, 
  SunMedium, 
  Mic, 
  Settings2, 
  Sliders, 
  CheckCircle2, 
  Sparkles,
  Gamepad2
} from 'lucide-react';
import { SupportedLanguage, STRINGS } from '../data/translations';

import { playIntercomBeep } from '../utils/audioFeedback';

interface HandlebarControllerProps {
  currentLang: SupportedLanguage;
  onSendCommand: (command: string) => void;
}

interface LogEntry {
  id: string;
  time: string;
  code: string;
  label: string;
  mappedAction: string;
}

export const HandlebarController: React.FC<HandlebarControllerProps> = ({
  currentLang,
  onSendCommand,
}) => {
  const t = STRINGS[currentLang] || STRINGS.en;

  const [debounceMs, setDebounceMs] = useState<number>(50);
  const [longPressMs, setLongPressMs] = useState<number>(400);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [audioFeedbackEnabled, setAudioFeedbackEnabled] = useState<boolean>(true);
  const [audioVolume, setAudioVolume] = useState<number>(0.4);
  const [switchgearPreset, setSwitchgearPreset] = useState<'cfmoto' | 'benelli' | 'voge' | 'bmw'>('cfmoto');
  
  const [eventLogs, setEventLogs] = useState<LogEntry[]>([
    { id: '1', time: '16:40:12.104', code: 'KEYCODE_DPAD_CENTER (23)', label: 'ENTER', mappedAction: 'Select / Toggle Playback' },
    { id: '2', time: '16:40:15.820', code: 'KEYCODE_MEDIA_NEXT (87)', label: 'RIGHT', mappedAction: 'Next Audio Track' },
    { id: '3', time: '16:40:22.401', code: 'KEYCODE_DPAD_UP (19)', label: 'UP', mappedAction: 'Shift Gear Up / Accelerate' },
  ]);

  const handleButtonPress = (code: string, label: string, actionDesc: string) => {
    setActiveButton(label);
    if (audioFeedbackEnabled) {
      playIntercomBeep('click', audioVolume);
    }
    setTimeout(() => setActiveButton(null), 200);

    const now = new Date();
    const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    
    setEventLogs((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        time: timeStr,
        code,
        label,
        mappedAction: actionDesc,
      },
      ...prev.slice(0, 19),
    ]);

    onSendCommand(label);
  };

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Gamepad2 className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-black text-white">Handlebar Button Mapping & Control Pod</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Control Android Auto, the Ride Dashboard, and media playback directly with the buttons on your motorcycle's handlebar. Press any button below to send live commands to the active TFT screen.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-800 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-300">HID CAPTURE SERVICE: RUNNING</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: VIRTUAL MOTORCYCLE HANDLEBAR POD (Physical Switchgear UI) */}
        <div className="lg:col-span-6 bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 border-2 border-zinc-800 rounded-3xl p-6 shadow-2xl relative">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-orange-400">Left Switchgear Pod</span>
              <h3 className="text-sm font-bold text-white">Motorcycle Handlebar Unit</h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">CAN-BUS / BLE</span>
          </div>

          {/* Realistic Pod Housing */}
          <div className="relative mx-auto max-w-xs bg-zinc-950 border-4 border-zinc-800 rounded-3xl p-6 shadow-inner space-y-6">
            {/* Top Function Buttons: MODE & RETURN */}
            <div className="flex justify-between items-center px-2">
              <button
                onClick={() => handleButtonPress('KEYCODE_ESCAPE (111)', 'MODE', 'Cycle TFT Screens')}
                className={`w-16 h-12 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center transition shadow-md ${
                  activeButton === 'MODE'
                    ? 'bg-orange-500 border-orange-400 text-white scale-95 shadow-orange-500/50'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                <RotateCcw className="w-4 h-4 mb-0.5" />
                <span className="text-[9px]">MODE</span>
              </button>

              <button
                onClick={() => handleButtonPress('KEYCODE_BACK (4)', 'BACK', 'Return to Previous Menu')}
                className={`w-16 h-12 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center transition shadow-md ${
                  activeButton === 'BACK'
                    ? 'bg-orange-500 border-orange-400 text-white scale-95 shadow-orange-500/50'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                <CornerDownLeft className="w-4 h-4 mb-0.5" />
                <span className="text-[9px]">BACK</span>
              </button>
            </div>

            {/* Main 4-Way D-Pad with Center Select */}
            <div className="relative w-48 h-48 mx-auto bg-zinc-900 rounded-full border-4 border-zinc-800 shadow-xl flex items-center justify-center p-2">
              {/* UP */}
              <button
                onClick={() => handleButtonPress('KEYCODE_DPAD_UP (19)', 'UP', 'Gear Up / Accelerate')}
                className={`absolute top-2 w-12 h-12 rounded-t-2xl font-bold flex items-center justify-center transition border border-zinc-700 ${
                  activeButton === 'UP' ? 'bg-orange-500 text-white shadow-lg' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
                title="Gear Up / Up"
              >
                <ArrowUp className="w-6 h-6" />
              </button>

              {/* DOWN */}
              <button
                onClick={() => handleButtonPress('KEYCODE_DPAD_DOWN (20)', 'DOWN', 'Gear Down / Decelerate')}
                className={`absolute bottom-2 w-12 h-12 rounded-b-2xl font-bold flex items-center justify-center transition border border-zinc-700 ${
                  activeButton === 'DOWN' ? 'bg-orange-500 text-white shadow-lg' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
                title="Gear Down / Down"
              >
                <ArrowDown className="w-6 h-6" />
              </button>

              {/* LEFT */}
              <button
                onClick={() => handleButtonPress('KEYCODE_DPAD_LEFT (21)', 'LEFT', 'Previous Track / Menu Left')}
                className={`absolute left-2 w-12 h-12 rounded-l-2xl font-bold flex items-center justify-center transition border border-zinc-700 ${
                  activeButton === 'LEFT' ? 'bg-orange-500 text-white shadow-lg' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
                title="Left / Prev Track"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              {/* RIGHT */}
              <button
                onClick={() => handleButtonPress('KEYCODE_DPAD_RIGHT (22)', 'RIGHT', 'Next Track / Menu Right')}
                className={`absolute right-2 w-12 h-12 rounded-r-2xl font-bold flex items-center justify-center transition border border-zinc-700 ${
                  activeButton === 'RIGHT' ? 'bg-orange-500 text-white shadow-lg' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
                title="Right / Next Track"
              >
                <ArrowRight className="w-6 h-6" />
              </button>

              {/* CENTER SELECT */}
              <button
                onClick={() => handleButtonPress('KEYCODE_DPAD_CENTER (23)', 'SELECT', 'Select / Toggle Playback')}
                className={`w-14 h-14 rounded-full font-black text-xs flex items-center justify-center transition border-2 shadow-inner z-10 ${
                  activeButton === 'SELECT'
                    ? 'bg-orange-500 border-orange-300 text-white scale-95 shadow-lg'
                    : 'bg-zinc-950 border-orange-500/60 text-orange-400 hover:bg-zinc-800'
                }`}
                title="Select / OK"
              >
                OK
              </button>
            </div>

            {/* Bottom Audio & Quick Actions Pod */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => handleButtonPress('KEYCODE_VOLUME_UP (24)', 'VOL_UP', 'Volume Increase')}
                className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 flex flex-col items-center justify-center text-[10px]"
                title="Volume +"
              >
                <Volume2 className="w-4 h-4 mb-0.5 text-zinc-300" />
                <span>VOL +</span>
              </button>

              <button
                onClick={() => handleButtonPress('KEYCODE_VOLUME_DOWN (25)', 'VOL_DOWN', 'Volume Decrease')}
                className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 flex flex-col items-center justify-center text-[10px]"
                title="Volume -"
              >
                <VolumeX className="w-4 h-4 mb-0.5 text-zinc-300" />
                <span>VOL -</span>
              </button>

              <button
                onClick={() => handleButtonPress('KEYCODE_MEDIA_PLAY_PAUSE (85)', 'PLAY_PAUSE', 'Audio Play / Pause')}
                className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 flex flex-col items-center justify-center text-[10px]"
                title="Play/Pause"
              >
                <Play className="w-4 h-4 mb-0.5 text-green-400" />
                <span>PLAY</span>
              </button>

              <button
                onClick={() => handleButtonPress('CUSTOM_HIGH_BEAM (256)', 'HIGH_BEAM', 'Flash High Beam')}
                className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 flex flex-col items-center justify-center text-[10px]"
                title="High Beam"
              >
                <SunMedium className="w-4 h-4 mb-0.5 text-blue-400" />
                <span>FLASH</span>
              </button>
            </div>

            {/* GESTURE CHORDS SECTION (Pressioni Combinate) */}
            <div className="pt-2 border-t border-zinc-800 space-y-1.5">
              <span className="text-[10px] text-zinc-400 font-bold uppercase block tracking-wider">
                Gesture Chords (Pressioni Combinate)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleButtonPress('CHORD_UP_DOWN', 'RECENTER', 'Recentra Mappa / Reset Pieghe');
                    if (audioFeedbackEnabled) playIntercomBeep('confirm', audioVolume);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-orange-400 text-[11px] font-mono font-bold text-center"
                >
                  ⚡ UP + DOWN (Recentra)
                </button>
                <button
                  onClick={() => {
                    handleButtonPress('HOLD_BACK', 'MUTE', 'Mute Interfono / Siri / Google');
                    if (audioFeedbackEnabled) playIntercomBeep('confirm', audioVolume);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-cyan-400 text-[11px] font-mono font-bold text-center"
                >
                  ⏳ HOLD BACK (Mute)
                </button>
              </div>
            </div>

            {/* Quick Lean Simulator Buttons */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleButtonPress('MOTION_LEAN_LEFT', 'LEAN_LEFT', 'Tilt Motorcycle Left')}
                className="px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-orange-400 text-xs font-mono font-bold"
              >
                ◀ Lean Left
              </button>
              <span className="text-[10px] text-zinc-500 uppercase">Tilt Gyro</span>
              <button
                onClick={() => handleButtonPress('MOTION_LEAN_RIGHT', 'LEAN_RIGHT', 'Tilt Motorcycle Right')}
                className="px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-orange-400 text-xs font-mono font-bold"
              >
                Lean Right ▶
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TIMING PREFERENCES & LIVE HID LOG */}
        <div className="lg:col-span-6 space-y-6">
          {/* Timing Calibration & Helmet Audio Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <Sliders className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white">Handlebar Timing & Intercom Feedback</h3>
            </div>

            {/* Helmet Audio Feedback Toggle */}
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Feedback Audio Interfono Casco</span>
                  <span className="text-[11px] text-zinc-400">Emette un tono discreto nel casco alla pressione dei tasti</span>
                </div>
                <input
                  type="checkbox"
                  checked={audioFeedbackEnabled}
                  onChange={(e) => {
                    setAudioFeedbackEnabled(e.target.checked);
                    if (e.target.checked) playIntercomBeep('confirm', audioVolume);
                  }}
                  className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                />
              </div>

              {audioFeedbackEnabled && (
                <div className="pt-2 border-t border-zinc-800/80">
                  <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Volume Beep Casco</span>
                    <span className="font-mono text-orange-400 font-bold">{Math.round(audioVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-zinc-300 mb-1">
                  <span>Debounce Window</span>
                  <span className="font-mono text-orange-400 font-bold">{debounceMs} ms</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="150" 
                  step="5"
                  value={debounceMs} 
                  onChange={(e) => setDebounceMs(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <p className="text-[11px] text-zinc-500 mt-1">Filters out mechanical button chatter from motorcycle switches.</p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-zinc-300 mb-1">
                  <span>Long-Press Trigger Threshold</span>
                  <span className="font-mono text-orange-400 font-bold">{longPressMs} ms</span>
                </div>
                <input 
                  type="range" 
                  min="250" 
                  max="800" 
                  step="25"
                  value={longPressMs} 
                  onChange={(e) => setLongPressMs(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <p className="text-[11px] text-zinc-500 mt-1">Holding the button for this duration activates secondary actions (e.g. voice assistant).</p>
              </div>
            </div>
          </div>

          {/* Live Event Log */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col h-72">
            <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-sm font-bold text-white">Real-Time Handlebar Event Feed</h3>
              </div>
              <button 
                onClick={() => setEventLogs([])}
                className="text-[10px] text-zinc-500 hover:text-zinc-300"
              >
                Clear Log
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-[11px]">
              {eventLogs.length === 0 ? (
                <div className="text-center py-10 text-zinc-600">No button events recorded yet. Press any handlebar button!</div>
              ) : (
                eventLogs.map((log) => (
                  <div key={log.id} className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-orange-400 font-bold mr-2">[{log.label}]</span>
                      <span className="text-zinc-200">{log.mappedAction}</span>
                      <div className="text-[10px] text-zinc-500">{log.code}</div>
                    </div>
                    <span className="text-[10px] text-zinc-500 shrink-0">{log.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

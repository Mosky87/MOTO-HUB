import React, { useState } from 'react';
import { 
  QrCode, 
  Wifi, 
  ShieldCheck, 
  Radio, 
  Terminal, 
  CheckCircle2, 
  Play, 
  RefreshCw, 
  Upload, 
  Camera, 
  FileCode,
  Key,
  Server
} from 'lucide-react';
import { MotorcycleProfile } from '../data/motorcycles';
import { SupportedLanguage, STRINGS } from '../data/translations';

interface PairingSuiteProps {
  currentLang: SupportedLanguage;
  activeBike: MotorcycleProfile;
  connectionState: 'connected' | 'connecting' | 'disconnected';
  onStateChange: (state: 'connected' | 'connecting' | 'disconnected') => void;
}

export const PairingSuite: React.FC<PairingSuiteProps> = ({
  currentLang,
  activeBike,
  connectionState,
  onStateChange,
}) => {
  const t = STRINGS[currentLang] || STRINGS.en;

  const [qrCodeText, setQrCodeText] = useState<string>(
    `EC:SSID=${activeBike.defaultSsid};P=12345678;IP=${activeBike.ip};PORT=${activeBike.port};DIALECT=${activeBike.protocol}`
  );
  const [handshakeStep, setHandshakeStep] = useState<number>(connectionState === 'connected' ? 5 : 0);
  const [packetLogs, setPacketLogs] = useState<string[]>([
    '[INIT] T-Box Link Resolver initialized',
    '[WIFI] Listening for motorcycle access points...',
  ]);

  const handshakeStages = [
    { name: '1. Wi-Fi Association', desc: `Scanning SSID: ${activeBike.defaultSsid}` },
    { name: '2. TCP Socket Connect', desc: `Target: ${activeBike.ip}:${activeBike.port}` },
    { name: '3. Protocol Handshake', desc: `Dialect: ${activeBike.protocol} BTP Ping` },
    { name: '4. Conscrypt SSL/TLS', desc: 'SingleKeyKeyManager certificate exchange' },
    { name: '5. AAP Service Discovery', desc: 'Registering Video, Audio & Input channels' },
  ];

  const runSimulatedHandshake = () => {
    onStateChange('connecting');
    setHandshakeStep(0);
    setPacketLogs((p) => [`[${new Date().toLocaleTimeString()}] Starting connection sequence...`, ...p]);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setHandshakeStep(step);

      if (step === 1) {
        setPacketLogs((p) => [
          `[WIFI] Connected to SSID: ${activeBike.defaultSsid} (IP: 192.168.43.100, Gateway: ${activeBike.ip})`,
          ...p,
        ]);
      } else if (step === 2) {
        setPacketLogs((p) => [
          `[TCP] Socket established to ${activeBike.ip}:${activeBike.port} (FD: 42, NoDelay: true)`,
          ...p,
        ]);
      } else if (step === 3) {
        setPacketLogs((p) => [
          `[HANDSHAKE] Sent ${activeBike.protocol} magic header (0xAA 0x55 0x01 0x00), received ACK`,
          ...p,
        ]);
      } else if (step === 4) {
        setPacketLogs((p) => [
          `[SSL] Conscrypt engine initialized, TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 handshake OK`,
          ...p,
        ]);
      } else if (step === 5) {
        setPacketLogs((p) => [
          `[AAP] ServiceDiscoveryResponse: VideoSink(1024x600@60fps), AudioTap(48kHz Stereo), InputSink(Handlebar D-Pad)`,
          `[STREAM] H.264 video pipeline unlocked. T-BOX SESSION ACTIVE.`,
          ...p,
        ]);
        clearInterval(interval);
        onStateChange('connected');
      }
    }, 800);
  };

  const handleDisconnect = () => {
    onStateChange('disconnected');
    setHandshakeStep(0);
    setPacketLogs((p) => [
      `[${new Date().toLocaleTimeString()}] T-Box transport closed cleanly.`,
      ...p,
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center space-x-2">
          <Wifi className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-black text-white">T-Box Link, QR Pairing & Protocol Inspector</h2>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Motorcycle dashboards with EasyConn, Yunmo, or ThinkerRide present a Wi-Fi access point and QR code. MOTO-HUB decodes this payload to initiate the encrypted AAP streaming link.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: QR CODE PARSER & PRESETS */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white">Dashboard QR Code Parser</h3>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Dialect: {activeBike.protocol}</span>
            </div>

            {/* Simulated QR Visualizer */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                {/* SVG QR Code representation */}
                <div className="w-full h-full border-4 border-black grid grid-cols-4 gap-1 p-1">
                  <div className="bg-black" />
                  <div className="bg-black" />
                  <div className="bg-transparent" />
                  <div className="bg-black" />
                  <div className="bg-black" />
                  <div className="bg-transparent" />
                  <div className="bg-black" />
                  <div className="bg-transparent" />
                  <div className="bg-transparent" />
                  <div className="bg-black" />
                  <div className="bg-black" />
                  <div className="bg-black" />
                  <div className="bg-black" />
                  <div className="bg-transparent" />
                  <div className="bg-black" />
                  <div className="bg-black" />
                </div>
              </div>

              <div className="space-y-2 flex-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Raw Decoded Payload</span>
                <textarea
                  value={qrCodeText}
                  onChange={(e) => setQrCodeText(e.target.value)}
                  rows={3}
                  className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-orange-400 font-mono text-[11px] focus:outline-none"
                />
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      setQrCodeText(`EC:SSID=${activeBike.defaultSsid};P=12345678;IP=${activeBike.ip};PORT=${activeBike.port};DIALECT=${activeBike.protocol}`);
                    }}
                    className="text-[10px] text-zinc-400 hover:text-white flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset Payload</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Protocol Dialects Explain */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-zinc-300 block">Supported Motorcycle Dialects:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
                  <strong className="text-orange-400 block">EasyConn (EC)</strong>
                  <span className="text-zinc-500 text-[10px]">CFMOTO, Benelli, Morini</span>
                </div>
                <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
                  <strong className="text-cyan-400 block">Yunmo (YM)</strong>
                  <span className="text-zinc-500 text-[10px]">Voge 525DSX, Loncin</span>
                </div>
                <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
                  <strong className="text-amber-400 block">ThinkerRide (TR)</strong>
                  <span className="text-zinc-500 text-[10px]">KOVE 800X / 450 Rally</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HANDSHAKE STATE MACHINE & LIVE PACKET LOG */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">T-Box Handshake State Machine</h3>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                connectionState === 'connected' ? 'bg-emerald-500/20 text-emerald-400' :
                connectionState === 'connecting' ? 'bg-amber-500/20 text-amber-400' :
                'bg-zinc-800 text-zinc-400'
              }`}>
                {connectionState.toUpperCase()}
              </span>
            </div>

            {/* Connected Bike Photo Showcase Banner */}
            {connectionState === 'connected' && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-zinc-900 border border-emerald-500/40 flex items-center space-x-3.5 shadow-lg">
                <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-zinc-700 bg-black shrink-0">
                  <img
                    src={activeBike.photoUrl || '/media/qj_srt_900_sx.png'}
                    alt={activeBike.model}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Connessione Attiva</span>
                  </div>
                  <h4 className="text-sm font-black text-white truncate">{activeBike.brand} {activeBike.model}</h4>
                  <p className="text-[11px] text-zinc-400 font-mono truncate">{activeBike.defaultSsid} · {activeBike.protocol}</p>
                </div>
              </div>
            )}

            {/* Handshake Progress Steps */}
            <div className="space-y-2">
              {handshakeStages.map((stage, idx) => {
                const isPassed = handshakeStep > idx;
                const isCurrent = handshakeStep === idx && connectionState === 'connecting';
                return (
                  <div
                    key={idx}
                    className={`flex items-center space-x-3 p-2 rounded-lg border text-xs transition ${
                      isPassed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : isCurrent
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 animate-pulse'
                        : 'bg-zinc-950 border-zinc-800/80 text-zinc-500'
                    }`}
                  >
                    <div className="shrink-0">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-mono ${
                          isCurrent ? 'border-amber-400 text-amber-400' : 'border-zinc-700 text-zinc-700'
                        }`}>
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold">{stage.name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{stage.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex space-x-3">
              {connectionState !== 'connected' ? (
                <button
                  onClick={runSimulatedHandshake}
                  disabled={connectionState === 'connecting'}
                  className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Connect to T-Box</span>
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  className="flex-1 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-bold text-xs transition"
                >
                  Disconnect Stream
                </button>
              )}
            </div>
          </div>

          {/* Wire Protocol Packet Stream */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col h-64">
            <div className="flex items-center justify-between mb-2 border-b border-zinc-800 pb-2">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white">Wire Protocol Packet Stream</h3>
              </div>
              <button 
                onClick={() => setPacketLogs([])}
                className="text-[10px] text-zinc-500 hover:text-zinc-300"
              >
                Clear
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[11px] text-zinc-300 pr-1">
              {packetLogs.map((log, i) => (
                <div key={i} className="text-zinc-400 border-b border-zinc-800/40 pb-0.5">
                  <span className="text-zinc-600 mr-2">{'>'}</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

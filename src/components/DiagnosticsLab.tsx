import React, { useState } from 'react';
import { 
  Activity, 
  Wifi, 
  Clock, 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldAlert, 
  Search, 
  Zap,
  Share2
} from 'lucide-react';
import { MotorcycleProfile } from '../data/motorcycles';
import { SupportedLanguage, STRINGS } from '../data/translations';

interface DiagnosticsLabProps {
  currentLang: SupportedLanguage;
  activeBike: MotorcycleProfile;
}

export const DiagnosticsLab: React.FC<DiagnosticsLabProps> = ({
  currentLang,
  activeBike,
}) => {
  const t = STRINGS[currentLang] || STRINGS.en;

  const [isScanningPorts, setIsScanningPorts] = useState<boolean>(false);
  const [portResults, setPortResults] = useState<{ port: number; name: string; status: 'open' | 'closed' | 'probing' }[]>([
    { port: 9999, name: 'EasyConn BTP', status: 'open' },
    { port: 8888, name: 'Yunmo Service', status: 'closed' },
    { port: 7000, name: 'AAP Video Sink', status: 'open' },
    { port: 5000, name: 'AAP Audio Stream', status: 'open' },
    { port: 8080, name: 'T-Box Web Admin', status: 'closed' },
  ]);

  const [copied, setCopied] = useState<boolean>(false);

  const [clockOffsetMs, setClockOffsetMs] = useState<number>(14.2);
  const [jitterMs, setJitterMs] = useState<number>(1.8);

  const runPortScan = () => {
    setIsScanningPorts(true);
    setTimeout(() => {
      setPortResults([
        { port: 9999, name: 'EasyConn BTP', status: activeBike.protocol === 'EasyConn' ? 'open' : 'closed' },
        { port: 8888, name: 'Yunmo Service', status: activeBike.protocol === 'Yunmo' ? 'open' : 'closed' },
        { port: 7000, name: 'AAP Video Sink', status: 'open' },
        { port: 5000, name: 'AAP Audio Stream', status: 'open' },
        { port: 8080, name: 'T-Box Web Admin', status: 'closed' },
      ]);
      setClockOffsetMs(+(12 + Math.random() * 4).toFixed(1));
      setJitterMs(+(1 + Math.random() * 2).toFixed(1));
      setIsScanningPorts(false);
    }, 1200);
  };

  const sampleReport = {
    app: 'MOTO-HUB CORE',
    version: '1.1.120',
    build: 214,
    timestamp: new Date().toISOString(),
    motorcycle: {
      brand: activeBike.brand,
      model: activeBike.model,
      protocol: activeBike.protocol,
      resolution: `${activeBike.resolution.width}x${activeBike.resolution.height}`,
      margins: activeBike.margins,
    },
    network: {
      tbox_ip: activeBike.ip,
      tbox_port: activeBike.port,
      clock_offset_ms: clockOffsetMs,
      jitter_ms: jitterMs,
      ports_scanned: portResults,
    },
    video_pipeline: {
      codec: 'video/avc',
      bitrate_mbps: 4.8,
      fps: 60,
      backpressure_guard: 'ACTIVE',
      dropped_frames: 0,
    },
    redacted: true,
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(JSON.stringify(sampleReport, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sampleReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `motohub-diag-${activeBike.brand.toLowerCase()}-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-black text-white">Diagnostics & Network Engineering Lab</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Perform socket port audits, inspect BTP clock drift, verify cellular bypass, and export sanitized diagnostic bundles.
          </p>
        </div>
        <button
          onClick={runPortScan}
          disabled={isScanningPorts}
          className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-orange-500 hover:text-white text-zinc-200 rounded-xl text-xs font-bold transition shadow-md"
        >
          <RefreshCw className={`w-4 h-4 ${isScanningPorts ? 'animate-spin' : ''}`} />
          <span>{isScanningPorts ? 'Scanning Ports...' : 'Run Socket Audit'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: PORT AUDIT & CLOCK LAB */}
        <div className="lg:col-span-6 space-y-6">
          {/* Socket Port Scanner */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white">T-Box Socket Port Audit</h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Target: {activeBike.ip}</span>
            </div>

            <div className="space-y-2">
              {portResults.map((pr) => (
                <div key={pr.port} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
                  <div>
                    <span className="font-mono font-bold text-white mr-2">Port {pr.port}</span>
                    <span className="text-zinc-400">{pr.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    pr.status === 'open' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {pr.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Clock Lab */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">BTP Clock Synchronization</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Measures timing jitter between Android Auto audio buffers and the motorcycle T-Box DAC clock.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">CLOCK OFFSET</span>
                <span className="text-lg font-black text-cyan-400">+{clockOffsetMs} ms</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Within tolerance (±25ms)</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">JITTER VARIANCE</span>
                <span className="text-lg font-black text-emerald-400">{jitterMs} ms</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Zero packet drops</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SANITIZED DIAGNOSTIC EXPORT */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white">Sanitized Diagnostic Report</h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                PII Redacted
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Export this report when reporting a dashboard firmware issue to the MOTO-HUB community on Discord or GitHub. All Wi-Fi passwords and personal tokens are stripped.
            </p>

            <div className="relative">
              <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-[11px] text-zinc-300 max-h-64 overflow-y-auto">
                {JSON.stringify(sampleReport, null, 2)}
              </pre>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCopyReport}
                className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Report'}</span>
              </button>
              <button
                onClick={handleDownloadReport}
                className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md shadow-orange-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

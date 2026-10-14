import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CircleDot, 
  Disc, 
  Download, 
  Play, 
  Square, 
  Pause, 
  Flame, 
  Gauge, 
  Compass, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Sliders,
  ShieldAlert
} from 'lucide-react';
import { playIntercomBeep } from '../utils/audioFeedback';

interface TelemetryPoint {
  time: string;
  lat: number;
  lon: number;
  ele: number;
  speed: number;
  rpm: number;
  gear: string;
  lean: number;
  coolant: number;
}

interface TelemetryLoggerProps {
  onTriggerCrashTest: () => void;
  speed: number;
  rpm: number;
  gear: string;
  leanAngle: number;
}

export const TelemetryLogger: React.FC<TelemetryLoggerProps> = ({
  onTriggerCrashTest,
  speed,
  rpm,
  gear,
  leanAngle,
}) => {
  // TPMS States
  const [frontPsi, setFrontPsi] = useState<number>(2.3);
  const [frontTemp, setFrontTemp] = useState<number>(31);
  const [rearPsi, setRearPsi] = useState<number>(2.5);
  const [rearTemp, setRearTemp] = useState<number>(37);

  // Datalogger state
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [recordedPoints, setRecordedPoints] = useState<TelemetryPoint[]>([]);

  // Predictive fuel calculation
  const [fuelFlowLitersPerHour, setFuelFlowLitersPerHour] = useState<number>(3.8);
  const [fuelRemainingPercent, setFuelRemainingPercent] = useState<number>(76);
  const [ridingProfile, setRidingProfile] = useState<'touring' | 'sport' | 'eco'>('touring');

  // Record points periodically while recording
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toISOString();
      const latBase = 46.5285 + (Math.random() - 0.5) * 0.002;
      const lonBase = 10.4532 + (Math.random() - 0.5) * 0.002;

      setRecordedPoints((prev) => [
        {
          time: timeStr,
          lat: latBase,
          lon: lonBase,
          ele: 2757 + Math.round((Math.random() - 0.5) * 5),
          speed: Math.round(speed),
          rpm: Math.round(rpm),
          gear,
          lean: Math.round(leanAngle),
          coolant: 88,
        },
        ...prev.slice(0, 49),
      ]);
    }, 1500);

    return () => clearInterval(interval);
  }, [isRecording, speed, rpm, gear, leanAngle]);

  // Export GPX format
  const handleExportGpx = () => {
    playIntercomBeep('confirm', 0.4);
    const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="MOTO-HUB CORE v1.1.120" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>MOTO-HUB Ride Telemetry</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>Passo dello Stelvio Tour</name>
    <trkseg>`;

    const gpxBody = recordedPoints
      .map(
        (p) => `      <trkpt lat="${p.lat.toFixed(6)}" lon="${p.lon.toFixed(6)}">
        <ele>${p.ele}</ele>
        <time>${p.time}</time>
        <extensions>
          <speed>${(p.speed / 3.6).toFixed(2)}</speed>
          <rpm>${p.rpm}</rpm>
          <gear>${p.gear}</gear>
          <lean>${p.lean}</lean>
        </extensions>
      </trkpt>`
      )
      .join('\n');

    const gpxFooter = `\n    </trkseg>\n  </trk>\n</gpx>`;
    const fullGpx = gpxHeader + '\n' + gpxBody + gpxFooter;

    const blob = new Blob([fullGpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motohub-ride-${Date.now()}.gpx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const handleExportCsv = () => {
    playIntercomBeep('confirm', 0.4);
    const header = 'Timestamp,Latitude,Longitude,Elevation_m,Speed_kmh,RPM,Gear,LeanAngle_deg,Coolant_C\n';
    const rows = recordedPoints
      .map(
        (p) =>
          `"${p.time}",${p.lat.toFixed(6)},${p.lon.toFixed(6)},${p.ele},${p.speed},${p.rpm},"${p.gear}",${p.lean},${p.coolant}`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motohub-telemetry-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const calculatedRangeKm = Math.round(
    ((fuelRemainingPercent / 100) * 18 * 100) / (ridingProfile === 'sport' ? 5.8 : ridingProfile === 'eco' ? 4.1 : 4.8)
  );

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-black text-white">Advanced Telemetry, TPMS & Datalogger</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Monitor BLE tire pressure sensors, record synchronized GPS/Lean telemetry with GPX/CSV export, and calculate predictive fuel range.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onTriggerCrashTest}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 text-xs font-bold transition shadow-sm"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Test Crash SOS</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: TPMS TIRE PRESSURE MONITOR */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <Disc className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white">BLE TPMS Tire Pressure & Temp</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                BLUETOOTH 5.0 ACTIVE
              </span>
            </div>

            {/* Motorcycle Silhouette & Tires */}
            <div className="grid grid-cols-2 gap-4">
              {/* Front Tire */}
              <div className={`p-4 rounded-2xl border transition ${
                frontPsi < 2.0 
                  ? 'bg-red-500/10 border-red-500/80 text-red-300' 
                  : 'bg-zinc-950 border-zinc-800 text-white'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">FRONT TIRE</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    frontPsi < 2.0 ? 'bg-red-500 text-white' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {frontPsi < 2.0 ? 'LOW PRESSURE' : 'NORMAL'}
                  </span>
                </div>
                <div className="flex items-baseline space-x-1 my-2">
                  <span className="text-4xl font-black font-mono">{frontPsi.toFixed(1)}</span>
                  <span className="text-xs font-bold text-zinc-400">bar</span>
                </div>
                <div className="flex justify-between items-center text-xs text-zinc-400 font-mono border-t border-zinc-800/80 pt-2">
                  <span>Temp: <strong className="text-white">{frontTemp} °C</strong></span>
                  <span>Target: 2.3 bar</span>
                </div>

                {/* Simulate Pressure adjust */}
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => setFrontPsi((p) => Math.max(1.6, +(p - 0.2).toFixed(1)))}
                    className="flex-1 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono text-zinc-300"
                  >
                    -0.2
                  </button>
                  <button
                    onClick={() => setFrontPsi((p) => Math.min(3.0, +(p + 0.2).toFixed(1)))}
                    className="flex-1 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono text-zinc-300"
                  >
                    +0.2
                  </button>
                </div>
              </div>

              {/* Rear Tire */}
              <div className={`p-4 rounded-2xl border transition ${
                rearPsi < 2.1 
                  ? 'bg-red-500/10 border-red-500/80 text-red-300' 
                  : 'bg-zinc-950 border-zinc-800 text-white'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">REAR TIRE</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    rearPsi < 2.1 ? 'bg-red-500 text-white' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {rearPsi < 2.1 ? 'LOW PRESSURE' : 'NORMAL'}
                  </span>
                </div>
                <div className="flex items-baseline space-x-1 my-2">
                  <span className="text-4xl font-black font-mono">{rearPsi.toFixed(1)}</span>
                  <span className="text-xs font-bold text-zinc-400">bar</span>
                </div>
                <div className="flex justify-between items-center text-xs text-zinc-400 font-mono border-t border-zinc-800/80 pt-2">
                  <span>Temp: <strong className="text-white">{rearTemp} °C</strong></span>
                  <span>Target: 2.5 bar</span>
                </div>

                {/* Simulate Pressure adjust */}
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => setRearPsi((p) => Math.max(1.6, +(p - 0.2).toFixed(1)))}
                    className="flex-1 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono text-zinc-300"
                  >
                    -0.2
                  </button>
                  <button
                    onClick={() => setRearPsi((p) => Math.min(3.2, +(p + 0.2).toFixed(1)))}
                    className="flex-1 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono text-zinc-300"
                  >
                    +0.2
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PREDICTIVE FUEL & CONSUMPTION */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">OBD Predictive Fuel & Range</h3>
              </div>
              <span className="text-xs font-mono text-zinc-400">MAF Injector Math</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 font-bold block uppercase">Fuel Remaining</span>
                <span className="text-xl font-black text-amber-400 font-mono">{fuelRemainingPercent}%</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono">~13.7 Liters</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 font-bold block uppercase">Predictive Range</span>
                <span className="text-xl font-black text-emerald-400 font-mono">{calculatedRangeKm} km</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono">{ridingProfile.toUpperCase()} style</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 font-bold block uppercase">Average Burn</span>
                <span className="text-xl font-black text-cyan-400 font-mono">
                  {ridingProfile === 'sport' ? '5.8' : ridingProfile === 'eco' ? '4.1' : '4.8'} L
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono">per 100 km</span>
              </div>
            </div>

            {/* Riding style pills */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-zinc-400 font-semibold">Riding Consumption Profile:</span>
              <div className="flex space-x-1.5">
                {(['eco', 'touring', 'sport'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setRidingProfile(style)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition ${
                      ridingProfile === style
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: GPX & CSV DATALOGGER */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white">Full-Telemetry Ride Logger</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsRecording((r) => !r)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                    isRecording
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {isRecording ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  <span>{isRecording ? 'REC ACTIVE' : 'RESUME'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-zinc-400">
              Captures high-frequency data: GPS position, speed, engine RPM, lean angle gyro, altitude, and gear. Exports directly to GPX (for Strava/Garmin/Relive) and CSV.
            </p>

            {/* Live Points Table preview */}
            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 max-h-56">
              <table className="w-full text-left font-mono text-[11px] text-zinc-300">
                <thead className="bg-zinc-900 text-zinc-500 uppercase text-[9px] sticky top-0">
                  <tr>
                    <th className="p-2">Time</th>
                    <th className="p-2">Speed</th>
                    <th className="p-2">RPM</th>
                    <th className="p-2">Lean</th>
                    <th className="p-2">Gear</th>
                    <th className="p-2">Alt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {recordedPoints.slice(0, 8).map((p, i) => (
                    <tr key={i} className="hover:bg-zinc-900/40">
                      <td className="p-2 text-zinc-500">{p.time.split('T')[1].slice(0, 8)}</td>
                      <td className="p-2 text-white font-bold">{p.speed} km/h</td>
                      <td className="p-2 text-orange-400">{p.rpm}</td>
                      <td className="p-2 text-cyan-400">{p.lean}°</td>
                      <td className="p-2 text-emerald-400 font-bold">{p.gear}</td>
                      <td className="p-2 text-zinc-400">{p.ele}m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Export buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleExportGpx}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition flex items-center justify-center space-x-2 shadow-md shadow-orange-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Export GPX (Maps/Strava)</span>
              </button>
              <button
                onClick={handleExportCsv}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition flex items-center justify-center space-x-2 border border-zinc-700"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Export CSV Telemetry</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

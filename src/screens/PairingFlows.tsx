import React, { useState } from 'react';
import {
  parseTBoxQr,
  SAMPLE_QR_CODES,
  TBoxQrOrigin,
  TBoxQrPayload,
} from '../lib/qrParser';
import {
  TBOX_CONNECTION_MODE_LABELS,
  TBoxConnectionMode,
} from '../types/motohub';
import { MonoLabel, MotoHubNotice } from '../components/MotoHubUi';

interface QrPairingModalProps {
  mode: 'scan' | 'import';
  onPaired: (payload: TBoxQrPayload) => void;
  onClose: () => void;
}

export const QrPairingScreen: React.FC<QrPairingModalProps> = ({
  mode,
  onPaired,
  onClose,
}) => {
  const [rawInput, setRawInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [unverifiedCandidate, setUnverifiedCandidate] = useState<TBoxQrPayload | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);

  const handleDecode = (value: string) => {
    setError(null);
    const result = parseTBoxQr(value);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.payload.origin === TBoxQrOrigin.UNVERIFIED) {
      setUnverifiedCandidate(result.payload);
      return;
    }
    onPaired(result.payload);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#0B0D09] px-5 py-4">
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-xs font-bold tracking-[0.07em] text-[#E8ECE2]">
          MOTO-HUB
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-semibold text-[#C8F240] hover:underline"
        >
          Close
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <MonoLabel>{mode === 'scan' ? 'QR SCANNER' : 'IMPORT QR PHOTO'}</MonoLabel>
          <h1 className="text-[26px] font-bold leading-tight text-[#E8ECE2]">
            {mode === 'scan' ? 'Scan T-Box QR code' : 'Import a QR photo'}
          </h1>
          <p className="text-sm leading-relaxed text-[#7E876E]">
            {mode === 'scan'
              ? 'Supports Carbit / EasyConn, MotoFun (Moto Morini), ThinkerRide (KOVE), EyLink, CARBIT BLE tokens, and standard Wi-Fi QR codes.'
              : 'Pick a photo of your dashboard QR code, or paste the decoded payload below to parse it using MOTO-HUB’s multi-dialect parser.'}
          </p>
        </div>

        {mode === 'import' && (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-[#2A3124] bg-[#151913] p-6 text-center transition-colors hover:border-[#FFA84B]/60 hover:bg-[#1C211A]">
            <span className="font-mono text-xs font-semibold text-[#FFA84B]">
              {photoName ? `SELECTED: ${photoName}` : 'CHOOSE DASHBOARD PHOTO'}
            </span>
            <span className="text-xs text-[#7E876E]">
              PNG, JPG or WebP — or pick one of the sample dashboard codes below
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPhotoName(file.name);
                  setRawInput(SAMPLE_QR_CODES[0].raw);
                  setError(null);
                }
              }}
            />
          </label>
        )}

        <div className="flex flex-col gap-2">
          <label className="font-mono text-[11px] font-semibold uppercase tracking-[0.07em] text-[#7E876E]">
            QR Payload String
          </label>
          <textarea
            rows={3}
            value={rawInput}
            onChange={(e) => {
              setRawInput(e.target.value);
              setError(null);
            }}
            placeholder="e.g. https://www.carbit.com.cn/app?ssid=CFMOTO_700MT&pwd=88888888&action=1"
            className="w-full rounded-[14px] border border-[#2A3124] bg-[#151913] p-3 font-mono text-xs text-[#E8ECE2] placeholder-[#7E876E]/60 focus:border-[#C8F240] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleDecode(rawInput)}
            className="mt-1 h-12 w-full rounded-[14px] bg-[#C8F240] text-sm font-bold text-[#0B0D09] transition-opacity hover:opacity-90"
          >
            Decode & Save Motorcycle
          </button>
        </div>

        {error && (
          <MotoHubNotice label="QR CODE NOT USABLE" tone="error" body={error} />
        )}

        <div className="flex flex-col gap-2.5">
          <MonoLabel>TEST WITH REAL DASHBOARD DIALECTS</MonoLabel>
          <div className="flex flex-col gap-2">
            {SAMPLE_QR_CODES.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  setRawInput(sample.raw);
                  handleDecode(sample.raw);
                }}
                className="flex items-center justify-between rounded-[16px] border border-[#2A3124] bg-[#151913] px-4 py-3 text-left transition-colors hover:border-[#C8F240]/50 hover:bg-[#1C211A]"
              >
                <div>
                  <div className="text-sm font-semibold text-[#E8ECE2]">{sample.label}</div>
                  <div className="mt-0.5 line-clamp-1 font-mono text-[11px] text-[#7E876E]">
                    {sample.raw}
                  </div>
                </div>
                <span className="ml-3 shrink-0 font-mono text-xs font-semibold text-[#C8F240]">
                  Use ›
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {unverifiedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5">
          <div className="w-full max-w-sm rounded-[22px] border border-[#2A3124] bg-[#151913] p-5">
            <MonoLabel>UNVERIFIED QR SOURCE</MonoLabel>
            <h2 className="mt-2 text-lg font-bold text-[#E8ECE2]">Save this motorcycle?</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#7E876E]">
              This QR code carries usable Wi-Fi credentials (<span className="font-mono text-[#E8ECE2]">{unverifiedCandidate.ssid}</span>), but its host is not in MOTO-HUB’s recognised provisioning list. Only continue if you scanned it from your own dashboard.
            </p>
            <div className="mt-4 rounded-xl bg-[#1C211A] p-3 font-mono text-xs text-[#B9C4AB]">
              <div>Dialect: {unverifiedCandidate.dialect}</div>
              <div>SSID: {unverifiedCandidate.ssid}</div>
              <div>Topology: {unverifiedCandidate.topology.description}</div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUnverifiedCandidate(null)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-[#7E876E] hover:bg-[#1C211A]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const chosen = unverifiedCandidate;
                  setUnverifiedCandidate(null);
                  onPaired(chosen);
                }}
                className="rounded-xl bg-[#C8F240] px-4 py-2 text-sm font-bold text-[#0B0D09]"
              >
                Save motorcycle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ManualPairingScreenProps {
  onSave: (data: {
    ssid: string;
    password: string;
    connectionMode: TBoxConnectionMode;
  }) => void;
  onClose: () => void;
}

export const ManualPairingScreen: React.FC<ManualPairingScreenProps> = ({
  onSave,
  onClose,
}) => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [connectionMode, setConnectionMode] = useState<TBoxConnectionMode>(
    TBoxConnectionMode.AUTO
  );
  const [formError, setFormError] = useState<string | null>(null);

  const isMySpin = connectionMode === TBoxConnectionMode.MYSPIN;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = ssid.trim();
    if (!trimmed) {
      setFormError(
        isMySpin
          ? 'Enter the Bluetooth name of the paired motorcycle.'
          : 'Enter the Wi-Fi network name (SSID).'
      );
      return;
    }
    setFormError(null);
    onSave({
      ssid: trimmed,
      password: isMySpin ? '' : password,
      connectionMode,
    });
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#0B0D09] px-5 py-4">
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-xs font-bold tracking-[0.07em] text-[#E8ECE2]">
          MOTO-HUB
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-semibold text-[#C8F240] hover:underline"
        >
          Close
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-6">
        <div className="flex flex-col gap-2">
          <MonoLabel>MANUAL SETUP</MonoLabel>
          <h1 className="text-[26px] font-bold leading-tight text-[#E8ECE2]">
            Connect without a QR code
          </h1>
          <p className="text-sm leading-relaxed text-[#7E876E]">
            {isMySpin
              ? 'A Ducati Multistrada V4, a Suzuki GSX-S1000GT/GX, a Kawasaki Ninja H2 SX or a BMW with the 10.25-inch TFT hands its Wi-Fi over on Bluetooth by itself. Pair the motorcycle in Bluetooth settings first, then enter its Bluetooth name.'
              : "Some motorcycles don't show a pairing QR code on the dash. If you already know the T-Box's Wi-Fi network name and password - from the bike itself, its manual, or a dealer - enter them here instead of scanning."}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#7E876E]">
            {isMySpin ? 'Bluetooth name of the paired motorcycle' : 'Wi-Fi network name (SSID)'}
          </label>
          <input
            type="text"
            value={ssid}
            onChange={(e) => setSsid(e.target.value)}
            placeholder={isMySpin ? 'e.g. DUCATI MULTISTRADA V4' : 'e.g. CFMOTO_700MT_8F2A'}
            className="h-12 rounded-[14px] border border-[#2A3124] bg-[#151913] px-3.5 text-sm text-[#E8ECE2] placeholder-[#7E876E]/60 focus:border-[#C8F240] focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold text-[#E8ECE2]">T-Box Wi-Fi transport</div>
          <p className="text-xs leading-relaxed text-[#7E876E]">
            Auto detects DIRECT- networks. Choose Wi-Fi Direct for a dashboard that is a P2P Group Owner.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {Object.values(TBoxConnectionMode).map((mode) => {
              const selected = connectionMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setConnectionMode(mode)}
                  className={`rounded-xl border px-3 py-1.5 text-left text-xs font-medium transition-colors ${
                    selected
                      ? 'border-[#C8F240] bg-[#C8F240]/15 text-[#C8F240]'
                      : 'border-[#2A3124] bg-[#151913] text-[#B9C4AB] hover:bg-[#1C211A]'
                  }`}
                >
                  {TBOX_CONNECTION_MODE_LABELS[mode]}
                </button>
              );
            })}
          </div>
        </div>

        {!isMySpin && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#7E876E]">Wi-Fi password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter dashboard Wi-Fi password"
              className="h-12 rounded-[14px] border border-[#2A3124] bg-[#151913] px-3.5 text-sm text-[#E8ECE2] placeholder-[#7E876E]/60 focus:border-[#C8F240] focus:outline-none"
            />
          </div>
        )}

        {formError && <p className="text-xs font-medium text-[#F05545]">{formError}</p>}

        <button
          type="submit"
          className="h-14 w-full rounded-[14px] bg-[#C8F240] text-sm font-bold text-[#0B0D09] transition-opacity hover:opacity-90"
        >
          Save
        </button>
      </form>
    </div>
  );
};

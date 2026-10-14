import React, { useEffect, useState } from 'react';
import { AlertOctagon, PhoneCall, ShieldAlert, X, MapPin, Check } from 'lucide-react';
import { playIntercomBeep } from '../utils/audioFeedback';

interface CrashDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  contactName?: string;
  contactPhone?: string;
}

export const CrashDialog: React.FC<CrashDialogProps> = ({
  isOpen,
  onCancel,
  contactName = 'Elena (Contatto di emergenza)',
  contactPhone = '+39 347 1234567',
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [smsSent, setSmsSent] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(30);
      setSmsSent(false);
      return;
    }

    playIntercomBeep('alert', 0.6);
    const soundInterval = setInterval(() => {
      playIntercomBeep('alert', 0.4);
    }, 2000);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setSmsSent(true);
          clearInterval(timer);
          clearInterval(soundInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(soundInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-950 border-4 border-red-600 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-center ring-4 ring-red-500/30 animate-pulse-border">
        {/* Siren Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-red-600/20 text-red-500 border-2 border-red-500 flex items-center justify-center mb-4 animate-bounce">
          <AlertOctagon className="w-12 h-12 stroke-[2.5]" />
        </div>

        <span className="text-xs uppercase tracking-widest font-black text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
          ALLARME IMPATTO / CADUTA RILEVATA
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
          {smsSent ? 'SMS SOS INVIATO AI SOCCORSI' : 'RILEVATA FORTE DECELERAZIONE'}
        </h2>

        {!smsSent ? (
          <>
            <p className="text-zinc-300 text-sm mt-2 max-w-md mx-auto">
              Se stai bene, premi <strong className="text-white">ANNULLA</strong> sul display o il tasto <strong className="text-white">BACK / OK</strong> al manubrio entro:
            </p>

            {/* Giant Countdown Circle */}
            <div className="my-6">
              <span className="text-6xl sm:text-7xl font-mono font-black text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]">
                {secondsLeft}s
              </span>
            </div>

            {/* GPS coordinates packet */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-left mb-6 space-y-1">
              <div className="flex items-center space-x-1.5 text-zinc-400">
                <MapPin className="w-4 h-4 text-orange-400" />
                <span className="text-zinc-200 font-bold">Coordinate GPS Moto:</span>
              </div>
              <div className="text-orange-400 font-bold pl-5">46.5285° N, 10.4532° E (Quota: 2,757 m)</div>
              <div className="text-zinc-500 text-[11px] pl-5">SS38 Passo dello Stelvio, Bormio (SO)</div>
              <div className="text-zinc-400 text-[11px] pl-5 border-t border-zinc-800 pt-1 mt-1">
                Destinatario: <span className="text-white font-bold">{contactName} ({contactPhone})</span>
              </div>
            </div>

            <button
              onClick={() => {
                playIntercomBeep('cancel', 0.4);
                onCancel();
              }}
              className="w-full py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-base transition border border-zinc-600 shadow-xl flex items-center justify-center space-x-2"
            >
              <X className="w-5 h-5 text-red-400" />
              <span>STO BENE — ANNULLA SOS (Pulsante Manubrio)</span>
            </button>
          </>
        ) : (
          <div className="my-6 space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center justify-center space-x-2">
              <Check className="w-5 h-5" />
              <span>Messaggio d'emergenza trasmesso con coordinate live!</span>
            </div>
            <p className="text-xs text-zinc-400">
              È stata avviata anche la chiamata automatica di soccorso a {contactPhone}.
            </p>
            <button
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-bold hover:bg-zinc-700"
            >
              Chiudi Allarme
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

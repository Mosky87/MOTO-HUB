import React, { useState } from 'react';
import { Header } from './components/Header';
import { TftDisplay } from './components/TftDisplay';
import { HandlebarController } from './components/HandlebarController';
import { GarageView } from './components/GarageView';
import { PairingSuite } from './components/PairingSuite';
import { DiagnosticsLab } from './components/DiagnosticsLab';
import { SettingsView } from './components/SettingsView';
import { TelemetryLogger } from './components/TelemetryLogger';
import { CrashDialog } from './components/CrashDialog';
import { MOTORCYCLE_CATALOG, MotorcycleProfile } from './data/motorcycles';
import { SupportedLanguage } from './data/translations';

export const App: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [activeTab, setActiveTab] = useState<'tft' | 'controls' | 'telemetry' | 'garage' | 'pairing' | 'diagnostics' | 'settings'>('tft');
  const [activeBike, setActiveBike] = useState<MotorcycleProfile>(MOTORCYCLE_CATALOG[0]);
  const [connectionState, setConnectionState] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const [isCrashDialogOpen, setIsCrashDialogOpen] = useState<boolean>(false);
  
  // Remote command from handlebar to TFT
  const [externalCommand, setExternalCommand] = useState<{ command: string; timestamp: number } | null>(null);

  const handleSendCommand = (cmd: string) => {
    if (isCrashDialogOpen && (cmd === 'BACK' || cmd === 'SELECT')) {
      setIsCrashDialogOpen(false);
      return;
    }
    setExternalCommand({ command: cmd, timestamp: Date.now() });
  };

  const toggleConnection = () => {
    if (connectionState === 'connected') {
      setConnectionState('disconnected');
    } else if (connectionState === 'disconnected') {
      setConnectionState('connecting');
      setTimeout(() => setConnectionState('connected'), 900);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Header
        currentLang={currentLang}
        setLang={setCurrentLang}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeBike={activeBike}
        connectionState={connectionState}
        toggleConnection={toggleConnection}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'tft' && (
          <TftDisplay
            activeBike={activeBike}
            currentLang={currentLang}
            connectionState={connectionState}
            externalCommand={externalCommand}
            onTriggerAction={(action) => {
              if (action === 'reconnect') toggleConnection();
            }}
          />
        )}

        {activeTab === 'controls' && (
          <div className="space-y-6">
            <HandlebarController
              currentLang={currentLang}
              onSendCommand={handleSendCommand}
            />
            
            {/* Embedded compact preview of TFT so user sees the buttons affect the screen live! */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-orange-400">Live TFT Response View</span>
                <button
                  onClick={() => setActiveTab('tft')}
                  className="text-xs text-zinc-400 hover:text-white underline"
                >
                  Open Full TFT
                </button>
              </div>
              <TftDisplay
                activeBike={activeBike}
                currentLang={currentLang}
                connectionState={connectionState}
                externalCommand={externalCommand}
              />
            </div>
          </div>
        )}

        {activeTab === 'telemetry' && (
          <TelemetryLogger
            onTriggerCrashTest={() => setIsCrashDialogOpen(true)}
            speed={68}
            rpm={4350}
            gear="4"
            leanAngle={14}
          />
        )}

        {activeTab === 'garage' && (
          <GarageView
            currentLang={currentLang}
            activeBike={activeBike}
            onSelectBike={(bike) => {
              setActiveBike(bike);
              setConnectionState('connected');
            }}
          />
        )}

        {activeTab === 'pairing' && (
          <PairingSuite
            currentLang={currentLang}
            activeBike={activeBike}
            connectionState={connectionState}
            onStateChange={setConnectionState}
          />
        )}

        {activeTab === 'diagnostics' && (
          <DiagnosticsLab
            currentLang={currentLang}
            activeBike={activeBike}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            currentLang={currentLang}
            setLang={setCurrentLang}
          />
        )}
      </main>

      {/* Emergency Crash Detection SOS Modal */}
      <CrashDialog
        isOpen={isCrashDialogOpen}
        onCancel={() => setIsCrashDialogOpen(false)}
        contactName="Elena (Famiglia)"
        contactPhone="+39 347 1234567"
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-4 px-6 text-center text-xs text-zinc-500 font-mono">
        MOTO-HUB CORE v1.1.120 · Free & Open-Source (AGPL-3.0) · EasyConn / Yunmo / ThinkerRide T-Box Driver
      </footer>
    </div>
  );
};

export default App;

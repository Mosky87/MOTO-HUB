import React, { useState } from 'react';
import { 
  Bike, 
  Check, 
  Plus, 
  ExternalLink, 
  Settings, 
  Tv, 
  Wifi, 
  Cpu, 
  Trash2, 
  Edit3, 
  Maximize, 
  Sparkles 
} from 'lucide-react';
import { MotorcycleProfile, MOTORCYCLE_CATALOG } from '../data/motorcycles';
import { SupportedLanguage, STRINGS } from '../data/translations';

interface GarageViewProps {
  currentLang: SupportedLanguage;
  activeBike: MotorcycleProfile;
  onSelectBike: (bike: MotorcycleProfile) => void;
}

export const GarageView: React.FC<GarageViewProps> = ({
  currentLang,
  activeBike,
  onSelectBike,
}) => {
  const t = STRINGS[currentLang] || STRINGS.en;

  const [bikes, setBikes] = useState<MotorcycleProfile[]>(MOTORCYCLE_CATALOG);
  const [selectedForDetails, setSelectedForDetails] = useState<MotorcycleProfile>(activeBike);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // New bike form state
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newProtocol, setNewProtocol] = useState<'EasyConn' | 'Yunmo' | 'ThinkerRide' | 'RideDaemon' | 'AOA_USB'>('EasyConn');
  const [newSsid, setNewSsid] = useState('MOTO_WIFI_');
  const [newPort, setNewPort] = useState(9999);
  const [newWidth, setNewWidth] = useState(1024);
  const [newHeight, setNewHeight] = useState(600);

  const handleAddNewBike = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand || !newModel) return;

    const created: MotorcycleProfile = {
      id: `custom-${Date.now()}`,
      brand: newBrand,
      model: newModel,
      year: new Date().getFullYear(),
      engine: 'Custom Motorcycle Engine',
      protocol: newProtocol,
      aspectRatio: '16:9',
      resolution: { width: newWidth, height: newHeight },
      defaultSsid: newSsid,
      port: newPort,
      ip: '192.168.43.1',
      photoUrl: '/media/hero-bike.jpg',
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      hasTftTouch: false,
      notes: 'User added custom motorcycle configuration.',
    };

    setBikes((prev) => [created, ...prev]);
    onSelectBike(created);
    setSelectedForDetails(created);
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-zinc-900/90 rounded-2xl border border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <Bike className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-black text-white">Motorcycle Garage & Profiles</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Configure motorcycle dashboard geometry, T-Box protocols (EasyConn, Yunmo, ThinkerRide), and pairing credentials.
          </p>
        </div>
        <button
          onClick={() => setIsAddingNew((v) => !v)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Bike</span>
        </button>
      </div>

      {/* Add New Bike Form */}
      {isAddingNew && (
        <form onSubmit={handleAddNewBike} className="bg-zinc-900 border border-orange-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Configure New Motorcycle Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">Brand / Manufacturer</label>
              <input
                type="text"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                placeholder="e.g. CFMOTO, Benelli, Voge"
                required
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">Model Name</label>
              <input
                type="text"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                placeholder="e.g. 800MT Explore"
                required
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">T-Box Protocol</label>
              <select
                value={newProtocol}
                onChange={(e) => setNewProtocol(e.target.value as any)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              >
                <option value="EasyConn">EasyConn (Carbit / BTP)</option>
                <option value="Yunmo">Yunmo (Voge / Loncin)</option>
                <option value="ThinkerRide">ThinkerRide (KOVE / T-Box)</option>
                <option value="RideDaemon">RideDaemon (Raw TCP)</option>
                <option value="AOA_USB">AOA USB (Android Open Accessory)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">TFT Resolution (Width x Height)</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={newWidth}
                  onChange={(e) => setNewWidth(Number(e.target.value))}
                  className="w-1/2 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
                <input
                  type="number"
                  value={newHeight}
                  onChange={(e) => setNewHeight(Number(e.target.value))}
                  className="w-1/2 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">T-Box Wi-Fi SSID</label>
              <input
                type="text"
                value={newSsid}
                onChange={(e) => setNewSsid(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">T-Box TCP Port</label>
              <input
                type="number"
                value={newPort}
                onChange={(e) => setNewPort(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-xs hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 shadow-md"
            >
              Save Profile
            </button>
          </div>
        </form>
      )}

      {/* Grid of Bikes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bikes.map((bike) => {
          const isActive = activeBike.id === bike.id;
          return (
            <div
              key={bike.id}
              onClick={() => setSelectedForDetails(bike)}
              className={`rounded-2xl border p-4 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-zinc-900 border-orange-500/80 shadow-xl shadow-orange-500/10 ring-1 ring-orange-500/40'
                  : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              {/* Active Badge */}
              {isActive && (
                <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-bold">
                  <Check className="w-3 h-3" />
                  <span>ACTIVE BIKE</span>
                </div>
              )}

              <div>
                {/* Bike Photo Showcase */}
                <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3 border border-zinc-800 bg-black">
                  <img
                    src={bike.photoUrl || '/media/qj_srt_900_sx.png'}
                    alt={bike.model}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2.5">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-orange-400 tracking-wider block">
                        {bike.brand}
                      </span>
                      <h3 className="text-sm font-extrabold text-white leading-tight">
                        {bike.model}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-zinc-400 font-mono">{bike.engine}</span>
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">{bike.aspectRatio}</span>
                </div>

                {/* Specs Pill List */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400 my-3">
                  <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800/80">
                    <span className="text-[9px] text-zinc-500 block">PROTOCOL</span>
                    <span className="text-zinc-200 font-bold">{bike.protocol}</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800/80">
                    <span className="text-[9px] text-zinc-500 block">RESOLUTION</span>
                    <span className="text-zinc-200 font-bold">{bike.resolution.width}x{bike.resolution.height}</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800/80">
                    <span className="text-[9px] text-zinc-500 block">T-BOX PORT</span>
                    <span className="text-zinc-200 font-bold">{bike.port}</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800/80">
                    <span className="text-[9px] text-zinc-500 block">SSID</span>
                    <span className="text-zinc-200 font-bold truncate block">{bike.defaultSsid}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 italic mb-3">
                  "{bike.notes}"
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 pt-2 border-t border-zinc-800/80">
                {!isActive ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBike(bike);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-orange-500 hover:text-white text-zinc-300 text-xs font-bold transition"
                  >
                    Select for Projection
                  </button>
                ) : (
                  <div className="flex-1 py-1.5 text-center text-xs text-orange-400 font-mono font-bold bg-orange-500/10 rounded-lg">
                    Connected to Active Stream
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

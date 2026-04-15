import React, { useState } from 'react';
import { MapPin, Search, PlusCircle, Compass, GraduationCap, Beer, HeartPulse, ShoppingCart, Crosshair } from 'lucide-react';
import { addPlace, getNearbyPlaces, getDistance } from './services/api';

const INTEREST_GROUPS = [
  { id: 'CERVECERIAS', label: 'Cervecerías Artesanales', icon: Beer, color: 'text-amber-500', bg: 'bg-amber-100' },
  { id: 'UNIVERSIDADES', label: 'Universidades', icon: GraduationCap, color: 'text-indigo-500', bg: 'bg-indigo-100' },
  { id: 'FARMACIAS', label: 'Farmacias', icon: Crosshair, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  { id: 'EMERGENCIAS', label: 'Centros de Emergencias', icon: HeartPulse, color: 'text-red-500', bg: 'bg-red-100' },
  { id: 'SUPERMERCADOS', label: 'Supermercados', icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-100' }
];

function App() {
  const [activeTab, setActiveTab] = useState('explore');

  // Add Place Form State
  const [addForm, setAddForm] = useState({ group: 'CERVECERIAS', name: '', lat: '', lng: '' });
  const [addMessage, setAddMessage] = useState({ type: '', text: '' });

  // Explore State
  const [userLoc, setUserLoc] = useState({ lat: '-34.6037', lng: '-58.3815' }); // default to Buenos Aires roughly
  const [nearbyPlaces, setNearbyPlaces] = useState({});
  const [selectedPlaceInfo, setSelectedPlaceInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setAddMessage({ type: '', text: '' });
      await addPlace(addForm);
      setAddMessage({ type: 'success', text: '¡Lugar agregado correctamente!' });
      setAddForm({ ...addForm, name: '' }); // reset only name
    } catch (error) {
      setAddMessage({ type: 'error', text: 'Error al agregar lugar. Revisa los datos.' });
    }
  };

  const handleSearchNearby = async () => {
    setIsLoading(true);
    setSelectedPlaceInfo(null);
    try {
      const results = await getNearbyPlaces(userLoc.lat, userLoc.lng);
      setNearbyPlaces(results);
    } catch (error) {
      console.error('Error fetching nearby places:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculateDistance = async (group, name) => {
    try {
      const distInfo = await getDistance(group, name, userLoc.lat, userLoc.lng);
      setSelectedPlaceInfo(distInfo);
    } catch (error) {
      console.error('Error calculating distance:', error);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 md:py-12 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row items-center justify-between mb-12 animate-fade-in-down">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">GeoTurismo</h1>
            <p className="text-slate-500 font-medium tracking-wide text-sm">Puntos de Interés a tu Alcance</p>
          </div>
        </div>
        
        <div className="flex bg-white/50 p-1 rounded-xl shadow-sm border border-slate-200 mt-6 md:mt-0 backdrop-blur-sm">
          <button 
            onClick={() => setActiveTab('explore')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'explore' ? 'bg-white shadow text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Explorar
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'admin' ? 'bg-white shadow text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Administrar
          </button>
        </div>
      </header>

      <main>
        {activeTab === 'explore' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-panel p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-800">
                  <MapPin className="text-primary-500" /> Tu Ubicación
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Latitud</label>
                    <input 
                      type="number" step="any"
                      className="input-styled" 
                      value={userLoc.lat}
                      onChange={e => setUserLoc({ ...userLoc, lat: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Longitud</label>
                    <input 
                      type="number" step="any"
                      className="input-styled" 
                      value={userLoc.lng}
                      onChange={e => setUserLoc({ ...userLoc, lng: e.target.value })}
                    />
                  </div>
                  <button onClick={handleSearchNearby} className="btn-primary w-full mt-2" disabled={isLoading}>
                    <Search className="w-5 h-5" />
                    {isLoading ? 'Buscando...' : 'Buscar a 5km'}
                  </button>
                </div>
              </div>

              {selectedPlaceInfo && (
                <div className="glass-panel p-6 bg-gradient-to-br from-indigo-50 to-white text-center animate-fade-in-up">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Distancia a {selectedPlaceInfo.name}</h3>
                  <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 mb-1">
                    {parseFloat(selectedPlaceInfo.distance).toFixed(2)} {selectedPlaceInfo.unit}
                  </div>
                  <p className="text-sm text-slate-500">Desde tu ubicación actual</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <div className="glass-panel p-6 min-h-[500px]">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-800">
                  <Compass className="text-primary-500" /> Lugares Cercanos
                </h2>

                {Object.keys(nearbyPlaces).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <MapPin className="w-16 h-16 mb-4 opacity-20" />
                    <p>Ingresa tu ubicación y busca lugares a tu alrededor.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(nearbyPlaces).map(([group, places]) => {
                      if (places.length === 0) return null;
                      const groupInfo = INTEREST_GROUPS.find(g => g.id === group);
                      const Icon = groupInfo ? groupInfo.icon : MapPin;
                      
                      return (
                        <div key={group} className="animate-fade-in-up">
                          <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-700 mb-4 pb-2 border-b border-slate-100">
                            <div className={`p-1.5 rounded-lg ${groupInfo?.bg}`}>
                              <Icon className={`w-4 h-4 ${groupInfo?.color}`} />
                            </div>
                            {groupInfo ? groupInfo.label : group}
                            <span className="ml-auto text-xs font-medium px-2 py-1 bg-slate-100 text-slate-500 rounded-full">
                              {places.length}
                            </span>
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {places.map((place, idx) => (
                              <div 
                                key={idx} 
                                className="group p-4 rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all bg-white cursor-pointer"
                                onClick={() => handleCalculateDistance(group, place.name)}
                              >
                                <div className="flex justify-between items-start">
                                  <h4 className="font-medium text-slate-800 group-hover:text-primary-600 transition-colors">{place.name}</h4>
                                  <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
                                    {parseFloat(place.distance).toFixed(2)} km
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                  Ver distancia exacta <MapPin className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="max-w-xl mx-auto glass-panel p-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
              <PlusCircle className="text-primary-500" /> Agregar Lugar
            </h2>
            
            {addMessage.text && (
              <div className={`p-4 mb-6 rounded-xl border ${addMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {addMessage.text}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Grupo de Interés</label>
                <select 
                  className="input-styled appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em] cursor-pointer"
                  style={{backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`}}
                  value={addForm.group}
                  onChange={e => setAddForm({...addForm, group: e.target.value})}
                >
                  {INTEREST_GROUPS.map(g => (
                    <option key={g.id} value={g.id}>{g.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nombre del Lugar</label>
                <input 
                  type="text" 
                  className="input-styled" 
                  placeholder="Ej: Cervecería Patagonia"
                  value={addForm.name}
                  onChange={e => setAddForm({...addForm, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Latitud</label>
                  <input 
                    type="number" step="any"
                    className="input-styled" 
                    placeholder="-34.6037"
                    value={addForm.lat}
                    onChange={e => setAddForm({...addForm, lat: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Longitud</label>
                  <input 
                    type="number" step="any"
                    className="input-styled" 
                    placeholder="-58.3815"
                    value={addForm.lng}
                    onChange={e => setAddForm({...addForm, lng: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full mt-4">
                <PlusCircle className="w-5 h-5" /> Guardar Lugar
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
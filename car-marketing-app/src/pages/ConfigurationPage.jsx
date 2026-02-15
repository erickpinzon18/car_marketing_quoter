import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import GlassPanel from '../components/ui/GlassPanel';
import { STORES, USERS } from '../data/users';
import settings from '../data/settings.json';
import { plans } from '../data/plans';

export default function ConfigurationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('rates');
  const [loading, setLoading] = useState(true);
  
  // State for overrides
  // State for overrides
  const [storeRates, setStoreRates] = useState({});
  const [customExchangeRates, setCustomExchangeRates] = useState({});

  // Demo State (Non-persistent)
  const [demoUsers, setDemoUsers] = useState(USERS);
  const [demoStores, setDemoStores] = useState(STORES);
  const [managementTab, setManagementTab] = useState('stores'); // stores | users

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    // Load from localStorage
    try {
      const savedStoreRates = localStorage.getItem('storeRates');
      if (savedStoreRates) setStoreRates(JSON.parse(savedStoreRates));

      const savedExchangeRates = localStorage.getItem('exchangeRates');
      if (savedExchangeRates) setCustomExchangeRates(JSON.parse(savedExchangeRates));
    } catch (e) {
      console.error('Error loading config', e);
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  const handleRateChange = (storeId, planKey, value) => {
    setStoreRates(prev => ({
      ...prev,
      [storeId]: {
        ...prev[storeId],
        [planKey]: parseFloat(value) || 0
      }
    }));
  };

  const handleExchangeRateChange = (currency, value) => {
    setCustomExchangeRates(prev => ({
      ...prev,
      [currency]: parseFloat(value) || 0
    }));
  };

  const saveConfiguration = () => {
    localStorage.setItem('storeRates', JSON.stringify(storeRates));
    localStorage.setItem('exchangeRates', JSON.stringify(customExchangeRates));
    alert('Configuración guardada exitosamente');
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Configuración Global</h1>
            <p className="text-slate-500 mt-1">Administra tasas de interés y tipos de cambio por sucursal.</p>
          </div>
          <button
            onClick={saveConfiguration}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-blue to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all text-sm"
          >
            <i className="fas fa-save"></i>
            Guardar Cambios
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('rates')}
            className={`pb-3 px-2 text-sm font-bold uppercase transition-colors relative ${
              activeTab === 'rates' ? 'text-brand-blue' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Tasas de Interés
            {activeTab === 'rates' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-blue"></div>}
          </button>
          <button
            onClick={() => setActiveTab('exchange')}
            className={`pb-3 px-2 text-sm font-bold uppercase transition-colors relative ${
              activeTab === 'exchange' ? 'text-brand-blue' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Tipos de Cambio
            {activeTab === 'exchange' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-blue"></div>}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-2 text-sm font-bold uppercase transition-colors relative ${
              activeTab === 'users' ? 'text-brand-blue' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Usuarios y Tiendas
            {activeTab === 'users' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-blue"></div>}
          </button>
        </div>

        {activeTab === 'rates' && (
          <GlassPanel>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-4 px-4 font-bold text-slate-800 bg-slate-50 min-w-[200px] sticky left-0 z-10">
                      Sucursal / Plan
                    </th>
                    {Object.keys(settings.rates).map(planKey => (
                      <th key={planKey} className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap min-w-[150px]">
                        {(plans[planKey]?.name || planKey).replace(/_/g, ' ')}
                        <div className="text-[10px] font-normal text-slate-400">Default: {settings.rates[planKey]}%</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(STORES).map(([storeId, store]) => (
                    <tr key={storeId} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-4 px-4 font-bold text-brand-dark sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                        {store.name}
                        <div className="text-xs text-slate-400 font-normal">{store.city}</div>
                      </td>
                      {Object.keys(settings.rates).map(planKey => {
                        const currentRate = storeRates[storeId]?.[planKey] ?? '';
                        const defaultRate = settings.rates[planKey];
                        const isModified = currentRate !== '' && parseFloat(currentRate) !== defaultRate;

                        return (
                          <td key={planKey} className="py-3 px-4">
                            <div className="relative">
                              <input
                                type="number"
                                step="0.1"
                                className={`w-full py-2 pl-3 pr-8 rounded-lg border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all ${
                                  isModified 
                                    ? 'border-brand-blue bg-blue-50/50 text-brand-blue' 
                                    : 'border-slate-200 text-slate-600'
                                }`}
                                placeholder={defaultRate}
                                value={currentRate}
                                onChange={(e) => handleRateChange(storeId, planKey, e.target.value)}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">%</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-700 text-xs flex items-start gap-2">
                <i className="fas fa-info-circle mt-0.5"></i>
                <p>
                  Las tasas configuradas aquí sobrescriben la tasa predeterminada global. 
                  Si dejas un campo vacío, se usará la tasa default ({settings.rates.credito_normal}% etc).
                </p>
              </div>
            </div>
          </GlassPanel>
        )}

        {activeTab === 'exchange' && (
          <GlassPanel>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {settings.currencies.map(currency => {
                if (currency.code === 'MXN') return null; // Logic base is MXN? Or USD? 
                
                // If base is USD=19.50, and we want to edit valid exchange rates.
                // Display current saved rate or default from settings.
                
                // Assuming settings.exchangeRates are relative to MXN or USD?
                // The app logic says: const base = { ...settings.exchangeRates, MXN: 1 };
                // So all are relative to... wait.
                // USD: 19.50 (1 USD = 19.50 MXN?)
                // COP: 0.0045 (1 COP = 0.0045 MXN)
                // So rate is "Value in MXN".
                
                const defaultRate = settings.exchangeRates[currency.code] || 0;
                const currentRate = customExchangeRates[currency.code] ?? '';
                const displayValue = currentRate !== '' ? currentRate : defaultRate;

                return (
                  <div key={currency.code} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{currency.flag}</span>
                        <div>
                          <div className="font-bold text-brand-dark">{currency.code}</div>
                          <div className="text-xs text-slate-400">{currency.name}</div>
                        </div>
                      </div>
                      <div className="text-xs font-mono text-slate-400">1 {currency.code} =</div>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.0001"
                        className="w-full py-2 pl-8 pr-12 rounded-lg border border-slate-200 font-bold focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                        value={displayValue}
                        onChange={(e) => handleExchangeRateChange(currency.code, e.target.value)}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">MXN</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassPanel>
        )}

        {activeTab === 'users' && (
          <GlassPanel>
            {/* Sub-tabs / Filters */}
            <div className="flex gap-4 mb-6 border-b border-slate-100">
              <button
                onClick={() => setManagementTab('stores')}
                className={`pb-2 px-4 text-sm font-bold transition-colors border-b-2 ${
                  managementTab === 'stores' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Tiendas ({Object.keys(demoStores).length})
              </button>
              <button
                onClick={() => setManagementTab('users')}
                className={`pb-2 px-4 text-sm font-bold transition-colors border-b-2 ${
                  managementTab === 'users' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Usuarios ({demoUsers.length})
              </button>
            </div>

            {/* STORES MANAGEMENT */}
            {managementTab === 'stores' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-brand-dark">Directorio de Sucursales</h3>
                  <button 
                    onClick={() => {
                      const name = prompt('Nombre de la nueva sucursal:');
                      if (name) {
                        const id = 'store_' + Date.now();
                        setDemoStores(prev => ({...prev, [id]: { name, city: 'Nueva Ubicación' }}));
                      }
                    }}
                    className="text-sm font-bold text-brand-blue bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    + Agregar Sucursal
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(demoStores).map(([id, store]) => (
                    <div key={id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue">
                          <i className="fas fa-store"></i>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              const newName = prompt('Editar nombre:', store.name);
                              if (newName) setDemoStores(prev => ({...prev, [id]: { ...prev[id], name: newName }}));
                            }}
                            className="p-1.5 text-slate-400 hover:text-brand-blue"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            onClick={() => {
                              if(confirm('¿Eliminar esta sucursal?')) {
                                const newStores = {...demoStores};
                                delete newStores[id];
                                setDemoStores(newStores);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-800">{store.name}</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <i className="fas fa-map-marker-alt text-xs opacity-50"></i> {store.city}
                      </p>
                      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                        <span>ID: {id}</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500">Activa</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* USERS MANAGEMENT */}
            {managementTab === 'users' && (
              <div>
                 <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-brand-dark">Directorio de Usuarios</h3>
                  <button 
                    onClick={() => alert('Función de demostración: Agregar Usuario')}
                    className="text-sm font-bold text-brand-blue bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    + Agregar Usuario
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                        <th className="py-3 px-4 font-bold">Usuario</th>
                        <th className="py-3 px-4 font-bold">Rol</th>
                        <th className="py-3 px-4 font-bold">Sucursal</th>
                        <th className="py-3 px-4 font-bold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demoUsers.map(u => (
                        <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-700">{u.name}</div>
                                <div className="text-xs text-slate-400">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                              u.role === 'admin' ? 'bg-purple-50 text-purple-600' :
                              u.role === 'manager' ? 'bg-amber-50 text-amber-600' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                              {u.role === 'admin' ? 'Administrador' : u.role === 'manager' ? 'Gerente' : 'Vendedor'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {demoStores[u.storeId]?.name || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-right">
                             <button className="text-slate-400 hover:text-brand-blue mr-3"><i className="fas fa-edit"></i></button>
                             <button className="text-slate-400 hover:text-red-500"><i className="fas fa-trash"></i></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </GlassPanel>
        )}
      </main>
    </div>
  );
}

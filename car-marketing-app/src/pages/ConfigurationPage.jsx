import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import GlassPanel from '../components/ui/GlassPanel';
import { useStores } from '../hooks/useStores';
import { useUsers } from '../hooks/useUsers';
import { useSettings } from '../hooks/useSettings';
import { usePromotions } from '../hooks/usePromotions';
import { useAgencies } from '../hooks/useAgencies';
import { updateUser } from '../firebase/services/usersService';
import { plans } from '../data/plans';

export default function ConfigurationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('rates');

  // Firestore hooks
  const { settings, loading: settingsLoading, saveStoreRates, saveExchangeRates } = useSettings();
  const { stores, storesMap, loading: storesLoading, addStore, editStore, removeStore } = useStores();
  const { users, loading: usersLoading, refetch: refetchUsers } = useUsers();
  const { promotions, loading: promosLoading, addPromotion, editPromotion, removePromotion } = usePromotions();
  const { agencies, agenciesMap, loading: agenciesLoading, addAgency, editAgency, removeAgency } = useAgencies();

  // Local state for editing
  const [storeRates, setStoreRates] = useState({});
  const [customExchangeRates, setCustomExchangeRates] = useState({});
  const [userSearch, setUserSearch] = useState('');

  // Toast notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Promotions modal state
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoForm, setPromoForm] = useState({
    name: '', description: '', tasa: '', plazos: [], enganche: [],
    comisionApertura: '', planIds: [], agencyIds: [], initDate: '', endDate: '',
  });

  // User edit modal state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', role: 'vendor', storeId: '', agencyId: '' });

  // Store modal state
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [editingStoreItem, setEditingStoreItem] = useState(null);
  const [storeForm, setStoreForm] = useState({ name: '', city: '', phone: '', address: '' });

  // Agency modal state
  const [agencyModalOpen, setAgencyModalOpen] = useState(false);
  const [editingAgencyItem, setEditingAgencyItem] = useState(null);
  const [agencyForm, setAgencyForm] = useState({ name: '', city: '', phone: '', address: '' });

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState(null);

  const loading = settingsLoading || storesLoading || usersLoading || agenciesLoading;

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Sync Firestore settings to local state when loaded
  useEffect(() => {
    if (settings) {
      setStoreRates(settings.storeRates || {});
      setCustomExchangeRates(settings.exchangeRates || {});
    }
  }, [settings]);

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

  const saveConfiguration = async () => {
    try {
      await saveStoreRates(storeRates);
      await saveExchangeRates(customExchangeRates);
      showToast('Configuración guardada exitosamente');
    } catch (err) {
      showToast('Error al guardar: ' + err.message, 'error');
    }
  };

  // Promotion handlers
  const openPromoModal = (promo = null) => {
    if (promo) {
      setEditingPromo(promo);
      setPromoForm({
        name: promo.name || '',
        description: promo.description || '',
        tasa: promo.tasa || '',
        plazos: promo.plazos || [],
        enganche: promo.enganche || [],
        comisionApertura: promo.comisionApertura || '',
        planIds: promo.planIds || (promo.planId === 'all' ? [] : (Array.isArray(promo.planId) ? promo.planId : [promo.planId])),
        agencyIds: promo.agencyIds || (promo.agencieId === 'all' ? [] : [promo.agencieId]),
        initDate: promo.initDate ? promo.initDate.split('T')[0] : '',
        endDate: promo.endDate ? promo.endDate.split('T')[0] : '',
      });
    } else {
      setEditingPromo(null);
      setPromoForm({
        name: '', description: '', tasa: '', plazos: [], enganche: [],
        comisionApertura: '', planIds: [], agencyIds: [], initDate: '', endDate: '',
      });
    }
    setPromoModalOpen(true);
  };

  const handleSavePromo = async () => {
    const data = {
      ...promoForm,
      tasa: parseFloat(promoForm.tasa) || 0,
      comisionApertura: parseFloat(promoForm.comisionApertura) || 0,
      initDate: promoForm.initDate ? new Date(promoForm.initDate + 'T00:00:00').toISOString() : '',
      endDate: promoForm.endDate ? new Date(promoForm.endDate + 'T23:59:59').toISOString() : '',
    };
    try {
      if (editingPromo) {
        await editPromotion(editingPromo.id, data);
      } else {
        await addPromotion(data);
      }
      setPromoModalOpen(false);
      setEditingPromo(null);
      showToast(editingPromo ? 'Promoción actualizada' : 'Promoción creada');
    } catch (err) {
      showToast('Error al guardar promoción: ' + err.message, 'error');
    }
  };

  const handleDeletePromo = async (id) => {
    setConfirmDialog({
      message: '¿Eliminar esta promoción?',
      onConfirm: async () => {
        try {
          await removePromotion(id);
          showToast('Promoción eliminada');
        } catch (err) {
          showToast('Error al eliminar: ' + err.message, 'error');
        }
        setConfirmDialog(null);
      },
    });
  };

  // Store handlers
  const openStoreModal = (store = null) => {
    if (store) {
      setEditingStoreItem(store);
      setStoreForm({ name: store.name || '', city: store.city || '', phone: store.phone || '', address: store.address || '' });
    } else {
      setEditingStoreItem(null);
      setStoreForm({ name: '', city: '', phone: '', address: '' });
    }
    setStoreModalOpen(true);
  };

  const handleSaveStore = async () => {
    try {
      if (editingStoreItem) {
        await editStore(editingStoreItem.id, storeForm);
        showToast('Sucursal actualizada');
      } else {
        await addStore(storeForm);
        showToast('Sucursal creada');
      }
      setStoreModalOpen(false);
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleDeleteStore = (store) => {
    setConfirmDialog({
      message: `¿Eliminar sucursal "${store.name}"?`,
      onConfirm: async () => {
        try { await removeStore(store.id); showToast('Sucursal eliminada'); }
        catch (err) { showToast('Error: ' + err.message, 'error'); }
        setConfirmDialog(null);
      },
    });
  };

  // Agency handlers
  const openAgencyModal = (agency = null) => {
    if (agency) {
      setEditingAgencyItem(agency);
      setAgencyForm({ name: agency.name || '', city: agency.city || '', phone: agency.phone || '', address: agency.address || '' });
    } else {
      setEditingAgencyItem(null);
      setAgencyForm({ name: '', city: '', phone: '', address: '' });
    }
    setAgencyModalOpen(true);
  };

  const handleSaveAgency = async () => {
    try {
      if (editingAgencyItem) {
        await editAgency(editingAgencyItem.id, agencyForm);
        showToast('Agencia actualizada');
      } else {
        await addAgency(agencyForm);
        showToast('Agencia creada');
      }
      setAgencyModalOpen(false);
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleDeleteAgency = (agency) => {
    setConfirmDialog({
      message: `¿Eliminar agencia "${agency.name}"?`,
      onConfirm: async () => {
        try { await removeAgency(agency.id); showToast('Agencia eliminada'); }
        catch (err) { showToast('Error: ' + err.message, 'error'); }
        setConfirmDialog(null);
      },
    });
  };

  const toggleArrayItem = (field, value) => {
    setPromoForm(prev => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
  };

  const isPromoActive = (promo) => {
    const now = new Date();
    const start = promo.initDate ? new Date(promo.initDate) : null;
    const end = promo.endDate ? new Date(promo.endDate) : null;
    if (!start || !end) return false;
    return now >= start && now <= end;
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div></div>;

  const rates = settings?.rates || {};
  const currencies = settings?.currencies || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Configuración Global</h1>
            <p className="text-slate-500 mt-1">Administra tasas de interés, tipos de cambio, promociones y más.</p>
          </div>
          {(activeTab === 'rates' || activeTab === 'exchange') && (
            <button
              onClick={saveConfiguration}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-blue to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all text-sm"
            >
              <i className="fas fa-save"></i>
              Guardar Cambios
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-200 mb-6 overflow-x-auto">
          {[
            { key: 'rates', label: 'Tasas de Interés' },
            { key: 'exchange', label: 'Tipos de Cambio' },
            { key: 'promotions', label: 'Promociones' },
            { key: 'agencies', label: 'Agencias' },
            { key: 'users', label: 'Usuarios y Tiendas' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-2 text-sm font-bold uppercase transition-colors relative whitespace-nowrap ${
                activeTab === tab.key ? 'text-brand-blue' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-blue"></div>}
            </button>
          ))}
        </div>

        {/* ===================== RATES TAB ===================== */}
        {activeTab === 'rates' && (
          <GlassPanel>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-4 px-4 font-bold text-slate-800 bg-slate-50 min-w-[220px]">
                      Plan / Sucursal
                    </th>
                    <th className="py-4 px-4 font-bold text-slate-500 text-center min-w-[100px]">
                      Default
                    </th>
                    {stores.map(store => (
                      <th key={store.id} className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap min-w-[160px]">
                        {store.name}
                        <div className="text-[10px] font-normal text-slate-400">{store.city}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(rates).map(planKey => {
                    const planConfig = plans[planKey];
                    const defaultRate = rates[planKey];

                    return (
                      <tr key={planKey} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {planConfig?.icon && (
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs shrink-0" style={{ backgroundColor: planConfig.color || '#64748B' }}>
                                <i className={planConfig.icon}></i>
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-brand-dark">{planConfig?.title || planKey}</div>
                              <div className="text-[10px] text-slate-400">{planKey}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm">
                            {defaultRate}%
                          </span>
                        </td>
                        {stores.map(store => {
                          const storeOverride = storeRates[store.id]?.[planKey];
                          const currentRate = storeOverride !== undefined && storeOverride !== '' 
                            ? storeOverride 
                            : defaultRate;
                          const isModified = storeOverride !== undefined && storeOverride !== '' && parseFloat(storeOverride) !== defaultRate;

                          return (
                            <td key={store.id} className="py-3 px-4">
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
                                  onChange={(e) => handleRateChange(store.id, planKey, e.target.value)}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">%</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-700 text-xs flex items-start gap-2">
                <i className="fas fa-info-circle mt-0.5"></i>
                <p>
                  Las tasas configuradas aquí sobrescriben la tasa predeterminada global. 
                  Si dejas un campo vacío, se usará la tasa default.
                </p>
              </div>
            </div>
          </GlassPanel>
        )}

        {/* ===================== EXCHANGE TAB ===================== */}
        {activeTab === 'exchange' && (
          <GlassPanel>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currencies.map(currency => {
                if (currency.code === 'MXN') return null;
                
                const defaultRate = settings?.exchangeRates?.[currency.code] || 0;
                const currentRate = customExchangeRates[currency.code] ?? defaultRate;

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
                        value={currentRate}
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

        {/* ===================== PROMOTIONS TAB ===================== */}
        {activeTab === 'promotions' && (
          <GlassPanel>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-brand-dark">Gestión de Promociones</h3>
              <button 
                onClick={() => openPromoModal()}
                className="text-sm font-bold text-white bg-brand-blue px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <i className="fas fa-plus"></i> Nueva Promoción
              </button>
            </div>

            {promosLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : promotions.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <i className="fas fa-tags text-2xl text-slate-300"></i>
                </div>
                <p className="text-slate-400 font-bold">No hay promociones creadas</p>
                <p className="text-sm text-slate-300 mt-1">Crea tu primera promoción para empezar</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {promotions.map(promo => {
                  const active = isPromoActive(promo);
                  return (
                    <div key={promo.id} className={`bg-white p-5 rounded-xl border ${active ? 'border-green-200' : 'border-slate-200'} shadow-sm relative group hover:shadow-md transition-all`}>
                      {/* Status Badge */}
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                        }`}>
                          {active ? 'Activa' : 'Expirada'}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openPromoModal(promo)}
                            className="p-1.5 text-slate-400 hover:text-brand-blue rounded-lg hover:bg-blue-50"
                          >
                            <i className="fas fa-edit text-sm"></i>
                          </button>
                          <button
                            onClick={() => handleDeletePromo(promo.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                          >
                            <i className="fas fa-trash text-sm"></i>
                          </button>
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-brand-dark text-lg mb-1">{promo.name}</h4>
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2">{promo.description}</p>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="text-slate-400 block">Tasa</span>
                          <span className="font-bold text-brand-dark">{promo.tasa}%</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="text-slate-400 block">Comisión Apertura</span>
                          <span className="font-bold text-brand-dark">{(promo.comisionApertura * 100).toFixed(1)}%</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="text-slate-400 block">Plazos</span>
                          <span className="font-bold text-brand-dark">{promo.plazos?.join(', ') || 'Todos'}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="text-slate-400 block">Enganche</span>
                          <span className="font-bold text-brand-dark">{promo.enganche?.map(e => `${e}%`).join(', ') || 'Todos'}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-slate-50 space-y-1 text-[10px] text-slate-400">
                        <div className="flex justify-between">
                          <span>Planes: {(!promo.planIds || promo.planIds.length === 0) ? 'Todos' : promo.planIds.map(p => plans[p]?.title || p).join(', ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Agencias: {(!promo.agencyIds || promo.agencyIds.length === 0) ? 'Todas' : promo.agencyIds.map(id => agenciesMap[id]?.name || id).join(', ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{promo.initDate ? new Date(promo.initDate).toLocaleDateString('es-MX') : '—'} → {promo.endDate ? new Date(promo.endDate).toLocaleDateString('es-MX') : '—'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassPanel>
        )}

        {/* ===================== AGENCIES TAB ===================== */}
        {activeTab === 'agencies' && (
          <GlassPanel>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-brand-dark">Directorio de Agencias ({agencies.length})</h3>
              <button
                onClick={() => openAgencyModal()}
                className="text-sm font-bold text-white bg-brand-blue px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <i className="fas fa-plus"></i> Nueva Agencia
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {agencies.map(agency => {
                const agencyUsers = users.filter(u => u.agencyId === agency.id);
                return (
                  <div key={agency.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <i className="fas fa-building"></i>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openAgencyModal(agency)}
                          className="p-1.5 text-slate-400 hover:text-brand-blue"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteAgency(agency)}
                          className="p-1.5 text-slate-400 hover:text-red-500"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-800">{agency.name}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <i className="fas fa-map-marker-alt text-xs opacity-50"></i> {agency.city || 'Sin ubicación'}
                    </p>
                    {agency.phone && (
                      <p className="text-sm text-slate-400 flex items-center gap-1 mt-0.5">
                        <i className="fas fa-phone text-xs opacity-50"></i> {agency.phone}
                      </p>
                    )}
                    <div className="mt-4 pt-4 border-t border-slate-50">
                      <div className="text-xs text-slate-400 font-bold mb-2">
                        <i className="fas fa-users mr-1"></i> Usuarios asignados ({agencyUsers.length})
                      </div>
                      {agencyUsers.length > 0 ? (
                        <div className="space-y-1.5">
                          {agencyUsers.map(u => (
                            <div key={u.id} className="flex items-center gap-2 text-xs">
                              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[9px]">
                                {u.name?.charAt(0) || '?'}
                              </div>
                              <span className="text-slate-600">{u.name}</span>
                              <span className={`ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                u.role === 'admin' ? 'bg-purple-50 text-purple-500' :
                                u.role === 'manager' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
                              }`}>{u.role}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-300 italic">Sin usuarios asignados</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* User-to-Agency Assignment */}
            <div className="pt-6 border-t border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-brand-dark">Asignar Usuarios a Agencias</h3>
                <div className="relative w-72">
                  <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email o rol..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full py-2 pl-9 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                  {userSearch && (
                    <button onClick={() => setUserSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                      <th className="py-3 px-4 font-bold">Usuario</th>
                      <th className="py-3 px-4 font-bold">Rol</th>
                      <th className="py-3 px-4 font-bold">Sucursal</th>
                      <th className="py-3 px-4 font-bold">Agencia Asignada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => {
                      if (!userSearch) return true;
                      const q = userSearch.toLowerCase();
                      return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q);
                    }).map(u => (
                      <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                              {u.name?.charAt(0) || '?'}
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
                            u.role === 'manager' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {u.role === 'admin' ? 'Admin' : u.role === 'manager' ? 'Gerente' : 'Vendedor'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs">{storesMap[u.storeId]?.name || '—'}</td>
                        <td className="py-3 px-4">
                          <select
                            value={u.agencyId || ''}
                            onChange={async (e) => {
                              try {
                              await updateUser(u.id, { agencyId: e.target.value || null });
                                refetchUsers();
                                showToast('Agencia asignada');
                              } catch (err) { showToast('Error: ' + err.message, 'error'); }
                            }}
                            className="w-full py-1.5 px-3 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                          >
                            <option value="">Sin agencia</option>
                            {agencies.map(a => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </GlassPanel>
        )}

        {/* ===================== USERS & STORES TAB ===================== */}
        {activeTab === 'users' && (
          <GlassPanel>
            {/* Sub-tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-100">
              <TabButton label={`Tiendas (${stores.length})`} active={true} />
            </div>

            {/* STORES */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-brand-dark">Directorio de Sucursales</h3>
                <button 
                  onClick={() => openStoreModal()}
                  className="text-sm font-bold text-brand-blue bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  + Agregar Sucursal
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                  <div key={store.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue">
                        <i className="fas fa-store"></i>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openStoreModal(store)}
                          className="p-1.5 text-slate-400 hover:text-brand-blue"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteStore(store)}
                          className="p-1.5 text-slate-400 hover:text-red-500"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-800">{store.name}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <i className="fas fa-map-marker-alt text-xs opacity-50"></i> {store.city || 'Sin ubicación'}
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                      <span>ID: {store.id}</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500">Activa</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* USERS TABLE */}
            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-brand-dark">Directorio de Usuarios ({users.length})</h3>
                <div className="relative w-72">
                  <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email o rol..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full py-2 pl-9 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                  {userSearch && (
                    <button onClick={() => setUserSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                      <th className="py-3 px-4 font-bold">Usuario</th>
                      <th className="py-3 px-4 font-bold">Rol</th>
                      <th className="py-3 px-4 font-bold">Sucursal</th>
                      <th className="py-3 px-4 font-bold">Agencia</th>
                      <th className="py-3 px-4 font-bold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => {
                      if (!userSearch) return true;
                      const q = userSearch.toLowerCase();
                      return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q);
                    }).map(u => (
                      <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 group">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                              {u.name?.charAt(0) || '?'}
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
                        <td className="py-3 px-4 text-slate-600 text-xs">
                          {storesMap[u.storeId]?.name || '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs">
                          {agenciesMap[u.agencyId]?.name || '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setUserForm({ name: u.name || '', role: u.role || 'vendor', storeId: u.storeId || '', agencyId: u.agencyId || '' });
                                setUserModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-brand-blue rounded-lg hover:bg-blue-50"
                            >
                              <i className="fas fa-edit text-sm"></i>
                            </button>
                            <button
                              onClick={() => {
                                setConfirmDialog({
                                  message: `¿Eliminar usuario ${u.name}? Esta acción no se puede deshacer.`,
                                  onConfirm: async () => {
                                    try {
                                      const { deleteUser } = await import('../firebase/services/usersService');
                                      await deleteUser(u.id);
                                      refetchUsers();
                                      showToast('Usuario eliminado');
                                    } catch (err) { showToast('Error: ' + err.message, 'error'); }
                                    setConfirmDialog(null);
                                  },
                                });
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                            >
                              <i className="fas fa-trash text-sm"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </GlassPanel>
        )}
      </main>

      {/* ===================== PROMOTIONS MODAL ===================== */}
      {promoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setPromoModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-brand-dark">
                {editingPromo ? 'Editar Promoción' : 'Nueva Promoción'}
              </h3>
              <button onClick={() => setPromoModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>

            <div className="space-y-5">
              {/* Name & Description */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Nombre</label>
                <input
                  type="text" value={promoForm.name}
                  onChange={(e) => setPromoForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  placeholder="Ej: Promoción Día del Padre"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Descripción</label>
                <textarea
                  value={promoForm.description}
                  onChange={(e) => setPromoForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none"
                  rows={3} placeholder="Descripción de la promoción..."
                />
              </div>

              {/* Tasa & Comision */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tasa de Interés (%)</label>
                  <input
                    type="number" step="0.1" value={promoForm.tasa}
                    onChange={(e) => setPromoForm(p => ({ ...p, tasa: e.target.value }))}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    placeholder="12.9"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Comisión Apertura (%)</label>
                  <input
                    type="number" step="0.01" value={promoForm.comisionApertura}
                    onChange={(e) => setPromoForm(p => ({ ...p, comisionApertura: e.target.value }))}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    placeholder="0.02"
                  />
                </div>
              </div>

              {/* Plazos */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Plazos Permitidos (meses)</label>
                <div className="flex flex-wrap gap-2">
                  {[12, 24, 36, 48, 60].map(p => (
                    <button
                      key={p} type="button"
                      onClick={() => toggleArrayItem('plazos', p)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                        promoForm.plazos.includes(p)
                          ? 'bg-brand-blue text-white border-brand-blue'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-brand-blue'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enganche */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Enganches Permitidos (%)</label>
                <div className="flex flex-wrap gap-2">
                  {[10, 20, 30, 40, 50].map(e => (
                    <button
                      key={e} type="button"
                      onClick={() => toggleArrayItem('enganche', e)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                        promoForm.enganche.includes(e)
                          ? 'bg-brand-blue text-white border-brand-blue'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-brand-blue'
                      }`}
                    >
                      {e}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Plans */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Planes Aplicables</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(plans).map(([key, plan]) => (
                    <button
                      key={key} type="button"
                      onClick={() => setPromoForm(p => ({
                        ...p,
                        planIds: p.planIds.includes(key) ? p.planIds.filter(v => v !== key) : [...p.planIds, key]
                      }))}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                        promoForm.planIds.includes(key)
                          ? 'bg-brand-blue text-white border-brand-blue'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-brand-blue'
                      }`}
                    >
                      {plan.title}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Si ninguno está seleccionado, aplica a todos.</p>
              </div>

              {/* Agencies */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Agencias Aplicables</label>
                <div className="flex flex-wrap gap-2">
                  {agencies.map(a => (
                    <button
                      key={a.id} type="button"
                      onClick={() => setPromoForm(p => ({
                        ...p,
                        agencyIds: p.agencyIds.includes(a.id) ? p.agencyIds.filter(v => v !== a.id) : [...p.agencyIds, a.id]
                      }))}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                        promoForm.agencyIds.includes(a.id)
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Si ninguna está seleccionada, aplica a todas.</p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Fecha Inicio</label>
                  <input
                    type="date" value={promoForm.initDate}
                    onChange={(e) => setPromoForm(p => ({ ...p, initDate: e.target.value }))}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Fecha Fin</label>
                  <input
                    type="date" value={promoForm.endDate}
                    onChange={(e) => setPromoForm(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setPromoModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePromo}
                  className="flex-1 py-3 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                >
                  {editingPromo ? 'Actualizar' : 'Crear Promoción'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== USER EDIT MODAL ===================== */}
      {userModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setUserModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-brand-dark">Editar Usuario</h3>
              <button onClick={() => setUserModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Nombre</label>
                <input
                  type="text" value={userForm.name}
                  onChange={(e) => setUserForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Email</label>
                <div className="w-full py-2.5 px-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-400">
                  {editingUser.email}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Rol</label>
                <select
                  value={userForm.role}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    setUserForm(p => ({
                      ...p,
                      role: newRole,
                      ...(newRole === 'admin' ? { storeId: '', agencyId: '' } : {}),
                    }));
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                >
                  <option value="admin">Administrador</option>
                  <option value="manager">Gerente</option>
                  <option value="vendor">Vendedor</option>
                </select>
              </div>

              <div className={userForm.role === 'admin' ? 'opacity-40 pointer-events-none' : ''}>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Sucursal {userForm.role === 'admin' && <span className="text-slate-300 normal-case">(no aplica para admin)</span>}
                </label>
                <select
                  value={userForm.storeId}
                  onChange={(e) => setUserForm(p => ({ ...p, storeId: e.target.value }))}
                  disabled={userForm.role === 'admin'}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20 disabled:bg-slate-50"
                >
                  <option value="">Sin sucursal</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name} — {s.city}</option>
                  ))}
                </select>
              </div>

              <div className={userForm.role === 'admin' ? 'opacity-40 pointer-events-none' : ''}>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Agencia {userForm.role === 'admin' && <span className="text-slate-300 normal-case">(no aplica para admin)</span>}
                </label>
                <select
                  value={userForm.agencyId}
                  onChange={(e) => setUserForm(p => ({ ...p, agencyId: e.target.value }))}
                  disabled={userForm.role === 'admin'}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20 disabled:bg-slate-50"
                >
                  <option value="">Sin agencia</option>
                  {agencies.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setUserModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    try {
                      await updateUser(editingUser.id, {
                        name: userForm.name,
                        role: userForm.role,
                        storeId: userForm.storeId || null,
                        agencyId: userForm.agencyId || null,
                      });
                      refetchUsers();
                      setUserModalOpen(false);
                      showToast('Usuario actualizado');
                    } catch (err) {
                      showToast('Error al actualizar: ' + err.message, 'error');
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== STORE MODAL ===================== */}
      {storeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setStoreModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-brand-dark">
                {editingStoreItem ? 'Editar Sucursal' : 'Nueva Sucursal'}
              </h3>
              <button onClick={() => setStoreModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Nombre</label>
                <input type="text" value={storeForm.name}
                  onChange={(e) => setStoreForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  placeholder="Ej: Sucursal Centro" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Ciudad</label>
                <input type="text" value={storeForm.city}
                  onChange={(e) => setStoreForm(p => ({ ...p, city: e.target.value }))}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  placeholder="CDMX" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Teléfono</label>
                <input type="text" value={storeForm.phone}
                  onChange={(e) => setStoreForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  placeholder="55 1234 5678" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Dirección</label>
                <input type="text" value={storeForm.address}
                  onChange={(e) => setStoreForm(p => ({ ...p, address: e.target.value }))}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  placeholder="Av. Principal 123" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setStoreModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all">
                  Cancelar
                </button>
                <button onClick={handleSaveStore}
                  className="flex-1 py-3 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20">
                  {editingStoreItem ? 'Actualizar' : 'Crear Sucursal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== AGENCY MODAL ===================== */}
      {agencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setAgencyModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-brand-dark">
                {editingAgencyItem ? 'Editar Agencia' : 'Nueva Agencia'}
              </h3>
              <button onClick={() => setAgencyModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Nombre</label>
                <input type="text" value={agencyForm.name}
                  onChange={(e) => setAgencyForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  placeholder="Ej: Volkswagen CDMX" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Ciudad</label>
                <input type="text" value={agencyForm.city}
                  onChange={(e) => setAgencyForm(p => ({ ...p, city: e.target.value }))}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  placeholder="CDMX" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Teléfono</label>
                <input type="text" value={agencyForm.phone}
                  onChange={(e) => setAgencyForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  placeholder="55 1234 5678" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Dirección</label>
                <input type="text" value={agencyForm.address}
                  onChange={(e) => setAgencyForm(p => ({ ...p, address: e.target.value }))}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  placeholder="Av. Insurgentes Sur 1234" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setAgencyModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all">
                  Cancelar
                </button>
                <button onClick={handleSaveAgency}
                  className="flex-1 py-3 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20">
                  {editingAgencyItem ? 'Actualizar' : 'Crear Agencia'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== CONFIRM DIALOG ===================== */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setConfirmDialog(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-red-500"></i>
              </div>
              <p className="text-brand-dark font-medium">{confirmDialog.message}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDialog(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50">
                Cancelar
              </button>
              <button onClick={confirmDialog.onConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 shadow-lg shadow-red-500/20">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TOAST ===================== */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[70] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-3 animate-[slideUp_0.3s_ease-out] ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-brand-dark text-white'
        }`}>
          <i className={`fas ${toast.type === 'error' ? 'fa-times-circle' : 'fa-check-circle'}`}></i>
          {toast.message}
        </div>
      )}
    </div>
  );
}

// Small helper component for tabs
function TabButton({ label, active }) {
  return (
    <span className={`pb-2 px-4 text-sm font-bold transition-colors border-b-2 ${
      active ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-400'
    }`}>
      {label}
    </span>
  );
}

import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCalculations } from '../hooks/useCalculations';
import { useQuotes } from '../hooks/useQuotes';
import { useSettings } from '../hooks/useSettings';
import { useClients } from '../hooks/useClients';
import { usePromotions } from '../hooks/usePromotions';
import { plans } from '../data/plans';
import { parsePrice } from '../utils/formatters';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import GlassPanel from '../components/ui/GlassPanel';
import ClientSearch from '../components/quoter/ClientSearch';
import VehicleForm from '../components/quoter/VehicleForm';
import PlanSelector from '../components/quoter/PlanSelector';
import FinancingControls from '../components/quoter/FinancingControls';
import SettingsPanel from '../components/quoter/SettingsPanel';
import QuoteSummary from '../components/quoter/QuoteSummary';
import PDFModal from '../components/pdf/PDFModal';
import PDFContent from '../components/pdf/PDFContent';

export default function QuoterPage() {
  const { user } = useAuth();
  const { saveQuote } = useQuotes(user?.id, user?.role, user?.storeId);
  const { settings, getRate, getExchangeRates: getExchangeRatesFromSettings } = useSettings();
  const { clients, addClient, updateClient } = useClients();
  const { promotions } = usePromotions(true); // only active promotions
  const pdfRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Check if we're editing an existing quote
  const editQuote = location.state?.quote;
  const [editId, setEditId] = useState(editQuote?.id || null);

  // Client state — now stores a full client object with id
  const [selectedClient, setSelectedClient] = useState(
    editQuote?.client?.id
      ? editQuote.client
      : editQuote?.client?.name
        ? editQuote.client
        : null
  );
  const [gender, setGender] = useState(editQuote?.config?.gender || 'male');

  // Vehicle state
  const [vehicleData, setVehicleData] = useState(
    editQuote?.vehicle || {
      type: 'auto', condition: 'new', brand: '', model: '', year: '2025',
      price: '', accessories: '',
    }
  );

  // Plan state
  const rawPlanKey = editQuote?.plan?.id || 'credito_normal';
  const [planKey, setPlanKey] = useState(plans[rawPlanKey] ? rawPlanKey : 'credito_normal');
  const config = plans[planKey];

  // Rate from Firestore settings (with store override)
  const [rate, setRate] = useState(config?.defaultRate ?? 15.9);

  // Update rate when plan changes or settings load
  useEffect(() => {
    if (settings) {
      const newRate = getRate(planKey, user?.storeId);
      setRate(newRate || config?.defaultRate || 15.9);
    }
  }, [planKey, settings, user, getRate, config]);

  // Financing state
  const [term, setTerm] = useState(editQuote?.plan?.term || 48);
  const [downPercent, setDownPercent] = useState(editQuote?.config?.downPercent ?? 20);
  const [downMode, setDownMode] = useState('percent'); // 'percent' or 'amount'
  const [downAmount, setDownAmount] = useState('');
  const [method, setMethod] = useState(editQuote?.plan?.method || 'french');
  const [currency, setCurrency] = useState(editQuote?.plan?.currency || 'MXN');
  const [scheduledPayments, setScheduledPayments] = useState(editQuote?.config?.scheduledPayments || []);

  // Clear edit state from location after loading
  useEffect(() => {
    if (editQuote) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Exchange rates from Firestore settings
  const exchangeRates = getExchangeRatesFromSettings();

  // Total vehicle price
  const totalPrice = parsePrice(vehicleData.price) + parsePrice(vehicleData.accessories);

  // Effective down percent (computed from amount if in amount mode)
  const effectiveDownPercent = downMode === 'amount' && totalPrice > 0
    ? Math.min(((parseFloat(downAmount) || 0) / totalPrice) * 100, 100)
    : downPercent;

  // Active promotion selection
  const [activePromotionId, setActivePromotionId] = useState(editQuote?.appliedPromotionId || '');

  // Filter valid promotions based on plan and agency only (term/down are synced on selection)
  const availablePromotions = useMemo(() => {
    return promotions.filter(promo => {
      // Plan check
      if (promo.planIds && promo.planIds.length > 0 && !promo.planIds.includes(planKey)) return false;
      // Agency check (skip if admin general / no agency attached to user)
      if (promo.agencyIds && promo.agencyIds.length > 0) {
         if (user?.role !== 'admin' && user?.storeId && !promo.agencyIds.includes(user.storeId)) return false;
      }
      return true;
    });
  }, [promotions, planKey, user]);

  const selectedPromo = useMemo(
    () => availablePromotions.find(p => p.id === activePromotionId) || null,
    [availablePromotions, activePromotionId]
  );

  // When a promotion is selected: auto-sync rate, term and down payment
  useEffect(() => {
    if (!selectedPromo) {
      // Restore default rate if promo is removed
      const defaultRate = getRate(planKey, user?.storeId) || config?.defaultRate || 15.9;
      setRate(defaultRate);
      return;
    }

    // Override rate
    if (selectedPromo.tasa !== null && selectedPromo.tasa !== '' && selectedPromo.tasa !== undefined) {
      setRate(parseFloat(selectedPromo.tasa));
    }
    // Override term: only adjust if strictly OUTSIDE the promo's min..max range
    if (selectedPromo.plazos && selectedPromo.plazos.length > 0) {
      const sorted = [...selectedPromo.plazos].sort((a, b) => a - b);
      const minTerm = sorted[0];
      const maxTerm = sorted[sorted.length - 1];
      const currentTerm = Number(term);
      if (currentTerm < minTerm || currentTerm > maxTerm) {
        setTerm(minTerm);
      }
    }
    // Override down: only adjust if strictly OUTSIDE the promo's min..max range
    if (selectedPromo.enganche && selectedPromo.enganche.length > 0) {
      const sortedDown = [...selectedPromo.enganche].sort((a, b) => a - b);
      const minDown = sortedDown[0];
      const maxDown = sortedDown[sortedDown.length - 1];
      const currentDown = Math.round(effectiveDownPercent);
      if (currentDown < minDown || currentDown > maxDown) {
        setDownPercent(minDown);
        setDownMode('percent');
      }
    }
  }, [activePromotionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-deactivate promotion only if user goes OUTSIDE the allowed min..max range
  useEffect(() => {
    if (!selectedPromo) return;
    const termNumber = Number(term);
    const downRound = Math.round(effectiveDownPercent);

    let termOk = true;
    if (selectedPromo.plazos?.length > 0) {
      const sorted = [...selectedPromo.plazos].sort((a, b) => a - b);
      termOk = termNumber >= sorted[0] && termNumber <= sorted[sorted.length - 1];
    }

    let downOk = true;
    if (selectedPromo.enganche?.length > 0) {
      const sortedDown = [...selectedPromo.enganche].sort((a, b) => a - b);
      downOk = downRound >= sortedDown[0] && downRound <= sortedDown[sortedDown.length - 1];
    }

    const planOk = !selectedPromo.planIds?.length || selectedPromo.planIds.includes(planKey);

    if (!termOk || !downOk || !planOk) {
      setActivePromotionId('');
      showToast('Promoción desactivada: configuración fuera de rango.', 'error');
    }
  }, [term, effectiveDownPercent, planKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculated data
  const { calculatedData, amortizationTable } = useCalculations({
    planKey,
    vehiclePrice: parsePrice(vehicleData.price),
    accessoriesPrice: parsePrice(vehicleData.accessories),
    term,
    downPercent: effectiveDownPercent,
    rate: parseFloat(rate) || 0,
    method: config.isLeasing ? 'leasing' : method,
    currency,
    scheduledPayments,
    exchangeRates,
    promotion: selectedPromo,
  });

  // Plan change handler
  const handlePlanChange = (key) => {
    setPlanKey(key);
    const newConfig = plans[key];
    if (newConfig.isLeasing) setMethod('french');
    if (key !== 'pagos_programados') setScheduledPayments([]);
  };

  // PDF state
  const [pdfOpen, setPdfOpen] = useState(false);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf()
      .from(pdfRef.current)
      .set({
        margin: [10, 10, 10, 10],
        filename: `Cotizacion_${selectedClient?.name || 'Cliente'}_${config.title}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .save();
  };

  // Build clientData object for PDF and save (backward compatible)
  const clientData = selectedClient
    ? { id: selectedClient.id, name: selectedClient.name, phone: selectedClient.phone, email: selectedClient.email, rfc: selectedClient.rfc || '' }
    : { name: '', phone: '', email: '', rfc: '' };

  // Save handler
  const handleSave = async () => {
    if (!selectedClient) {
      showToast('Selecciona o registra un cliente antes de guardar', 'error');
      return;
    }

    const quoteData = {
      date: editId ? (editQuote?.date || new Date().toISOString()) : new Date().toISOString(),
      clientId: selectedClient.id,
      client: clientData,
      vehicle: vehicleData,
      plan: { id: planKey, name: config.title, term, rate, currency, method },
      financials: calculatedData,
      config: { downPercent: effectiveDownPercent, gender, scheduledPayments },
      amortizationTable,
      appliedPromotionId: activePromotionId || null,
      userId: user?.id,
      vendorName: user?.name || '',
      storeId: user?.storeId || null,
      status: editId ? (editQuote?.status || 'pending') : 'pending',
    };

    try {
      await saveQuote(quoteData, editId);
      if (!editId && quoteData.id) {
        setEditId(quoteData.id);
      }
      showToast(editId ? '¡Cotización actualizada!' : '¡Cotización guardada exitosamente!');
    } catch (err) {
      showToast('Error al guardar la cotización: ' + err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-400/5 blur-[120px] z-[-1]"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-cyan-400/5 blur-[100px] z-[-1]"></div>

      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 md:py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 relative z-10">
        {/* LEFT COLUMN: CONTROLS */}
        <div className="lg:col-span-7 space-y-6 md:space-y-8">
          <div className="mb-2 md:mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-2">
              {editId ? 'Editar Cotización' : 'Cotizador Digital'}
            </h1>
            <p className="text-slate-500 text-base md:text-lg">
              {editId
                ? <><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100 mr-2"><i className="fas fa-edit mr-1"></i>Editando</span><span className="text-xs font-mono text-slate-400">{editId}</span></>
                : 'Personaliza tu plan de financiamiento en segundos.'
              }
            </p>
          </div>

          {/* Step 1: Client */}
          <GlassPanel className="relative z-50">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-lg border border-blue-100">
                1
              </div>
              <h2 className="text-lg md:text-xl font-bold text-brand-dark">
                Datos del Cliente
              </h2>
            </div>
            <ClientSearch
              clients={clients}
              onSelect={setSelectedClient}
              selectedClient={selectedClient}
              onClear={() => setSelectedClient(null)}
              addClient={addClient}
              updateClient={updateClient}
              isAdmin={user?.role === 'admin'}
              gender={gender}
              onGenderChange={setGender}
            />
          </GlassPanel>

          {/* Step 2: Vehicle */}
          <GlassPanel>
            <VehicleForm vehicleData={vehicleData} onChange={setVehicleData} />
          </GlassPanel>

          {/* Step 3: Plan */}
          <GlassPanel>
            <PlanSelector currentPlan={planKey} onChange={handlePlanChange} />
          </GlassPanel>

          {/* Promociones */}
          {availablePromotions.length > 0 && (
            <div className="relative">
              {/* Animated border glow for promotions section */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-tr from-blue-400/40 via-purple-400/20 to-cyan-400/40 blur-[2px] -z-10 pointer-events-none" />
              <div className="bg-white/90 backdrop-blur-sm border border-blue-100/60 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <i className="fas fa-tag text-white text-xs"></i>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-brand-dark leading-tight">
                      Promociones Especiales
                    </h2>
                    <p className="text-[11px] text-slate-400">Disponibles para tu configuración actual</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availablePromotions.map(promo => {
                    const isActive = activePromotionId === promo.id;
                    const hasTasa = promo.tasa !== null && promo.tasa !== '' && promo.tasa !== undefined;
                    const hasComision = promo.comisionApertura !== null && promo.comisionApertura !== '' && promo.comisionApertura !== undefined;
                    return (
                      <button
                        key={promo.id}
                        type="button"
                        onClick={() => setActivePromotionId(isActive ? '' : promo.id)}
                        className={`text-left relative w-full p-4 rounded-xl border-2 transition-all duration-200 group ${
                          isActive
                            ? 'border-brand-blue bg-blue-50/60 shadow-md shadow-blue-100'
                            : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                        }`}
                      >
                        {/* Active badge */}
                        {isActive && (
                          <span className="absolute top-3 right-3 px-2 py-0.5 bg-brand-blue text-white text-[9px] font-bold rounded-full uppercase tracking-wider">
                            Aplicada
                          </span>
                        )}

                        {/* Name */}
                        <p className={`font-bold text-sm mb-1 ${isActive ? 'text-brand-blue' : 'text-brand-dark'} group-hover:text-brand-blue transition-colors`}>
                          <i className="fas fa-star text-amber-400 mr-1.5 text-[10px]"></i>
                          {promo.name}
                        </p>

                        {/* Description */}
                        {promo.description && (
                          <p className="text-[11px] text-slate-500 mb-3 leading-relaxed line-clamp-2">
                            {promo.description}
                          </p>
                        )}

                        {/* Benefits */}
                        {(hasTasa || hasComision) && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {hasTasa && (
                              <span className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold border border-green-100 flex items-center gap-1">
                                <i className="fas fa-percentage text-[8px]"></i>
                                Tasa {promo.tasa}%
                              </span>
                            )}
                            {hasComision && (
                              <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-bold border border-purple-100 flex items-center gap-1">
                                <i className="fas fa-hand-holding-usd text-[8px]"></i>
                                Comisión {promo.comisionApertura}%
                              </span>
                            )}
                          </div>
                        )}

                        {/* Restrictions */}
                        <div className="flex flex-wrap gap-1">
                          {promo.plazos?.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded text-[9px] font-medium border border-slate-100">
                              <i className="fas fa-clock mr-0.5 text-[8px]"></i>
                              {promo.plazos.join(', ')} meses
                            </span>
                          )}
                          {promo.enganche?.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded text-[9px] font-medium border border-slate-100">
                              <i className="fas fa-coins mr-0.5 text-[8px]"></i>
                              Enganche {promo.enganche.join(' o ')}%
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Financing */}
          <GlassPanel>
            <FinancingControls
              planKey={planKey}
              term={term}
              onTermChange={setTerm}
              downPercent={downPercent}
              onDownPercentChange={setDownPercent}
              downMode={downMode}
              onDownModeChange={setDownMode}
              downAmount={downAmount}
              onDownAmountChange={setDownAmount}
              totalPrice={totalPrice}
              rate={rate}
              onRateChange={setRate}
              appliedPromotion={selectedPromo}
            />
          </GlassPanel>

          {/* Settings */}
          <GlassPanel>
            <SettingsPanel
              planKey={planKey}
              method={method}
              onMethodChange={setMethod}
              currency={currency}
              onCurrencyChange={setCurrency}
              scheduledPayments={scheduledPayments}
              onScheduledPaymentsChange={setScheduledPayments}
              availablePromotions={availablePromotions}
              activePromotionId={activePromotionId}
              onPromotionChange={setActivePromotionId}
            />
          </GlassPanel>


        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-28">
            <QuoteSummary
              planKey={planKey}
              calculatedData={calculatedData}
              currency={currency}
              onOpenPDF={() => setPdfOpen(true)}
              onSave={handleSave}
              isEditing={!!editId}
            />
          </div>
        </div>
      </main>

      {/* PDF Modal */}
      <PDFModal
        isOpen={pdfOpen}
        onClose={() => setPdfOpen(false)}
        onDownload={handleDownloadPDF}
      >
        <PDFContent
          ref={pdfRef}
          planKey={planKey}
          clientData={clientData}
          vehicleData={vehicleData}
          calculatedData={calculatedData}
          amortizationTable={amortizationTable}
          currency={currency}
          method={method}
          scheduledPayments={scheduledPayments}
          user={user}
          appliedPromotion={selectedPromo}
        />
      </PDFModal>

      {/* Toast */}
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

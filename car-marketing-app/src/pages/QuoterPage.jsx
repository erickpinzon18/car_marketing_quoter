import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCalculations } from '../hooks/useCalculations';
import { useQuotes } from '../hooks/useQuotes';
import { plans } from '../data/plans';
import settings from '../data/settings.json';
import { parsePrice } from '../utils/formatters';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import GlassPanel from '../components/ui/GlassPanel';
import { ClientFormFields } from '../components/quoter/ClientForm';
import VehicleForm from '../components/quoter/VehicleForm';
import PlanSelector from '../components/quoter/PlanSelector';
import FinancingControls from '../components/quoter/FinancingControls';
import SettingsPanel from '../components/quoter/SettingsPanel';
import QuoteSummary from '../components/quoter/QuoteSummary';
import PDFModal from '../components/pdf/PDFModal';
import PDFContent from '../components/pdf/PDFContent';

export default function QuoterPage() {
  const { user } = useAuth();
  const { saveQuote } = useQuotes(user?.id, user?.role);
  const pdfRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're editing an existing quote
  const editQuote = location.state?.quote;
  const [editId, setEditId] = useState(editQuote?.id || null);

  // Client state
  const [clientData, setClientData] = useState(
    editQuote?.client || { name: '', phone: '', email: '', rfc: '' }
  );

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

  // Fixed rate from settings
  // Fixed rate from settings (now editable by admin)
  const [rate, setRate] = useState(settings.rates[planKey] ?? config?.defaultRate ?? 15.9);

  // Reset rate when plan changes
  // Calculate initial rate with store overrides
  useEffect(() => {
    let newRate = settings.rates[planKey] ?? config?.defaultRate ?? 15.9;

    // Check for store specific overrides in localStorage
    if (user?.storeId) {
      try {
        const savedStoreRates = localStorage.getItem('storeRates');
        if (savedStoreRates) {
          const storeRates = JSON.parse(savedStoreRates);
          const specific = storeRates[user.storeId]?.[planKey];
          // Check if specific rate exists and is not empty string/null
          if (specific !== undefined && specific !== '' && !isNaN(parseFloat(specific))) {
            newRate = parseFloat(specific);
          }
        }
      } catch (e) {
        console.error('Error loading store rates', e);
      }
    }

    setRate(newRate);
  }, [planKey, user]);

  // Financing state
  const [term, setTerm] = useState(editQuote?.plan?.term || 48);
  const [downPercent, setDownPercent] = useState(editQuote?.config?.downPercent ?? 20);
  const [downMode, setDownMode] = useState('percent'); // 'percent' or 'amount'
  const [downAmount, setDownAmount] = useState('');
  const [gender, setGender] = useState(editQuote?.config?.gender || 'male');
  const [method, setMethod] = useState(editQuote?.plan?.method || 'french');
  const [currency, setCurrency] = useState(editQuote?.plan?.currency || 'MXN');
  const [scheduledPayments, setScheduledPayments] = useState(editQuote?.config?.scheduledPayments || []);

  // Clear edit state from location after loading
  useEffect(() => {
    if (editQuote) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Exchange rates from settings + localStorage overrides
  const getExchangeRates = () => {
    const base = { ...settings.exchangeRates, MXN: 1 };
    try {
      const saved = localStorage.getItem('exchangeRates');
      if (saved) {
        const overrides = JSON.parse(saved);
        Object.keys(overrides).forEach((k) => {
          if (overrides[k]) base[k] = parseFloat(overrides[k]);
        });
      }
    } catch { /* ignore */ }
    return base;
  };

  // Total vehicle price
  const totalPrice = parsePrice(vehicleData.price) + parsePrice(vehicleData.accessories);

  // Effective down percent (computed from amount if in amount mode)
  const effectiveDownPercent = downMode === 'amount' && totalPrice > 0
    ? Math.min(((parseFloat(downAmount) || 0) / totalPrice) * 100, 100)
    : downPercent;

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
    exchangeRates: getExchangeRates(),
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
        filename: `Cotizacion_${clientData.name || 'Cliente'}_${config.title}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .save();
  };

  // Save handler
  const handleSave = () => {
    const quoteData = {
      id: editId || `CM-${Date.now()}`,
      date: editId ? (editQuote?.date || new Date().toISOString()) : new Date().toISOString(),
      client: clientData,
      vehicle: vehicleData,
      plan: { id: planKey, name: config.title, term, rate, currency, method },
      financials: calculatedData,
      config: { downPercent: effectiveDownPercent, gender, scheduledPayments },
      amortizationTable,
      user: user?.id,
      status: editId ? (editQuote?.status || 'draft') : 'draft',
    };
    saveQuote(quoteData, editId);
    setEditId(quoteData.id);
    alert(editId ? '¡Cotización actualizada!' : '¡Cotización guardada exitosamente!');
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
          <GlassPanel>
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-lg border border-blue-100">
                1
              </div>
              <h2 className="text-lg md:text-xl font-bold text-brand-dark">
                Datos del Cliente
              </h2>
            </div>
            <ClientFormFields clientData={clientData} onChange={setClientData} />
          </GlassPanel>

          {/* Step 2: Vehicle */}
          <GlassPanel>
            <VehicleForm vehicleData={vehicleData} onChange={setVehicleData} />
          </GlassPanel>

          {/* Step 3: Plan */}
          <GlassPanel>
            <PlanSelector currentPlan={planKey} onChange={handlePlanChange} />
          </GlassPanel>

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
              gender={gender}
              onGenderChange={setGender}
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
        />
      </PDFModal>
    </div>
  );
}

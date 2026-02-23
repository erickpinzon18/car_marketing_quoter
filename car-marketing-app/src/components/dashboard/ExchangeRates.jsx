import { useSettings } from '../../hooks/useSettings';
import GlassPanel from '../ui/GlassPanel';

export default function ExchangeRates() {
  const { settings, loading, saveExchangeRates } = useSettings();

  if (loading || !settings) {
    return (
      <GlassPanel className="border-l-4 border-amber-400">
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </GlassPanel>
    );
  }

  const currencies = (settings.currencies || []).filter((c) => c.code !== 'MXN');
  const rates = settings.exchangeRates || {};

  const handleChange = (code, value) => {
    // This component is read-only display now; editing is done in ConfigurationPage
    // Keeping the structure for potential direct-edit use
  };

  return (
    <GlassPanel className="border-l-4 border-amber-400">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
          <i className="fas fa-exchange-alt text-sm"></i>
        </div>
        <div>
          <h3 className="font-bold text-brand-dark text-sm">Tipos de Cambio</h3>
          <p className="text-xs text-slate-400">Monedas Latinoamérica (vs MXN)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto hide-scrollbar">
        {currencies.map((c) => (
          <div key={c.code}>
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
              {c.flag} {c.code}/MXN
            </label>
            <div className="input-clean w-full rounded-xl py-1.5 px-3 text-xs font-bold text-brand-dark">
              {rates[c.code] || '—'}
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

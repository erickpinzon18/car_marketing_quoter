import { useState, useEffect } from 'react';
import GlassPanel from '../ui/GlassPanel';
import settings from '../../data/settings.json';

export default function ExchangeRates() {
  const [rates, setRates] = useState(() => {
    // Initialize from settings.json
    const initial = {};
    settings.currencies
      .filter((c) => c.code !== 'MXN')
      .forEach((c) => {
        initial[c.code] = settings.exchangeRates[c.code]?.toString() || '0';
      });
    return initial;
  });

  useEffect(() => {
    const saved = localStorage.getItem('exchangeRates');
    if (saved) {
      try { setRates((prev) => ({ ...prev, ...JSON.parse(saved) })); } catch { /* ignore */ }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('exchangeRates', JSON.stringify(rates));
    alert('Tipos de cambio actualizados');
  };

  const latamCurrencies = settings.currencies.filter((c) => c.code !== 'MXN');

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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 max-h-60 overflow-y-auto hide-scrollbar">
        {latamCurrencies.map((c) => (
          <div key={c.code}>
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
              {c.flag} {c.code}/MXN
            </label>
            <input
              type="number"
              value={rates[c.code] || ''}
              onChange={(e) => setRates({ ...rates, [c.code]: e.target.value })}
              step="0.01"
              className="input-clean w-full rounded-xl py-1.5 px-3 text-xs font-bold text-brand-dark focus:outline-none"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="w-full py-2 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-colors"
      >
        <i className="fas fa-save mr-2"></i> Guardar Cambios
      </button>
    </GlassPanel>
  );
}

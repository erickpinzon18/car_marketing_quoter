import ToggleGroup from '../ui/ToggleGroup';
import ScheduledPayments from './ScheduledPayments';
import { plans } from '../../data/plans';
import settings from '../../data/settings.json';

export default function SettingsPanel({
  planKey,
  method, onMethodChange,
  currency, onCurrencyChange,
  scheduledPayments, onScheduledPaymentsChange,
}) {
  const config = plans[planKey];
  const showScheduled = planKey === 'pagos_programados';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-lg border border-blue-100">
          <i className="fas fa-cog text-sm"></i>
        </div>
        <h2 className="text-lg md:text-xl font-bold text-brand-dark">
          Opciones Avanzadas
        </h2>
      </div>

      {!config?.isLeasing && (
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
            Método de Amortización
          </label>
          <ToggleGroup
            options={[
              { value: 'french', label: 'Francés (Fija)' },
              { value: 'german', label: 'Alemán (Decreciente)' },
            ]}
            value={method}
            onChange={onMethodChange}
            size="sm"
          />
        </div>
      )}

      {/* Currency Dropdown - LATAM */}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
          Moneda
        </label>
        <div className="relative">
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="input-clean w-full rounded-2xl py-3 px-4 font-semibold text-brand-dark focus:outline-none appearance-none cursor-pointer text-sm"
          >
            {settings.currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code} — {c.name}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-blue">
            <i className="fas fa-chevron-down text-xs"></i>
          </div>
        </div>
        {currency !== 'MXN' && (
          <p className="text-[10px] text-slate-400 mt-2 ml-1">
            <i className="fas fa-info-circle mr-1"></i>
            Tipo de cambio: 1 {currency} = {settings.exchangeRates[currency] || '—'} MXN
          </p>
        )}
      </div>

      {showScheduled && (
        <ScheduledPayments
          payments={scheduledPayments}
          onChange={onScheduledPaymentsChange}
        />
      )}
    </div>
  );
}

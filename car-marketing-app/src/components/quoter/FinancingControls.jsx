import SliderInput from '../ui/SliderInput';
import ToggleGroup from '../ui/ToggleGroup';
import { useAuth } from '../../context/AuthContext';
import { plans } from '../../data/plans';
import settings from '../../data/settings.json';
import { formatMoney } from '../../utils/formatters';

export default function FinancingControls({
  planKey,
  term, onTermChange,
  downPercent, onDownPercentChange,
  downMode, onDownModeChange,
  downAmount, onDownAmountChange,
  totalPrice,
  rate, onRateChange,
  gender, onGenderChange,
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const config = plans[planKey];
  const color = config?.color || '#0052CC';

  // Format the down amount input with commas
  const handleDownAmountInput = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    onDownAmountChange(raw);
  };

  // Display formatted down amount
  const formattedDownAmount = downAmount
    ? Number(downAmount).toLocaleString('en-US', { maximumFractionDigits: 0 })
    : '';

  // Compute the effective percent from amount
  const effectivePercent = downMode === 'amount' && totalPrice > 0
    ? Math.min(((parseFloat(downAmount) || 0) / totalPrice) * 100, 100).toFixed(1)
    : downPercent;

  return (
    <>
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-lg border border-blue-100">
          4
        </div>
        <h2 className="text-lg md:text-xl font-bold text-brand-dark">
          Configuración Financiera
        </h2>
      </div>

      <div className="space-y-8">
        <SliderInput
          label="Plazo de Financiamiento"
          value={term}
          min={12}
          max={72}
          step={6}
          onChange={onTermChange}
          suffix=" meses"
          color={color}
          marks={['12', '24', '36', '48', '60', '72']}
        />

        {/* Down Payment with % / $ toggle */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">
              Enganche
            </label>
            <div className="flex items-center gap-2">
              {/* Mode toggle */}
              <div className="flex bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                <button
                  onClick={() => onDownModeChange('percent')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    downMode === 'percent'
                      ? 'bg-white text-brand-blue shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  %
                </button>
                <button
                  onClick={() => onDownModeChange('amount')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    downMode === 'amount'
                      ? 'bg-white text-brand-blue shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  $
                </button>
              </div>
            </div>
          </div>

          {downMode === 'percent' ? (
            <SliderInput
              value={downPercent}
              min={0}
              max={60}
              step={5}
              onChange={onDownPercentChange}
              displayValue={downPercent}
              suffix="%"
              color={color}
              marks={['0%', '15%', '30%', '45%', '60%']}
              hideLabel
            />
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <input
                  type="text"
                  value={formattedDownAmount}
                  onChange={handleDownAmountInput}
                  placeholder="150,000"
                  className="input-clean w-full rounded-2xl py-3 pl-8 pr-4 font-semibold text-brand-dark focus:outline-none text-lg"
                />
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-slate-400">
                  Equivale a <span className="font-bold text-brand-blue">{effectivePercent}%</span> del precio
                </span>
                {totalPrice > 0 && (
                  <span className="text-xs text-slate-400">
                    Precio: {formatMoney(totalPrice)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rate - Slider for Admin, Fixed for others */}
        {!config?.isLeasing && (
          <div>
            {isAdmin ? (
              <SliderInput
                label="Tasa de Interés Anual (Admin)"
                value={rate}
                min={0}
                max={30}
                step={0.1}
                onChange={onRateChange}
                suffix="%"
                color={color}
                marks={['0%', '10%', '20%', '30%']}
              />
            ) : (
              <>
                <div className="flex justify-between items-end mb-3">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                    Tasa de Interés Anual
                  </label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl md:text-3xl font-bold" style={{ color }}>
                      {parseFloat(rate).toFixed(1)}
                    </span>
                    <span className="text-lg font-bold" style={{ color }}>%</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <i className="fas fa-lock text-brand-blue text-xs"></i>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    La tasa es fija por producto y no puede ser modificada por el vendedor. 
                    Contacta a tu administrador para tasas preferenciales.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
            <i className="fas fa-user mr-1"></i> Género
          </label>
          <ToggleGroup
            options={[
              { value: 'male', label: 'Masculino', icon: 'fas fa-mars' },
              { value: 'female', label: 'Femenino', icon: 'fas fa-venus' },
            ]}
            value={gender}
            onChange={onGenderChange}
          />
        </div>
      </div>
    </>
  );
}

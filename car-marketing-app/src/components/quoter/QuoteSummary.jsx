import { formatMoney, splitMoneyParts } from '../../utils/formatters';
import { plans } from '../../data/plans';
import BenefitsList from './BenefitsList';

export default function QuoteSummary({
  planKey,
  calculatedData,
  currency,
  onOpenPDF,
  onSave,
  isEditing = false,
}) {
  const config = plans[planKey];
  if (!config || !calculatedData.monthlyPayment) return null;

  const { integer: monthlyInt, decimals: monthlyCents } = splitMoneyParts(
    calculatedData.monthlyPayment
  );
  const currencySymbol = currency === 'USD' ? 'USD' : 'MXN';

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5">
      {/* Header */}
      <div className="bg-slate-50 p-6 md:p-8 border-b border-slate-100 relative">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <i className="fas fa-file-invoice-dollar fa-5x text-brand-blue"></i>
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-brand-blue text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                Pre-Cotización
              </div>
              {isEditing && (
                <div className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-1 rounded border border-amber-100">
                  <i className="fas fa-edit mr-1"></i>Editando
                </div>
              )}
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-brand-dark mb-1">
            {config.title}
          </h3>
          <p className="text-sm text-slate-500">
            Resumen estimado de inversión
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 space-y-6 md:space-y-8">
        {/* Monthly Payment */}
        <div className="text-center bg-brand-light/30 rounded-2xl p-5 md:p-6 border border-brand-light">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">
            {config.isLeasing ? 'Renta Mensual Estimada' : 'Pago Mensual Estimado'}
          </p>
          <div className="flex items-baseline justify-center">
            <span className="text-xl md:text-2xl mr-1 font-medium opacity-40">$</span>
            <span className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-brand-blue">
              {monthlyInt}
            </span>
            <span className="text-lg md:text-xl ml-1 text-slate-400 font-bold">
              .{monthlyCents}
            </span>
          </div>
          <p className="text-xs text-brand-blue mt-2 font-medium bg-white inline-block px-3 py-1 rounded-full border border-blue-100 shadow-sm">
            IVA Incluido
          </p>
        </div>

        {/* Rate & CAT */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">
              Tasa Anual
            </p>
            <p className="text-lg font-bold text-brand-blue">
              {calculatedData.rate}%
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">
              CAT
            </p>
            <p className="text-lg font-bold text-green-600">
              {calculatedData.cat}%
            </p>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="space-y-4 px-1 md:px-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500 text-sm">
              {config.isLeasing ? '1er Pago / Renta' : '1er Pago / Enganche'}
            </span>
            <span className="text-brand-dark font-semibold text-base md:text-lg">
              {formatMoney(
                config.isLeasing ? calculatedData.monthlyPayment : calculatedData.downPaymentAmount,
                currency
              )}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500 text-sm">
              Comisión x Apertura
            </span>
            <span className="text-slate-700 font-medium">
              {formatMoney(calculatedData.comision, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500 text-sm">Seguro (Contado)</span>
            <span className="text-slate-700 font-medium">
              {formatMoney(calculatedData.seguro, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between pb-1">
            <span className="text-slate-500 text-sm">
              Lo Jack (GPS) <i className="fas fa-check-circle text-xs text-green-500 ml-1"></i>
            </span>
            <span className="text-slate-700 font-medium">
              {formatMoney(calculatedData.lojack, currency)}
            </span>
          </div>

          {calculatedData.totalScheduled > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-green-600 text-sm font-medium">
                <i className="fas fa-calendar-check mr-1"></i>Abonos Programados
              </span>
              <span className="text-green-600 font-semibold">
                -{formatMoney(calculatedData.totalScheduled, currency)}
              </span>
            </div>
          )}

          {/* Total Initial - Dark Box */}
          <div className="bg-slate-900 rounded-xl p-4 md:p-5 flex justify-between items-center mt-4 shadow-lg">
            <div>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                Inversión Inicial Total
              </p>
              <p className="text-slate-500 text-[10px]">(Aprox.)</p>
            </div>
            <span className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {formatMoney(calculatedData.totalInitial, currency)}
            </span>
          </div>
        </div>

        {/* Benefits */}
        <BenefitsList planKey={planKey} />

        {/* Actions */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onSave}
              className="bg-slate-800 text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:bg-slate-700 transition-all duration-300 transform hover:-translate-y-0.5 flex justify-center items-center gap-2 text-xs md:text-sm"
            >
              <i className={`fas ${isEditing ? 'fa-sync-alt' : 'fa-save'}`}></i>
              {isEditing ? 'Actualizar' : 'Guardar'}
            </button>
            <button
              onClick={onOpenPDF}
              className="bg-brand-blue text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:bg-blue-600 transition-all duration-300 transform hover:-translate-y-0.5 flex justify-center items-center gap-2 text-xs md:text-sm"
            >
              <i className="fas fa-file-pdf"></i> PDF
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400">
            <i className="fas fa-lock mr-1"></i> Sujeto a aprobación de crédito.
          </p>
        </div>
      </div>
    </div>
  );
}

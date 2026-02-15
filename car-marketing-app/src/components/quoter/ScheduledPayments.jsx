import { formatPriceInput, parsePrice, formatMoney } from '../../utils/formatters';

export default function ScheduledPayments({ payments, onChange }) {
  const addRow = () => {
    onChange([...payments, { id: Date.now(), date: '', amount: '' }]);
  };

  const removeRow = (id) => {
    onChange(payments.filter((p) => p.id !== id));
  };

  const updateRow = (id, field, value) => {
    onChange(
      payments.map((p) =>
        p.id === id ? { ...p, [field]: field === 'amount' ? formatPriceInput(value) : value } : p
      )
    );
  };

  const total = payments.reduce((sum, p) => sum + parsePrice(p.amount), 0);

  return (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
        <i className="fas fa-calendar-plus mr-1"></i> Pagos Programados (Abonos a Capital)
      </label>

      <div className="space-y-2 mb-3">
        {payments.map((payment) => (
          <div key={payment.id} className="flex gap-2 items-center">
            <div className="relative w-1/2">
              <input
                type="date"
                value={payment.date}
                onChange={(e) => updateRow(payment.id, 'date', e.target.value)}
                className="input-clean w-full rounded-xl py-2 px-3 text-xs font-medium text-slate-600 focus:outline-none"
              />
            </div>
            <div className="relative w-1/2">
              <span className="absolute left-3 top-2 text-slate-400 text-xs">$</span>
              <input
                type="text"
                value={payment.amount}
                onChange={(e) => updateRow(payment.id, 'amount', e.target.value)}
                placeholder="0.00"
                className="input-clean w-full rounded-xl py-2 pl-6 pr-2 text-xs font-bold text-brand-dark focus:outline-none"
              />
            </div>
            <button
              onClick={() => removeRow(payment.id)}
              className="text-slate-400 hover:text-red-500 px-1 transition-colors"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:border-brand-blue hover:text-brand-blue transition-all"
      >
        <i className="fas fa-plus mr-1"></i> Agregar Pago Programado
      </button>

      {total > 0 && (
        <div className="mt-3 p-3 bg-blue-50 rounded-xl text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-500">Total Abonos:</span>
            <span className="font-bold text-brand-blue">{formatMoney(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

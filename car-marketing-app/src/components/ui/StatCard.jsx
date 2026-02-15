export default function StatCard({ label, value, change, changeType = 'up', borderColor = 'border-brand-blue' }) {
  return (
    <div className={`glass-panel rounded-2xl p-5 border-l-4 ${borderColor}`}>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-bold text-brand-dark">{value}</h3>
        {change !== undefined && (
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              changeType === 'up'
                ? 'text-green-500 bg-green-50'
                : changeType === 'down'
                ? 'text-red-500 bg-red-50'
                : 'text-slate-400 bg-slate-50'
            }`}
          >
            {changeType === 'up' && <i className="fas fa-arrow-up mr-1"></i>}
            {changeType === 'down' && <i className="fas fa-arrow-down mr-1"></i>}
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ToggleGroup({ options, value, onChange, size = 'md' }) {
  const sizeClasses = size === 'sm'
    ? 'py-1.5 text-xs'
    : 'py-2.5 px-4 text-sm';

  return (
    <div className="flex bg-slate-100 rounded-2xl p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded-xl font-bold transition-all ${sizeClasses} ${
            value === opt.value
              ? 'shadow-sm bg-white text-brand-blue'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {opt.icon && <i className={`${opt.icon} mr-1.5`}></i>}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

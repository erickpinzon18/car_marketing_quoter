export default function SliderInput({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  displayValue,
  suffix = '',
  color = 'var(--color-brand-blue)',
  marks = [],
  hideLabel = false,
}) {
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <div>
      {!hideLabel && (
        <div className="flex justify-between items-end mb-4">
          <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            {label}
          </label>
          <div className="flex items-center gap-1">
            <span className="text-2xl md:text-3xl font-bold" style={{ color }}>
              {displayValue ?? value}
            </span>
            {suffix && (
              <span className="text-lg font-bold" style={{ color }}>
                {suffix}
              </span>
            )}
          </div>
        </div>
      )}
      <div className="relative h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full z-20 focus:outline-none"
          style={{ color }}
        />
        <div className="absolute w-full h-2 bg-slate-100 rounded-full z-10 border border-slate-200"></div>
        <div
          className="absolute h-2 rounded-full z-10"
          style={{ width: `${progress}%`, backgroundColor: color }}
        ></div>
      </div>
      {marks.length > 0 && (
        <div className="flex justify-between text-xs font-semibold text-slate-400 mt-3 px-1">
          {marks.map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      )}
    </div>
  );
}

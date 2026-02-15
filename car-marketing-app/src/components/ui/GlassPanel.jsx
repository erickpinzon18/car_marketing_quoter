export default function GlassPanel({ children, className = '' }) {
  return (
    <div className={`glass-panel rounded-3xl p-6 md:p-8 fade-in ${className}`}>
      {children}
    </div>
  );
}

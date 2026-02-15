import StatCard from '../ui/StatCard';

export default function StatsGrid({ quotes }) {
  const totalQuotes = quotes.length;
  const totalValue = quotes.reduce(
    (sum, q) => sum + (q.financials?.totalInitial || 0),
    0
  );
  const approvedCount = quotes.filter((q) => q.status === 'approved').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <StatCard
        label="Cotizaciones"
        value={totalQuotes}
        change="+12%"
        changeType="up"
        borderColor="border-brand-blue"
      />
      <StatCard
        label="Valor Total"
        value={`$${(totalValue / 1000).toFixed(0)}K`}
        change="+8%"
        changeType="up"
        borderColor="border-green-500"
      />
      <StatCard
        label="Aprobadas"
        value={approvedCount}
        change={`${totalQuotes ? ((approvedCount / totalQuotes) * 100).toFixed(0) : 0}%`}
        changeType="up"
        borderColor="border-brand-accent"
      />
    </div>
  );
}

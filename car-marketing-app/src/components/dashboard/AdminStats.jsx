import { useMemo } from 'react';
import { useQuotes } from '../../hooks/useQuotes';
import { useStores } from '../../hooks/useStores';
import { useUsers } from '../../hooks/useUsers';
import { formatMoney } from '../../utils/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminStats() {
  const { quotes, loading: quotesLoading } = useQuotes(null, 'admin');
  const { stores, loading: storesLoading } = useStores();
  const { users, loading: usersLoading } = useUsers();

  const loading = quotesLoading || storesLoading || usersLoading;

  // Calculate stats from real Firestore data
  const storeStats = useMemo(() => {
    if (!stores.length) return [];
    return stores.map((store) => {
      const storeQuotes = quotes.filter((q) => q.storeId === store.id);
      const totalAmount = storeQuotes.reduce((sum, q) => {
        const price = q.vehicle?.price
          ? (typeof q.vehicle.price === 'string'
            ? parseFloat(q.vehicle.price.replace(/,/g, '')) || 0
            : q.vehicle.price)
          : 0;
        return sum + price;
      }, 0);
      return {
        id: store.id,
        name: store.name,
        sales: totalAmount,
        quotes: storeQuotes.length,
        active: storeQuotes.filter((q) => q.status === 'draft' || q.status === 'active').length,
        conversion: storeQuotes.length > 0
          ? Math.round((storeQuotes.filter((q) => q.status === 'closed').length / storeQuotes.length) * 100)
          : 0,
      };
    });
  }, [stores, quotes]);

  // Vendor leaderboard from real data
  const vendorLeaderboard = useMemo(() => {
    if (!users.length || !quotes.length) return [];
    const vendors = users.filter((u) => u.role === 'vendor');
    const leaderboard = vendors.map((vendor) => {
      const vendorQuotes = quotes.filter((q) => q.userId === vendor.id);
      const totalAmount = vendorQuotes.reduce((sum, q) => {
        const price = q.vehicle?.price
          ? (typeof q.vehicle.price === 'string'
            ? parseFloat(q.vehicle.price.replace(/,/g, '')) || 0
            : q.vehicle.price)
          : 0;
        return sum + price;
      }, 0);
      return {
        name: vendor.name,
        storeId: vendor.storeId,
        amount: totalAmount,
        deals: vendorQuotes.length,
      };
    });
    return leaderboard.sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [users, quotes]);

  const totalSales = useMemo(() => storeStats.reduce((a, b) => a + b.sales, 0), [storeStats]);
  const totalQuotes = useMemo(() => storeStats.reduce((a, b) => a + b.quotes, 0), [storeStats]);

  // Stores map for vendor leaderboard display
  const storesMap = stores.reduce((acc, s) => { acc[s.id] = s; return acc; }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-slate-500 text-sm">Cargando estadísticas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
          <div className="relative z-10">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Monto Cotizado Total</p>
            <h3 className="text-3xl font-bold text-brand-dark">{formatMoney(totalSales)}</h3>
            <p className="text-slate-400 text-xs font-bold mt-2 flex items-center">
              <i className="fas fa-chart-bar mr-1"></i> Todas las sucursales
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
          <div className="relative z-10">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Cotizaciones Totales</p>
            <h3 className="text-3xl font-bold text-brand-dark">{totalQuotes}</h3>
            <p className="text-emerald-500 text-xs font-bold mt-2 flex items-center">
              <i className="fas fa-check mr-1"></i> {stores.length} sucursales activas
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Store Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-brand-dark mb-6">Desempeño por Sucursal</h3>
          {storeStats.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={storeStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(value) => `$${value/1000000}M`} />
                  <Tooltip 
                    cursor={{ fill: '#F1F5F9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => formatMoney(value)}
                  />
                  <Bar dataKey="sales" fill="#0052CC" radius={[6, 6, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
              No hay datos suficientes para mostrar el gráfico
            </div>
          )}
        </div>

        {/* Top Vendors Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-brand-dark mb-6">Top Vendedores</h3>
          {vendorLeaderboard.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="pb-3 text-left font-bold uppercase text-xs">Vendedor</th>
                    <th className="pb-3 text-left font-bold uppercase text-xs">Sucursal</th>
                    <th className="pb-3 text-center font-bold uppercase text-xs">Cotizaciones</th>
                    <th className="pb-3 text-right font-bold uppercase text-xs">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorLeaderboard.map((vendor, i) => (
                    <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-bold text-brand-dark flex items-center gap-2">
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold ${i < 3 ? 'bg-amber-400' : 'bg-slate-300'}`}>
                            {i + 1}
                          </div>
                          {vendor.name}
                      </td>
                       <td className="py-3 text-slate-500 text-xs">
                        {storesMap[vendor.storeId]?.name || 'N/A'}
                      </td>
                      <td className="py-3 text-center font-bold text-slate-600">{vendor.deals}</td>
                      <td className="py-3 text-right font-bold text-brand-blue">{formatMoney(vendor.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm">
              No hay datos de vendedores aún
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

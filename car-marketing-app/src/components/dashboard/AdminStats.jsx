import { useMemo } from 'react';
import { STORES } from '../../data/users';
import { formatMoney } from '../../utils/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Simulated Data
const STORE_STATS = [
  { id: 'store_001', name: 'Sucursal Polanco', sales: 4500000, quotes: 120, active: 45, conversion: 37 },
  { id: 'store_002', name: 'Sucursal Satélite', sales: 3200000, quotes: 95, active: 32, conversion: 33 },
];

const VENDOR_LEADERBOARD = [
  { name: 'Vendedor Estrella', store: 'store_001', amount: 1850000, deals: 8 },
  { name: 'Roberto Gómez', store: 'store_002', amount: 1450000, deals: 6 },
  { name: 'Ana Torres', store: 'store_001', amount: 1200000, deals: 5 },
  { name: 'Carlos Ruíz', store: 'store_002', amount: 980000, deals: 4 },
  { name: 'Vendedor Novato', store: 'store_001', amount: 450000, deals: 2 },
];

const COLORS = ['#0052CC', '#10B981', '#F59E0B', '#EF4444'];

export default function AdminStats() {
  
  const totalSales = useMemo(() => STORE_STATS.reduce((a, b) => a + b.sales, 0), []);
  const totalQuotes = useMemo(() => STORE_STATS.reduce((a, b) => a + b.quotes, 0), []);
  const avgConversion = useMemo(() => Math.round(STORE_STATS.reduce((a, b) => a + b.conversion, 0) / STORE_STATS.length), []);

  return (
    <div className="space-y-6">
      {/* Global KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
          <div className="relative z-10">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Monto Cotizado (Mes)</p>
            <h3 className="text-3xl font-bold text-brand-dark">{formatMoney(totalSales)}</h3>
            <p className="text-green-500 text-xs font-bold mt-2 flex items-center">
              <i className="fas fa-arrow-up mr-1"></i> +12% vs mes anterior
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
          <div className="relative z-10">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Cotizaciones Activas</p>
            <h3 className="text-3xl font-bold text-brand-dark">{totalQuotes}</h3>
            <p className="text-emerald-500 text-xs font-bold mt-2 flex items-center">
              <i className="fas fa-check mr-1"></i> 65% requieren seguimiento
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Store Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-brand-dark mb-6">Desempeño por Sucursal</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STORE_STATS} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
        </div>

        {/* Top Vendors Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-brand-dark mb-6">Top Vendedores</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="pb-3 text-left font-bold uppercase text-xs">Vendedor</th>
                  <th className="pb-3 text-left font-bold uppercase text-xs">Sucursal</th>
                  <th className="pb-3 text-center font-bold uppercase text-xs">Cierres</th>
                  <th className="pb-3 text-right font-bold uppercase text-xs">Monto</th>
                </tr>
              </thead>
              <tbody>
                {VENDOR_LEADERBOARD.map((vendor, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-bold text-brand-dark flex items-center gap-2">
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold ${i < 3 ? 'bg-amber-400' : 'bg-slate-300'}`}>
                          {i + 1}
                        </div>
                        {vendor.name}
                    </td>
                     <td className="py-3 text-slate-500 text-xs">
                      {STORES[vendor.store]?.name || vendor.store}
                    </td>
                    <td className="py-3 text-center font-bold text-slate-600">{vendor.deals}</td>
                    <td className="py-3 text-right font-bold text-brand-blue">{formatMoney(vendor.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

import { formatMoney } from '../../utils/formatters';
import PlanBadge from '../ui/PlanBadge';
import { USERS } from '../../data/users';

export default function CRMTable({ quotes, loading, onClientClick, showVendor = false }) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-400 text-sm">Cargando cotizaciones...</p>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-inbox text-4xl text-slate-200 mb-3"></i>
        <p className="text-slate-400">No hay cotizaciones registradas.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase">Cliente</th>
            {showVendor && (
              <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase">Vendedor</th>
            )}
            <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase">Vehículo</th>
            <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase">Fecha</th>
            <th className="text-center px-6 py-3 text-xs font-bold text-slate-400 uppercase">Plan</th>
            <th className="text-center px-6 py-3 text-xs font-bold text-slate-400 uppercase">Total</th>
            <th className="text-right px-6 py-3 text-xs font-bold text-slate-400 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((q, i) => {
            const dateStr = new Date(q.date).toLocaleDateString('es-MX', {
              day: 'numeric', month: 'short', year: 'numeric',
            });

            const vendorName = USERS.find(u => u.id === q.user)?.name || 'Desconocido';

            const initials = q.client?.name
              ? q.client.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
              : 'CM';

            const phoneLink = q.client?.phone
              ? `https://wa.me/${q.client.phone.replace(/\D/g, '')}?text=Hola ${encodeURIComponent(q.client.name || '')}, te envío tu cotización de ${encodeURIComponent(q.vehicle?.model || '')}`
              : '#';

            return (
              <tr key={q.id || i} className="hover:bg-slate-50 transition-colors group border-b border-slate-50">
                <td className="px-6 py-4">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => onClientClick?.(q.client)}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs border border-slate-200 group-hover:border-brand-blue/30 group-hover:text-brand-blue transition-colors">
                      {initials}
                    </div>
                    <div>
                      <div className="font-bold text-brand-dark group-hover:text-brand-blue transition-colors">{q.client?.name || 'Cliente'}</div>
                      <div className="text-xs text-slate-400">{q.client?.email || 'Sin correo'}</div>
                    </div>
                  </div>
                </td>
                {showVendor && (
                  <td className="px-6 py-4 text-xs font-bold text-brand-blue">
                    {vendorName}
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-700">{q.vehicle?.model}</div>
                  <div className="text-xs text-slate-400">{q.vehicle?.year} • {q.vehicle?.brand}</div>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">{dateStr}</td>
                <td className="px-6 py-4 text-center">
                  <PlanBadge planId={q.plan?.id} planName={q.plan?.name} />
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="font-bold text-slate-700">{formatMoney(q.financials?.totalInitial || 0)}</div>
                  <div className="text-[10px] text-slate-400 font-normal">Inicial</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onClientClick?.(q.client)}
                    className="text-slate-400 hover:text-brand-blue transition-colors px-2"
                    title="Ver Detalles"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <a
                    href={phoneLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-green-500 transition-colors px-2"
                    title="Contactar WhatsApp"
                  >
                    <i className="fab fa-whatsapp"></i>
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

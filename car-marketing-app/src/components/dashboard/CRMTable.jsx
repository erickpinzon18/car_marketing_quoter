import { formatMoney } from '../../utils/formatters';

export default function CRMTable({ clients, loading, onClientClick, isAdmin, onUpdateQuoteStatus }) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-400 text-sm">Cargando directorio de clientes...</p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-users text-4xl text-slate-200 mb-3"></i>
        <p className="text-slate-400">No hay clientes registrados en el directorio.</p>
      </div>
    );
  }

  const statusConfig = {
    draft: { label: 'Borrador', color: 'bg-slate-100 text-slate-500', icon: 'fa-file-alt' },
    pending: { label: 'Pendiente', color: 'bg-yellow-50 text-yellow-600', icon: 'fa-clock' },
    negotiation: { label: 'Negociación', color: 'bg-amber-50 text-amber-600', icon: 'fa-handshake' },
    approved: { label: 'Aprobada', color: 'bg-green-50 text-green-600', icon: 'fa-check-circle' },
    rejected: { label: 'Rechazada', color: 'bg-red-50 text-red-600', icon: 'fa-times-circle' },
    lost: { label: 'Perdida', color: 'bg-rose-50 text-rose-500', icon: 'fa-ban' },
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase">Cliente</th>
            <th className="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase">Vehículo de Interés</th>
            <th className="text-center px-6 py-3 text-xs font-bold text-slate-400 uppercase">Última Cotización</th>
            <th className="text-center px-6 py-3 text-xs font-bold text-slate-400 uppercase">Estado</th>
            <th className="text-right px-6 py-3 text-xs font-bold text-slate-400 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c, i) => {
            const initials = c.name
              ? c.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
              : 'CM';

            const phoneLink = c.phone
              ? `https://wa.me/${c.phone.replace(/\D/g, '')}?text=Hola ${encodeURIComponent(c.name || '')}`
              : '#';

            // Extract latest quote
            const lastQuote = c.quotes?.length > 0 ? c.quotes[0] : null;
            const quoteCount = c.quotes?.length || 0;

            const st = lastQuote ? (statusConfig[lastQuote.status] || statusConfig.draft) : null;

            return (
              <tr key={c.id || i} className="hover:bg-slate-50 transition-colors group border-b border-slate-50">
                <td className="px-6 py-4">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => onClientClick?.(c)}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs border border-slate-200 group-hover:border-brand-blue/30 group-hover:text-brand-blue transition-colors">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-brand-dark group-hover:text-brand-blue transition-colors">{c.name || 'Cliente sin nombre'}</div>
                        {c.gender && (
                          <i className={`fas ${c.gender === 'male' ? 'fa-mars text-blue-400' : 'fa-venus text-pink-400'} text-[10px]`}></i>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {c.phone || 'Sin tel'} • {quoteCount} {quoteCount === 1 ? 'cotización' : 'cotizaciones'}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  {lastQuote?.vehicle ? (
                    <>
                      <div className="font-medium text-slate-700">
                        {lastQuote.vehicle.model?.startsWith(lastQuote.vehicle.brand) ? lastQuote.vehicle.model : `${lastQuote.vehicle.brand} ${lastQuote.vehicle.model}`}
                      </div>
                      <div className="text-xs text-slate-400">{lastQuote.vehicle.year} • {lastQuote.vehicle.type === 'new' || lastQuote.vehicle.condition === 'new' ? 'Nuevo' : 'Seminuevo'}</div>
                    </>
                  ) : (
                    <span className="text-slate-400 text-xs italic">Aún sin cotizar</span>
                  )}
                </td>
                
                <td className="px-6 py-4 text-center">
                  {lastQuote ? (
                    <div className="font-bold text-brand-blue">{formatMoney(lastQuote.financials?.totalInitial || 0)}</div>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  {st ? (
                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${st.color}`}>
                       <i className={`fas ${st.icon} mr-1`}></i>
                       {st.label}
                     </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">
                      Sin estado
                    </span>
                  )}
                </td>
                
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onClientClick?.(c)}
                      className="text-slate-400 hover:text-brand-blue transition-colors px-2"
                      title="Ver Detalles"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    {c.phone && (
                      <a
                        href={phoneLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-green-500 transition-colors px-2"
                        title="Contactar WhatsApp"
                      >
                        <i className="fab fa-whatsapp"></i>
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

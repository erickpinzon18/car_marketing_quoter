import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatMoney } from '../../utils/formatters';
import PlanBadge from '../ui/PlanBadge';
import PDFModal from '../pdf/PDFModal';
import PDFContent from '../pdf/PDFContent';

export default function ClientDetailModal({ client, quotes, isOpen, onClose }) {
  const navigate = useNavigate();
  const pdfRef = useRef(null);
  const [pdfQuote, setPdfQuote] = useState(null);

  if (!isOpen || !client) return null;

  const initials = client.name
    ? client.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'CM';

  const phoneClean = client.phone?.replace(/\D/g, '');
  const waLink = phoneClean
    ? `https://wa.me/${phoneClean}?text=Hola ${encodeURIComponent(client.name)}`
    : null;

  const totalInvested = quotes.reduce((s, q) => s + (q.financials?.totalInitial || 0), 0);
  const totalMonthly = quotes.reduce((s, q) => s + (q.financials?.monthlyPayment || 0), 0);

  const statusConfig = {
    draft: { label: 'Borrador', color: 'bg-slate-100 text-slate-500', icon: 'fa-file-alt' },
    negotiation: { label: 'Negociación', color: 'bg-amber-50 text-amber-600', icon: 'fa-handshake' },
    approved: { label: 'Aprobada', color: 'bg-green-50 text-green-600', icon: 'fa-check-circle' },
    lost: { label: 'Perdida', color: 'bg-red-50 text-red-500', icon: 'fa-times-circle' },
  };

  const handleEdit = (quote) => {
    onClose();
    navigate('/quoter', { state: { quote } });
  };

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    const html2pdf = (await import('html2pdf.js')).default;
    const q = pdfQuote;
    html2pdf()
      .from(pdfRef.current)
      .set({
        margin: [10, 10, 10, 10],
        filename: `Cotizacion_${q.client?.name || 'Cliente'}_${q.plan?.name || 'Plan'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .save();
  };

  return (
    <>
      {/* Full-screen backdrop — blurs everything including navbar */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Card */}
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-modal-pop"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-blue to-blue-600 text-white p-6 relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <i className="fas fa-times text-sm"></i>
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold backdrop-blur-sm border border-white/30">
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold">{client.name}</h2>
                <p className="text-white/70 text-sm">{quotes.length} cotización{quotes.length !== 1 ? 'es' : ''}</p>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {/* Contact Info + Quick Actions */}
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Información de Contacto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {client.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
                      <i className="fas fa-envelope text-xs"></i>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Email</p>
                      <a href={`mailto:${client.email}`} className="text-sm font-medium text-brand-dark hover:text-brand-blue transition-colors">
                        {client.email}
                      </a>
                    </div>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 text-green-500 flex items-center justify-center">
                      <i className="fas fa-phone text-xs"></i>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Teléfono</p>
                      <a href={`tel:${client.phone}`} className="text-sm font-medium text-brand-dark hover:text-brand-blue transition-colors">
                        {client.phone}
                      </a>
                    </div>
                  </div>
                )}
                {client.rfc && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-500 flex items-center justify-center">
                      <i className="fas fa-id-card text-xs"></i>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">RFC</p>
                      <p className="text-sm font-medium text-brand-dark">{client.rfc}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-4">
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-green-500 text-white font-bold text-xs text-center hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fab fa-whatsapp"></i> WhatsApp
                  </a>
                )}
                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    className="flex-1 py-2.5 rounded-xl bg-brand-blue text-white font-bold text-xs text-center hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-envelope"></i> Email
                  </a>
                )}
                {client.phone && (
                  <a
                    href={`tel:${client.phone}`}
                    className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-xs text-center hover:border-brand-blue hover:text-brand-blue transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-phone"></i> Llamar
                  </a>
                )}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Resumen
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-brand-blue">{quotes.length}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Cotizaciones</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-green-600">{formatMoney(totalInvested)}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Inicial</p>
                </div>
                <div className="bg-violet-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-violet-600">{formatMoney(totalMonthly)}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Mensualidades</p>
                </div>
              </div>
            </div>

            {/* Quote List */}
            <div className="p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Historial de Cotizaciones
              </h3>
              <div className="space-y-3">
                {quotes.map((q, i) => {
                  const st = statusConfig[q.status] || statusConfig.draft;
                  const dateStr = new Date(q.date).toLocaleDateString('es-MX', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  });

                  return (
                    <div
                      key={q.id || i}
                      className="border border-slate-100 rounded-2xl p-4 hover:border-brand-blue/30 hover:shadow-sm transition-all group"
                    >
                      {/* Quote header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <PlanBadge planId={q.plan?.id} planName={q.plan?.name} />
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.color}`}>
                            <i className={`fas ${st.icon} mr-1`}></i>
                            {st.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{dateStr}</span>
                      </div>

                      {/* Vehicle */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                          <i className={`fas ${q.vehicle?.type === 'moto' ? 'fa-motorcycle' : 'fa-car'} text-xs`}></i>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-dark">
                            {q.vehicle?.model?.startsWith(q.vehicle?.brand) ? q.vehicle.model : `${q.vehicle?.brand} ${q.vehicle?.model}`}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {q.vehicle?.year} • {q.vehicle?.type === 'new' || q.vehicle?.condition === 'new' ? 'Nuevo' : 'Seminuevo'}
                          </p>
                        </div>
                      </div>

                      {/* Financial details */}
                      <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Mensualidad</p>
                          <p className="text-sm font-bold text-brand-dark">
                            {formatMoney(q.financials?.monthlyPayment || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Inicial</p>
                          <p className="text-sm font-bold text-brand-dark">
                            {formatMoney(q.financials?.totalInitial || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Plazo</p>
                          <p className="text-sm font-bold text-brand-dark">
                            {q.plan?.term || '—'} <span className="text-[10px] text-slate-400">meses</span>
                          </p>
                        </div>
                      </div>

                      {/* Rate & ID */}
                      <div className="flex items-center justify-between mt-2 px-1">
                        <span className="text-[10px] text-slate-400">
                          Tasa: <span className="font-bold">{q.plan?.rate}%</span> • {q.plan?.currency}
                        </span>
                        <span className="text-[10px] text-slate-300 font-mono">{q.id}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50">
                        <button
                          onClick={() => setPdfQuote(q)}
                          className="flex-1 py-2 rounded-xl bg-brand-blue text-white font-bold text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-1.5"
                        >
                          <i className="fas fa-file-pdf"></i> Descargar PDF
                        </button>
                        <button
                          onClick={() => handleEdit(q)}
                          className="flex-1 py-2 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-xs hover:border-brand-blue hover:text-brand-blue transition-all flex items-center justify-center gap-1.5"
                        >
                          <i className="fas fa-edit"></i> Editar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {pdfQuote && (
        <PDFModal
          isOpen={!!pdfQuote}
          onClose={() => setPdfQuote(null)}
          onDownload={handleDownloadPDF}
        >
          <PDFContent
            ref={pdfRef}
            planKey={pdfQuote.plan?.id}
            clientData={pdfQuote.client}
            vehicleData={pdfQuote.vehicle}
            calculatedData={pdfQuote.financials}
            amortizationTable={pdfQuote.amortizationTable || []}
            currency={pdfQuote.plan?.currency || 'MXN'}
            method={pdfQuote.plan?.method || 'french'}
            scheduledPayments={pdfQuote.config?.scheduledPayments || []}
          />
        </PDFModal>
      )}
    </>
  );
}

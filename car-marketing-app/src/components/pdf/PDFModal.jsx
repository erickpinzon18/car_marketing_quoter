import { useRef, useEffect } from 'react';

export default function PDFModal({ isOpen, onClose, children, onDownload }) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-modal-pop z-10">
        {/* Sticky Header */}
        <div className="shrink-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center rounded-t-2xl">
          <h3 className="text-lg font-bold text-brand-dark">
            Vista Previa de Cotización
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={onDownload}
              className="bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm shadow-lg shadow-blue-500/30"
            >
              <i className="fas fa-download"></i> Descargar PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="bg-white shadow-sm ring-1 ring-slate-900/5 min-h-[500px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

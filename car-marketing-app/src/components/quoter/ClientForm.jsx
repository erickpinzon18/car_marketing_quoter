import { formatPriceInput } from '../../utils/formatters';

export default function ClientForm({ clientData, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...clientData, [field]: value });
  };

  return (
    <div className="flex items-center gap-4 mb-6 md:mb-8">
      <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-lg border border-blue-100">
        1
      </div>
      <h2 className="text-lg md:text-xl font-bold text-brand-dark">
        Datos del Cliente
      </h2>
    </div>
  );
}

export function ClientFormFields({ clientData, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...clientData, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
          <i className="fas fa-user mr-1 text-brand-blue"></i> Nombre Completo
        </label>
        <input
          type="text"
          value={clientData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Juan Pérez"
          className="input-clean w-full rounded-xl py-3 px-4 text-sm font-medium text-brand-dark focus:outline-none"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
          <i className="fas fa-phone mr-1 text-brand-blue"></i> Teléfono
        </label>
        <input
          type="tel"
          value={clientData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="55 1234 5678"
          className="input-clean w-full rounded-xl py-3 px-4 text-sm font-medium text-brand-dark focus:outline-none"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
          <i className="fas fa-envelope mr-1 text-brand-blue"></i> Email
        </label>
        <input
          type="email"
          value={clientData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="correo@email.com"
          className="input-clean w-full rounded-xl py-3 px-4 text-sm font-medium text-brand-dark focus:outline-none"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
          <i className="fas fa-id-card mr-1 text-brand-blue"></i> RFC (Opcional)
        </label>
        <input
          type="text"
          value={clientData.rfc || ''}
          onChange={(e) => handleChange('rfc', e.target.value)}
          placeholder="XAXX010101000"
          className="input-clean w-full rounded-xl py-3 px-4 text-sm font-medium text-brand-dark focus:outline-none"
        />
      </div>
    </div>
  );
}

import { formatPriceInput, parsePrice } from '../../utils/formatters';
import ToggleGroup from '../ui/ToggleGroup';

export default function VehicleForm({ vehicleData, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...vehicleData, [field]: value });
  };

  const handlePriceInput = (e) => {
    const formatted = formatPriceInput(e.target.value);
    handleChange('price', formatted);
  };

  const handleAccessoriesInput = (e) => {
    const formatted = formatPriceInput(e.target.value);
    handleChange('accessories', formatted);
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-lg border border-blue-100">
          2
        </div>
        <h2 className="text-lg md:text-xl font-bold text-brand-dark">
          Datos del Vehículo
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-6">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            <i className="fas fa-car mr-1 text-brand-blue"></i> Tipo
          </label>
          <ToggleGroup
            options={[
              { value: 'auto', label: 'Auto', icon: 'fas fa-car' },
              { value: 'suv', label: 'SUV', icon: 'fas fa-truck' },
              { value: 'pickup', label: 'Pickup', icon: 'fas fa-truck-pickup' },
              { value: 'moto', label: 'Moto', icon: 'fas fa-motorcycle' },
            ]}
            value={vehicleData.type}
            onChange={(v) => handleChange('type', v)}
            size="sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            Condición
          </label>
          <ToggleGroup
            options={[
              { value: 'new', label: 'Nuevo' },
              { value: 'semi', label: 'Seminuevo' },
            ]}
            value={vehicleData.condition}
            onChange={(v) => handleChange('condition', v)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-6">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            Marca
          </label>
          <input
            type="text"
            value={vehicleData.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            placeholder="Ej: Toyota"
            className="input-clean w-full rounded-xl py-3 px-4 text-sm font-medium text-brand-dark focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            Modelo
          </label>
          <input
            type="text"
            value={vehicleData.model}
            onChange={(e) => handleChange('model', e.target.value)}
            placeholder="Ej: Corolla"
            className="input-clean w-full rounded-xl py-3 px-4 text-sm font-medium text-brand-dark focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            Año
          </label>
          <input
            type="text"
            value={vehicleData.year}
            onChange={(e) => handleChange('year', e.target.value)}
            placeholder="2025"
            className="input-clean w-full rounded-xl py-3 px-4 text-sm font-medium text-brand-dark focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            <i className="fas fa-dollar-sign mr-1 text-brand-blue"></i> Precio del Vehículo
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
            <input
              type="text"
              value={vehicleData.price}
              onChange={handlePriceInput}
              placeholder="430,000.00"
              className="input-clean w-full rounded-xl py-3 pl-8 pr-4 text-sm font-bold text-brand-dark focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            Accesorios (Opcional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
            <input
              type="text"
              value={vehicleData.accessories}
              onChange={handleAccessoriesInput}
              placeholder="0.00"
              className="input-clean w-full rounded-xl py-3 pl-8 pr-4 text-sm font-bold text-brand-dark focus:outline-none"
            />
          </div>
        </div>
      </div>
    </>
  );
}

import { plans } from '../../data/plans';

export default function BenefitsList({ planKey }) {
  const config = plans[planKey];
  if (!config?.benefits) return null;

  return (
    <div
      className="p-4 rounded-2xl border space-y-2"
      style={{
        borderColor: config.color + '30',
        backgroundColor: config.color + '05',
      }}
    >
      <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">
        Beneficios del Plan
      </div>
      {config.benefits.map((benefit, i) => (
        <div key={i} className="flex items-start gap-2">
          <i
            className="fas fa-check-circle text-[10px] mt-0.5"
            style={{ color: config.color }}
          ></i>
          <span className="text-[10px] text-slate-600 leading-tight">{benefit}</span>
        </div>
      ))}
    </div>
  );
}

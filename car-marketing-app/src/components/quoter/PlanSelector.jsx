import { plans, planKeys } from '../../data/plans';

export default function PlanSelector({ currentPlan, onChange }) {
  return (
    <>
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-lg border border-blue-100">
          3
        </div>
        <h2 className="text-lg md:text-xl font-bold text-brand-dark">
          Selecciona tu Plan
        </h2>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 snap-x -mx-2 px-2 scrollbar-hide">
        {planKeys.map((key) => {
          const plan = plans[key];
          const isActive = currentPlan === key;

          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex-shrink-0 snap-start flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border ${
                isActive
                  ? 'text-white shadow-lg scale-[1.02]'
                  : 'bg-white/60 text-slate-500 hover:bg-white border-slate-100 hover:scale-[1.01]'
              }`}
              style={
                isActive
                  ? { backgroundColor: plan.color, borderColor: plan.color }
                  : {}
              }
            >
              <i className={plan.icon}></i>
              {plan.title}
            </button>
          );
        })}
      </div>

      <div
        className={`mt-4 p-4 rounded-2xl border ${plans[currentPlan].bgClass} ${plans[currentPlan].borderClass}`}
      >
        <p className="text-sm text-slate-600">{plans[currentPlan].desc}</p>
      </div>
    </>
  );
}

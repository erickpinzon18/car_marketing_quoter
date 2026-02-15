export default function PlanBadge({ planId, planName, color }) {
  let badgeColor = 'bg-blue-50 text-blue-600 border-blue-100';
  if (planId?.includes('pink')) badgeColor = 'bg-pink-50 text-pink-600 border-pink-100';
  if (planId?.includes('green')) badgeColor = 'bg-green-50 text-green-600 border-green-100';
  if (planId?.includes('moto')) badgeColor = 'bg-amber-50 text-amber-600 border-amber-100';
  if (planId?.includes('smart')) badgeColor = 'bg-indigo-50 text-indigo-600 border-indigo-100';
  if (planId?.includes('leasing') || planId?.includes('arrendamiento'))
    badgeColor = 'bg-violet-50 text-violet-600 border-violet-100';

  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-bold border ${badgeColor}`}
      style={color ? { color, borderColor: color + '30', backgroundColor: color + '10' } : {}}
    >
      {planName}
    </span>
  );
}

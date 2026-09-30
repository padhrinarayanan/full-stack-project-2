import { stagger } from "../utils/style";
import CountUp from "./CountUp";
import Icon from "./Icon";
import TiltCard from "./TiltCard";

export default function StatCard({
  label,
  value,
  decimals = 0,
  suffix = "",
  hint,
  icon,
  index = 0,
}: {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  hint?: string;
  icon: string;
  index?: number;
}) {
  return (
    <div className="rise" style={stagger(index)}>
      <TiltCard className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-500">{label}</span>
          <span className="tz grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <Icon name={icon} className="h-4 w-4" />
          </span>
        </div>
        <p className="tz mt-3 font-mono text-3xl font-semibold tracking-tight text-stone-900">
          <CountUp value={value} decimals={decimals} suffix={suffix} />
        </p>
        {hint && <p className="mt-1 truncate text-xs text-stone-500">{hint}</p>}
      </TiltCard>
    </div>
  );
}

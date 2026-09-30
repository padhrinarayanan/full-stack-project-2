import { useCountUp } from "../hooks/useCountUp";

export default function CountUp({
  value,
  decimals = 0,
  suffix = "",
  duration,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
}) {
  const v = useCountUp(value, duration);
  return (
    <span className="tabular-nums">
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}

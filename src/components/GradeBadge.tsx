import type { GradeLetter } from "../types";
import { cn } from "../utils/cn";

export const GRADE_TONE: Record<GradeLetter, { badge: string; bar: string }> = {
  "A+": { badge: "bg-emerald-100 text-emerald-800 ring-emerald-200", bar: "bg-emerald-600" },
  A: { badge: "bg-green-100 text-green-800 ring-green-200", bar: "bg-green-500" },
  B: { badge: "bg-sky-100 text-sky-800 ring-sky-200", bar: "bg-sky-500" },
  C: { badge: "bg-amber-100 text-amber-800 ring-amber-200", bar: "bg-amber-500" },
  D: { badge: "bg-orange-100 text-orange-800 ring-orange-200", bar: "bg-orange-500" },
  E: { badge: "bg-stone-200 text-stone-700 ring-stone-300", bar: "bg-stone-500" },
  F: { badge: "bg-rose-100 text-rose-800 ring-rose-200", bar: "bg-rose-500" },
};

export default function GradeBadge({
  grade,
  size = "md",
  animate = false,
}: {
  grade: GradeLetter;
  size?: "sm" | "md" | "lg";
  /** Plays a 3D flip-in; pair with key={grade} so it replays when the grade changes. */
  animate?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-mono font-semibold ring-1 ring-inset",
        GRADE_TONE[grade].badge,
        animate && "flip-in",
        size === "sm" && "min-w-8 px-1.5 py-0.5 text-xs",
        size === "md" && "min-w-10 px-2 py-1 text-sm",
        size === "lg" && "min-w-16 px-4 py-2 text-3xl shadow-lg"
      )}
    >
      {grade}
    </span>
  );
}

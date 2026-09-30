import { useState, type MouseEvent } from "react";
import { GRADE_SCALE, PASS_MARK, fmt, getGrade } from "../utils/grading";
import { cn } from "../utils/cn";
import { stagger } from "../utils/style";
import GradeBadge, { GRADE_TONE } from "../components/GradeBadge";
import type { GradeLetter } from "../types";

function rangeLabel(g: (typeof GRADE_SCALE)[number]) {
  if (g.grade === "A+") return "90 – 100";
  if (g.grade === "F") return "Below 40";
  return `${g.min} – ${Math.floor(g.max)}`;
}

function FlipCard({ g, index }: { g: (typeof GRADE_SCALE)[number]; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const tone = GRADE_TONE[g.grade as GradeLetter];

  const onClick = (e: MouseEvent) => {
    // mouse users flip on hover; touch + keyboard users flip on activation
    const type = (e.nativeEvent as PointerEvent).pointerType;
    if (type === "mouse") return;
    setFlipped((f) => !f);
  };

  return (
    <div className="rise" style={stagger(index)}>
      <button
        type="button"
        onClick={onClick}
        onPointerEnter={(e) => e.pointerType === "mouse" && setFlipped(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setFlipped(false)}
        onFocus={() => setFlipped(true)}
        onBlur={() => setFlipped(false)}
        aria-label={`Grade ${g.grade}: average ${rangeLabel(g)}, ${g.remark}`}
        className="flip-scene block h-36 w-full rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
      >
        <span className={cn("flip-card block", flipped && "is-flipped")}>
          <span
            className={cn(
              "flip-face flex flex-col items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white shadow-sm"
            )}
          >
            <span className={cn("h-1.5 w-10 rounded-full", tone.bar)} />
            <span className="font-mono text-5xl font-semibold tracking-tight text-stone-900">{g.grade}</span>
            <span className="text-xs text-stone-500">{g.remark}</span>
          </span>
          <span className="flip-face flip-back flex flex-col items-center justify-center gap-1 rounded-2xl bg-stone-900 p-3 text-center text-white shadow-lg">
            <GradeBadge grade={g.grade} />
            <span className="mt-2 font-mono text-lg font-semibold">{rangeLabel(g)}</span>
            <span className="text-xs text-stone-400">average marks</span>
          </span>
        </span>
      </button>
    </div>
  );
}

export default function ScaleView() {
  const [value, setValue] = useState("");
  const n = Number(value);
  const valid = value.trim() !== "" && !Number.isNaN(n) && n >= 0 && n <= 100;
  const out = valid ? getGrade(n) : null;

  const segments = [...GRADE_SCALE].reverse();

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="lg:col-span-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-stone-900">Grading scale</h2>
          <p className="text-sm text-stone-500">
            Grades come from the average of all subjects, each out of 100. Hover or tap a card to flip it.
          </p>

          {/* segmented 0-100 bar */}
          <div className="mt-5">
            <div className="flex h-4 overflow-hidden rounded-full">
              {segments.map((g, i) => {
                const width = g.grade === "F" ? 40 : 10;
                return (
                  <div
                    key={g.grade}
                    title={`${g.grade}: ${rangeLabel(g)}`}
                    className={cn("grow-x h-full border-r border-white/60 last:border-0", GRADE_TONE[g.grade].bar)}
                    style={{ ...stagger(i), width: `${width}%` }}
                  />
                );
              })}
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[11px] text-stone-400">
              <span>0</span>
              <span>40</span>
              <span>50</span>
              <span>60</span>
              <span>70</span>
              <span>80</span>
              <span>90</span>
              <span>100</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {GRADE_SCALE.map((g, i) => (
            <FlipCard key={g.grade} g={g} index={i + 1} />
          ))}
        </div>
      </section>

      <div className="space-y-6 lg:col-span-2">
        <section className="rise rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6" style={stagger(2)}>
          <h2 className="text-base font-semibold text-stone-900">Quick check</h2>
          <p className="text-sm text-stone-500">Type an average to see which grade it earns.</p>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="decimal"
            placeholder="e.g. 73.5"
            aria-label="Average to check"
            className="mt-4 w-full rounded-lg border border-stone-300 px-3 py-2.5 font-mono text-sm transition focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
          <div className="mt-4 flex h-20 items-center justify-between rounded-xl bg-stone-50 px-4">
            {out ? (
              <>
                <span className="text-sm text-stone-600">
                  {fmt(n)}% → {out.remark}
                </span>
                <GradeBadge key={out.grade} grade={out.grade} size="lg" animate />
              </>
            ) : (
              <span className="text-sm text-stone-400">
                {value.trim() === "" ? "Waiting for a number" : "Enter a value from 0 to 100"}
              </span>
            )}
          </div>
        </section>

        <section className="rise rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6" style={stagger(3)}>
          <h2 className="text-base font-semibold text-stone-900">How it's calculated</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-stone-600">
            <li>Total = sum of marks across all subjects.</li>
            <li>Average = total ÷ number of subjects.</li>
            <li>The grade comes from the average using the scale.</li>
            <li>A student passes with an average of {PASS_MARK} or more.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}

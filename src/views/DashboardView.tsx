import { useMemo } from "react";
import type { Student, ViewName } from "../types";
import { GRADE_ORDER, fmt, getGrade, resultOf } from "../utils/grading";
import { stagger } from "../utils/style";
import CountUp from "../components/CountUp";
import GradeBadge, { GRADE_TONE } from "../components/GradeBadge";
import HeroScene from "../components/HeroScene";
import StatCard from "../components/StatCard";
import TiltCard from "../components/TiltCard";

export default function DashboardView({
  students,
  onNavigate,
  onLoadSamples,
}: {
  students: Student[];
  onNavigate: (v: ViewName) => void;
  onLoadSamples: () => void;
}) {
  const stats = useMemo(() => {
    const rows = students.map((s) => ({ s, r: resultOf(s) }));
    const n = rows.length;
    const classAvg = n ? rows.reduce((a, x) => a + x.r.average, 0) / n : 0;
    const passed = rows.filter((x) => x.r.passed).length;
    const ranked = [...rows].sort((a, b) => b.r.average - a.r.average);
    const counts = GRADE_ORDER.map((g) => rows.filter((x) => x.r.grade === g).length);

    const bySubject = new Map<string, { name: string; sum: number; n: number }>();
    students.forEach((s) =>
      s.subjects.forEach((sub) => {
        const key = sub.name.toLowerCase();
        const cur = bySubject.get(key) ?? { name: sub.name, sum: 0, n: 0 };
        cur.sum += sub.marks;
        cur.n += 1;
        bySubject.set(key, cur);
      })
    );
    const subjects = [...bySubject.values()]
      .map((x) => ({ name: x.name, avg: x.sum / x.n, n: x.n }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 6);

    return { n, classAvg, passed, ranked, counts, subjects };
  }, [students]);

  if (stats.n === 0) {
    return (
      <TiltCard className="mx-auto max-w-md rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center">
        <p className="tz float-y font-mono text-5xl text-emerald-600/40">A+</p>
        <h2 className="tz mt-3 text-lg font-semibold text-stone-900">No students yet</h2>
        <p className="mt-1 text-sm text-stone-500">
          Enter marks for your first student, or start with a sample class.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={() => onNavigate("calculator")}
            className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800 active:scale-[0.98]"
          >
            Add a student
          </button>
          <button
            onClick={onLoadSamples}
            className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 active:scale-[0.98]"
          >
            Load sample data
          </button>
        </div>
      </TiltCard>
    );
  }

  const top = stats.ranked[0];
  const classGrade = getGrade(stats.classAvg);

  return (
    <div className="space-y-6">
      {/* ---------- 3D hero ---------- */}
      <section className="rise relative overflow-hidden rounded-3xl bg-stone-900 text-white shadow-xl shadow-stone-900/10">
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        <div className="relative grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <div className="z-10 flex flex-col justify-center p-7 sm:p-10 lg:py-14">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-200">
              <span className="pulse-dot h-2 w-2 rounded-full bg-emerald-400" />
              Live class snapshot
            </span>

            <p className="mt-6 text-sm text-stone-400">Class average</p>
            <div className="flex items-end gap-4">
              <p className="font-mono text-6xl font-semibold tracking-tight sm:text-7xl">
                <CountUp value={stats.classAvg} decimals={1} suffix="%" duration={1400} />
              </p>
              <div className="flex-none pb-2">
                <GradeBadge key={classGrade.grade} grade={classGrade.grade} size="lg" animate />
              </div>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-400">
              Across {stats.n} {stats.n === 1 ? "student" : "students"}, {stats.passed} passing. The 3D chart shows where
              everyone landed — move your cursor over it.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate("calculator")}
                className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-stone-950 shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-400 active:translate-y-0 active:scale-[0.98]"
              >
                Calculate a grade
              </button>
              <button
                onClick={() => onNavigate("records")}
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0 active:scale-[0.98]"
              >
                Browse records
              </button>
            </div>
          </div>

          <div className="relative h-72 sm:h-96 lg:h-auto lg:min-h-[440px]">
            <HeroScene counts={stats.counts} />
            <span className="pointer-events-none absolute bottom-3 left-5 text-[11px] uppercase tracking-widest text-stone-500">
              Grade distribution · 3D
            </span>
          </div>
        </div>
      </section>

      {/* ---------- stats ---------- */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard index={1} label="Students" value={stats.n} icon="users" hint="Across all classes" />
        <StatCard
          index={2}
          label="Class average"
          value={Number(stats.classAvg.toFixed(1))}
          decimals={1}
          suffix="%"
          icon="scale"
          hint="Mean of all averages"
        />
        <StatCard
          index={3}
          label="Pass rate"
          value={Math.round((stats.passed / stats.n) * 100)}
          suffix="%"
          icon="check"
          hint={`${stats.passed} of ${stats.n} passed`}
        />
        <StatCard
          index={4}
          label="Top score"
          value={Number(top.r.average.toFixed(1))}
          decimals={1}
          suffix="%"
          icon="trophy"
          hint={top.s.name}
        />
      </div>

      {/* ---------- details ---------- */}
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rise rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-3" style={stagger(5)}>
          <h2 className="text-base font-semibold text-stone-900">Subject averages</h2>
          <p className="text-sm text-stone-500">Strongest subjects first, across every student.</p>
          <ul className="mt-5 space-y-4">
            {stats.subjects.map((sub, i) => {
              const tone = GRADE_TONE[getGrade(sub.avg).grade];
              return (
                <li key={sub.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-stone-700">{sub.name}</span>
                    <span className="font-mono text-stone-900">{fmt(Number(sub.avg.toFixed(1)))}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className={`grow-x h-full rounded-full shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] ${tone.bar}`}
                      style={{ ...stagger(i), width: `${Math.min(sub.avg, 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rise rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2" style={stagger(6)}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-stone-900">Leaderboard</h2>
            <button onClick={() => onNavigate("records")} className="text-sm font-medium text-emerald-700 hover:underline">
              View all
            </button>
          </div>
          <ol className="mt-4 divide-y divide-stone-100">
            {stats.ranked.slice(0, 5).map(({ s, r }, i) => (
              <li
                key={s.id}
                className="rise -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-stone-50"
                style={stagger(i + 6)}
              >
                <span
                  className={`grid h-6 w-6 flex-none place-items-center rounded-full font-mono text-xs ${
                    i === 0 ? "bg-amber-100 text-amber-800" : "text-stone-400"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-900">{s.name}</p>
                  <p className="text-xs text-stone-500">Roll {s.roll}</p>
                </div>
                <span className="font-mono text-sm text-stone-700">{fmt(Number(r.average.toFixed(1)))}%</span>
                <GradeBadge grade={r.grade} size="sm" />
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { Student } from "../types";
import {
  DEFAULT_SUBJECTS,
  MAX_MARKS,
  calculate,
  fmt,
  hasErrors,
  uid,
  validateStudentForm,
  type FormRow,
} from "../utils/grading";
import { cn } from "../utils/cn";
import GradeBadge, { GRADE_TONE } from "./GradeBadge";
import Icon from "./Icon";
import TiltCard from "./TiltCard";
import { stagger } from "../utils/style";

type Payload = Omit<Student, "id" | "createdAt">;

const MAX_SUBJECTS = 10;

const inputCls = (invalid: boolean) =>
  cn(
    "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition focus:outline-none focus:ring-2",
    invalid
      ? "border-rose-400 focus:ring-rose-200"
      : "border-stone-300 focus:border-emerald-700 focus:ring-emerald-100"
  );

function Field({
  label,
  error,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-stone-700">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-xs text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default function StudentForm({
  editing,
  students,
  onSubmit,
  onCancel,
}: {
  editing: Student | null;
  students: Student[];
  onSubmit: (data: Payload) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [roll, setRoll] = useState(editing?.roll ?? "");
  const [className, setClassName] = useState(editing?.className ?? "");
  const [rows, setRows] = useState<FormRow[]>(
    editing
      ? editing.subjects.map((s) => ({ id: s.id, name: s.name, marks: String(s.marks) }))
      : DEFAULT_SUBJECTS.map((s) => ({ id: uid(), name: s, marks: "" }))
  );
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const others = useMemo(() => students.filter((s) => s.id !== editing?.id), [students, editing]);
  const errors = useMemo(
    () => validateStudentForm({ name, roll, className, rows }, others),
    [name, roll, className, rows, others]
  );

  const show = (key: string) => submitted || touched[key];
  const touch = (key: string) => setTouched((t) => ({ ...t, [key]: true }));

  // live preview uses only valid numeric rows
  const validRows = rows.filter(
    (r) => r.marks.trim() !== "" && !Number.isNaN(Number(r.marks)) && Number(r.marks) >= 0 && Number(r.marks) <= MAX_MARKS
  );
  const preview = calculate(validRows.map((r) => ({ marks: Number(r.marks) })));
  const hasPreview = validRows.length > 0;

  const updateRow = (id: string, patch: Partial<FormRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors(errors)) return;
    onSubmit({
      name: name.trim(),
      roll: roll.trim(),
      className: className.trim(),
      subjects: rows.map((r) => ({ id: r.id, name: r.name.trim(), marks: Number(r.marks) })),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm shadow-stone-900/[0.03] sm:p-6">
          <h2 className="text-base font-semibold text-stone-900">Student details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Full name" htmlFor="name" error={show("name") ? errors.name : undefined}>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => touch("name")}
                  placeholder="e.g. Ananya Rao"
                  className={inputCls(Boolean(show("name") && errors.name))}
                />
              </Field>
            </div>
            <Field label="Roll number" htmlFor="roll" error={show("roll") ? errors.roll : undefined}>
              <input
                id="roll"
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                onBlur={() => touch("roll")}
                placeholder="e.g. 107"
                className={cn(inputCls(Boolean(show("roll") && errors.roll)), "font-mono")}
              />
            </Field>
            <Field
              label="Class (optional)"
              htmlFor="className"
              error={show("className") ? errors.className : undefined}
            >
              <input
                id="className"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                onBlur={() => touch("className")}
                placeholder="e.g. 10-A"
                className={inputCls(Boolean(show("className") && errors.className))}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm shadow-stone-900/[0.03] sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-stone-900">Subject marks</h2>
              <p className="text-sm text-stone-500">Each subject is out of {MAX_MARKS}.</p>
            </div>
            <button
              type="button"
              disabled={rows.length >= MAX_SUBJECTS}
              onClick={() => setRows((p) => [...p, { id: uid(), name: "", marks: "" }])}
              className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="plus" className="h-4 w-4" />
              Add subject
            </button>
          </div>

          {errors.general && show("general") && (
            <p role="alert" className="mt-3 text-sm text-rose-600">
              {errors.general}
            </p>
          )}

          <div className="mt-5 hidden grid-cols-[1fr_96px_auto] gap-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-stone-400 sm:grid sm:gap-3">
            <span>Subject</span>
            <span className="text-right">Marks</span>
            <span className="w-8" />
          </div>
          <ul className="mt-2 space-y-3">
            {rows.map((row, i) => {
              const err = errors.subjects[row.id];
              const nameKey = `n-${row.id}`;
              const markKey = `m-${row.id}`;
              return (
                <li
                  key={row.id}
                  className="rise grid grid-cols-[1fr_96px_auto] items-start gap-2 sm:gap-3"
                  style={stagger(Math.min(i, 8))}
                >
                  <div>
                    <input
                      aria-label={`Subject ${i + 1} name`}
                      value={row.name}
                      onChange={(e) => updateRow(row.id, { name: e.target.value })}
                      onBlur={() => touch(nameKey)}
                      placeholder="Subject"
                      className={inputCls(Boolean(show(nameKey) && err?.name))}
                    />
                    {show(nameKey) && err?.name && (
                      <p role="alert" className="mt-1 text-xs text-rose-600">
                        {err.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      aria-label={`${row.name || "Subject"} marks`}
                      inputMode="decimal"
                      value={row.marks}
                      onChange={(e) => updateRow(row.id, { marks: e.target.value })}
                      onBlur={() => touch(markKey)}
                      placeholder={`/${MAX_MARKS}`}
                      className={cn(inputCls(Boolean(show(markKey) && err?.marks)), "text-right font-mono")}
                    />
                    {show(markKey) && err?.marks && (
                      <p role="alert" className="mt-1 text-xs text-rose-600">
                        {err.marks}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setRows((p) => p.filter((r) => r.id !== row.id))}
                    aria-label={`Remove ${row.name || "subject"}`}
                    className="mt-1 rounded-lg p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <TiltCard max={5} className="overflow-hidden rounded-2xl bg-[#173c36] p-6 text-white shadow-lg shadow-emerald-950/10 [--glare:rgba(255,255,255,0.08)]">
          <p className="relative text-xs font-medium uppercase tracking-widest text-stone-400">Live result</p>

          <div className="relative mt-4 flex items-end justify-between">
            <div>
              <p className="text-sm text-stone-400">Average</p>
              <p className="font-mono text-5xl font-semibold tracking-tight">
                {hasPreview ? fmt(Number(preview.average.toFixed(2))) : "—"}
                {hasPreview && <span className="text-2xl text-stone-500">%</span>}
              </p>
            </div>
            {hasPreview && <GradeBadge key={preview.grade} grade={preview.grade} size="lg" animate />}
          </div>

          <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-stone-700">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                hasPreview ? GRADE_TONE[preview.grade].bar : "bg-stone-600"
              )}
              style={{ width: `${hasPreview ? Math.min(preview.average, 100) : 0}%` }}
            />
          </div>

          <dl className="relative mt-6 space-y-3 border-t border-stone-700 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-400">Total</dt>
              <dd className="font-mono">
                {hasPreview ? `${fmt(preview.total)} / ${preview.max}` : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-400">Subjects counted</dt>
              <dd className="font-mono">
                {validRows.length} / {rows.length}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-400">Status</dt>
              <dd className={cn("font-medium", hasPreview ? (preview.passed ? "text-emerald-300" : "text-rose-300") : "text-stone-500")}>
                {hasPreview ? `${preview.passed ? "Pass" : "Fail"} · ${preview.remark}` : "Waiting for marks"}
              </dd>
            </div>
          </dl>
        </TiltCard>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-[2] rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 active:scale-[0.98]"
          >
            {editing ? "Save changes" : "Save student"}
          </button>
        </div>
        {submitted && hasErrors(errors) && (
          <p role="alert" className="mt-3 text-center text-sm text-rose-600">
            Please fix the highlighted fields.
          </p>
        )}
      </aside>
    </form>
  );
}

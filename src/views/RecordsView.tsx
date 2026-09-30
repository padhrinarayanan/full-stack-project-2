import { useEffect, useMemo, useState } from "react";
import type { GradeLetter, Student } from "../types";
import { GRADE_ORDER, fmt, resultOf } from "../utils/grading";
import { stagger } from "../utils/style";
import GradeBadge from "../components/GradeBadge";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import StudentDetail from "../components/StudentDetail";

type SortKey = "recent" | "name" | "high" | "low";

const selectCls =
  "rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-700 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-100";

export default function RecordsView({
  students,
  onEdit,
  onDelete,
  onAdd,
  onClearAll,
}: {
  students: Student[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onClearAll: () => void;
}) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [grade, setGrade] = useState<GradeLetter | "all">("all");
  const [status, setStatus] = useState<"all" | "pass" | "fail">("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [viewing, setViewing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 150);
    return () => clearTimeout(t);
  }, [query]);

  const rows = useMemo(() => {
    const list = students
      .map((s) => ({ s, r: resultOf(s) }))
      .filter(({ s, r }) => {
        if (debounced && !`${s.name} ${s.roll} ${s.className}`.toLowerCase().includes(debounced)) return false;
        if (grade !== "all" && r.grade !== grade) return false;
        if (status === "pass" && !r.passed) return false;
        if (status === "fail" && r.passed) return false;
        return true;
      });
    list.sort((a, b) => {
      if (sort === "name") return a.s.name.localeCompare(b.s.name);
      if (sort === "high") return b.r.average - a.r.average;
      if (sort === "low") return a.r.average - b.r.average;
      return b.s.createdAt - a.s.createdAt;
    });
    return list;
  }, [students, debounced, grade, status, sort]);

  const viewed = students.find((s) => s.id === viewing) ?? null;
  const filtered = debounced !== "" || grade !== "all" || status !== "all";

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, roll or class"
            aria-label="Search students"
            className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 lg:flex">
          <select aria-label="Filter by grade" value={grade} onChange={(e) => setGrade(e.target.value as GradeLetter | "all")} className={selectCls}>
            <option value="all">All grades</option>
            {GRADE_ORDER.map((g) => (
              <option key={g} value={g}>
                Grade {g}
              </option>
            ))}
          </select>
          <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value as "all" | "pass" | "fail")} className={selectCls}>
            <option value="all">Pass + fail</option>
            <option value="pass">Passed</option>
            <option value="fail">Failed</option>
          </select>
          <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={selectCls}>
            <option value="recent">Newest</option>
            <option value="name">Name A–Z</option>
            <option value="high">Highest avg</option>
            <option value="low">Lowest avg</option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-stone-500">
        <span>
          Showing {rows.length} of {students.length}
        </span>
        <div className="flex gap-4">
          {filtered && (
            <button
              onClick={() => {
                setQuery("");
                setGrade("all");
                setStatus("all");
              }}
              className="font-medium text-emerald-700 hover:underline"
            >
              Clear filters
            </button>
          )}
          {students.length > 0 && (
            <button onClick={() => setConfirmClear(true)} className="hover:text-rose-600">
              Delete all
            </button>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
          <h3 className="font-semibold text-stone-900">
            {students.length === 0 ? "No records yet" : "No matching students"}
          </h3>
          <p className="mt-1 text-sm text-stone-500">
            {students.length === 0 ? "Add a student to see results here." : "Try a different search or filter."}
          </p>
          {students.length === 0 && (
            <button onClick={onAdd} className="mt-5 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800">
              Add a student
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="hidden grid-cols-[1.6fr_0.7fr_0.8fr_0.8fr_0.7fr_auto] gap-4 border-b border-stone-200 bg-stone-50 px-5 py-3 text-xs font-medium uppercase tracking-wider text-stone-500 md:grid">
            <span>Student</span>
            <span className="text-right">Total</span>
            <span className="text-right">Average</span>
            <span>Grade</span>
            <span>Status</span>
            <span className="w-[108px] text-right">Actions</span>
          </div>
          <ul className="divide-y divide-stone-100">
            {rows.map(({ s, r }, idx) => (
              <li
                key={s.id}
                style={stagger(Math.min(idx, 10) * 0.6)}
                className="rise grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-4 transition-colors hover:bg-emerald-50/40 sm:px-5 md:grid-cols-[1.6fr_0.7fr_0.8fr_0.8fr_0.7fr_auto]"
              >
                <button onClick={() => setViewing(s.id)} className="min-w-0 text-left">
                  <p className="truncate text-sm font-medium text-stone-900 hover:underline">{s.name}</p>
                  <p className="text-xs text-stone-500">
                    Roll {s.roll}
                    {s.className && ` · ${s.className}`}
                  </p>
                </button>
                <div className="flex items-center justify-end gap-2 md:contents">
                  <span className="hidden text-right font-mono text-sm text-stone-700 md:block">
                    {fmt(r.total)}
                    <span className="text-stone-400">/{r.max}</span>
                  </span>
                  <span className="text-right font-mono text-sm text-stone-900">{fmt(Number(r.average.toFixed(2)))}%</span>
                  <span>
                    <GradeBadge grade={r.grade} size="sm" />
                  </span>
                  <span
                    className={`hidden text-sm font-medium md:block ${r.passed ? "text-emerald-700" : "text-rose-600"}`}
                  >
                    {r.passed ? "Pass" : "Fail"}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end gap-1 md:col-span-1 md:w-[108px]">
                  <button onClick={() => setViewing(s.id)} aria-label={`View ${s.name}`} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900">
                    <Icon name="eye" className="h-4 w-4" />
                  </button>
                  <button onClick={() => onEdit(s.id)} aria-label={`Edit ${s.name}`} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900">
                    <Icon name="edit" className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleting(s)} aria-label={`Delete ${s.name}`} className="rounded-lg p-2 text-stone-500 hover:bg-rose-50 hover:text-rose-600">
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {viewed && (
        <StudentDetail
          student={viewed}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setViewing(null);
            onEdit(viewed.id);
          }}
        />
      )}

      {deleting && (
        <Modal title="Delete this record?" onClose={() => setDeleting(null)}>
          <p className="text-sm text-stone-600">
            <strong className="text-stone-900">{deleting.name}</strong> and all their marks will be removed. This can't be undone.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={() => setDeleting(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100">
              Keep
            </button>
            <button
              onClick={() => {
                onDelete(deleting.id);
                setDeleting(null);
              }}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}

      {confirmClear && (
        <Modal title="Delete all records?" onClose={() => setConfirmClear(false)}>
          <p className="text-sm text-stone-600">All {students.length} students will be removed from this browser.</p>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={() => setConfirmClear(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100">
              Cancel
            </button>
            <button
              onClick={() => {
                onClearAll();
                setConfirmClear(false);
              }}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              Delete all
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

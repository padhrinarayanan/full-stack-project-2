import { useCallback, useEffect, useState } from "react";
import type { ViewName } from "./types";
import { useStudents } from "./hooks/useStudents";
import Navbar from "./components/Navbar";
import DashboardView from "./views/DashboardView";
import CalculatorView from "./views/CalculatorView";
import RecordsView from "./views/RecordsView";
import ScaleView from "./views/ScaleView";

const VIEWS: ViewName[] = ["dashboard", "calculator", "records", "scale"];

const TITLES: Record<ViewName, { title: string; subtitle: string }> = {
  dashboard: { title: "Class overview", subtitle: "Performance at a glance." },
  calculator: { title: "Grade calculator", subtitle: "Enter marks and get the total, average and grade instantly." },
  records: { title: "Student records", subtitle: "Search, filter, edit or remove saved results." },
  scale: { title: "Grade scale", subtitle: "The rules used to assign grades." },
};

function viewFromHash(): ViewName {
  const h = window.location.hash.replace("#/", "") as ViewName;
  return VIEWS.includes(h) ? h : "dashboard";
}

export default function App() {
  const { students, addStudent, updateStudent, deleteStudent, loadSamples, clearAll } = useStudents();
  const [view, setView] = useState<ViewName>(viewFromHash);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const onHash = () => setView(viewFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const navigate = useCallback((v: ViewName) => {
    if (v !== "calculator") setEditingId(null);
    window.location.hash = `/${v}`;
    setView(v);
    window.scrollTo({ top: 0 });
  }, []);

  const startNew = () => {
    setEditingId(null);
    navigate("calculator");
  };

  const startEdit = (id: string) => {
    setEditingId(id);
    window.location.hash = "/calculator";
    setView("calculator");
    window.scrollTo({ top: 0 });
  };

  const editing = students.find((s) => s.id === editingId) ?? null;
  const head = TITLES[view];

  return (
    <div className="min-h-screen pb-24 font-sans text-stone-900 antialiased md:pb-12">
      <div aria-hidden="true" className="app-backdrop pointer-events-none fixed inset-0 -z-10" />
      <Navbar view={view} onNavigate={(v) => (v === "calculator" ? startNew() : navigate(v))} count={students.length} />

      <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
        <div key={`head-${view}-${editingId ?? ""}`} className="page-in mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {view === "calculator" && editing ? `Edit ${editing.name}` : head.title}
            </h1>
            <p className="mt-1 text-sm text-stone-500 sm:text-base">{head.subtitle}</p>
          </div>
          {view === "records" && (
            <button
              onClick={startNew}
              className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800 active:scale-[0.98]"
            >
              + Add student
            </button>
          )}
        </div>

        <div key={`${view}-${editingId ?? ""}`} className="page-in">
        {view === "dashboard" && (
          <DashboardView students={students} onNavigate={(v) => (v === "calculator" ? startNew() : navigate(v))} onLoadSamples={loadSamples} />
        )}
        {view === "calculator" && (
          <CalculatorView
            students={students}
            editing={editing}
            onCancel={() => navigate(editing ? "records" : "dashboard")}
            onSave={(data) => {
              if (editing) {
                updateStudent(editing.id, data);
                setToast(`Updated ${data.name}`);
              } else {
                addStudent(data);
                setToast(`Saved ${data.name}`);
              }
              navigate("records");
            }}
          />
        )}
        {view === "records" && (
          <RecordsView
            students={students}
            onEdit={startEdit}
            onAdd={startNew}
            onDelete={(id) => {
              deleteStudent(id);
              setToast("Record deleted");
            }}
            onClearAll={() => {
              clearAll();
              setToast("All records deleted");
            }}
          />
        )}
        {view === "scale" && <ScaleView />}
        </div>
      </main>

      {toast && (
        <div
          role="status"
          className="toast-in fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-stone-900 px-5 py-2.5 text-sm text-white shadow-lg md:bottom-8"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

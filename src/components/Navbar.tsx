import type { ViewName } from "../types";
import { cn } from "../utils/cn";
import Icon from "./Icon";

const ITEMS: { id: ViewName; label: string; icon: string }[] = [
  { id: "dashboard", label: "Overview", icon: "dashboard" },
  { id: "calculator", label: "Calculator", icon: "calculator" },
  { id: "records", label: "Records", icon: "records" },
  { id: "scale", label: "Grade scale", icon: "scale" },
];

export default function Navbar({
  view,
  onNavigate,
  count,
}: {
  view: ViewName;
  onNavigate: (v: ViewName) => void;
  count: number;
}) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
          >
            <span className="cube-scene" aria-hidden="true">
              <span className="cube">
                <span className="cube-face f1">A+</span>
                <span className="cube-face f2">A</span>
                <span className="cube-face f3">B</span>
                <span className="cube-face f4">C</span>
                <span className="cube-face f5" />
                <span className="cube-face f6" />
              </span>
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[15px] font-semibold tracking-tight text-stone-900">
                Gradebook
              </span>
              <span className="block text-xs text-stone-500">{count} students tracked</span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                aria-current={view === item.id ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700",
                  view === item.id
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-200/70 hover:text-stone-900"
                )}
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={() => onNavigate("calculator")}
            className="hidden items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 active:scale-[0.98] sm:flex md:hidden lg:flex"
          >
            <Icon name="plus" className="h-4 w-4" />
            New student
          </button>
        </div>
      </header>

      <nav
        aria-label="Mobile"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            aria-current={view === item.id ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
              view === item.id ? "text-emerald-700" : "text-stone-500"
            )}
          >
            <Icon name={item.icon} className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>
    </>
  );
}

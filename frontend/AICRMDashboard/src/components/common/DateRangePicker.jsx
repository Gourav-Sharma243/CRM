import { useState, useRef, useEffect } from "react";
import { CalendarRange, ChevronDown, Check, X, Calendar as CalendarIcon } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { cn } from "../../lib/utils";

export const PRESETS = [
  { id: "all", label: "All Time" },
  { id: "this-month", label: "This Month (Sep 2026)" },
  { id: "last-month", label: "Last Month (Aug 2026)" },
  { id: "last-30", label: "Last 30 Days" },
  { id: "last-90", label: "Last 90 Days" },
  { id: "year-2026", label: "Full Year (2026)" },
];

export function DateRangePicker({ value, onChange, className, align = "right" }) {
  const [open, setOpen] = useState(false);
  const [customStart, setCustomStart] = useState(value?.start || "");
  const [customEnd, setCustomEnd] = useState(value?.end || "");
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const selectPreset = (presetId) => {
    const now = new Date(2026, 8, 26); // Anchor to current app date context: Sep 2026
    let start = "";
    let end = "";

    if (presetId === "this-month") {
      start = "2026-09-01";
      end = "2026-09-30";
    } else if (presetId === "last-month") {
      start = "2026-08-01";
      end = "2026-08-31";
    } else if (presetId === "last-30") {
      start = format(subDays(now, 30), "yyyy-MM-dd");
      end = format(now, "yyyy-MM-dd");
    } else if (presetId === "last-90") {
      start = format(subDays(now, 90), "yyyy-MM-dd");
      end = format(now, "yyyy-MM-dd");
    } else if (presetId === "year-2026") {
      start = "2026-01-01";
      end = "2026-12-31";
    }

    setCustomStart(start);
    setCustomEnd(end);
    onChange({ preset: presetId, start, end });
    setOpen(false);
  };

  const applyCustom = (e) => {
    e.preventDefault();
    if (!customStart && !customEnd) return;
    onChange({ preset: "custom", start: customStart, end: customEnd });
    setOpen(false);
  };

  const clearFilter = (e) => {
    e.stopPropagation();
    setCustomStart("");
    setCustomEnd("");
    onChange({ preset: "all", start: "", end: "" });
    setOpen(false);
  };

  // Label displayed on the trigger pill
  const getDisplayLabel = () => {
    if (!value || value.preset === "all" || (!value.start && !value.end)) {
      return "All Time";
    }
    const match = PRESETS.find((p) => p.id === value.preset);
    if (match && value.preset !== "custom") return match.label;
    if (value.start && value.end) {
      const s = format(new Date(value.start + "T00:00:00"), "dd MMM");
      const e = format(new Date(value.end + "T23:59:59"), "dd MMM, yyyy");
      return `${s} – ${e}`;
    }
    if (value.start) return `From ${value.start}`;
    if (value.end) return `Until ${value.end}`;
    return "Custom Range";
  };

  const isFiltered = value && value.preset !== "all" && (value.start || value.end);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium transition hover:bg-surface-muted",
          isFiltered ? "border-brand-300 bg-brand-50/50 text-brand-900" : "text-ink-soft hover:text-ink",
          className
        )}
      >
        <CalendarRange className={cn("h-3.5 w-3.5", isFiltered ? "text-brand-600" : "text-ink-soft")} />
        <span className="font-semibold text-ink">{getDisplayLabel()}</span>
        {isFiltered ? (
          <span
            onClick={clearFilter}
            className="ml-1 rounded p-0.5 text-ink-soft hover:bg-surface-muted hover:text-ink"
            title="Clear filter"
          >
            <X className="h-3 w-3" />
          </span>
        ) : (
          <ChevronDown className="h-3 w-3 text-ink-soft" />
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-72 sm:w-80 rounded-2xl border border-line bg-surface p-3.5 shadow-[var(--shadow-pop)] animate-fade-up",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <div className="flex items-center justify-between border-b border-line pb-2 px-1">
            <span className="text-xs font-bold text-ink">Timeline Filter</span>
            {isFiltered && (
              <button
                type="button"
                onClick={clearFilter}
                className="text-[11px] font-semibold text-brand-600 hover:underline"
              >
                Reset to All
              </button>
            )}
          </div>

          {/* Quick presets */}
          <div className="mt-2.5 space-y-1">
            {PRESETS.map((p) => {
              const active = value?.preset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPreset(p.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-left transition",
                    active
                      ? "bg-brand-50 font-semibold text-brand-700"
                      : "text-ink-soft hover:bg-surface-muted hover:text-ink"
                  )}
                >
                  <span>{p.label}</span>
                  {active && <Check className="h-3.5 w-3.5 text-brand-600" />}
                </button>
              );
            })}
          </div>

          {/* Custom Date Range Picker */}
          <div className="mt-3 border-t border-line pt-3">
            <p className="px-1 text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
              Custom Date Range
            </p>
            <form onSubmit={applyCustom} className="mt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-ink-soft font-medium">From</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full rounded-lg border border-line bg-surface px-2 py-1 text-xs text-ink focus:border-brand-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-ink-soft font-medium">To</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full rounded-lg border border-line bg-surface px-2 py-1 text-xs text-ink focus:border-brand-400 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-brand-600 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                Apply Range
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

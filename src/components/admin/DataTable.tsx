import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Search, Eye, Pencil, Trash2, Download, Plus, Loader2, ChevronDown, Check } from "lucide-react";
import { downloadCsv } from "@/lib/csv";

export type Column<T> = {
  key: keyof T & string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
  /** Optional export-only formatter; defaults to row[key]. */
  exportValue?: (row: T) => string | number | undefined;
};

export type FilterChip = {
  key: string;
  /** Human-readable label shown on the dropdown trigger. Defaults to key. */
  label?: string;
  /** First option is treated as "All" / clear-filter. */
  options: string[];
  /** When true, dropdown allows multiple selections; value is comma-joined. */
  multi?: boolean;
};

function FilterDropdown({
  chip,
  value,
  onChange,
}: {
  chip: FilterChip;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const allOpt = chip.options[0];
  const label = chip.label ?? chip.key.charAt(0).toUpperCase() + chip.key.slice(1);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!chip.multi) {
    const current = value || allOpt;
    return (
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center justify-between gap-2 min-w-[160px] px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm hover:bg-slate-50"
        >
          <span className="text-slate-500">{label}:</span>
          <span className="font-medium truncate">{current}</span>
          <ChevronDown className="size-4 text-slate-400" />
        </button>
        {open && (
          <div className="absolute z-20 mt-1 min-w-full bg-white border border-slate-200 rounded-lg shadow-lg py-1 max-h-72 overflow-auto">
            {chip.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50"
              >
                <span className="w-4">{current === opt && <Check className="size-4 text-[#0f1b3d]" />}</span>
                <span>{opt}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // multi: value is comma-separated. "All"/empty = no filter.
  const selected = useMemo(() => {
    if (!value || value === allOpt) return new Set<string>();
    return new Set(value.split(",").filter(Boolean));
  }, [value, allOpt]);
  const triggerText = selected.size === 0 ? allOpt : selected.size === 1 ? Array.from(selected)[0] : `${selected.size} selected`;

  const toggle = (opt: string) => {
    if (opt === allOpt) { onChange(allOpt); return; }
    const next = new Set(selected);
    if (next.has(opt)) next.delete(opt); else next.add(opt);
    onChange(next.size === 0 ? allOpt : Array.from(next).join(","));
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center justify-between gap-2 min-w-[180px] px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm hover:bg-slate-50"
      >
        <span className="text-slate-500">{label}:</span>
        <span className="font-medium truncate">{triggerText}</span>
        <ChevronDown className="size-4 text-slate-400" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 min-w-full bg-white border border-slate-200 rounded-lg shadow-lg py-1 max-h-72 overflow-auto">
          {chip.options.map((opt) => {
            const checked = opt === allOpt ? selected.size === 0 : selected.has(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50"
              >
                <span className={`size-4 rounded border flex items-center justify-center ${checked ? "bg-[#0f1b3d] border-[#0f1b3d]" : "border-slate-300"}`}>
                  {checked && <Check className="size-3 text-white" />}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DataTable<T extends { id: string }>({
  title,
  description,
  data,
  columns,
  loading,
  searchPlaceholder = "Search…",
  search,
  onSearch,
  filterChips,
  filterValues,
  onFilterChange,
  onAdd,
  addLabel = "Add",
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
  exportFilename,
  emptyMessage = "No records found.",
  pageSize = 10,
}: {
  title: string;
  description?: string;
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchPlaceholder?: string;
  search?: string;
  onSearch?: (q: string) => void;
  filterChips?: FilterChip[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onAdd?: () => void;
  addLabel?: string;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onBulkDelete?: (ids: string[]) => void;
  exportFilename?: string;
  emptyMessage?: string;
  pageSize?: number;
}) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  const toggle = (id: string) => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSelected(n);
  };
  const allOnPageChecked = pageData.length > 0 && pageData.every((r) => selected.has(r.id));
  const toggleAllOnPage = () => {
    const n = new Set(selected);
    if (allOnPageChecked) pageData.forEach((r) => n.delete(r.id));
    else pageData.forEach((r) => n.add(r.id));
    setSelected(n);
  };

  const handleExport = () => {
    if (!exportFilename) return;
    const rows = data.map((row) => {
      const out: Record<string, unknown> = {};
      for (const c of columns) {
        out[c.header] = c.exportValue ? c.exportValue(row) : (row[c.key] as unknown);
      }
      return out;
    });
    downloadCsv(exportFilename, rows);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl font-bold">{title}</h2>
          {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {exportFilename && (
            <button onClick={handleExport} className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm hover:bg-slate-50">
              <Download className="size-4" /> Export CSV
            </button>
          )}
          {onAdd && (
            <button onClick={onAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0f1b3d] text-white text-sm font-medium hover:bg-[#0f1b3d]/90">
              <Plus className="size-4" /> {addLabel}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        {(onSearch || filterChips) && (
          <div className="flex flex-col md:flex-row gap-3 mb-5">
            {onSearch && (
              <div className="flex-1 relative">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search ?? ""}
                  onChange={(e) => { onSearch(e.target.value); setPage(1); }}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-[#d9a441] outline-none"
                />
              </div>
            )}
            {filterChips?.map((chip) => (
              <FilterDropdown
                key={chip.key}
                chip={chip}
                value={filterValues?.[chip.key] ?? chip.options[0]}
                onChange={(v) => { onFilterChange?.(chip.key, v); setPage(1); }}
              />
            ))}
          </div>
        )}

        {onBulkDelete && (
          <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm">
            <span className={selected.size === 0 ? "text-slate-500" : "text-slate-700 font-medium"}>
              {selected.size} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelected(new Set())}
                disabled={selected.size === 0}
                className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs disabled:opacity-40"
              >
                Clear
              </button>
              <button
                onClick={() => { onBulkDelete(Array.from(selected)); setSelected(new Set()); }}
                disabled={selected.size === 0}
                className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600"
              >
                Delete selected
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
                {onBulkDelete && (
                  <th className="py-3 w-8">
                    <input type="checkbox" checked={allOnPageChecked} onChange={toggleAllOnPage} />
                  </th>
                )}
                {columns.map((c) => (
                  <th key={c.key} className={`py-3 ${c.className ?? ""}`}>{c.header}</th>
                ))}
                {(onView || onEdit || onDelete) && <th className="py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={columns.length + 2} className="py-10 text-center text-slate-400"><Loader2 className="inline size-4 animate-spin mr-2" /> Loading…</td></tr>
              )}
              {!loading && pageData.length === 0 && (
                <tr><td colSpan={columns.length + 2} className="py-10 text-center text-slate-400">{emptyMessage}</td></tr>
              )}
              {!loading && pageData.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                  {onBulkDelete && (
                    <td className="py-3">
                      <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggle(row.id)} />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className={`py-3 text-sm ${c.className ?? ""}`}>
                      {c.render ? c.render(row) : String(row[c.key] ?? "")}
                    </td>
                  ))}
                  {(onView || onEdit || onDelete) && (
                    <td className="py-3">
                      <div className="flex gap-1.5">
                        {onView && (
                          <button title="View" onClick={() => onView(row)} className="size-8 rounded border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100">
                            <Eye className="size-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button title="Edit" onClick={() => onEdit(row)} className="size-8 rounded border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100">
                            <Pencil className="size-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button title="Delete" onClick={() => onDelete(row)} className="size-8 rounded border border-slate-200 flex items-center justify-center text-red-500 hover:bg-red-50">
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-slate-500">Page {page} of {totalPages} — {data.length} total</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 rounded-md border border-slate-200 disabled:opacity-40">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 rounded-md border border-slate-200 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

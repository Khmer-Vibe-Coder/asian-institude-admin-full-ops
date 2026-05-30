import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useRef, useEffect } from "react";
import { lecturerHooks, departmentHooks } from "@/hooks/queries";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DetailDrawer, DetailRow } from "@/components/admin/DetailDrawer";
import type { Lecturer, DepartmentRecord } from "@/services/api";
import {
  Plus,
  X,
  Check,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/admin/lecturers")({ component: LecturersPage });

// ── Shared primitives ─────────────────────────────────────────────────────────
const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-[#d9a441] focus:outline-none bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

// ── Multi-select dropdown (for majorities) ────────────────────────────────────
const MAJORITIES_LIST = [
  "Computer Science",
  "Software Engineering",
  "Network & Cybersecurity",
  "Information Systems",
  "Management & Entrepreneurship",
  "Marketing & International Trade",
  "Accounting & Finance",
  "International Business",
  "Law & Governance",
  "Social Science & Development",
  "English for Communication",
  "General Studies",
];

function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const toggle = (opt: string) => {
    const next = value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt];
    onChange(next);
  };

  return (
    <Field label={label}>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white hover:border-[#d9a441] transition-colors"
        >
          <span className={value.length === 0 ? "text-slate-400" : "text-slate-800 truncate"}>
            {value.length === 0 ? placeholder ?? "Select…" : value.join(", ")}
          </span>
          <ChevronDown className="size-4 text-slate-400 shrink-0" />
        </button>
        {open && (
          <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 max-h-56 overflow-auto">
            {options.map(opt => {
              const checked = value.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggle(opt)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-slate-50"
                >
                  <span className={`size-4 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-[#0f1b3d] border-[#0f1b3d]" : "border-slate-300"}`}>
                    {checked && <Check className="size-3 text-white" />}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {value.map(v => (
            <span key={v} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
              {v}
              <button type="button" onClick={() => toggle(v)}><X className="size-3" /></button>
            </span>
          ))}
        </div>
      )}
    </Field>
  );
}

// ── Dept multi-select (by DepartmentRecord) ───────────────────────────────────
function DeptSelect({
  departments,
  value,
  onChange,
}: {
  departments: DepartmentRecord[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const toggle = (id: string) => {
    const next = value.includes(id) ? value.filter(v => v !== id) : [...value, id];
    onChange(next);
  };

  const labels = departments.filter(d => value.includes(d.id)).map(d => d.name);

  return (
    <Field label="Teaching Departments (multi)">
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white hover:border-[#d9a441] transition-colors"
        >
          <span className={labels.length === 0 ? "text-slate-400" : "text-slate-800 truncate"}>
            {labels.length === 0 ? "Select departments…" : labels.join(", ")}
          </span>
          <ChevronDown className="size-4 text-slate-400 shrink-0" />
        </button>
        {open && (
          <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 max-h-56 overflow-auto">
            {departments.map(dept => {
              const checked = value.includes(dept.id);
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => toggle(dept.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-slate-50"
                >
                  <span className={`size-4 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-[#0f1b3d] border-[#0f1b3d]" : "border-slate-300"}`}>
                    {checked && <Check className="size-3 text-white" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-slate-400 ml-1.5 text-xs">{dept.code}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {departments.filter(d => value.includes(d.id)).map(d => (
            <span key={d.id} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-medium">
              {d.name}
              <button type="button" onClick={() => toggle(d.id)}><X className="size-3" /></button>
            </span>
          ))}
        </div>
      )}
    </Field>
  );
}

// ── Lecturer form modal ───────────────────────────────────────────────────────
const FACULTIES = ["FIT", "FBA", "FLSS", "Admin"] as const;
const TITLES = ["Professor", "Associate Professor", "Senior Lecturer", "Lecturer", "Department Chair", "Visiting Lecturer"];
const STATUSES = ["Active", "Inactive", "On Leave", "Retired"] as const;

type LecturerFormState = Omit<Lecturer, "id">;

function LecturerModal({
  open,
  initial,
  departments,
  onClose,
  onSave,
  saving,
}: {
  open: boolean;
  initial?: Partial<Lecturer>;
  departments: DepartmentRecord[];
  onClose: () => void;
  onSave: (d: LecturerFormState) => Promise<void>;
  saving: boolean;
}) {
  const [form, setForm] = useState<LecturerFormState>({
    name: initial?.name ?? "",
    khmerName: initial?.khmerName ?? "",
    title: initial?.title ?? "Lecturer",
    department: initial?.department ?? "FIT",
    departmentIds: initial?.departmentIds ?? [],
    majorities: initial?.majorities ?? [],
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    bio: initial?.bio ?? "",
    photo: initial?.photo ?? "",
    courses: initial?.courses ?? [],
    status: initial?.status ?? "Active",
  });

  // sync when initial changes (edit)
  useEffect(() => {
    if (!open) return;
    setForm({
      name: initial?.name ?? "",
      khmerName: initial?.khmerName ?? "",
      title: initial?.title ?? "Lecturer",
      department: initial?.department ?? "FIT",
      departmentIds: initial?.departmentIds ?? [],
      majorities: initial?.majorities ?? [],
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      bio: initial?.bio ?? "",
      photo: initial?.photo ?? "",
      courses: initial?.courses ?? [],
      status: initial?.status ?? "Active",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const coursesStr = (form.courses ?? []).join(", ");

  const statusColor = (s: string) => {
    if (s === "Active") return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300";
    if (s === "Inactive") return "bg-slate-100 text-slate-600 ring-1 ring-slate-300";
    if (s === "On Leave") return "bg-amber-50 text-amber-700 ring-1 ring-amber-300";
    return "bg-rose-50 text-rose-600 ring-1 ring-rose-300";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <div>
            <h3 className="font-serif text-xl font-bold">{initial?.id ? "Edit Lecturer" : "Add Lecturer"}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Fill in the lecturer profile and assign majorities</p>
          </div>
          <button onClick={onClose} className="size-9 rounded-xl hover:bg-slate-100 flex items-center justify-center"><X className="size-5" /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name *">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="e.g. Dr. Sopheap Kim" />
            </Field>
            <Field label="Khmer Name">
              <input value={form.khmerName} onChange={e => setForm(f => ({ ...f, khmerName: e.target.value }))} className={inputCls} placeholder="ឈ្មោះជាភាសាខ្មែរ" />
            </Field>
          </div>
          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Academic Title *">
              <select value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputCls}>
                {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Primary Faculty *">
              <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value as typeof form.department }))} className={inputCls}>
                {FACULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
          </div>

          {/* Teaching departments */}
          <DeptSelect
            departments={departments}
            value={form.departmentIds ?? []}
            onChange={v => setForm(f => ({ ...f, departmentIds: v }))}
          />

          {/* Majorities */}
          <MultiSelect
            label="Majorities Taught *"
            options={MAJORITIES_LIST}
            value={form.majorities ?? []}
            onChange={v => setForm(f => ({ ...f, majorities: v }))}
            placeholder="Select majorities this lecturer teaches…"
          />

          {/* Row 3 */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email *">
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="lecturer@aic.edu.kh" />
            </Field>
            <Field label="Phone">
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="+855 xx xxx xxx" />
            </Field>
          </div>

          {/* Status chips */}
          <Field label="Employment Status">
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, status: s }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${form.status === s ? statusColor(s) : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          {/* Photo URL */}
          <Field label="Photo URL">
            <input type="url" value={form.photo} onChange={e => setForm(f => ({ ...f, photo: e.target.value }))} className={inputCls} placeholder="https://…" />
          </Field>

          {/* Courses */}
          <Field label="Course Codes (comma-separated)">
            <input
              value={coursesStr}
              onChange={e => setForm(f => ({ ...f, courses: e.target.value.split(",").map(c => c.trim()).filter(Boolean) }))}
              className={inputCls}
              placeholder="CS-301, SE-201, …"
            />
          </Field>

          {/* Bio */}
          <Field label="Biography">
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Brief academic biography…"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50">Cancel</button>
          <button
            disabled={!form.name || !form.email || saving}
            onClick={() => onSave(form)}
            className="px-5 py-2 rounded-lg bg-[#0f1b3d] text-white text-sm font-medium hover:bg-[#0f1b3d]/90 disabled:opacity-50"
          >
            {saving ? "Saving…" : initial?.id ? "Save Changes" : "Add Lecturer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Lecturer["status"] }) {
  const cls =
    status === "Active"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Inactive"
      ? "bg-slate-100 text-slate-500"
      : status === "On Leave"
      ? "bg-amber-100 text-amber-700"
      : "bg-rose-100 text-rose-600";
  return <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cls}`}>{status}</span>;
}

// ── Toggle active/inactive inline ─────────────────────────────────────────────
function StatusToggle({
  lecturer,
  onToggle,
}: {
  lecturer: Lecturer;
  onToggle: () => void;
}) {
  const isActive = lecturer.status === "Active";
  return (
    <button
      onClick={onToggle}
      title={isActive ? "Set Inactive" : "Set Active"}
      className={`group flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all ${isActive ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
    >
      {isActive
        ? <ToggleRight className="size-4" />
        : <ToggleLeft className="size-4" />}
      {lecturer.status}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function LecturersPage() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const list = lecturerHooks.useList({ q, filters: { department: dept === "All" ? undefined : dept } });
  const deptList = departmentHooks.useList({});
  const create = lecturerHooks.useCreate();
  const update = lecturerHooks.useUpdate();
  const remove = lecturerHooks.useRemove();
  const removeMany = lecturerHooks.useRemoveMany();

  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Lecturer | null>(null);
  const [viewRow, setViewRow] = useState<Lecturer | null>(null);
  const [delRow, setDelRow] = useState<Lecturer | null>(null);

  const departments = deptList.data?.data ?? [];
  const allLecturers = list.data?.data ?? [];

  const filteredData = useMemo(() => {
    if (statusFilter === "All") return allLecturers;
    return allLecturers.filter(l => l.status === statusFilter);
  }, [allLecturers, statusFilter]);

  const handleToggleStatus = (lecturer: Lecturer) => {
    const newStatus: Lecturer["status"] = lecturer.status === "Active" ? "Inactive" : "Active";
    update.mutate({ id: lecturer.id, patch: { status: newStatus } });
  };

  const columns: Column<Lecturer>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Lecturer",
        render: l => (
          <div className="flex items-center gap-3">
            {l.photo ? (
              <img src={l.photo} alt={l.name} className="size-10 rounded-full object-cover ring-2 ring-slate-200" />
            ) : (
              <div className="size-10 rounded-full bg-gradient-to-br from-indigo-200 to-indigo-300 flex items-center justify-center text-indigo-700 font-bold text-sm">
                {l.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="font-semibold text-slate-900">{l.name}</div>
              {l.khmerName && <div className="text-xs text-slate-400">{l.khmerName}</div>}
              <div className="text-xs text-slate-500">{l.title}</div>
            </div>
          </div>
        ),
      },
      {
        key: "department",
        header: "Faculty",
        render: l => (
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{l.department}</span>
        ),
      },
      {
        key: "majorities",
        header: "Majorities",
        render: l => (
          <div className="flex flex-wrap gap-1">
            {(l.majorities ?? []).slice(0, 2).map(m => (
              <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">{m}</span>
            ))}
            {(l.majorities?.length ?? 0) > 2 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">+{(l.majorities?.length ?? 0) - 2}</span>
            )}
            {(l.majorities?.length ?? 0) === 0 && <span className="text-xs text-slate-400">—</span>}
          </div>
        ),
      },
      { key: "email", header: "Email" },
      {
        key: "status",
        header: "Status",
        render: l => (
          <StatusToggle lecturer={l} onToggle={() => handleToggleStatus(l)} />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [update],
  );

  return (
    <>
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {(["All", "Active", "Inactive", "On Leave"] as const).map(s => {
          const count = s === "All" ? allLecturers.length : allLecturers.filter(l => l.status === s).length;
          const isSelected = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`p-4 rounded-2xl border text-left transition-all ${isSelected ? "border-[#0f1b3d] bg-[#0f1b3d] text-white shadow-lg" : "border-slate-200 bg-white hover:shadow-md"}`}
            >
              <div className={`text-2xl font-bold mb-1 ${isSelected ? "text-white" : "text-slate-900"}`}>{count}</div>
              <div className={`text-xs font-medium ${isSelected ? "text-white/70" : "text-slate-500"}`}>
                {s === "All" ? "Total Lecturers" : s}
              </div>
            </button>
          );
        })}
      </div>

      <DataTable<Lecturer>
        title="Lecturer Management"
        description={`${filteredData.length} of ${allLecturers.length} faculty members`}
        data={filteredData}
        loading={list.isLoading}
        columns={columns}
        search={q}
        onSearch={setQ}
        searchPlaceholder="Search by name, email, department…"
        filterChips={[{ key: "department", options: ["All", "FIT", "FBA", "FLSS", "Admin"] }]}
        filterValues={{ department: dept }}
        onFilterChange={(_, v) => setDept(v)}
        onAdd={() => setAddOpen(true)}
        addLabel="Add Lecturer"
        exportFilename="aic-lecturers.csv"
        onView={setViewRow}
        onEdit={setEditRow}
        onDelete={setDelRow}
        onBulkDelete={ids => removeMany.mutate(ids)}
      />

      {/* Add modal */}
      <LecturerModal
        open={addOpen}
        departments={departments}
        onClose={() => setAddOpen(false)}
        saving={create.isPending}
        onSave={async v => { await create.mutateAsync(v as Omit<Lecturer, "id">); setAddOpen(false); }}
      />

      {/* Edit modal */}
      <LecturerModal
        open={!!editRow}
        initial={editRow ?? undefined}
        departments={departments}
        onClose={() => setEditRow(null)}
        saving={update.isPending}
        onSave={async v => { await update.mutateAsync({ id: editRow!.id, patch: v }); setEditRow(null); }}
      />

      {/* Detail drawer */}
      <DetailDrawer
        open={!!viewRow}
        onOpenChange={v => !v && setViewRow(null)}
        title={viewRow?.name ?? ""}
        description={viewRow?.title}
      >
        {viewRow && (
          <>
            {viewRow.photo && (
              <img src={viewRow.photo} alt={viewRow.name} className="w-32 h-32 rounded-xl object-cover mb-4" />
            )}
            <DetailRow label="Khmer Name">{viewRow.khmerName || "—"}</DetailRow>
            <DetailRow label="Faculty">{viewRow.department}</DetailRow>
            <DetailRow label="Status"><StatusBadge status={viewRow.status} /></DetailRow>
            <DetailRow label="Email">{viewRow.email}</DetailRow>
            <DetailRow label="Phone">{viewRow.phone || "—"}</DetailRow>
            <DetailRow label="Majorities">
              <div className="flex flex-wrap gap-1">
                {(viewRow.majorities ?? []).map(m => (
                  <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium flex items-center gap-1">
                    <BookOpen className="size-3" />{m}
                  </span>
                ))}
                {!viewRow.majorities?.length && "—"}
              </div>
            </DetailRow>
            <DetailRow label="Courses">{viewRow.courses?.join(", ") || "—"}</DetailRow>
            <DetailRow label="Bio">{viewRow.bio || "—"}</DetailRow>
          </>
        )}
      </DetailDrawer>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!delRow}
        onOpenChange={v => !v && setDelRow(null)}
        title={`Delete ${delRow?.name}?`}
        destructive
        confirmLabel="Delete"
        onConfirm={() => { if (delRow) remove.mutate(delRow.id); setDelRow(null); }}
      />
    </>
  );
}

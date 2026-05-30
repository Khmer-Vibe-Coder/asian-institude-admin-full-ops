import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Users, BookOpen, UserCheck, X, Building2, Search } from "lucide-react";
import { facultyHooks, departmentHooks, lecturerHooks } from "@/hooks/queries";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { FacultyRecord, DepartmentRecord } from "@/services/api";

export const Route = createFileRoute("/admin/organization")({ component: OrganizationPage });

// ── Shared node interface ────────────────────────────────────────────────────
interface OrgTreeNode {
  id: string;
  type: "root" | "faculty" | "department";
  name: string;
  role: string;
  head?: string;
  photo?: string;
  color: string;
  light: string;
  stats?: { icon: React.ReactNode; val: string | number }[];
  raw?: FacultyRecord | DepartmentRecord;
  children?: OrgTreeNode[];
}

// ── Colors ───────────────────────────────────────────────────────────────────
const FAC_COLOR: Record<string, string> = {
  FIT: "#4f46e5", FBA: "#0891b2", FLSS: "#7c3aed", ADMIN: "#d9a441",
};
const FAC_LIGHT: Record<string, string> = {
  FIT: "#eef2ff", FBA: "#ecfeff", FLSS: "#f5f3ff", ADMIN: "#fffbeb",
};
const LINE = "#cbd5e1";
const LINE_W = 2;
const V_H = 36; // px height of vertical connector segments

// ── Field helper ─────────────────────────────────────────────────────────────
const inp = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-[#d9a441] focus:outline-none bg-white";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>{children}</div>;
}

// ── Org Card ─────────────────────────────────────────────────────────────────
function OrgCard({
  id, name, role, head, photo, color, light, stats, type, onEdit, onDelete, onAdd,
}: {
  id: string; name: string; role: string; head?: string; photo?: string;
  color: string; light: string; stats?: { icon: React.ReactNode; val: string | number }[];
  type: "root" | "faculty" | "department";
  onEdit?: () => void; onDelete?: () => void; onAdd?: () => void;
}) {
  const [hov, setHov] = useState(false);
  const initials = (head || name).split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const cardW = type === "root" ? 240 : type === "faculty" ? 210 : 190;
  const avatarSz = type === "root" ? 80 : type === "faculty" ? 68 : 56;

  return (
    <div
      className="relative flex flex-col items-center select-none"
      style={{ width: cardW }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div
        className="w-full bg-white rounded-2xl transition-shadow duration-300"
        style={{
          /* Always 1px border — never changes width, so tree lines never shift */
          border: `1px solid ${hov ? color + "66" : "#e2e8f0"}`,
          boxShadow: hov
            ? `0 6px 24px ${color}22, 0 1px 4px #0000000d`
            : "0 1px 4px #0000000d",
        }}
      >
        <div className="p-5 text-center">
          {/* Small node id */}
          <div className="absolute top-3 right-3 text-[9px] text-slate-300 font-mono">{id.split("_").pop()}</div>

          {/* Avatar */}
          <div className="flex justify-center mb-3">
            {photo ? (
              <img
                src={photo}
                alt={head || name}
                className="rounded-full object-cover"
                style={{ width: avatarSz, height: avatarSz, boxShadow: `0 0 0 3px ${color}33` }}
              />
            ) : (
              <div
                className="rounded-full flex items-center justify-center text-white font-bold"
                style={{
                  width: avatarSz,
                  height: avatarSz,
                  background: `linear-gradient(135deg, ${color}, ${color}bb)`,
                  fontSize: type === "root" ? 24 : 18,
                  boxShadow: `0 0 0 3px ${color}22`,
                }}
              >
                {initials}
              </div>
            )}
          </div>

          {/* Head / Dean name */}
          {head && <h4 className="font-bold text-slate-900 text-sm leading-tight">{head}</h4>}

          {/* Role label */}
          <p className="text-[9px] font-extrabold tracking-[0.15em] uppercase mt-1.5 mb-1" style={{ color }}>
            {role}
          </p>

          {/* Faculty / Dept full name */}
          <p className="text-xs text-slate-500 leading-snug line-clamp-2">{name}</p>

          {/* Stats row */}
          {stats && stats.length > 0 && (
            <div className="flex justify-center gap-4 mt-3 pt-3 border-t border-slate-100">
              {stats.map((s, i) => (
                <span key={i} className="flex items-center gap-1 text-[10px] text-slate-400">{s.icon}{s.val}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hover action pill — floats below the card */}
      {hov && (onEdit || onDelete || onAdd) && (
        <div className="absolute -bottom-4 z-20 flex gap-0.5 bg-white rounded-full shadow-lg border border-slate-200 px-2 py-1">
          {onAdd && <button onClick={onAdd} title="Add sub" className="size-6 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"><Plus className="size-3.5" /></button>}
          {onEdit && <button onClick={onEdit} title="Edit" className="size-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full transition-colors"><Pencil className="size-3.5" /></button>}
          {onDelete && <button onClick={onDelete} title="Delete" className="size-6 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="size-3.5" /></button>}
        </div>
      )}
    </div>
  );
}


// ── Connector helpers ─────────────────────────────────────────────────────────
/**
 * Each child draws its own left & right arm of the horizontal bar.
 * Combined across siblings → seamless continuous line regardless of subtree widths.
 */
function ChildConnector({ isFirst, isLast, isOnly }: { isFirst: boolean; isLast: boolean; isOnly: boolean }) {
  return (
    <div style={{ display: "flex", width: "100%", height: V_H }}>
      {/* Left arm: hidden for first child (and only child) */}
      <div style={{ flex: 1, borderTop: isOnly || isFirst ? "none" : `${LINE_W}px solid ${LINE}` }} />
      {/* Vertical drop */}
      <div style={{ width: LINE_W, backgroundColor: LINE, flexShrink: 0 }} />
      {/* Right arm: hidden for last child (and only child) */}
      <div style={{ flex: 1, borderTop: isOnly || isLast ? "none" : `${LINE_W}px solid ${LINE}` }} />
    </div>
  );
}

// ── Tree branch: renders one node + its children row ──────────────────────────
function TreeBranch({ node, onEdit, onDelete, onAddChild }: {
  node: OrgTreeNode;
  onEdit: (n: OrgTreeNode) => void;
  onDelete: (n: OrgTreeNode) => void;
  onAddChild: (n: OrgTreeNode) => void;
}) {
  const kids = node.children ?? [];
  const n = kids.length;

  return (
    // padding = visual gap between sibling branches; stretch so connector width = subtree width
    <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", padding: "0 10px" }}>
      {/* Card centred within its column */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <OrgCard
          {...node}
          onEdit={() => onEdit(node)}
          onDelete={node.type !== "root" ? () => onDelete(node) : undefined}
          onAdd={node.type !== "department" ? () => onAddChild(node) : undefined}
        />
      </div>

      {n > 0 && (
        <>
          {/* Vertical from card down to horizontal bar */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: LINE_W, height: V_H, backgroundColor: LINE }} />
          </div>

          {/* Children row — flex:0 0 auto so each subtree uses natural width, never shrinks */}
          <div style={{ display: "flex" }}>
            {kids.map((child, i) => (
              <div
                key={child.id}
                style={{ display: "flex", flexDirection: "column", alignItems: "stretch", flex: "0 0 auto" }}
              >
                <ChildConnector isFirst={i === 0} isLast={i === n - 1} isOnly={n === 1} />
                <TreeBranch node={child} onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Modals ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, onSave, saving, children }: {
  title: string; onClose: () => void; onSave: () => void; saving: boolean; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="font-serif text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"><X className="size-4" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">{children}</div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-5 py-2 text-sm rounded-lg bg-[#0f1b3d] text-white font-medium hover:bg-[#0f1b3d]/90 disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function OrganizationPage() {
  const facultyQ = facultyHooks.useList({});
  const deptQ = departmentHooks.useList({});
  const lecturerQ = lecturerHooks.useList({});

  const facCreate = facultyHooks.useCreate();
  const facUpdate = facultyHooks.useUpdate();
  const facRemove = facultyHooks.useRemove();
  const deptCreate = departmentHooks.useCreate();
  const deptUpdate = departmentHooks.useUpdate();
  const deptRemove = departmentHooks.useRemove();

  const [search, setSearch] = useState("");
  const [facModal, setFacModal] = useState<{ open: boolean; edit?: FacultyRecord }>({ open: false });
  const [deptModal, setDeptModal] = useState<{ open: boolean; edit?: DepartmentRecord; defaultFacId?: string }>({ open: false });
  const [delFac, setDelFac] = useState<FacultyRecord | null>(null);
  const [delDept, setDelDept] = useState<DepartmentRecord | null>(null);

  // Faculty form state
  const [facForm, setFacForm] = useState({ name: "", code: "", dean: "" });
  // Dept form state
  const [deptForm, setDeptForm] = useState({ name: "", code: "", head: "", facultyId: "" });

  const faculties = facultyQ.data?.data ?? [];
  const departments = deptQ.data?.data ?? [];
  const lecturers = lecturerQ.data?.data ?? [];

  // Build tree nodes
  const rootNode = useMemo((): OrgTreeNode => {
    const filteredFacs = search
      ? faculties.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()) || f.code.toLowerCase().includes(search.toLowerCase()))
      : faculties;

    const facNodes = filteredFacs.map((fac) => {
      const color = FAC_COLOR[fac.code] ?? "#6b7280";
      const light = FAC_LIGHT[fac.code] ?? "#f9fafb";
      const depts = departments.filter((d) => d.facultyId === fac.id);
      const lecCount = lecturers.filter((l) => l.department === fac.code).length;

      return {
        id: fac.id,
        type: "faculty" as const,
        name: fac.name,
        role: fac.code + " · Faculty",
        head: fac.dean,
        color,
        light,
        raw: fac,
        stats: [
          { icon: <UserCheck className="size-3" />, val: lecCount },
          { icon: <Users className="size-3" />, val: fac.totalStudents },
          { icon: <Building2 className="size-3" />, val: depts.length },
        ],
        children: depts.map((dept) => {
          const dLecCount = lecturers.filter((l) => l.departmentIds?.includes(dept.id)).length;
          return {
            id: dept.id,
            type: "department" as const,
            name: dept.name,
            role: dept.code + " · Department",
            head: dept.head,
            color,
            light,
            raw: dept,
            stats: [
              { icon: <BookOpen className="size-3" />, val: dept.majorCount },
              { icon: <Users className="size-3" />, val: dept.studentCount },
              { icon: <UserCheck className="size-3" />, val: dLecCount },
            ],
          };
        }),
      };
    });

    return {
      id: "root_aic",
      type: "root" as const,
      name: "Asian Institute of Cambodia",
      role: "Principal · University",
      head: "H.E. Principal",
      color: "#d9a441",
      light: "#fffbeb",
      stats: [
        { icon: <UserCheck className="size-3" />, val: lecturers.length },
        { icon: <Users className="size-3" />, val: faculties.reduce((a, f) => a + f.totalStudents, 0) },
      ],
      children: facNodes,
    };
  }, [faculties, departments, lecturers, search]);

  function openEdit(node: OrgTreeNode) {
    if (node.type === "faculty") {
      const raw = node.raw as FacultyRecord;
      setFacForm({ name: raw.name, code: raw.code, dean: raw.dean ?? "" });
      setFacModal({ open: true, edit: raw });
    } else if (node.type === "department") {
      const raw = node.raw as DepartmentRecord;
      setDeptForm({ name: raw.name, code: raw.code, head: raw.head ?? "", facultyId: raw.facultyId });
      setDeptModal({ open: true, edit: raw });
    }
  }

  function openDelete(node: OrgTreeNode) {
    if (node.type === "faculty") setDelFac(node.raw as FacultyRecord);
    else if (node.type === "department") setDelDept(node.raw as DepartmentRecord);
  }

  function openAddChild(node: OrgTreeNode) {
    if (node.type === "root" || node.type === "faculty") {
      const facId = node.type === "faculty" ? node.id : "";
      setDeptForm({ name: "", code: "", head: "", facultyId: facId });
      setDeptModal({ open: true, defaultFacId: facId });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold">Organization Chart</h2>
          <p className="text-sm text-slate-500 mt-1">{faculties.length} faculties · {departments.length} departments</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search faculties…"
              className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-[#d9a441] outline-none bg-white w-52" />
          </div>
          <button onClick={() => { setFacForm({ name: "", code: "", dean: "" }); setFacModal({ open: true }); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0f1b3d] text-white text-sm font-medium hover:bg-[#0f1b3d]/90">
            <Plus className="size-4" /> Add Faculty
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(FAC_COLOR).map(([code, color]) => (
          <span key={code} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: color }}>
            {code}
          </span>
        ))}
      </div>

      {/* Tree canvas — fixed height, scrolls both axes inside this box only */}
      <div
        className="bg-[#f8f9fc] rounded-2xl border border-slate-200 p-8"
        style={{ height: "calc(100vh - 280px)", overflow: "auto" }}
      >
        {facultyQ.isLoading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">Loading…</div>
        ) : (
          <div className="flex flex-col items-center" style={{ minWidth: "max-content", minHeight: "max-content" }}>
            <TreeBranch
              node={rootNode}
              onEdit={openEdit}
              onDelete={openDelete}
              onAddChild={openAddChild}
            />
          </div>
        )}
      </div>

      {/* Faculty modal */}
      {facModal.open && (
        <Modal
          title={facModal.edit ? "Edit Faculty" : "Add Faculty"}
          onClose={() => setFacModal({ open: false })}
          saving={facCreate.isPending || facUpdate.isPending}
          onSave={async () => {
            if (!facForm.name || !facForm.code) return;
            if (facModal.edit) {
              await facUpdate.mutateAsync({ id: facModal.edit.id, patch: { name: facForm.name, code: facForm.code.toUpperCase(), dean: facForm.dean } });
            } else {
              await facCreate.mutateAsync({ name: facForm.name, code: facForm.code.toUpperCase(), dean: facForm.dean, color: FAC_COLOR[facForm.code.toUpperCase()] ?? "#6b7280", totalLecturers: 0, totalStudents: 0 } as Omit<FacultyRecord, "id">);
            }
            setFacModal({ open: false });
          }}
        >
          <Field label="Faculty Name *"><input value={facForm.name} onChange={(e) => setFacForm((f) => ({ ...f, name: e.target.value }))} className={inp} placeholder="e.g. Faculty of Information Technology" /></Field>
          <Field label="Code *"><input value={facForm.code} onChange={(e) => setFacForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} className={inp} placeholder="e.g. FIT" maxLength={6} /></Field>
          <Field label="Dean / Head"><input value={facForm.dean} onChange={(e) => setFacForm((f) => ({ ...f, dean: e.target.value }))} className={inp} placeholder="e.g. Dr. Sopheap Kim" /></Field>
        </Modal>
      )}

      {/* Dept modal */}
      {deptModal.open && (
        <Modal
          title={deptModal.edit ? "Edit Department" : "Add Department"}
          onClose={() => setDeptModal({ open: false })}
          saving={deptCreate.isPending || deptUpdate.isPending}
          onSave={async () => {
            if (!deptForm.name || !deptForm.code || !deptForm.facultyId) return;
            if (deptModal.edit) {
              await deptUpdate.mutateAsync({ id: deptModal.edit.id, patch: { name: deptForm.name, code: deptForm.code.toUpperCase(), head: deptForm.head, facultyId: deptForm.facultyId } });
            } else {
              await deptCreate.mutateAsync({ name: deptForm.name, code: deptForm.code.toUpperCase(), head: deptForm.head, facultyId: deptForm.facultyId, majorCount: 0, studentCount: 0 } as Omit<DepartmentRecord, "id">);
            }
            setDeptModal({ open: false });
          }}
        >
          <Field label="Department Name *"><input value={deptForm.name} onChange={(e) => setDeptForm((f) => ({ ...f, name: e.target.value }))} className={inp} placeholder="e.g. Computer Science" /></Field>
          <Field label="Code *"><input value={deptForm.code} onChange={(e) => setDeptForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} className={inp} placeholder="e.g. CS" maxLength={6} /></Field>
          <Field label="Faculty *">
            <select value={deptForm.facultyId} onChange={(e) => setDeptForm((f) => ({ ...f, facultyId: e.target.value }))} className={inp}>
              <option value="">— Select faculty —</option>
              {faculties.map((fac) => <option key={fac.id} value={fac.id}>{fac.name}</option>)}
            </select>
          </Field>
          <Field label="Department Head"><input value={deptForm.head} onChange={(e) => setDeptForm((f) => ({ ...f, head: e.target.value }))} className={inp} placeholder="e.g. Dr. Sokha Pich" /></Field>
        </Modal>
      )}

      {/* Confirm delete faculty */}
      <ConfirmDialog open={!!delFac} onOpenChange={(v) => !v && setDelFac(null)} title={`Delete "${delFac?.name}"?`}
        description="All departments must be removed separately." destructive confirmLabel="Delete Faculty"
        onConfirm={() => { if (delFac) facRemove.mutate(delFac.id); setDelFac(null); }} />

      {/* Confirm delete department */}
      <ConfirmDialog open={!!delDept} onOpenChange={(v) => !v && setDelDept(null)} title={`Delete department "${delDept?.name}"?`}
        destructive confirmLabel="Delete"
        onConfirm={() => { if (delDept) deptRemove.mutate(delDept.id); setDelDept(null); }} />
    </div>
  );
}

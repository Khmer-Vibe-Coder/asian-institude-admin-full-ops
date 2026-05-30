import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { studentHooks } from "@/hooks/queries";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ResourceFormDialog, type FormField } from "@/components/admin/ResourceFormDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DetailDrawer, DetailRow } from "@/components/admin/DetailDrawer";
import type { Student } from "@/services/api";

export const Route = createFileRoute("/admin/students")({ component: StudentsPage });

const statusColor: Record<Student["status"], string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Graduating: "bg-blue-100 text-blue-700",
  Suspended: "bg-red-100 text-red-700",
  Inactive: "bg-slate-100 text-slate-600",
};

// Fields shown when ADDING a new student (ID is auto-generated)
const addFields: FormField<Student>[] = [
  { name: "name", label: "Full Name", required: true },
  { name: "khmerName", label: "Khmer Name" },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "faculty", label: "Faculty", type: "select", required: true, options: [
    { value: "FIT", label: "FIT — Information Technology" },
    { value: "FBA", label: "FBA — Business" },
    { value: "FLSS", label: "FLSS — Law & Social Sciences" },
  ]},
  { name: "major", label: "Major", required: true },
  { name: "year", label: "Year", type: "select", required: true, options: ["Y1","Y2","Y3","Y4","Y5"].map((y) => ({ value: y, label: y })) },
  { name: "gpa", label: "GPA", type: "number", step: 0.01, min: 0, max: 4 },
  { name: "status", label: "Status", type: "select", required: true, options: ["Active","Graduating","Suspended","Inactive"].map((s) => ({ value: s, label: s })) },
  { name: "enrolledAt", label: "Enrolled At", type: "date", required: true },
  { name: "photo", label: "Photo", type: "photo", full: true },
];

// Fields shown when EDITING (same but includes studentId as read-only display — handled separately)
const editFields: FormField<Student>[] = addFields;

// Auto-generate a student ID like AIC-2025-001
function generateStudentId(): string {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 900) + 100);
  return `AIC-${year}-${rand}`;
}

function StudentsPage() {
  const [q, setQ] = useState("");
  const [faculty, setFaculty] = useState("All");
  const list = studentHooks.useList({
    q,
    filters: { faculty: faculty === "All" ? undefined : faculty },
    sortBy: "studentId",
    sortDir: "asc",
  });
  const create = studentHooks.useCreate({ successMessage: "Student added" });
  const update = studentHooks.useUpdate({ successMessage: "Student updated" });
  const remove = studentHooks.useRemove({ successMessage: "Student deleted" });
  const removeMany = studentHooks.useRemoveMany();

  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Student | null>(null);
  const [viewRow, setViewRow] = useState<Student | null>(null);
  const [delRow, setDelRow] = useState<Student | null>(null);

  const columns: Column<Student>[] = useMemo(() => [
    {
      key: "name", header: "Student",
      render: (s) => (
        <div className="flex items-center gap-3">
          {s.photo ? <img src={s.photo} alt={s.name} className="size-9 rounded-full object-cover" /> : <div className="size-9 rounded-full bg-slate-200" />}
          <div>
            <div className="font-medium">{s.name}</div>
            <div className="text-xs text-slate-500">{s.email}</div>
          </div>
        </div>
      ),
    },
    { key: "studentId", header: "ID" },
    { key: "faculty", header: "Faculty / Major", render: (s) => (<><div className="font-medium">{s.faculty}</div><div className="text-xs text-slate-500">{s.major}</div></>) },
    { key: "year", header: "Year", render: (s) => <span className="text-xs px-2 py-1 rounded bg-slate-100">{s.year}</span> },
    { key: "gpa", header: "GPA", render: (s) => <span className={`font-medium ${s.gpa >= 3.5 ? "text-emerald-600" : s.gpa >= 3 ? "text-amber-600" : "text-red-600"}`}>{s.gpa}</span> },
    { key: "status", header: "Status", render: (s) => <span className={`text-xs px-2.5 py-1 rounded-full ${statusColor[s.status]}`}>{s.status}</span> },
  ], []);

  return (
    <>
      <DataTable<Student>
        title="Student Management"
        description={`${list.data?.total ?? 0} total students registered`}
        data={list.data?.data ?? []}
        loading={list.isLoading}
        columns={columns}
        search={q}
        onSearch={setQ}
        searchPlaceholder="Search by name, ID, email…"
        filterChips={[{ key: "faculty", options: ["All","FIT","FBA","FLSS"] }]}
        filterValues={{ faculty }}
        onFilterChange={(_, v) => setFaculty(v)}
        onAdd={() => setAddOpen(true)}
        addLabel="Add Student"
        exportFilename="aic-students.csv"
        onView={setViewRow}
        onEdit={setEditRow}
        onDelete={setDelRow}
        onBulkDelete={(ids) => removeMany.mutate(ids)}
      />

      <ResourceFormDialog<Student>
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Student"
        fields={addFields}
        defaultValues={{ status: "Active", year: "Y1", faculty: "FIT", gpa: 0, enrolledAt: new Date().toISOString().slice(0, 10) }}
        submitting={create.isPending}
        onSubmit={async (v) => {
          await create.mutateAsync({ ...v, studentId: generateStudentId() } as Omit<Student, "id">);
        }}
      />

      <ResourceFormDialog<Student>
        open={!!editRow}
        onOpenChange={(v) => !v && setEditRow(null)}
        title={`Edit ${editRow?.name ?? ""}`}
        description={`Student ID: ${editRow?.studentId ?? ""}`}
        fields={editFields}
        defaultValues={editRow ?? {}}
        submitting={update.isPending}
        onSubmit={async (v) => { await update.mutateAsync({ id: editRow!.id, patch: v }); }}
      />

      <DetailDrawer open={!!viewRow} onOpenChange={(v) => !v && setViewRow(null)} title={viewRow?.name ?? ""} description={viewRow?.studentId}>
        {viewRow && (
          <>
            {viewRow.photo && <img src={viewRow.photo} alt={viewRow.name} className="w-32 h-32 rounded-xl object-cover mb-2" />}
            <DetailRow label="Email">{viewRow.email}</DetailRow>
            <DetailRow label="Phone">{viewRow.phone || "—"}</DetailRow>
            <DetailRow label="Khmer Name">{viewRow.khmerName || "—"}</DetailRow>
            <DetailRow label="Faculty">{viewRow.faculty}</DetailRow>
            <DetailRow label="Major">{viewRow.major}</DetailRow>
            <DetailRow label="Year">{viewRow.year}</DetailRow>
            <DetailRow label="GPA">{viewRow.gpa}</DetailRow>
            <DetailRow label="Status"><span className={`text-xs px-2.5 py-1 rounded-full ${statusColor[viewRow.status]}`}>{viewRow.status}</span></DetailRow>
            <DetailRow label="Enrolled">{viewRow.enrolledAt}</DetailRow>
          </>
        )}
      </DetailDrawer>

      <ConfirmDialog
        open={!!delRow}
        onOpenChange={(v) => !v && setDelRow(null)}
        title={`Delete ${delRow?.name}?`}
        description="This student record will be permanently removed."
        confirmLabel="Delete"
        destructive
        onConfirm={() => { if (delRow) remove.mutate(delRow.id); setDelRow(null); }}
      />
    </>
  );
}

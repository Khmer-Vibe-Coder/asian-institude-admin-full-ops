import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { lecturerHooks } from "@/hooks/queries";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ResourceFormDialog, type FormField } from "@/components/admin/ResourceFormDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DetailDrawer, DetailRow } from "@/components/admin/DetailDrawer";
import type { Lecturer } from "@/services/api";

export const Route = createFileRoute("/admin/lecturers")({ component: LecturersPage });

const fields: FormField<Lecturer>[] = [
  { name: "name", label: "Name", required: true },
  { name: "khmerName", label: "Khmer Name" },
  { name: "title", label: "Title", required: true, placeholder: "Associate Professor" },
  { name: "department", label: "Department", type: "select", required: true, options: ["FIT","FBA","FLSS","Admin"].map((d) => ({ value: d, label: d })) },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "status", label: "Status", type: "select", required: true, options: ["Active","On Leave","Retired"].map((s) => ({ value: s, label: s })) },
  { name: "photo", label: "Photo URL", type: "url", full: true },
  { name: "bio", label: "Biography", type: "textarea" },
];

function LecturersPage() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All");
  const list = lecturerHooks.useList({ q, filters: { department: dept === "All" ? undefined : dept } });
  const create = lecturerHooks.useCreate();
  const update = lecturerHooks.useUpdate();
  const remove = lecturerHooks.useRemove();
  const removeMany = lecturerHooks.useRemoveMany();

  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Lecturer | null>(null);
  const [viewRow, setViewRow] = useState<Lecturer | null>(null);
  const [delRow, setDelRow] = useState<Lecturer | null>(null);

  const columns: Column<Lecturer>[] = useMemo(() => [
    { key: "name", header: "Lecturer", render: (l) => (
      <div className="flex items-center gap-3">
        {l.photo ? <img src={l.photo} alt={l.name} className="size-10 rounded-full object-cover" /> : <div className="size-10 rounded-full bg-slate-200" />}
        <div>
          <div className="font-medium">{l.name}</div>
          <div className="text-xs text-slate-500">{l.title}</div>
        </div>
      </div>
    )},
    { key: "department", header: "Department" },
    { key: "email", header: "Email" },
    { key: "courses", header: "Courses", render: (l) => <span className="text-xs">{l.courses?.join(", ") || "—"}</span> },
    { key: "status", header: "Status", render: (l) => (
      <span className={`text-xs px-2.5 py-1 rounded-full ${l.status === "Active" ? "bg-emerald-100 text-emerald-700" : l.status === "On Leave" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{l.status}</span>
    )},
  ], []);

  return (
    <>
      <DataTable<Lecturer>
        title="Lecturer Management"
        description={`${list.data?.total ?? 0} faculty members`}
        data={list.data?.data ?? []}
        loading={list.isLoading}
        columns={columns}
        search={q}
        onSearch={setQ}
        searchPlaceholder="Search by name, email, department…"
        filterChips={[{ key: "department", options: ["All","FIT","FBA","FLSS","Admin"] }]}
        filterValues={{ department: dept }}
        onFilterChange={(_, v) => setDept(v)}
        onAdd={() => setAddOpen(true)}
        addLabel="Add Lecturer"
        exportFilename="aic-lecturers.csv"
        onView={setViewRow}
        onEdit={setEditRow}
        onDelete={setDelRow}
        onBulkDelete={(ids) => removeMany.mutate(ids)}
      />
      <ResourceFormDialog<Lecturer>
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Lecturer"
        fields={fields}
        defaultValues={{ status: "Active", department: "FIT" }}
        submitting={create.isPending}
        onSubmit={async (v) => { await create.mutateAsync(v as Omit<Lecturer,"id">); }}
      />
      <ResourceFormDialog<Lecturer>
        open={!!editRow}
        onOpenChange={(v) => !v && setEditRow(null)}
        title={`Edit ${editRow?.name ?? ""}`}
        fields={fields}
        defaultValues={editRow ?? {}}
        submitting={update.isPending}
        onSubmit={async (v) => { await update.mutateAsync({ id: editRow!.id, patch: v }); }}
      />
      <DetailDrawer open={!!viewRow} onOpenChange={(v) => !v && setViewRow(null)} title={viewRow?.name ?? ""} description={viewRow?.title}>
        {viewRow && (
          <>
            {viewRow.photo && <img src={viewRow.photo} alt={viewRow.name} className="w-32 h-32 rounded-xl object-cover mb-2" />}
            <DetailRow label="Department">{viewRow.department}</DetailRow>
            <DetailRow label="Email">{viewRow.email}</DetailRow>
            <DetailRow label="Phone">{viewRow.phone || "—"}</DetailRow>
            <DetailRow label="Courses">{viewRow.courses?.join(", ") || "—"}</DetailRow>
            <DetailRow label="Bio">{viewRow.bio || "—"}</DetailRow>
            <DetailRow label="Status">{viewRow.status}</DetailRow>
          </>
        )}
      </DetailDrawer>
      <ConfirmDialog open={!!delRow} onOpenChange={(v) => !v && setDelRow(null)} title={`Delete ${delRow?.name}?`} destructive confirmLabel="Delete" onConfirm={() => { if (delRow) remove.mutate(delRow.id); setDelRow(null); }} />
    </>
  );
}

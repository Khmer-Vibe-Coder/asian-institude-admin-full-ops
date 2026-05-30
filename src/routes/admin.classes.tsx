import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { programHooks } from "@/hooks/queries";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ResourceFormDialog, type FormField } from "@/components/admin/ResourceFormDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DetailDrawer, DetailRow } from "@/components/admin/DetailDrawer";
import type { Program } from "@/services/api";

export const Route = createFileRoute("/admin/classes")({ component: ClassesPage });

const fields: FormField<Program>[] = [
  { name: "code", label: "Program Code", required: true, placeholder: "BSC-SE" },
  { name: "name", label: "Program Name", required: true, full: true },
  { name: "faculty", label: "Faculty", type: "select", required: true, options: ["FIT","FBA","FLSS"].map((f) => ({ value: f, label: f })) },
  { name: "level", label: "Level", type: "select", required: true, options: ["Bachelor","Master","PhD","Diploma"].map((l) => ({ value: l, label: l })) },
  { name: "durationYears", label: "Duration (years)", type: "number", required: true, min: 1, max: 8 },
  { name: "credits", label: "Credits", type: "number", required: true, min: 0 },
  { name: "tuitionUSD", label: "Tuition / year (USD)", type: "number", required: true, min: 0 },
  { name: "status", label: "Status", type: "select", required: true, options: ["Open","Closed"].map((s) => ({ value: s, label: s })) },
  { name: "description", label: "Description", type: "textarea", required: true },
];

function ClassesPage() {
  const [q, setQ] = useState("");
  const [faculty, setFaculty] = useState("All");
  const list = programHooks.useList({ q, filters: { faculty: faculty === "All" ? undefined : faculty } });
  const create = programHooks.useCreate();
  const update = programHooks.useUpdate();
  const remove = programHooks.useRemove();
  const removeMany = programHooks.useRemoveMany();

  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Program | null>(null);
  const [viewRow, setViewRow] = useState<Program | null>(null);
  const [delRow, setDelRow] = useState<Program | null>(null);

  const columns: Column<Program>[] = useMemo(() => [
    { key: "code", header: "Code" },
    { key: "name", header: "Name", render: (p) => <div><div className="font-medium">{p.name}</div><div className="text-xs text-slate-500 line-clamp-1">{p.description}</div></div> },
    { key: "faculty", header: "Faculty" },
    { key: "level", header: "Level" },
    { key: "durationYears", header: "Duration", render: (p) => `${p.durationYears} yr` },
    { key: "credits", header: "Credits" },
    { key: "tuitionUSD", header: "Tuition/yr", render: (p) => `$${p.tuitionUSD.toLocaleString()}` },
    { key: "status", header: "Status", render: (p) => <span className={`text-xs px-2.5 py-1 rounded-full ${p.status === "Open" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{p.status}</span> },
  ], []);

  return (
    <>
      <DataTable<Program>
        title="Programs & Classes"
        description={`${list.data?.total ?? 0} programs`}
        data={list.data?.data ?? []}
        loading={list.isLoading}
        columns={columns}
        search={q}
        onSearch={setQ}
        filterChips={[{ key: "faculty", options: ["All","FIT","FBA","FLSS"] }]}
        filterValues={{ faculty }}
        onFilterChange={(_, v) => setFaculty(v)}
        onAdd={() => setAddOpen(true)}
        addLabel="Add Program"
        exportFilename="aic-programs.csv"
        onView={setViewRow}
        onEdit={setEditRow}
        onDelete={setDelRow}
        onBulkDelete={(ids) => removeMany.mutate(ids)}
      />
      <ResourceFormDialog<Program>
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Program"
        fields={fields}
        defaultValues={{ status: "Open", level: "Bachelor", faculty: "FIT", durationYears: 4, credits: 144, tuitionUSD: 2400 }}
        submitting={create.isPending}
        onSubmit={async (v) => { await create.mutateAsync(v as Omit<Program,"id">); }}
      />
      <ResourceFormDialog<Program>
        open={!!editRow}
        onOpenChange={(v) => !v && setEditRow(null)}
        title={`Edit ${editRow?.name ?? ""}`}
        fields={fields}
        defaultValues={editRow ?? {}}
        submitting={update.isPending}
        onSubmit={async (v) => { await update.mutateAsync({ id: editRow!.id, patch: v }); }}
      />
      <DetailDrawer open={!!viewRow} onOpenChange={(v) => !v && setViewRow(null)} title={viewRow?.name ?? ""} description={viewRow?.code}>
        {viewRow && (
          <>
            <DetailRow label="Faculty">{viewRow.faculty}</DetailRow>
            <DetailRow label="Level">{viewRow.level}</DetailRow>
            <DetailRow label="Duration">{viewRow.durationYears} years</DetailRow>
            <DetailRow label="Credits">{viewRow.credits}</DetailRow>
            <DetailRow label="Tuition / year">${viewRow.tuitionUSD.toLocaleString()}</DetailRow>
            <DetailRow label="Description">{viewRow.description}</DetailRow>
            <DetailRow label="Highlights">{viewRow.highlights?.join(", ") || "—"}</DetailRow>
            <DetailRow label="Status">{viewRow.status}</DetailRow>
          </>
        )}
      </DetailDrawer>
      <ConfirmDialog open={!!delRow} onOpenChange={(v) => !v && setDelRow(null)} title={`Delete ${delRow?.name}?`} destructive confirmLabel="Delete" onConfirm={() => { if (delRow) remove.mutate(delRow.id); setDelRow(null); }} />
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { scholarshipHooks, scholarshipAppHooks } from "@/hooks/queries";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ResourceFormDialog, type FormField } from "@/components/admin/ResourceFormDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DetailDrawer, DetailRow } from "@/components/admin/DetailDrawer";
import type { Scholarship, ScholarshipApplication } from "@/services/api";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/scholarships")({ component: ScholarshipsPage });

const fields: FormField<Scholarship>[] = [
  { name: "name", label: "Scholarship Name", required: true, full: true },
  { name: "amountUSD", label: "Amount (USD)", type: "number", required: true, min: 0 },
  { name: "deadline", label: "Deadline", type: "date", required: true },
  { name: "status", label: "Status", type: "select", required: true, options: ["Open","Closed"].map((s) => ({ value: s, label: s })) },
  { name: "eligibility", label: "Eligibility", required: true, full: true },
  { name: "description", label: "Description", type: "textarea", required: true },
];

function ScholarshipsPage() {
  const [q, setQ] = useState("");
  const list = scholarshipHooks.useList({ q });
  const create = scholarshipHooks.useCreate();
  const update = scholarshipHooks.useUpdate();
  const remove = scholarshipHooks.useRemove();
  const removeMany = scholarshipHooks.useRemoveMany();

  const apps = scholarshipAppHooks.useList();
  const appUpdate = scholarshipAppHooks.useUpdate();
  const appRemove = scholarshipAppHooks.useRemove();

  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Scholarship | null>(null);
  const [viewRow, setViewRow] = useState<Scholarship | null>(null);
  const [delRow, setDelRow] = useState<Scholarship | null>(null);

  const columns: Column<Scholarship>[] = useMemo(() => [
    { key: "name", header: "Scholarship", render: (s) => (<div><div className="font-medium">{s.name}</div><div className="text-xs text-slate-500 line-clamp-1">{s.eligibility}</div></div>) },
    { key: "amountUSD", header: "Amount", render: (s) => <span className="font-medium">${s.amountUSD.toLocaleString()}</span> },
    { key: "deadline", header: "Deadline" },
    { key: "status", header: "Status", render: (s) => (
      <span className={`text-xs px-2.5 py-1 rounded-full ${s.status === "Open" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{s.status}</span>
    )},
  ], []);

  return (
    <div className="space-y-8">
      <DataTable<Scholarship>
        title="Scholarship Programs"
        description={`${list.data?.total ?? 0} programs`}
        data={list.data?.data ?? []}
        loading={list.isLoading}
        columns={columns}
        search={q}
        onSearch={setQ}
        onAdd={() => setAddOpen(true)}
        addLabel="Add Scholarship"
        exportFilename="aic-scholarships.csv"
        onView={setViewRow}
        onEdit={setEditRow}
        onDelete={setDelRow}
        onBulkDelete={(ids) => removeMany.mutate(ids)}
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-serif text-xl font-bold mb-1">Pending Applications</h3>
        <p className="text-sm text-slate-500 mb-4">{(apps.data?.data ?? []).filter((a) => a.status === "Pending").length} awaiting decision</p>
        {(apps.data?.data ?? []).length === 0 && <p className="text-sm text-slate-400 py-6 text-center">No applications yet — applicants submit from the public Scholarships page.</p>}
        <div className="space-y-2">
          {(apps.data?.data ?? []).map((a) => (
            <ApplicationRow key={a.id} app={a} scholarshipName={list.data?.data.find((s) => s.id === a.scholarshipId)?.name ?? "—"}
              onApprove={() => appUpdate.mutate({ id: a.id, patch: { status: "Approved" } })}
              onReject={() => appUpdate.mutate({ id: a.id, patch: { status: "Rejected" } })}
              onDelete={() => appRemove.mutate(a.id)}
            />
          ))}
        </div>
      </div>

      <ResourceFormDialog<Scholarship>
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Scholarship"
        fields={fields}
        defaultValues={{ status: "Open", amountUSD: 1000, deadline: new Date().toISOString().slice(0, 10) }}
        submitting={create.isPending}
        onSubmit={async (v) => { await create.mutateAsync(v as Omit<Scholarship,"id">); }}
      />
      <ResourceFormDialog<Scholarship>
        open={!!editRow}
        onOpenChange={(v) => !v && setEditRow(null)}
        title={`Edit ${editRow?.name ?? ""}`}
        fields={fields}
        defaultValues={editRow ?? {}}
        submitting={update.isPending}
        onSubmit={async (v) => { await update.mutateAsync({ id: editRow!.id, patch: v }); }}
      />
      <DetailDrawer open={!!viewRow} onOpenChange={(v) => !v && setViewRow(null)} title={viewRow?.name ?? ""} description={`$${viewRow?.amountUSD.toLocaleString()}`}>
        {viewRow && (
          <>
            <DetailRow label="Amount">${viewRow.amountUSD.toLocaleString()}</DetailRow>
            <DetailRow label="Deadline">{viewRow.deadline}</DetailRow>
            <DetailRow label="Eligibility">{viewRow.eligibility}</DetailRow>
            <DetailRow label="Description">{viewRow.description}</DetailRow>
            <DetailRow label="Status">{viewRow.status}</DetailRow>
          </>
        )}
      </DetailDrawer>
      <ConfirmDialog open={!!delRow} onOpenChange={(v) => !v && setDelRow(null)} title={`Delete ${delRow?.name}?`} destructive confirmLabel="Delete" onConfirm={() => { if (delRow) remove.mutate(delRow.id); setDelRow(null); }} />
    </div>
  );
}

function ApplicationRow({ app, scholarshipName, onApprove, onReject, onDelete }: { app: ScholarshipApplication; scholarshipName: string; onApprove: () => void; onReject: () => void; onDelete: () => void }) {
  const statusColor = app.status === "Approved" ? "bg-emerald-100 text-emerald-700" : app.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-lg border border-slate-200">
      <div>
        <div className="font-medium text-sm">{app.applicantName}</div>
        <div className="text-xs text-slate-500">{app.email} • applied {app.submittedAt} • {scholarshipName}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2.5 py-1 rounded-full ${statusColor}`}>{app.status}</span>
        {app.status === "Pending" && (
          <>
            <button onClick={onApprove} className="size-8 rounded border border-emerald-200 text-emerald-600 flex items-center justify-center hover:bg-emerald-50" title="Approve"><Check className="size-4" /></button>
            <button onClick={onReject} className="size-8 rounded border border-red-200 text-red-600 flex items-center justify-center hover:bg-red-50" title="Reject"><X className="size-4" /></button>
          </>
        )}
        <button onClick={onDelete} className="text-xs text-slate-400 hover:text-red-600">Delete</button>
      </div>
    </div>
  );
}

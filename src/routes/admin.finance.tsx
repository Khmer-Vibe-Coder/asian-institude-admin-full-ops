import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { invoiceHooks, studentHooks } from "@/hooks/queries";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ResourceFormDialog, type FormField } from "@/components/admin/ResourceFormDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { Invoice } from "@/services/api";

export const Route = createFileRoute("/admin/finance")({ component: FinancePage });

const statusColor: Record<Invoice["status"], string> = {
  Paid: "bg-emerald-100 text-emerald-700",
  Unpaid: "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-700",
};

function FinancePage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const students = studentHooks.useList();
  const list = invoiceHooks.useList({ q, filters: { status: status === "All" ? undefined : status } });
  const create = invoiceHooks.useCreate();
  const update = invoiceHooks.useUpdate();
  const remove = invoiceHooks.useRemove();
  const removeMany = invoiceHooks.useRemoveMany();

  const studentOptions = useMemo(
    () => (students.data?.data ?? []).map((s) => ({ value: s.id, label: `${s.studentId} — ${s.name}` })),
    [students.data],
  );

  const fields: FormField<Invoice>[] = useMemo(() => [
    { name: "studentId", label: "Student", type: "select", required: true, options: studentOptions },
    { name: "description", label: "Description", required: true, placeholder: "Tuition Fall 2025" },
    { name: "amountUSD", label: "Amount (USD)", type: "number", required: true, min: 0 },
    { name: "dueDate", label: "Due Date", type: "date", required: true },
    { name: "status", label: "Status", type: "select", required: true, options: ["Unpaid","Paid","Overdue"].map((s) => ({ value: s, label: s })) },
    { name: "method", label: "Payment Method", type: "select", options: ["Cash","Bank Transfer","Card","ABA","Wing"].map((m) => ({ value: m, label: m })) },
    { name: "paidAt", label: "Paid At", type: "date" },
  ], [studentOptions]);

  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Invoice | null>(null);
  const [delRow, setDelRow] = useState<Invoice | null>(null);

  const totalRevenue = (list.data?.data ?? []).filter((i) => i.status === "Paid").reduce((s, i) => s + i.amountUSD, 0);
  const outstanding = (list.data?.data ?? []).filter((i) => i.status !== "Paid").reduce((s, i) => s + i.amountUSD, 0);

  const columns: Column<Invoice>[] = useMemo(() => [
    { key: "studentName", header: "Student", render: (i) => {
      const s = students.data?.data.find((x) => x.id === i.studentId);
      return s ? <div><div className="font-medium">{s.name}</div><div className="text-xs text-slate-500">{s.studentId}</div></div> : i.studentName;
    }},
    { key: "description", header: "Description" },
    { key: "amountUSD", header: "Amount", render: (i) => <span className="font-medium">${i.amountUSD.toLocaleString()}</span> },
    { key: "dueDate", header: "Due" },
    { key: "status", header: "Status", render: (i) => <span className={`text-xs px-2.5 py-1 rounded-full ${statusColor[i.status]}`}>{i.status}</span> },
    { key: "method", header: "Method", render: (i) => i.method ?? "—" },
    { key: "id", header: "Quick Action", render: (i) => i.status !== "Paid" ? (
      <button onClick={() => update.mutate({ id: i.id, patch: { status: "Paid", paidAt: new Date().toISOString().slice(0, 10) } })}
        className="text-xs px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">Mark Paid</button>
    ) : null },
  ], [students.data, update]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200"><div className="text-xs text-slate-500">Revenue (paid)</div><div className="font-serif text-2xl font-bold mt-1">${totalRevenue.toLocaleString()}</div></div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200"><div className="text-xs text-slate-500">Outstanding</div><div className="font-serif text-2xl font-bold mt-1 text-amber-600">${outstanding.toLocaleString()}</div></div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200"><div className="text-xs text-slate-500">Invoices</div><div className="font-serif text-2xl font-bold mt-1">{list.data?.total ?? 0}</div></div>
      </div>
      <DataTable<Invoice>
        title="Finance & Invoices"
        data={list.data?.data ?? []}
        loading={list.isLoading}
        columns={columns}
        search={q}
        onSearch={setQ}
        filterChips={[{ key: "status", options: ["All","Unpaid","Paid","Overdue"] }]}
        filterValues={{ status }}
        onFilterChange={(_, v) => setStatus(v)}
        onAdd={() => setAddOpen(true)}
        addLabel="New Invoice"
        exportFilename="aic-invoices.csv"
        onEdit={setEditRow}
        onDelete={setDelRow}
        onBulkDelete={(ids) => removeMany.mutate(ids)}
      />
      <ResourceFormDialog<Invoice>
        open={addOpen}
        onOpenChange={setAddOpen}
        title="New Invoice"
        fields={fields}
        defaultValues={{ status: "Unpaid", amountUSD: 0, dueDate: new Date().toISOString().slice(0, 10) }}
        submitting={create.isPending}
        onSubmit={async (v) => {
          const s = students.data?.data.find((x) => x.id === v.studentId);
          await create.mutateAsync({ ...(v as Omit<Invoice,"id">), studentName: s?.name });
        }}
      />
      <ResourceFormDialog<Invoice>
        open={!!editRow}
        onOpenChange={(v) => !v && setEditRow(null)}
        title="Edit Invoice"
        fields={fields}
        defaultValues={editRow ?? {}}
        submitting={update.isPending}
        onSubmit={async (v) => {
          const s = students.data?.data.find((x) => x.id === v.studentId);
          await update.mutateAsync({ id: editRow!.id, patch: { ...v, studentName: s?.name } });
        }}
      />
      <ConfirmDialog open={!!delRow} onOpenChange={(v) => !v && setDelRow(null)} title="Delete invoice?" destructive confirmLabel="Delete" onConfirm={() => { if (delRow) remove.mutate(delRow.id); setDelRow(null); }} />
    </>
  );
}

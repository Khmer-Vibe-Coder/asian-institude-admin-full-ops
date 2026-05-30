import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { applicationHooks, studentHooks, programHooks } from "@/hooks/queries";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ResourceFormDialog, type FormField } from "@/components/admin/ResourceFormDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DetailDrawer, DetailRow } from "@/components/admin/DetailDrawer";
import { Check, X } from "lucide-react";
import type { Application, Student } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/enrollment")({ component: EnrollmentPage });

const statusColor: Record<Application["status"], string> = {
  Pending: "bg-amber-100 text-amber-700",
  Reviewing: "bg-blue-100 text-blue-700",
  Accepted: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
};

function EnrollmentPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const programs = programHooks.useList();
  const list = applicationHooks.useList({ q, filters: { status: status === "All" ? undefined : status }, sortBy: "submittedAt", sortDir: "desc" });
  const update = applicationHooks.useUpdate();
  const create = applicationHooks.useCreate();
  const remove = applicationHooks.useRemove();
  const removeMany = applicationHooks.useRemoveMany();
  const createStudent = studentHooks.useCreate({ successMessage: "Student created from application" });

  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Application | null>(null);
  const [viewRow, setViewRow] = useState<Application | null>(null);
  const [delRow, setDelRow] = useState<Application | null>(null);

  const programOptions = (programs.data?.data ?? []).map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` }));

  const fields: FormField<Application>[] = useMemo(() => [
    { name: "applicantName", label: "Full Name", required: true },
    { name: "khmerName", label: "Khmer Name" },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "tel", required: true },
    { name: "dob", label: "Date of Birth", type: "date" },
    { name: "programId", label: "Program", type: "select", required: true, options: programOptions },
    { name: "submittedAt", label: "Submitted At", type: "date", required: true },
    { name: "status", label: "Status", type: "select", required: true, options: ["Pending","Reviewing","Accepted","Rejected"].map((s) => ({ value: s, label: s })) },
    { name: "message", label: "Personal Statement", type: "textarea", full: true },
  ], [programOptions]);

  async function approve(app: Application) {
    await update.mutateAsync({ id: app.id, patch: { status: "Accepted" } });
    const program = programs.data?.data.find((p) => p.id === app.programId);
    const studentInput: Omit<Student, "id"> = {
      studentId: `AIC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      name: app.applicantName,
      khmerName: app.khmerName,
      email: app.email,
      phone: app.phone,
      faculty: (program?.faculty ?? "FIT") as Student["faculty"],
      major: program?.name ?? "Undeclared",
      year: "Y1",
      gpa: 0,
      status: "Active",
      enrolledAt: new Date().toISOString().slice(0, 10),
    };
    await createStudent.mutateAsync(studentInput);
    toast.success(`${app.applicantName} enrolled`);
  }

  const columns: Column<Application>[] = useMemo(() => [
    { key: "applicantName", header: "Applicant", render: (a) => (
      <div>
        <div className="font-medium">{a.applicantName}</div>
        <div className="text-xs text-slate-500">{a.email}</div>
      </div>
    )},
    { key: "programName", header: "Program", render: (a) => a.programName ?? programs.data?.data.find((p) => p.id === a.programId)?.name ?? "—" },
    { key: "phone", header: "Phone" },
    { key: "submittedAt", header: "Submitted" },
    { key: "status", header: "Status", render: (a) => <span className={`text-xs px-2.5 py-1 rounded-full ${statusColor[a.status]}`}>{a.status}</span> },
    { key: "id", header: "Decide", render: (a) => a.status === "Pending" || a.status === "Reviewing" ? (
      <div className="flex gap-1.5">
        <button onClick={() => approve(a)} title="Approve & enroll" className="size-8 rounded border border-emerald-200 text-emerald-600 flex items-center justify-center hover:bg-emerald-50"><Check className="size-4" /></button>
        <button onClick={() => update.mutate({ id: a.id, patch: { status: "Rejected" } })} title="Reject" className="size-8 rounded border border-red-200 text-red-600 flex items-center justify-center hover:bg-red-50"><X className="size-4" /></button>
      </div>
    ) : null },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [programs.data]);

  return (
    <>
      <DataTable<Application>
        title="Enrollment Applications"
        description={`${list.data?.total ?? 0} applications`}
        data={list.data?.data ?? []}
        loading={list.isLoading}
        columns={columns}
        search={q}
        onSearch={setQ}
        filterChips={[{ key: "status", options: ["All","Pending","Reviewing","Accepted","Rejected"] }]}
        filterValues={{ status }}
        onFilterChange={(_, v) => setStatus(v)}
        onAdd={() => setAddOpen(true)}
        addLabel="Add Application"
        exportFilename="aic-applications.csv"
        onView={setViewRow}
        onEdit={setEditRow}
        onDelete={setDelRow}
        onBulkDelete={(ids) => removeMany.mutate(ids)}
      />
      <ResourceFormDialog<Application>
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Application"
        fields={fields}
        defaultValues={{ status: "Pending", submittedAt: new Date().toISOString().slice(0, 10) }}
        submitting={create.isPending}
        onSubmit={async (v) => {
          const program = programs.data?.data.find((p) => p.id === v.programId);
          await create.mutateAsync({ ...(v as Omit<Application,"id">), programName: program?.name });
        }}
      />
      <ResourceFormDialog<Application>
        open={!!editRow}
        onOpenChange={(v) => !v && setEditRow(null)}
        title={`Edit ${editRow?.applicantName ?? ""}`}
        fields={fields}
        defaultValues={editRow ?? {}}
        submitting={update.isPending}
        onSubmit={async (v) => {
          const program = programs.data?.data.find((p) => p.id === v.programId);
          await update.mutateAsync({ id: editRow!.id, patch: { ...v, programName: program?.name } });
        }}
      />
      <DetailDrawer open={!!viewRow} onOpenChange={(v) => !v && setViewRow(null)} title={viewRow?.applicantName ?? ""} description={viewRow?.email}>
        {viewRow && (
          <>
            <DetailRow label="Program">{viewRow.programName}</DetailRow>
            <DetailRow label="Phone">{viewRow.phone}</DetailRow>
            <DetailRow label="DOB">{viewRow.dob || "—"}</DetailRow>
            <DetailRow label="Submitted">{viewRow.submittedAt}</DetailRow>
            <DetailRow label="Status">{viewRow.status}</DetailRow>
            <DetailRow label="Statement">{viewRow.message || "—"}</DetailRow>
          </>
        )}
      </DetailDrawer>
      <ConfirmDialog open={!!delRow} onOpenChange={(v) => !v && setDelRow(null)} title={`Delete ${delRow?.applicantName}?`} destructive confirmLabel="Delete" onConfirm={() => { if (delRow) remove.mutate(delRow.id); setDelRow(null); }} />
    </>
  );
}

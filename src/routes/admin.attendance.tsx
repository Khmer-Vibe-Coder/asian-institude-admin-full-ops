import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { attendanceHooks, studentHooks, timetableHooks } from "@/hooks/queries";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ResourceFormDialog, type FormField } from "@/components/admin/ResourceFormDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { Attendance } from "@/services/api";
import { toast } from "sonner";
import { useRole } from "@/contexts/RoleContext";
import { BookOpen, Check } from "lucide-react";

export const Route = createFileRoute("/admin/attendance")({ component: AttendancePage });

const statusColor: Record<Attendance["status"], string> = {
  Present: "bg-emerald-100 text-emerald-700",
  Absent: "bg-red-100 text-red-700",
  Late: "bg-amber-100 text-amber-700",
};

function AttendancePage() {
  const { role } = useRole();
  const [q, setQ] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [course, setCourse] = useState<string>("All");

  const courses = timetableHooks.useList();
  const students = studentHooks.useList();
  const list = attendanceHooks.useList({
    q,
    filters: { courseCode: course === "All" ? undefined : course },
    sortBy: "date",
    sortDir: "desc",
  });
  const create = attendanceHooks.useCreate();
  const update = attendanceHooks.useUpdate();
  const remove = attendanceHooks.useRemove();
  const removeMany = attendanceHooks.useRemoveMany();

  const courseOptions = useMemo(() => {
    const seen = new Set<string>();
    const opts: { value: string; label: string }[] = [];
    (courses.data?.data ?? []).forEach((c) => {
      if (!seen.has(c.courseCode)) {
        seen.add(c.courseCode);
        opts.push({ value: c.courseCode, label: `${c.courseCode} — ${c.courseName}` });
      }
    });
    return opts;
  }, [courses.data]);

  const studentOptions = useMemo(
    () => (students.data?.data ?? []).map((s) => ({ value: s.id, label: `${s.studentId} — ${s.name}` })),
    [students.data],
  );

  const fields: FormField<Attendance>[] = useMemo(() => [
    { name: "date", label: "Date", type: "date", required: true },
    { name: "courseCode", label: "Course", type: "select", required: true, options: courseOptions },
    { name: "studentId", label: "Student", type: "select", required: true, options: studentOptions },
    { name: "status", label: "Status", type: "select", required: true, options: ["Present","Absent","Late"].map((s) => ({ value: s, label: s })) },
    { name: "note", label: "Note" },
  ], [courseOptions, studentOptions]);

  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Attendance | null>(null);
  const [delRow, setDelRow] = useState<Attendance | null>(null);

  function markAllPresent() {
    if (course === "All") { toast.error("Pick a course first"); return; }
    let n = 0;
    (students.data?.data ?? []).forEach((s) => {
      const exists = (list.data?.data ?? []).find((a) => a.date === date && a.courseCode === course && a.studentId === s.id);
      if (!exists) {
        create.mutate({ date, courseCode: course, studentId: s.id, status: "Present" });
        n++;
      }
    });
    toast.success(`Marked ${n} students present`);
  }

  const columns: Column<Attendance>[] = useMemo(() => [
    { key: "date", header: "Date" },
    { key: "courseCode", header: "Course" },
    { key: "studentId", header: "Student", render: (a) => {
      const s = students.data?.data.find((x) => x.id === a.studentId);
      return s ? `${s.studentId} — ${s.name}` : a.studentId;
    }},
    { key: "status", header: "Status", render: (a) => (
      <select value={a.status} onChange={(e) => update.mutate({ id: a.id, patch: { status: e.target.value as Attendance["status"] } })}
        className={`text-xs px-2.5 py-1 rounded-full border-0 ${statusColor[a.status]}`}>
        <option>Present</option><option>Absent</option><option>Late</option>
      </select>
    )},
    { key: "note", header: "Note" },
  ], [students.data, update]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
          <select 
            value={course} 
            onChange={(e) => setCourse(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#d9a441]"
          >
            <option value="All">— {role === "Lecturer" ? "Select a class to take attendance" : "All Classes"} —</option>
            {courseOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        {course !== "All" && (
          <div className="flex items-center gap-2">
            <button onClick={markAllPresent} className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm hover:bg-slate-50 font-medium transition-colors">
              Mark all present
            </button>
            <button 
              onClick={() => {
                toast.success(`Attendance for ${course} on ${date} has been confirmed and saved!`);
                setCourse("All"); // Reset the view to give a sense of completion
              }} 
              className="px-4 py-2 rounded-lg bg-[#d9a441] text-white text-sm hover:bg-[#c29235] font-medium transition-colors flex items-center gap-2"
            >
              <Check className="size-4" />
              Confirm & Submit
            </button>
          </div>
        )}
      </div>

      {role === "Lecturer" && course === "All" ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <div className="size-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="size-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Select a Class</h3>
          <p className="text-sm text-slate-500 max-w-sm text-center">
            Please choose a specific class from the dropdown above to view or mark attendance for today.
          </p>
        </div>
      ) : (
        <DataTable<Attendance>
          title={course === "All" ? "Overall Attendance" : `Attendance: ${course}`}
          description={`${list.data?.total ?? 0} records`}
          data={list.data?.data ?? []}
          loading={list.isLoading}
          columns={columns}
          search={q}
          onSearch={setQ}
          searchPlaceholder="Search…"
          onAdd={() => setAddOpen(true)}
          addLabel="Add Entry"
          exportFilename="aic-attendance.csv"
          onEdit={setEditRow}
          onDelete={setDelRow}
          onBulkDelete={(ids) => removeMany.mutate(ids)}
        />
      )}

      <ResourceFormDialog<Attendance>
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Attendance Entry"
        fields={fields}
        defaultValues={{ date, status: "Present", courseCode: course === "All" ? "" : course }}
        submitting={create.isPending}
        onSubmit={async (v) => { await create.mutateAsync(v as Omit<Attendance,"id">); }}
      />
      <ResourceFormDialog<Attendance>
        open={!!editRow}
        onOpenChange={(v) => !v && setEditRow(null)}
        title="Edit Attendance"
        fields={fields}
        defaultValues={editRow ?? {}}
        submitting={update.isPending}
        onSubmit={async (v) => { await update.mutateAsync({ id: editRow!.id, patch: v }); }}
      />
      <ConfirmDialog open={!!delRow} onOpenChange={(v) => !v && setDelRow(null)} title="Delete attendance record?" destructive confirmLabel="Delete" onConfirm={() => { if (delRow) remove.mutate(delRow.id); setDelRow(null); }} />
    </>
  );
}

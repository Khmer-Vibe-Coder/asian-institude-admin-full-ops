import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { gradeHooks, studentHooks } from "@/hooks/queries";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ResourceFormDialog, type FormField } from "@/components/admin/ResourceFormDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { Grade } from "@/services/api";
import { letterFromScore } from "@/services/api";

export const Route = createFileRoute("/admin/grades")({ component: GradesPage });

function GradesPage() {
  const [q, setQ] = useState("");
  const [department, setDepartment] = useState("All");
  const [klass, setKlass] = useState("All"); // year/class
  const [student, setStudent] = useState("All");

  const students = studentHooks.useList();
  const allStudents = students.data?.data ?? [];

  // Filter the student pool by department + class so the student dropdown narrows too.
  // department/klass may be a comma-separated multi-select value, or "All".
  const filteredStudents = useMemo(() => {
    const depSet = department === "All" ? null : new Set(department.split(","));
    const klsSet = klass === "All" ? null : new Set(klass.split(","));
    return allStudents.filter((s) =>
      (!depSet || depSet.has(s.faculty)) &&
      (!klsSet || klsSet.has(s.year)),
    );
  }, [allStudents, department, klass]);

  // Grades scoped to the filtered student set. We fetch all then filter client-side
  // (mock API). When wiring to a real API, pass { departmentId, classId, studentId }.
  const list = gradeHooks.useList({ q });
  const grades = useMemo(() => {
    const allowed = new Set(filteredStudents.map((s) => s.id));
    return (list.data?.data ?? []).filter((g) => {
      if (student !== "All") return g.studentId === student;
      return allowed.has(g.studentId);
    });
  }, [list.data, filteredStudents, student]);

  const create = gradeHooks.useCreate();
  const update = gradeHooks.useUpdate();
  const remove = gradeHooks.useRemove();
  const removeMany = gradeHooks.useRemoveMany();

  const studentOptions = useMemo(
    () => filteredStudents.map((s) => ({ value: s.id, label: `${s.studentId} — ${s.name}` })),
    [filteredStudents],
  );

  const fields: FormField<Grade>[] = useMemo(() => [
    { name: "studentId", label: "Student", type: "select", required: true, options: allStudents.map((s) => ({ value: s.id, label: `${s.studentId} — ${s.name}` })) },
    { name: "courseCode", label: "Course Code", required: true, placeholder: "CS-301" },
    { name: "courseName", label: "Course Name", required: true },
    { name: "term", label: "Term", required: true, placeholder: "2025-Fall" },
    { name: "score", label: "Score (0-100)", type: "number", required: true, min: 0, max: 100 },
    { name: "letter", label: "Letter", type: "select", required: true, options: ["A","B","C","D","F"].map((l) => ({ value: l, label: l })) },
    { name: "credits", label: "Credits", type: "number", required: true, min: 1, max: 6 },
  ], [allStudents]);

  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Grade | null>(null);
  const [delRow, setDelRow] = useState<Grade | null>(null);

  const columns: Column<Grade>[] = useMemo(() => [
    { key: "studentId", header: "Student", render: (g) => {
      const s = allStudents.find((x) => x.id === g.studentId);
      return s ? (
        <div>
          <div className="font-medium">{s.name}</div>
          <div className="text-xs text-slate-500">{s.studentId} · {s.faculty} · {s.year}</div>
        </div>
      ) : g.studentId;
    }},
    { key: "courseCode", header: "Course", render: (g) => <div><div className="font-medium">{g.courseCode}</div><div className="text-xs text-slate-500">{g.courseName}</div></div> },
    { key: "term", header: "Term" },
    { key: "score", header: "Score", render: (g) => <span className={`font-medium ${g.score >= 85 ? "text-emerald-600" : g.score >= 65 ? "text-amber-600" : "text-red-600"}`}>{g.score}</span> },
    { key: "letter", header: "Letter", render: (g) => <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100">{g.letter}</span> },
    { key: "credits", header: "Credits" },
  ], [allStudents]);

  return (
    <>
      <DataTable<Grade>
        title="Grade Records"
        description={`${grades.length} entries`}
        data={grades}
        loading={list.isLoading}
        columns={columns}
        search={q}
        onSearch={setQ}
        searchPlaceholder="Search by course…"
        filterChips={[
          { key: "department", label: "Department", multi: true, options: ["All", "FIT", "FBA", "FLSS"] },
          { key: "class", label: "Class", multi: true, options: ["All", "Y1", "Y2", "Y3", "Y4", "Y5"] },
          { key: "student", label: "Student", options: ["All", ...studentOptions.slice(0, 12).map((o) => o.value)] },
        ]}
        filterValues={{ department, class: klass, student }}
        onFilterChange={(key, v) => {
          if (key === "department") { setDepartment(v); setStudent("All"); }
          else if (key === "class") { setKlass(v); setStudent("All"); }
          else if (key === "student") setStudent(v);
        }}
        onAdd={() => setAddOpen(true)}
        addLabel="Add Grade"
        exportFilename="aic-grades.csv"
        onEdit={setEditRow}
        onDelete={setDelRow}
        onBulkDelete={(ids) => removeMany.mutate(ids)}
      />
      <ResourceFormDialog<Grade>
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Grade"
        fields={fields}
        defaultValues={{ score: 0, letter: "F", credits: 3, term: "2025-Fall" }}
        submitting={create.isPending}
        onSubmit={async (v) => {
          const score = Number(v.score);
          await create.mutateAsync({ ...(v as Omit<Grade,"id">), letter: letterFromScore(score), score });
        }}
      />
      <ResourceFormDialog<Grade>
        open={!!editRow}
        onOpenChange={(v) => !v && setEditRow(null)}
        title="Edit Grade"
        fields={fields}
        defaultValues={editRow ?? {}}
        submitting={update.isPending}
        onSubmit={async (v) => {
          const score = Number(v.score);
          await update.mutateAsync({ id: editRow!.id, patch: { ...v, letter: letterFromScore(score), score } });
        }}
      />
      <ConfirmDialog open={!!delRow} onOpenChange={(v) => !v && setDelRow(null)} title="Delete grade record?" destructive confirmLabel="Delete" onConfirm={() => { if (delRow) remove.mutate(delRow.id); setDelRow(null); }} />
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { timetableHooks } from "@/hooks/queries";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ResourceFormDialog, type FormField } from "@/components/admin/ResourceFormDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { TimetableSlot } from "@/services/api";

export const Route = createFileRoute("/admin/timetable")({ component: TimetablePage });

const DAYS: TimetableSlot["day"][] = ["Mon","Tue","Wed","Thu","Fri","Sat"];

const fields: FormField<TimetableSlot>[] = [
  { name: "courseCode", label: "Course Code", required: true, placeholder: "CS-301" },
  { name: "courseName", label: "Course Name", required: true },
  { name: "day", label: "Day", type: "select", required: true, options: DAYS.map((d) => ({ value: d, label: d })) },
  { name: "startTime", label: "Start Time", placeholder: "08:00", required: true },
  { name: "endTime", label: "End Time", placeholder: "09:30", required: true },
  { name: "lecturer", label: "Lecturer", required: true },
  { name: "room", label: "Room", required: true, placeholder: "B-201" },
  { name: "term", label: "Term", required: true, placeholder: "2025-Fall" },
];

function TimetablePage() {
  const [q, setQ] = useState("");
  const list = timetableHooks.useList({ q });
  const create = timetableHooks.useCreate();
  const update = timetableHooks.useUpdate();
  const remove = timetableHooks.useRemove();
  const removeMany = timetableHooks.useRemoveMany();

  const [view, setView] = useState<"grid" | "table">("grid");
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<TimetableSlot | null>(null);
  const [delRow, setDelRow] = useState<TimetableSlot | null>(null);

  const grid = useMemo(() => {
    const map: Record<string, TimetableSlot[]> = {};
    DAYS.forEach((d) => { map[d] = []; });
    (list.data?.data ?? []).forEach((s) => { map[s.day]?.push(s); });
    DAYS.forEach((d) => map[d].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return map;
  }, [list.data]);

  const columns: Column<TimetableSlot>[] = useMemo(() => [
    { key: "day", header: "Day" },
    { key: "startTime", header: "Time", render: (s) => `${s.startTime}–${s.endTime}` },
    { key: "courseCode", header: "Course", render: (s) => <div><div className="font-medium">{s.courseCode}</div><div className="text-xs text-slate-500">{s.courseName}</div></div> },
    { key: "lecturer", header: "Lecturer" },
    { key: "room", header: "Room" },
    { key: "term", header: "Term" },
  ], []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold">Timetable</h2>
          <p className="text-sm text-slate-500 mt-1">{list.data?.total ?? 0} scheduled slots</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-slate-200 bg-white p-1 flex">
            <button onClick={() => setView("grid")} className={`px-3 py-1.5 text-xs rounded ${view === "grid" ? "bg-[#0f1b3d] text-white" : "text-slate-600"}`}>Week Grid</button>
            <button onClick={() => setView("table")} className={`px-3 py-1.5 text-xs rounded ${view === "table" ? "bg-[#0f1b3d] text-white" : "text-slate-600"}`}>Table</button>
          </div>
        </div>
      </div>

      {view === "grid" ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 overflow-x-auto">
          <div className="grid grid-cols-6 gap-3 min-w-[900px]">
            {DAYS.map((d) => (
              <div key={d}>
                <div className="font-medium text-sm text-center pb-3 border-b border-slate-200 mb-3">{d}</div>
                <div className="space-y-2">
                  {grid[d].length === 0 && <div className="text-xs text-slate-400 text-center py-6">No classes</div>}
                  {grid[d].map((s) => (
                    <button key={s.id} onClick={() => setEditRow(s)} className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-[#d9a441]/10 border border-slate-200">
                      <div className="text-xs text-slate-500">{s.startTime}–{s.endTime}</div>
                      <div className="font-medium text-sm">{s.courseCode}</div>
                      <div className="text-xs text-slate-600 line-clamp-1">{s.courseName}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{s.lecturer} • {s.room}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={() => setAddOpen(true)} className="px-4 py-2 rounded-lg bg-[#0f1b3d] text-white text-sm">+ Add Slot</button>
          </div>
        </div>
      ) : (
        <DataTable<TimetableSlot>
          title=""
          data={list.data?.data ?? []}
          loading={list.isLoading}
          columns={columns}
          search={q}
          onSearch={setQ}
          onAdd={() => setAddOpen(true)}
          addLabel="Add Slot"
          exportFilename="aic-timetable.csv"
          onEdit={setEditRow}
          onDelete={setDelRow}
          onBulkDelete={(ids) => removeMany.mutate(ids)}
        />
      )}

      <ResourceFormDialog<TimetableSlot>
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Timetable Slot"
        fields={fields}
        defaultValues={{ day: "Mon", term: "2025-Fall", startTime: "08:00", endTime: "09:30" }}
        submitting={create.isPending}
        onSubmit={async (v) => { await create.mutateAsync(v as Omit<TimetableSlot,"id">); }}
      />
      <ResourceFormDialog<TimetableSlot>
        open={!!editRow}
        onOpenChange={(v) => !v && setEditRow(null)}
        title={`Edit ${editRow?.courseCode ?? ""}`}
        fields={fields}
        defaultValues={editRow ?? {}}
        submitting={update.isPending}
        onSubmit={async (v) => { await update.mutateAsync({ id: editRow!.id, patch: v }); }}
      />
      <ConfirmDialog open={!!delRow} onOpenChange={(v) => !v && setDelRow(null)} title={`Delete ${delRow?.courseCode}?`} destructive confirmLabel="Delete" onConfirm={() => { if (delRow) remove.mutate(delRow.id); setDelRow(null); }} />
    </div>
  );
}

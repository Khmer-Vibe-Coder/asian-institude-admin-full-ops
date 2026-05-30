import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { studentHooks, gradeHooks, attendanceHooks, timetableHooks, invoiceHooks } from "@/hooks/queries";
import { BookOpen, Star, CreditCard, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/admin/portal")({ component: StudentPortal });

// Demo student identity for the Student role
const ME_ID = "stu_1";

type Tab = "overview" | "schedule" | "grades" | "attendance" | "payments";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "schedule", label: "Schedule" },
  { id: "grades", label: "Grades" },
  { id: "attendance", label: "Attendance" },
  { id: "payments", label: "Payments" },
];

const letterColor: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-700",
  B: "bg-sky-100 text-sky-700",
  C: "bg-amber-100 text-amber-700",
  D: "bg-orange-100 text-orange-700",
  F: "bg-red-100 text-red-700",
};

function StudentPortal() {
  const [tab, setTab] = useState<Tab>("overview");
  const students = studentHooks.useList();
  const grades = gradeHooks.useList({ filters: { studentId: ME_ID } });
  const attendance = attendanceHooks.useList({ filters: { studentId: ME_ID } });
  const timetable = timetableHooks.useList();
  const invoices = invoiceHooks.useList({ filters: { studentId: ME_ID } });

  const me = students.data?.data.find((s) => s.id === ME_ID);
  const myGrades = grades.data?.data ?? [];
  const myAttendance = attendance.data?.data ?? [];
  const mySchedule = timetable.data?.data ?? [];
  const myInvoices = invoices.data?.data ?? [];

  // GPA calc
  const gpa =
    myGrades.length > 0
      ? (
          myGrades.reduce((s, g) => {
            const pts = g.letter === "A" ? 4 : g.letter === "B" ? 3 : g.letter === "C" ? 2 : g.letter === "D" ? 1 : 0;
            return s + pts * g.credits;
          }, 0) / Math.max(1, myGrades.reduce((s, g) => s + g.credits, 0))
        ).toFixed(2)
      : "—";

  const presentCount = myAttendance.filter((a) => a.status === "Present").length;
  const lateCount = myAttendance.filter((a) => a.status === "Late").length;
  const absentCount = myAttendance.filter((a) => a.status === "Absent").length;
  const attendanceRate = myAttendance.length > 0 ? Math.round((presentCount / myAttendance.length) * 100) : 100;

  const totalDue = myInvoices.reduce((s, i) => s + i.amountUSD, 0);
  const totalPaid = myInvoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amountUSD, 0);
  const paymentStatus = totalDue === totalPaid ? "Paid" : "Outstanding";

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-5">
        {me?.photo ? (
          <img src={me.photo} alt={me.name} className="size-20 rounded-full object-cover" />
        ) : (
          <div className="size-20 rounded-full bg-[#0f1b3d] text-white text-2xl font-bold flex items-center justify-center">
            {me?.name?.charAt(0) ?? "S"}
          </div>
        )}
        <div>
          <div className="text-sm text-slate-500">Welcome back,</div>
          <div className="font-serif text-3xl font-bold">{me?.name ?? "Student"}</div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">{me?.studentId}</span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">{me?.major}</span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">Year {me?.year?.replace("Y", "")}</span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#0f1b3d] text-white p-5">
          <div className="text-xs text-slate-300">Semester GPA</div>
          <div className="font-serif text-4xl text-[#d9a441] mt-2">{gpa}</div>
          <div className="text-xs text-slate-300 mt-1">Current semester</div>
        </div>
        <StatCard label="Attendance" value={`${attendanceRate}%`} sub={`${presentCount}/${myAttendance.length || 0} sessions`} tone="emerald" />
        <StatCard label="Enrolled Courses" value={String(myGrades.length || mySchedule.length)} sub="Active this semester" tone="sky" />
        <StatCard label="Payment" value={paymentStatus} sub={`$${totalPaid} paid`} tone={paymentStatus === "Paid" ? "emerald" : "amber"} />
      </div>

      {/* Tabs */}
      <div className="bg-slate-100 rounded-xl p-1 flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${tab === t.id ? "bg-white text-[#0f1b3d] font-medium shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-2 gap-4">
          <Panel icon={<BookOpen className="size-5 text-[#d9a441]" />} title="This Week's Classes">
            <div className="space-y-2">
              {mySchedule.slice(0, 4).map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div>
                    <div className="font-medium text-sm">{s.courseName}</div>
                    <div className="text-xs text-slate-500">{s.day} {s.startTime}–{s.endTime} · {s.room}</div>
                  </div>
                  <span className="text-xs text-slate-500">{s.courseCode}</span>
                </div>
              ))}
              {mySchedule.length === 0 && <Empty>No scheduled classes.</Empty>}
            </div>
          </Panel>

          <Panel icon={<Star className="size-5 text-[#d9a441]" />} title="Latest Grades">
            <div className="space-y-2">
              {myGrades.map((g) => (
                <div key={g.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className={`size-9 rounded-md flex items-center justify-center font-bold ${letterColor[g.letter] ?? "bg-slate-100"}`}>{g.letter}</span>
                    <div>
                      <div className="font-medium text-sm">{g.courseName}</div>
                      <div className="text-xs text-slate-500">Score: {g.score} · {g.credits} cr</div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-[#0f1b3d]">{g.score}</span>
                </div>
              ))}
              {myGrades.length === 0 && <Empty>No grades posted yet.</Empty>}
            </div>
          </Panel>

          <Panel icon={<CreditCard className="size-5 text-[#d9a441]" />} title="Payment Status">
            <div className="space-y-3">
              {myInvoices.map((i) => (
                <div key={i.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div>
                    <div className="font-medium text-sm">{i.description}</div>
                    <div className="text-xs text-slate-500">Due {i.dueDate} · INV-{i.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${i.amountUSD}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${i.status === "Paid" ? "bg-emerald-100 text-emerald-700" : i.status === "Overdue" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{i.status}</span>
                  </div>
                </div>
              ))}
              {myInvoices.length === 0 && <Empty>No invoices.</Empty>}
            </div>
          </Panel>

          <Panel icon={<CalendarDays className="size-5 text-[#d9a441]" />} title="Attendance Summary">
            <div className="grid grid-cols-3 gap-3 text-center mb-3">
              <div><div className="text-2xl font-bold text-emerald-600">{presentCount}</div><div className="text-xs text-slate-500">Present</div></div>
              <div><div className="text-2xl font-bold text-amber-600">{lateCount}</div><div className="text-xs text-slate-500">Late</div></div>
              <div><div className="text-2xl font-bold text-red-600">{absentCount}</div><div className="text-xs text-slate-500">Absent</div></div>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${attendanceRate}%` }} />
            </div>
            <div className="text-xs text-slate-500 text-center mt-2">{attendanceRate}% overall attendance rate</div>
          </Panel>
        </div>
      )}

      {tab === "schedule" && (
        <Panel icon={<CalendarDays className="size-5 text-[#d9a441]" />} title="Weekly Schedule">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500 border-b border-slate-200">
              <tr><th className="py-2">Day</th><th>Time</th><th>Course</th><th>Lecturer</th><th>Room</th></tr>
            </thead>
            <tbody>
              {mySchedule.map((s) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="py-2 font-medium">{s.day}</td>
                  <td>{s.startTime}–{s.endTime}</td>
                  <td>{s.courseCode} · {s.courseName}</td>
                  <td>{s.lecturer}</td>
                  <td>{s.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {tab === "grades" && (
        <Panel icon={<Star className="size-5 text-[#d9a441]" />} title="My Grades">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500 border-b border-slate-200">
              <tr><th className="py-2">Course</th><th>Term</th><th>Credits</th><th>Score</th><th>Letter</th></tr>
            </thead>
            <tbody>
              {myGrades.map((g) => (
                <tr key={g.id} className="border-b border-slate-100">
                  <td className="py-2">{g.courseCode} · {g.courseName}</td>
                  <td>{g.term}</td>
                  <td>{g.credits}</td>
                  <td>{g.score}</td>
                  <td><span className={`px-2 py-0.5 rounded-md text-xs font-bold ${letterColor[g.letter]}`}>{g.letter}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {tab === "attendance" && (
        <Panel icon={<CalendarDays className="size-5 text-[#d9a441]" />} title="My Attendance">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500 border-b border-slate-200">
              <tr><th className="py-2">Date</th><th>Course</th><th>Status</th></tr>
            </thead>
            <tbody>
              {myAttendance.map((a) => (
                <tr key={a.id} className="border-b border-slate-100">
                  <td className="py-2">{a.date}</td>
                  <td>{a.courseCode}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-md text-xs ${a.status === "Present" ? "bg-emerald-100 text-emerald-700" : a.status === "Absent" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{a.status}</span>
                  </td>
                </tr>
              ))}
              {myAttendance.length === 0 && <tr><td colSpan={3}><Empty>No records.</Empty></td></tr>}
            </tbody>
          </table>
        </Panel>
      )}

      {tab === "payments" && (
        <Panel icon={<CreditCard className="size-5 text-[#d9a441]" />} title="My Payments">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500 border-b border-slate-200">
              <tr><th className="py-2">Invoice</th><th>Description</th><th>Due</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {myInvoices.map((i) => (
                <tr key={i.id} className="border-b border-slate-100">
                  <td className="py-2 font-mono text-xs">INV-{i.id}</td>
                  <td>{i.description}</td>
                  <td>{i.dueDate}</td>
                  <td>${i.amountUSD}</td>
                  <td><span className={`px-2 py-0.5 rounded-md text-xs ${i.status === "Paid" ? "bg-emerald-100 text-emerald-700" : i.status === "Overdue" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{i.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "emerald" | "sky" | "amber" }) {
  const colors = {
    emerald: "text-emerald-600",
    sky: "text-sky-600",
    amber: "text-amber-600",
  } as const;
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`font-serif text-4xl mt-2 ${colors[tone]}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 font-serif text-lg font-bold mb-4">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-center text-sm text-slate-400 py-6">{children}</div>;
}

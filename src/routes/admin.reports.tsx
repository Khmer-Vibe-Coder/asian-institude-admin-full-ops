import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { studentHooks, invoiceHooks, attendanceHooks, applicationHooks } from "@/hooks/queries";
import { downloadCsv } from "@/lib/csv";
import { Download } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({ component: ReportsPage });

const COLORS = ["#0f1b3d", "#d9a441", "#10b981", "#3b82f6", "#ef4444"];

function ReportsPage() {
  const students = studentHooks.useList();
  const invoices = invoiceHooks.useList();
  const attendance = attendanceHooks.useList();
  const apps = applicationHooks.useList();

  const studentsByFaculty = useMemo(() => {
    const acc: Record<string, number> = {};
    (students.data?.data ?? []).forEach((s) => { acc[s.faculty] = (acc[s.faculty] ?? 0) + 1; });
    return Object.entries(acc).map(([name, value]) => ({ name, value }));
  }, [students.data]);

  const revenueByStatus = useMemo(() => {
    const acc: Record<string, number> = { Paid: 0, Unpaid: 0, Overdue: 0 };
    (invoices.data?.data ?? []).forEach((i) => { acc[i.status] = (acc[i.status] ?? 0) + i.amountUSD; });
    return Object.entries(acc).map(([name, value]) => ({ name, value }));
  }, [invoices.data]);

  const attendanceTrend = useMemo(() => {
    const acc: Record<string, { date: string; present: number; absent: number; late: number }> = {};
    (attendance.data?.data ?? []).forEach((a) => {
      acc[a.date] ??= { date: a.date, present: 0, absent: 0, late: 0 };
      if (a.status === "Present") acc[a.date].present++;
      if (a.status === "Absent") acc[a.date].absent++;
      if (a.status === "Late") acc[a.date].late++;
    });
    return Object.values(acc).sort((a, b) => a.date.localeCompare(b.date));
  }, [attendance.data]);

  const appsByStatus = useMemo(() => {
    const acc: Record<string, number> = {};
    (apps.data?.data ?? []).forEach((a) => { acc[a.status] = (acc[a.status] ?? 0) + 1; });
    return Object.entries(acc).map(([name, value]) => ({ name, value }));
  }, [apps.data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold">Reports</h2>
          <p className="text-sm text-slate-500 mt-1">Snapshot of all institutional data</p>
        </div>
        <button onClick={() => downloadCsv("aic-report-snapshot.csv", [
          { metric: "Total Students", value: students.data?.total ?? 0 },
          { metric: "Total Invoices", value: invoices.data?.total ?? 0 },
          { metric: "Paid Revenue", value: revenueByStatus.find((r) => r.name === "Paid")?.value ?? 0 },
          { metric: "Outstanding", value: (revenueByStatus.find((r) => r.name === "Unpaid")?.value ?? 0) + (revenueByStatus.find((r) => r.name === "Overdue")?.value ?? 0) },
          { metric: "Applications", value: apps.data?.total ?? 0 },
        ])} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm hover:bg-slate-50">
          <Download className="size-4" /> Export Snapshot
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-serif text-lg font-bold mb-4">Students by Faculty</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={studentsByFaculty} dataKey="value" nameKey="name" outerRadius={90} label>
                  {studentsByFaculty.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-serif text-lg font-bold mb-4">Revenue by Status</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={revenueByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#d9a441" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-serif text-lg font-bold mb-4">Attendance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="present" stackId="1" stroke="#10b981" fill="#10b98155" />
                <Area type="monotone" dataKey="late" stackId="1" stroke="#d9a441" fill="#d9a44155" />
                <Area type="monotone" dataKey="absent" stackId="1" stroke="#ef4444" fill="#ef444455" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-serif text-lg font-bold mb-4">Applications</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={appsByStatus} dataKey="value" nameKey="name" outerRadius={80} label>
                  {appsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

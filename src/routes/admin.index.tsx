import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Users, BookOpen, DollarSign, UserPlus, TrendingUp, AlertCircle, Clock } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { studentHooks, programHooks, invoiceHooks, applicationHooks, attendanceHooks } from "@/hooks/queries";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const students = studentHooks.useList();
  const programs = programHooks.useList();
  const invoices = invoiceHooks.useList();
  const apps = applicationHooks.useList();
  const attendance = attendanceHooks.useList();

  const revenue = useMemo(() => (invoices.data?.data ?? []).filter((i) => i.status === "Paid").reduce((s, i) => s + i.amountUSD, 0), [invoices.data]);
  const overdue = useMemo(() => (invoices.data?.data ?? []).filter((i) => i.status === "Overdue").length, [invoices.data]);
  const pendingApps = useMemo(() => (apps.data?.data ?? []).filter((a) => a.status === "Pending").length, [apps.data]);

  const stats = [
    { icon: Users, color: "bg-[#0f1b3d]", title: "Total Students", value: students.data?.total ?? 0, to: "/admin/students" },
    { icon: BookOpen, color: "bg-emerald-600", title: "Programs", value: programs.data?.total ?? 0, to: "/admin/classes" },
    { icon: DollarSign, color: "bg-emerald-500", title: "Revenue (paid)", value: `$${revenue.toLocaleString()}`, to: "/admin/finance" },
    { icon: UserPlus, color: "bg-purple-600", title: "Pending Applications", value: pendingApps, to: "/admin/enrollment" },
  ];

  const enrollmentTrend = useMemo(() => {
    const acc: Record<string, number> = {};
    (students.data?.data ?? []).forEach((s) => { const k = s.enrolledAt.slice(0, 7); acc[k] = (acc[k] ?? 0) + 1; });
    return Object.entries(acc).sort(([a],[b]) => a.localeCompare(b)).map(([m, v]) => ({ m, v }));
  }, [students.data]);

  const attendanceByCourse = useMemo(() => {
    const acc: Record<string, { total: number; present: number }> = {};
    (attendance.data?.data ?? []).forEach((a) => {
      acc[a.courseCode] ??= { total: 0, present: 0 };
      acc[a.courseCode].total++;
      if (a.status === "Present") acc[a.courseCode].present++;
    });
    return Object.entries(acc).map(([f, v]) => ({ f, v: v.total === 0 ? 0 : Math.round((v.present / v.total) * 100) }));
  }, [attendance.data]);

  const recentApps = (apps.data?.data ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s) => (
          <Link key={s.title} to={s.to} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className={`size-12 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon className="size-6 text-white" />
              </div>
              <span className="text-xs text-[#d9a441] font-medium">View →</span>
            </div>
            <div className="font-serif text-3xl font-bold">{s.value}</div>
            <div className="text-sm text-slate-500 mt-1">{s.title}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-serif text-lg font-bold mb-4">Enrollment Trend (by month)</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={enrollmentTrend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f1b3d" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0f1b3d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="m" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="v" stroke="#0f1b3d" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-serif text-lg font-bold mb-4">Attendance % by Course</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={attendanceByCourse} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis dataKey="f" type="category" tick={{ fill: "#64748b", fontSize: 12 }} width={60} />
                <Tooltip />
                <Bar dataKey="v" fill="#d9a441" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif text-lg font-bold">Recent Applications</h3>
            <Link to="/admin/enrollment" className="text-sm text-[#d9a441]">View all →</Link>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
                <th className="py-3">Applicant</th><th>Program</th><th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentApps.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-slate-400 text-sm">No applications yet.</td></tr>}
              {recentApps.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 font-medium text-sm">{a.applicantName}</td>
                  <td className="text-sm text-slate-600">{a.programName ?? "—"}</td>
                  <td className="text-sm text-slate-600">{a.submittedAt}</td>
                  <td><span className="text-xs px-2.5 py-1 rounded-full bg-slate-100">{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-serif text-lg font-bold mb-4">Alerts</h3>
          <div className="space-y-3">
            {overdue > 0 && <Alert icon={AlertCircle} color="bg-red-50 text-red-700 border-red-100" title={`${overdue} overdue invoice${overdue > 1 ? "s" : ""}`} sub="Past payment deadline" />}
            {pendingApps > 0 && <Alert icon={Clock} color="bg-amber-50 text-amber-700 border-amber-100" title={`${pendingApps} pending application${pendingApps > 1 ? "s" : ""}`} sub="Awaiting review" />}
            {overdue === 0 && pendingApps === 0 && <Alert icon={TrendingUp} color="bg-emerald-50 text-emerald-700 border-emerald-100" title="All caught up" sub="No outstanding actions" />}
          </div>
        </div>
      </div>
    </div>
  );
}

function Alert({ icon: Icon, color, title, sub }: { icon: typeof AlertCircle; color: string; title: string; sub: string }) {
  return (
    <div className={`flex gap-3 p-3 rounded-lg border ${color}`}>
      <Icon className="size-5 shrink-0" />
      <div>
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs opacity-80">{sub}</div>
      </div>
    </div>
  );
}

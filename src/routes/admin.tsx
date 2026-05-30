import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { GraduationCap, LayoutDashboard, Users, ClipboardList, BookOpen, CalendarCheck, GraduationCap as GradIcon, DollarSign, Award, UserCheck, CalendarDays, Newspaper, BarChart3, Bell, ExternalLink, ChevronDown, User } from "lucide-react";
import { RoleProvider, useRole, ALL_ROLES, ROLE_ACCESS, type Role } from "@/contexts/RoleContext";

export const Route = createFileRoute("/admin")({
  component: () => (
    <RoleProvider>
      <AdminLayout />
    </RoleProvider>
  ),
});

type LinkDef = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };

const ALL_LINKS: LinkDef[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/portal", label: "My Portal", icon: User, exact: true },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/enrollment", label: "Enrollment", icon: ClipboardList },
  { to: "/admin/classes", label: "Classes", icon: BookOpen },
  { to: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/admin/grades", label: "Grades", icon: GradIcon },
  { to: "/admin/finance", label: "Finance", icon: DollarSign },
  { to: "/admin/scholarships", label: "Scholarships", icon: Award },
  { to: "/admin/lecturers", label: "Lecturers", icon: UserCheck },
  { to: "/admin/timetable", label: "Timetable", icon: CalendarDays },
  { to: "/admin/news", label: "News / CMS", icon: Newspaper },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
];

const titles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/portal": "My Portal",
  "/admin/students": "Students",
  "/admin/enrollment": "Enrollment",
  "/admin/classes": "Classes",
  "/admin/attendance": "Attendance",
  "/admin/grades": "Grades",
  "/admin/finance": "Finance",
  "/admin/scholarships": "Scholarships",
  "/admin/lecturers": "Lecturers",
  "/admin/timetable": "Timetable",
  "/admin/news": "News / CMS",
  "/admin/reports": "Reports",
};

const roleDotColor: Record<Role, string> = {
  Principal: "bg-[#d9a441]",
  Staff: "bg-emerald-500",
  Lecturer: "bg-sky-500",
  Accountant: "bg-violet-500",
  Student: "bg-pink-500",
};

function AdminLayout() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { role, setRole } = useRole();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const title = titles[loc.pathname] ?? "Admin";
  const allowed = ROLE_ACCESS[role];
  const visibleLinks = ALL_LINKS.filter((l) => allowed.includes(l.to));

  // Redirect off forbidden routes
  useEffect(() => {
    if (!allowed.includes(loc.pathname)) {
      navigate({ to: allowed[0] as "/admin", replace: true });
    }
  }, [role, loc.pathname, allowed, navigate]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const portalMode = role === "Student";

  return (
    <div className="admin-shell min-h-screen flex bg-[#f5f6fa] text-[#0f1b3d]">
      <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-5 flex items-center gap-3 border-b border-slate-200">
          <div className="size-10 rounded-lg bg-[#d9a441] flex items-center justify-center">
            <GraduationCap className="size-5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-serif text-lg font-bold">{portalMode ? "AIC Portal" : "AIC Admin"}</div>
            <div className="text-xs text-slate-500">{role}</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.exact }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors data-[status=active]:bg-[#d9a441] data-[status=active]:text-white data-[status=active]:font-medium"
            >
              <l.icon className="size-4" />
              {l.label}
            </Link>
          ))}
        </nav>
        <Link to="/" className="flex items-center gap-2 m-3 p-3 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
          <ExternalLink className="size-4" />
          View Public Site
        </Link>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-8 bg-white border-b border-slate-200 flex items-center justify-between">
          <h1 className="font-serif text-xl font-bold">{title}</h1>
          <div className="flex items-center gap-4">
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 text-sm hover:bg-slate-50"
              >
                <span className={`size-2 rounded-full ${roleDotColor[role]}`} />
                {role}
                <ChevronDown className="size-3.5 text-slate-400" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50">
                  {ALL_ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => { setRole(r); setMenuOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${r === role ? "text-[#d9a441] font-medium" : "text-slate-700"}`}
                    >
                      <span className={`size-2 rounded-full ${roleDotColor[r]}`} />
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="relative size-9 rounded-md border border-slate-200 flex items-center justify-center text-slate-600">
              <Bell className="size-4" />
              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">3</span>
            </button>
            <div className="size-9 rounded-full bg-[#0f1b3d] text-white text-sm flex items-center justify-center font-medium">
              {role.charAt(0)}
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

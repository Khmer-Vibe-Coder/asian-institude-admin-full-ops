import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "Principal" | "Staff" | "Lecturer" | "Accountant" | "Student";

export const ALL_ROLES: Role[] = ["Principal", "Staff", "Lecturer", "Accountant", "Student"];

// Sidebar links each role can see (path is route URL)
export const ROLE_ACCESS: Record<Role, string[]> = {
  Principal: [
    "/admin",
    "/admin/organization",
    "/admin/students",
    "/admin/enrollment",
    "/admin/classes",
    "/admin/attendance",
    "/admin/grades",
    "/admin/finance",
    "/admin/scholarships",
    "/admin/lecturers",
    "/admin/timetable",
    "/admin/news",
    "/admin/reports",
  ],
  Staff: [
    "/admin",
    "/admin/students",
    "/admin/enrollment",
    "/admin/classes",
    "/admin/attendance",
    "/admin/timetable",
    "/admin/news",
  ],
  Lecturer: ["/admin/classes", "/admin/attendance", "/admin/grades", "/admin/timetable"],
  Accountant: ["/admin", "/admin/finance", "/admin/scholarships"],
  Student: ["/admin/portal"],
};

type Ctx = { role: Role; setRole: (r: Role) => void };
const RoleContext = createContext<Ctx | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("Principal");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("aic.role") as Role | null;
      if (stored && ALL_ROLES.includes(stored)) setRoleState(stored);
    } catch { /* noop */ }
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    try { localStorage.setItem("aic.role", r); } catch { /* noop */ }
  };

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

export function canAccess(role: Role, path: string): boolean {
  return ROLE_ACCESS[role].includes(path);
}

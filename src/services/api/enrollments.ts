import { defineResource } from "./resource";

export type Enrollment = {
  id: string;
  studentId: string; // refers to Student.id
  programId: string;
  term: string; // e.g. "2025-Fall"
  status: "Enrolled" | "Withdrawn" | "Completed";
  enrolledAt: string;
};

export const enrollmentsApi = defineResource<Enrollment>({
  endpoint: "/api/enrollments",
  table: "enrollments",
  searchFields: ["term"],
  seed: () => [
    { id: "enr_1", studentId: "stu_1", programId: "prg_1", term: "2025-Fall", status: "Enrolled", enrolledAt: "2025-08-15" },
    { id: "enr_2", studentId: "stu_2", programId: "prg_2", term: "2025-Fall", status: "Enrolled", enrolledAt: "2025-08-15" },
    { id: "enr_3", studentId: "stu_3", programId: "prg_3", term: "2025-Fall", status: "Enrolled", enrolledAt: "2025-08-15" },
  ],
});

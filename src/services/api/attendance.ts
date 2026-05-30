import { defineResource } from "./resource";

export type Attendance = {
  id: string;
  date: string; // ISO date
  courseCode: string;
  studentId: string;
  status: "Present" | "Absent" | "Late";
  note?: string;
};

export const attendanceApi = defineResource<Attendance>({
  endpoint: "/api/attendance",
  table: "attendance",
  searchFields: ["courseCode"],
  seed: () => [
    { id: "att_1", date: "2025-09-23", courseCode: "CS-301", studentId: "stu_1", status: "Present" },
    { id: "att_2", date: "2025-09-23", courseCode: "CS-301", studentId: "stu_2", status: "Late" },
    { id: "att_3", date: "2025-09-23", courseCode: "CS-301", studentId: "stu_7", status: "Absent" },
  ],
});

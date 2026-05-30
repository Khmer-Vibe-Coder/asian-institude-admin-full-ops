import { defineResource } from "./resource";

export type Grade = {
  id: string;
  studentId: string;
  courseCode: string;
  courseName: string;
  term: string;
  score: number; // 0..100
  letter: "A" | "B" | "C" | "D" | "F";
  credits: number;
};

export const gradesApi = defineResource<Grade>({
  endpoint: "/api/grades",
  table: "grades",
  searchFields: ["courseCode", "courseName"],
  seed: () => [
    { id: "g_1", studentId: "stu_1", courseCode: "CS-301", courseName: "Software Architecture", term: "2025-Spring", score: 88, letter: "A", credits: 3 },
    { id: "g_2", studentId: "stu_1", courseCode: "CS-310", courseName: "Databases", term: "2025-Spring", score: 79, letter: "B", credits: 3 },
    { id: "g_3", studentId: "stu_2", courseCode: "CS-330", courseName: "Network Security", term: "2025-Spring", score: 92, letter: "A", credits: 3 },
  ],
});

export function letterFromScore(score: number): Grade["letter"] {
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 65) return "C";
  if (score >= 50) return "D";
  return "F";
}

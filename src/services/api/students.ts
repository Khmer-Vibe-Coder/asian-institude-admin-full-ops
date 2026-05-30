import { defineResource } from "./resource";

export type Student = {
  id: string;
  studentId: string; // human-readable AIC-YYYY-XXX
  name: string;
  khmerName?: string;
  email: string;
  phone?: string;
  faculty: "FIT" | "FBA" | "FLSS";
  major: string;
  year: "Y1" | "Y2" | "Y3" | "Y4" | "Y5";
  gpa: number;
  status: "Active" | "Graduating" | "Suspended" | "Inactive";
  enrolledAt: string; // ISO date
  photo?: string;
};

export const studentsApi = defineResource<Student>({
  endpoint: "/api/students",
  table: "students",
  searchFields: ["name", "studentId", "email", "major"],
  seed: () => [
    { id: "stu_1", studentId: "AIC-2023-001", name: "Ratanak Sok", email: "ratanak.sok@student.aic.edu.kh", phone: "+855 12 345 678", faculty: "FIT", major: "Software Engineering", year: "Y3", gpa: 3.7, status: "Active", enrolledAt: "2023-09-01", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200" },
    { id: "stu_2", studentId: "AIC-2023-002", name: "Sreyleak Chan", email: "sreyleak.chan@student.aic.edu.kh", phone: "+855 12 222 111", faculty: "FIT", major: "Cybersecurity", year: "Y3", gpa: 3.9, status: "Active", enrolledAt: "2023-09-01", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200" },
    { id: "stu_3", studentId: "AIC-2022-045", name: "Dara Meng", email: "dara.meng@student.aic.edu.kh", phone: "+855 17 808 808", faculty: "FBA", major: "International Business", year: "Y4", gpa: 3.4, status: "Active", enrolledAt: "2022-09-01", photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200" },
    { id: "stu_4", studentId: "AIC-2024-012", name: "Pisey Lim", email: "pisey.lim@student.aic.edu.kh", faculty: "FIT", major: "Artificial Intelligence", year: "Y1", gpa: 3.6, status: "Active", enrolledAt: "2024-09-01", photo: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=200" },
    { id: "stu_5", studentId: "AIC-2021-088", name: "Makara Khun", email: "makara.khun@student.aic.edu.kh", faculty: "FLSS", major: "International Law", year: "Y5", gpa: 3.8, status: "Graduating", enrolledAt: "2021-09-01", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" },
    { id: "stu_6", studentId: "AIC-2023-078", name: "Channary Pon", email: "channary.pon@student.aic.edu.kh", faculty: "FBA", major: "Finance & Accounting", year: "Y3", gpa: 3.2, status: "Active", enrolledAt: "2023-09-01", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200" },
    { id: "stu_7", studentId: "AIC-2024-034", name: "Vichet Noun", email: "vichet.noun@student.aic.edu.kh", faculty: "FIT", major: "Software Engineering", year: "Y2", gpa: 3.5, status: "Active", enrolledAt: "2024-09-01", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200" },
    { id: "stu_8", studentId: "AIC-2022-112", name: "Sokha Prum", email: "sokha.prum@student.aic.edu.kh", faculty: "FIT", major: "Cybersecurity", year: "Y4", gpa: 2.1, status: "Suspended", enrolledAt: "2022-09-01", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200" },
  ],
});

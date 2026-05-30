import { defineResource } from "./resource";

export type Lecturer = {
  id: string;
  name: string;
  khmerName?: string;
  title: string; // e.g. "Associate Professor"
  department: "FIT" | "FBA" | "FLSS" | "Admin";
  email: string;
  phone?: string;
  bio?: string;
  photo?: string;
  courses?: string[]; // course codes
  status: "Active" | "On Leave" | "Retired";
};

export const lecturersApi = defineResource<Lecturer>({
  endpoint: "/api/lecturers",
  table: "lecturers",
  searchFields: ["name", "email", "department", "title"],
  seed: () => [
    { id: "lec_1", name: "Dr. Sopheap Kim", title: "Associate Professor", department: "FIT", email: "sopheap.kim@aic.edu.kh", bio: "PhD in Computer Science with 12+ years of experience in software engineering education.", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400", courses: ["CS-301", "CS-410"], status: "Active" },
    { id: "lec_2", name: "Prof. Vanna Heng", title: "Department Chair", department: "FBA", email: "vanna.heng@aic.edu.kh", bio: "PhD in International Business; ex-McKinsey consultant.", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400", courses: ["BA-201", "BA-405"], status: "Active" },
    { id: "lec_3", name: "Dr. Channary Tep", title: "Senior Lecturer", department: "FLSS", email: "channary.tep@aic.edu.kh", bio: "Specialist in international and constitutional law.", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400", courses: ["LAW-202", "LAW-301"], status: "Active" },
    { id: "lec_4", name: "Mr. Sokha Pich", title: "Lecturer", department: "FIT", email: "sokha.pich@aic.edu.kh", bio: "Industry expert in cloud architecture and DevOps.", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", courses: ["CS-305"], status: "Active" },
  ],
});

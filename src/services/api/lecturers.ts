import { defineResource } from "./resource";

export type Lecturer = {
  id: string;
  name: string;
  khmerName?: string;
  title: string; // e.g. "Associate Professor"
  /** Primary faculty code */
  department: "FIT" | "FBA" | "FLSS" | "Admin";
  /** Additional department IDs this lecturer teaches in */
  departmentIds?: string[];
  /** Majorities (majors) this lecturer is assigned to, comma-separated */
  majorities?: string[];
  email: string;
  phone?: string;
  bio?: string;
  photo?: string;
  courses?: string[]; // course codes
  /** Active = still employed here; Inactive = no longer active; On Leave / Retired */
  status: "Active" | "Inactive" | "On Leave" | "Retired";
};

export const lecturersApi = defineResource<Lecturer>({
  endpoint: "/api/lecturers",
  table: "lecturers",
  searchFields: ["name", "email", "department", "title"],
  seed: () => [
    { id: "lec_1", name: "Dr. Sopheap Kim", title: "Associate Professor", department: "FIT", departmentIds: ["dep_cs", "dep_se"], majorities: ["Computer Science", "Software Engineering"], email: "sopheap.kim@aic.edu.kh", bio: "PhD in Computer Science with 12+ years of experience in software engineering education.", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400", courses: ["CS-301", "CS-410"], status: "Active" },
    { id: "lec_2", name: "Prof. Vanna Heng", title: "Department Chair", department: "FBA", departmentIds: ["dep_mgmt", "dep_mkt"], majorities: ["Management & Entrepreneurship", "Marketing"], email: "vanna.heng@aic.edu.kh", bio: "PhD in International Business; ex-McKinsey consultant.", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400", courses: ["BA-201", "BA-405"], status: "Active" },
    { id: "lec_3", name: "Dr. Channary Tep", title: "Senior Lecturer", department: "FLSS", departmentIds: ["dep_law", "dep_soc"], majorities: ["Law & Governance", "Social Science"], email: "channary.tep@aic.edu.kh", bio: "Specialist in international and constitutional law.", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400", courses: ["LAW-202", "LAW-301"], status: "Active" },
    { id: "lec_4", name: "Mr. Sokha Pich", title: "Lecturer", department: "FIT", departmentIds: ["dep_cs", "dep_net"], majorities: ["Network & Cybersecurity", "Computer Science"], email: "sokha.pich@aic.edu.kh", bio: "Industry expert in cloud architecture and DevOps.", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", courses: ["CS-305"], status: "Active" },
    { id: "lec_5", name: "Ms. Pisey Nhem", title: "Lecturer", department: "FIT", departmentIds: ["dep_se"], majorities: ["Software Engineering"], email: "pisey.nhem@aic.edu.kh", bio: "Specializes in agile development and UI/UX engineering.", photo: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400", courses: ["SE-201", "SE-310"], status: "Active" },
    { id: "lec_6", name: "Ms. Bopha Mao", title: "Senior Lecturer", department: "FBA", departmentIds: ["dep_acc"], majorities: ["Accounting & Finance"], email: "bopha.mao@aic.edu.kh", bio: "CPA with 8 years of corporate finance experience.", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400", courses: ["ACC-201"], status: "Inactive" },
  ],
});

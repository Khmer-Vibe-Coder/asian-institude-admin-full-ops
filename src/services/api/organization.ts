import { defineResource } from "./resource";

export type Department = {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  head?: string;      // name of department head
  majorCount: number;
  studentCount: number;
};

export type Faculty = {
  id: string;
  name: string;
  code: string;
  color: string;      // brand color token for the tree card
  dean?: string;      // name of dean
  departments: Department[];
  totalLecturers: number;
  totalStudents: number;
};

// We need a flat storable version for defineResource
export type FacultyRecord = {
  id: string;
  name: string;
  code: string;
  color: string;
  dean?: string;
  totalLecturers: number;
  totalStudents: number;
};

export type DepartmentRecord = {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  head?: string;
  majorCount: number;
  studentCount: number;
};

export const facultiesApi = defineResource<FacultyRecord>({
  endpoint: "/api/faculties",
  table: "faculties",
  searchFields: ["name", "code", "dean"],
  seed: () => [
    {
      id: "fac_fit",
      name: "Faculty of Information Technology",
      code: "FIT",
      color: "#4f46e5",
      dean: "Dr. Sopheap Kim",
      totalLecturers: 12,
      totalStudents: 430,
    },
    {
      id: "fac_fba",
      name: "Faculty of Business Administration",
      code: "FBA",
      color: "#0891b2",
      dean: "Prof. Vanna Heng",
      totalLecturers: 9,
      totalStudents: 520,
    },
    {
      id: "fac_flss",
      name: "Faculty of Law & Social Sciences",
      code: "FLSS",
      color: "#7c3aed",
      dean: "Dr. Channary Tep",
      totalLecturers: 7,
      totalStudents: 310,
    },
    {
      id: "fac_admin",
      name: "Administration & Support",
      code: "ADMIN",
      color: "#d9a441",
      dean: "Mr. Dara Sok",
      totalLecturers: 4,
      totalStudents: 0,
    },
  ],
});

export const departmentsApi = defineResource<DepartmentRecord>({
  endpoint: "/api/departments",
  table: "departments",
  searchFields: ["name", "code", "head", "facultyId"],
  seed: () => [
    // FIT departments
    { id: "dep_cs", name: "Computer Science", code: "CS", facultyId: "fac_fit", head: "Dr. Sokha Pich", majorCount: 3, studentCount: 185 },
    { id: "dep_se", name: "Software Engineering", code: "SE", facultyId: "fac_fit", head: "Ms. Pisey Nhem", majorCount: 2, studentCount: 145 },
    { id: "dep_net", name: "Network & Cybersecurity", code: "NET", facultyId: "fac_fit", head: "Mr. Rith Chan", majorCount: 2, studentCount: 100 },
    // FBA departments
    { id: "dep_mgmt", name: "Management & Entrepreneurship", code: "MGMT", facultyId: "fac_fba", head: "Dr. Lina Oun", majorCount: 3, studentCount: 210 },
    { id: "dep_acc", name: "Accounting & Finance", code: "ACC", facultyId: "fac_fba", head: "Ms. Bopha Mao", majorCount: 2, studentCount: 185 },
    { id: "dep_mkt", name: "Marketing & International Trade", code: "MKT", facultyId: "fac_fba", head: "Mr. Vuthy Keo", majorCount: 2, studentCount: 125 },
    // FLSS departments
    { id: "dep_law", name: "Law & Governance", code: "LAW", facultyId: "fac_flss", head: "Dr. Channary Tep", majorCount: 2, studentCount: 150 },
    { id: "dep_soc", name: "Social Science & Development", code: "SOC", facultyId: "fac_flss", head: "Ms. Sreymom Ly", majorCount: 2, studentCount: 160 },
    // Admin
    { id: "dep_hr", name: "Human Resources", code: "HR", facultyId: "fac_admin", head: "Mr. Dara Sok", majorCount: 0, studentCount: 0 },
    { id: "dep_it_sup", name: "IT Support", code: "ITS", facultyId: "fac_admin", head: "Mr. Samrach Em", majorCount: 0, studentCount: 0 },
  ],
});

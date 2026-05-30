/**
 * Pre-built hook bundles for every resource. Admin/public pages import from
 * here so they never touch React Query keys directly.
 */
import { createResourceHooks } from "./createResourceHooks";
import {
  studentsApi,
  lecturersApi,
  programsApi,
  newsApi,
  scholarshipsApi,
  scholarshipAppsApi,
  applicationsApi,
  enrollmentsApi,
  attendanceApi,
  gradesApi,
  invoicesApi,
  timetableApi,
  messagesApi,
  facultiesApi,
  departmentsApi,
} from "@/services/api";

export const studentHooks = createResourceHooks(studentsApi, "students");
export const lecturerHooks = createResourceHooks(lecturersApi, "lecturers");
export const programHooks = createResourceHooks(programsApi, "programs");
export const newsHooks = createResourceHooks(newsApi, "news");
export const scholarshipHooks = createResourceHooks(scholarshipsApi, "scholarships");
export const scholarshipAppHooks = createResourceHooks(scholarshipAppsApi, "scholarship-applications");
export const applicationHooks = createResourceHooks(applicationsApi, "applications");
export const enrollmentHooks = createResourceHooks(enrollmentsApi, "enrollments");
export const attendanceHooks = createResourceHooks(attendanceApi, "attendance");
export const gradeHooks = createResourceHooks(gradesApi, "grades");
export const invoiceHooks = createResourceHooks(invoicesApi, "invoices");
export const timetableHooks = createResourceHooks(timetableApi, "timetable");
export const messageHooks = createResourceHooks(messagesApi, "messages");
export const facultyHooks = createResourceHooks(facultiesApi, "faculties");
export const departmentHooks = createResourceHooks(departmentsApi, "departments");

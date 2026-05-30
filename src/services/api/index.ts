/**
 * Public API surface — import resource APIs from `@/services/api`.
 *
 * To switch from mock to real backend, flip USE_MOCK in client.ts.
 */
export { USE_MOCK, httpClient } from "./client";
export type { ListParams, ListResult } from "./client";
export { studentsApi, type Student } from "./students";
export { lecturersApi, type Lecturer } from "./lecturers";
export { programsApi, type Program } from "./programs";
export { newsApi, type NewsArticle } from "./news";
export { scholarshipsApi, scholarshipAppsApi, type Scholarship, type ScholarshipApplication } from "./scholarships";
export { applicationsApi, type Application } from "./applications";
export { enrollmentsApi, type Enrollment } from "./enrollments";
export { attendanceApi, type Attendance } from "./attendance";
export { gradesApi, letterFromScore, type Grade } from "./grades";
export { invoicesApi, type Invoice } from "./finance";
export { timetableApi, type TimetableSlot } from "./timetable";
export { messagesApi, type ContactMessage } from "./messages";
export { facultiesApi, departmentsApi, type FacultyRecord, type DepartmentRecord } from "./organization";

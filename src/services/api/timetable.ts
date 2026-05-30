import { defineResource } from "./resource";

export type TimetableSlot = {
  id: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
  startTime: string; // "08:00"
  endTime: string; // "09:30"
  courseCode: string;
  courseName: string;
  lecturer: string;
  room: string;
  term: string;
};

export const timetableApi = defineResource<TimetableSlot>({
  endpoint: "/api/timetable",
  table: "timetable",
  searchFields: ["courseCode", "courseName", "lecturer", "room"],
  seed: () => [
    { id: "tt_1", day: "Mon", startTime: "08:00", endTime: "09:30", courseCode: "CS-301", courseName: "Software Architecture", lecturer: "Dr. Sopheap Kim", room: "B-201", term: "2025-Fall" },
    { id: "tt_2", day: "Mon", startTime: "10:00", endTime: "11:30", courseCode: "CS-310", courseName: "Databases", lecturer: "Mr. Sokha Pich", room: "B-203", term: "2025-Fall" },
    { id: "tt_3", day: "Tue", startTime: "13:00", endTime: "14:30", courseCode: "CS-330", courseName: "Network Security", lecturer: "Dr. Sopheap Kim", room: "C-105", term: "2025-Fall" },
    { id: "tt_4", day: "Wed", startTime: "08:00", endTime: "09:30", courseCode: "BA-201", courseName: "Marketing Principles", lecturer: "Prof. Vanna Heng", room: "A-301", term: "2025-Fall" },
    { id: "tt_5", day: "Thu", startTime: "10:00", endTime: "11:30", courseCode: "LAW-202", courseName: "Constitutional Law", lecturer: "Dr. Channary Tep", room: "A-110", term: "2025-Fall" },
  ],
});

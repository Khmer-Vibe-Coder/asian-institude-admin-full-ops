import { defineResource } from "./resource";

export type Application = {
  id: string;
  applicantName: string;
  khmerName?: string;
  email: string;
  phone: string;
  dob?: string;
  programId: string;
  programName?: string;
  message?: string;
  submittedAt: string;
  status: "Pending" | "Reviewing" | "Accepted" | "Rejected";
};

export const applicationsApi = defineResource<Application>({
  endpoint: "/api/applications",
  table: "applications",
  searchFields: ["applicantName", "email", "programName"],
  seed: () => [
    { id: "app_1", applicantName: "Sotheary Yim", email: "sotheary.yim@example.com", phone: "+855 12 678 945", programId: "prg_1", programName: "BSc in Software Engineering", submittedAt: "2025-09-10", status: "Pending" },
    { id: "app_2", applicantName: "Bunna Sok", email: "bunna.sok@example.com", phone: "+855 17 778 110", programId: "prg_3", programName: "BBA in International Business", submittedAt: "2025-09-08", status: "Reviewing" },
    { id: "app_3", applicantName: "Daravuth Long", email: "daravuth.long@example.com", phone: "+855 96 002 245", programId: "prg_2", programName: "BSc in Cybersecurity", submittedAt: "2025-09-02", status: "Accepted" },
  ],
});

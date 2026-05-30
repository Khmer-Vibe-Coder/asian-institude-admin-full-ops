import { defineResource } from "./resource";

export type Scholarship = {
  id: string;
  name: string;
  amountUSD: number;
  deadline: string; // ISO date
  eligibility: string;
  description: string;
  status: "Open" | "Closed";
};

export const scholarshipsApi = defineResource<Scholarship>({
  endpoint: "/api/scholarships",
  table: "scholarships",
  searchFields: ["name", "description"],
  seed: () => [
    { id: "sch_1", name: "AIC Merit Scholarship", amountUSD: 2000, deadline: "2026-03-31", eligibility: "GPA ≥ 3.7, Cambodian citizen", description: "Awarded annually to top-performing undergraduate students.", status: "Open" },
    { id: "sch_2", name: "Women in Tech Grant", amountUSD: 1500, deadline: "2026-02-15", eligibility: "Women enrolled in FIT", description: "Encouraging female participation in computer science.", status: "Open" },
    { id: "sch_3", name: "Rural Outreach Fund", amountUSD: 1200, deadline: "2026-04-20", eligibility: "Students from rural provinces", description: "Supporting access to higher education across Cambodia.", status: "Open" },
    { id: "sch_4", name: "Alumni Legacy Award", amountUSD: 1000, deadline: "2025-12-01", eligibility: "Children of AIC alumni", description: "Funded by the AIC alumni community.", status: "Closed" },
  ],
});

/** Sub-resource: applications submitted for a scholarship. */
export type ScholarshipApplication = {
  id: string;
  scholarshipId: string;
  applicantName: string;
  email: string;
  phone?: string;
  reason: string;
  submittedAt: string;
  status: "Pending" | "Approved" | "Rejected";
};

export const scholarshipAppsApi = defineResource<ScholarshipApplication>({
  endpoint: "/api/scholarship-applications",
  table: "scholarship_applications",
  searchFields: ["applicantName", "email"],
  seed: () => [],
});

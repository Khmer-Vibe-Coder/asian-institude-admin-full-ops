import { defineResource } from "./resource";

export type Invoice = {
  id: string;
  studentId: string;
  studentName?: string;
  description: string;
  amountUSD: number;
  dueDate: string;
  status: "Unpaid" | "Paid" | "Overdue";
  paidAt?: string;
  method?: "Cash" | "Bank Transfer" | "Card" | "ABA" | "Wing";
};

export const invoicesApi = defineResource<Invoice>({
  endpoint: "/api/invoices",
  table: "invoices",
  searchFields: ["studentName", "description"],
  seed: () => [
    { id: "inv_1", studentId: "stu_1", studentName: "Ratanak Sok", description: "Tuition Fall 2025", amountUSD: 1200, dueDate: "2025-09-30", status: "Paid", paidAt: "2025-09-20", method: "ABA" },
    { id: "inv_2", studentId: "stu_2", studentName: "Sreyleak Chan", description: "Tuition Fall 2025", amountUSD: 1300, dueDate: "2025-09-30", status: "Unpaid" },
    { id: "inv_3", studentId: "stu_8", studentName: "Sokha Prum", description: "Tuition Spring 2025", amountUSD: 1200, dueDate: "2025-02-28", status: "Overdue" },
  ],
});

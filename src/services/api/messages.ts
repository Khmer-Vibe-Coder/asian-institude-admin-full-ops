import { defineResource } from "./resource";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  status: "New" | "Replied" | "Archived";
};

export const messagesApi = defineResource<ContactMessage>({
  endpoint: "/api/messages",
  table: "messages",
  searchFields: ["name", "email", "subject"],
  seed: () => [],
});

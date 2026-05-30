import { defineResource } from "./resource";

export type Program = {
  id: string;
  code: string; // e.g. "BSC-SE"
  name: string;
  faculty: "FIT" | "FBA" | "FLSS";
  level: "Bachelor" | "Master" | "PhD" | "Diploma";
  durationYears: number;
  credits: number;
  tuitionUSD: number;
  description: string;
  highlights?: string[];
  status: "Open" | "Closed";
};

export const programsApi = defineResource<Program>({
  endpoint: "/api/programs",
  table: "programs",
  searchFields: ["name", "code", "description"],
  seed: () => [
    { id: "prg_1", code: "BSC-SE", name: "BSc in Software Engineering", faculty: "FIT", level: "Bachelor", durationYears: 4, credits: 144, tuitionUSD: 2400, description: "Build production-grade software with modern engineering practices.", highlights: ["Full-stack web", "Mobile development", "Cloud & DevOps"], status: "Open" },
    { id: "prg_2", code: "BSC-CYB", name: "BSc in Cybersecurity", faculty: "FIT", level: "Bachelor", durationYears: 4, credits: 144, tuitionUSD: 2600, description: "Defend systems against modern cyber threats.", highlights: ["Offensive security", "Network defense", "Cryptography"], status: "Open" },
    { id: "prg_3", code: "BBA-IB", name: "BBA in International Business", faculty: "FBA", level: "Bachelor", durationYears: 4, credits: 138, tuitionUSD: 2200, description: "Lead businesses in a globally connected economy.", highlights: ["Cross-cultural strategy", "Trade & finance", "Entrepreneurship"], status: "Open" },
    { id: "prg_4", code: "LLB-IL", name: "LLB in International Law", faculty: "FLSS", level: "Bachelor", durationYears: 5, credits: 180, tuitionUSD: 2100, description: "Practice law in a global legal landscape.", highlights: ["Human rights", "Trade law", "ASEAN integration"], status: "Open" },
    { id: "prg_5", code: "MSC-AI", name: "MSc in Artificial Intelligence", faculty: "FIT", level: "Master", durationYears: 2, credits: 72, tuitionUSD: 3800, description: "Applied AI for industry and research.", highlights: ["Deep learning", "MLOps", "NLP"], status: "Open" },
  ],
});

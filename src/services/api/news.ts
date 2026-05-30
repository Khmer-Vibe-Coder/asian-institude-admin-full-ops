import { defineResource } from "./resource";

export type NewsArticle = {
  id: string;
  title: string;
  slug: string;
  category: "Academics" | "Research" | "Events" | "Student Life" | "Announcement";
  excerpt: string;
  body: string;
  coverImage?: string;
  author: string;
  publishedAt: string; // ISO
  status: "Draft" | "Published";
};

export const newsApi = defineResource<NewsArticle>({
  endpoint: "/api/news",
  table: "news",
  searchFields: ["title", "excerpt", "author"],
  seed: () => [
    { id: "n_1", title: "AIC Launches New AI Research Center", slug: "ai-research-center", category: "Research", excerpt: "A landmark step for applied AI in Cambodia.", body: "The Asian Institute of Cambodia (AIC) is proud to announce the launch of its new AI Research Center, focused on practical applications for ASEAN economies.\n\nThe center will host postgraduate researchers and industry collaborators.", coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200", author: "AIC Newsroom", publishedAt: "2025-09-01", status: "Published" },
    { id: "n_2", title: "Spring Convocation Ceremony 2025", slug: "spring-convocation-2025", category: "Events", excerpt: "Celebrating our graduating class of 2025.", body: "Join us at the AIC main hall to honor over 480 graduates across all faculties.", coverImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200", author: "Student Affairs", publishedAt: "2025-08-12", status: "Published" },
    { id: "n_3", title: "AIC and Tokyo Tech Sign MoU", slug: "tokyo-tech-mou", category: "Announcement", excerpt: "Bilateral exchange and joint research begin in 2026.", body: "Faculty and student exchange begins next academic year.", coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200", author: "Office of the President", publishedAt: "2025-07-30", status: "Published" },
    { id: "n_4", title: "Software Engineering Cohort Wins ASEAN Hackathon", slug: "asean-hackathon-win", category: "Student Life", excerpt: "Four FIT seniors take first place.", body: "Project 'Khmer Sign Translator' won first place at the ASEAN Hackathon 2025.", coverImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200", author: "FIT Department", publishedAt: "2025-06-15", status: "Published" },
  ],
});

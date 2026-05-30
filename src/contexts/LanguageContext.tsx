import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "kh";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (en: string, kh: string) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("lang") as Lang | null) : null;
    if (saved === "en" || saved === "kh") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  const toggle = () => setLang(lang === "en" ? "kh" : "en");
  const t = (en: string, kh: string) => (lang === "en" ? en : kh);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export const SCHOOL_NAME = {
  en: "Asian Institute of Cambodia",
  kh: "វិទ្យាស្ថានអាស៊ី កម្ពុជា -ភ្នំពេញ",
};

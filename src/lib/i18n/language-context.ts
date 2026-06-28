import { createContext } from "react";
import type { Language, TranslationDictionary } from "./translations";

export type LanguageContextValue = {
  language: Language;
  locale: string;
  currency: string;
  t: TranslationDictionary;
  setLanguage: (language: Language) => void;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);

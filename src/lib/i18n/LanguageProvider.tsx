import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  LanguageContext,
  type LanguageContextValue,
} from "./language-context";
import {
  type Language,
  translations,
} from "./translations";

const STORAGE_KEY = "fintrack_language";

function getBrowserLanguage(): Language {
  const browserLanguage = navigator.language.toLowerCase();

  if (browserLanguage.startsWith("pt")) {
    return "pt-BR";
  }

  return "en";
}

function getInitialLanguage(): Language {
  const storedLanguage = localStorage.getItem(STORAGE_KEY);

  if (storedLanguage === "en" || storedLanguage === "pt-BR") {
    return storedLanguage;
  }

  return getBrowserLanguage();
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage);
    localStorage.setItem(STORAGE_KEY, nextLanguage);
  }

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      locale: language === "pt-BR" ? "pt-BR" : "en-US",
      currency: language === "pt-BR" ? "BRL" : "USD",
      t: translations[language],
      setLanguage,
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

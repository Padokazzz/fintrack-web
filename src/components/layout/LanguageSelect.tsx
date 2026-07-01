import { Languages } from "lucide-react";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { languages, type Language } from "../../lib/i18n/translations";

export function LanguageSelect() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-2 text-sm font-medium text-slate-700 sm:px-3">
      <Languages className="h-4 w-4" />
      <span className="sr-only">{t.language}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className="max-w-24 bg-transparent text-sm outline-none sm:max-w-none"
        aria-label={t.language}
      >
        {languages.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

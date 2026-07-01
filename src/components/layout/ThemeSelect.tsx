import { Moon, Monitor, Sun } from "lucide-react";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { useTheme } from "../../lib/theme/useTheme";
import type { ThemePreference } from "../../lib/theme/theme-context";

const themeOptions: { value: ThemePreference; icon: typeof Monitor }[] = [
  { value: "system", icon: Monitor },
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
];

export function ThemeSelect() {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const selectedOption =
    themeOptions.find((option) => option.value === theme) ?? themeOptions[0];
  const Icon = selectedOption.icon;

  return (
    <label className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-2 text-sm font-medium text-slate-700 sm:px-3">
      <Icon className="h-4 w-4" />
      <span className="sr-only">{t.theme.label}</span>
      <select
        value={theme}
        onChange={(event) => setTheme(event.target.value as ThemePreference)}
        className="max-w-20 bg-transparent text-sm outline-none sm:max-w-none"
        aria-label={t.theme.label}
      >
        {themeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {t.theme[option.value]}
          </option>
        ))}
      </select>
    </label>
  );
}

import { InstallWebApp } from "../ui/InstallWebApp";
import { useState } from "react";
import { LogOut, Menu, Settings2 } from "lucide-react";
import { useAuth } from "../../features/auth/use-auth";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { LanguageSelect } from "./LanguageSelect";
import { ThemeSelect } from "./ThemeSelect";

type HeaderProps = {
  onMenuClick: () => void;
  menuOpen: boolean;
};

export function Header({ onMenuClick, menuOpen }: HeaderProps) {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError(false);
    try {
      await logout();
    } catch {
      setLogoutError(true);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="flex min-h-14 min-w-0 shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50 md:hidden"
          aria-label={t.nav.openMenu}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-950">
            {user?.name || t.user}
          </p>
          <p className="hidden truncate text-xs text-slate-500 sm:block">{user?.email}</p>
        </div>
      </div>

      <details className="relative z-30 shrink-0">
        <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-lg text-slate-700 hover:bg-slate-50 [&::-webkit-details-marker]:hidden"
          aria-label={language === "pt-BR" ? "Preferências" : "Preferences"}>
          <Settings2 aria-hidden="true" className="size-5" />
        </summary>
        <div className="absolute right-0 top-full mt-1 flex w-64 max-w-[calc(100vw-2rem)] flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <ThemeSelect />
          <LanguageSelect />
          <InstallWebApp />
          <button type="button" onClick={handleLogout} disabled={loggingOut}
            className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-medium text-slate-700 hover:text-slate-950">
            <LogOut aria-hidden="true" className="size-4" />
            {t.logout}
          </button>
        </div>
      </details>
      {logoutError && <p role="alert" className="w-full text-sm text-rose-700">{t.logoutError}</p>}
    </header>
  );
}

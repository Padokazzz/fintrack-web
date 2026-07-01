import { LogOut, Menu } from "lucide-react";
import { useAuth } from "../../features/auth/use-auth";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { LanguageSelect } from "./LanguageSelect";

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50 md:hidden"
          aria-label={t.nav.openMenu}
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-950">
            {user?.name || t.user}
          </p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <LanguageSelect />

        <button
          type="button"
          onClick={logout}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{t.logout}</span>
        </button>
      </div>
    </header>
  );
}

import { CalendarDays, House, List, Wallet } from "lucide-react";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

const mobileLinks = [
  { to: "/dashboard", icon: House, pt: "Início", en: "Home" },
  { to: "/transactions", icon: List, pt: "Lançamentos", en: "Entries" },
  { to: "/recurrences", icon: CalendarDays, pt: "Contas fixas", en: "Bills" },
  { to: "/accounts", icon: Wallet, pt: "Contas e cartões", en: "Accounts" },
];

export function AppLayout() {
  const { language } = useLanguage();
  const pt = language === "pt-BR";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-[calc(100dvh_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] bg-slate-100 text-slate-950">
      <div className="flex min-h-[inherit]">
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header menuOpen={isMobileMenuOpen} onMenuClick={() => setIsMobileMenuOpen(true)} />

          <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-3 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-6 md:py-6">
            <Outlet />
          </main>
        </div>
      </div>
      <nav aria-label={pt ? "Atalhos principais" : "Main shortcuts"}
        className="fixed right-[env(safe-area-inset-right)] bottom-0 left-[env(safe-area-inset-left)] z-20 grid grid-cols-4 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {mobileLinks.map(({ to, icon: Icon, pt: label, en }) => (
          <NavLink key={to} to={to} className="flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 px-1 py-1 text-center text-[11px] leading-tight text-slate-700 aria-[current=page]:bg-emerald-50 aria-[current=page]:font-semibold aria-[current=page]:text-emerald-800">
            <Icon aria-hidden="true" className="h-5 w-5" />
            <span className="max-w-full [overflow-wrap:anywhere]">{pt ? label : en}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

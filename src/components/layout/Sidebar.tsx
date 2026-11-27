import { FinTrackLogo } from "../ui/FinTrackLogo";
import {
  ArrowLeftRight,
  ChartNoAxesCombined,
  CalendarDays,
  LayoutDashboard,
  Repeat2,
  X,
  Tags,
  Shield,
  Wallet,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../../lib/i18n/useLanguage";

const navItems = [
  {
    labelKey: "dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    labelKey: "accounts",
    to: "/accounts",
    icon: Wallet,
  },
  {
    labelKey: "categories",
    to: "/categories",
    icon: Tags,
  },
  {
    labelKey: "transactions",
    to: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    labelKey: "transfers",
    to: "/transfers",
    icon: Repeat2,
  },
  {
    labelKey: "recurrences",
    to: "/recurrences",
    icon: CalendarDays,
  },
  {
    labelKey: "reports",
    to: "/reports/monthly-summary",
    icon: ChartNoAxesCombined,
  },
  { labelKey: "myData", to: "/my-data", icon: Shield },
] as const;

type SidebarProps = {
  isMobileOpen: boolean;
  onMobileClose: () => void;
};

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useLanguage();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              ].join(" ")
            }
          >
            <Icon className="h-4 w-4" />
            <span>{t.nav[item.labelKey]}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const { t } = useLanguage();
  const drawer = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = drawer.current;
    if (!dialog) return;

    if (isMobileOpen && !dialog.open) dialog.showModal();
    if (!isMobileOpen && dialog.open) dialog.close();

    const desktop = window.matchMedia("(min-width: 768px)");
    function closeOnDesktop() {
      if (desktop.matches && dialog?.open) dialog.close();
    }
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [isMobileOpen]);

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-5 md:block">
        <div className="mb-8 px-2">
          <FinTrackLogo />
          <p className="mt-1 text-sm text-slate-500">{t.personalFinance}</p>
        </div>

        <NavigationLinks />
      </aside>

      <dialog
        ref={drawer}
        id="mobile-navigation"
        aria-label={t.nav.openMenu}
        onClose={onMobileClose}
        className="fixed inset-0 m-0 h-dvh max-h-none w-72 max-w-[85vw] overflow-y-auto overscroll-contain border-r border-slate-200 bg-white p-5 text-slate-950 shadow-xl backdrop:bg-slate-950/40 md:hidden"
      >
            <div className="mb-8 flex items-start justify-between gap-4 px-2">
              <div>
                <FinTrackLogo />
                <p className="mt-1 text-sm text-slate-500">
                  {t.personalFinance}
                </p>
              </div>

              <button
                type="button"
                onClick={onMobileClose}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50"
                aria-label={t.nav.closeMenu}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <NavigationLinks onNavigate={onMobileClose} />
      </dialog>
    </>
  );
}

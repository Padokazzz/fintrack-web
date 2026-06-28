import {
  ArrowLeftRight,
  ChartNoAxesCombined,
  LayoutDashboard,
  Tags,
  Wallet,
} from "lucide-react";
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
    labelKey: "reports",
    to: "/reports/monthly-summary",
    icon: ChartNoAxesCombined,
  },
] as const;

export function Sidebar() {
  const { t } = useLanguage();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-5 md:block">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-semibold tracking-normal text-slate-950">
          FinTrack
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t.personalFinance}</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
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
    </aside>
  );
}

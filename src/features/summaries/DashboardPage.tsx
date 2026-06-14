import { SummaryCard } from "../../components/ui/SummaryCard";
import { formatCurrency } from "../../lib/formatters";
import { MonthlyOverviewChart } from "./components/MonthlyOverviewChart";
import { RecentTransactions } from "./components/RecentTransactions";

const summary = {
  income: 8500,
  expenses: 4230,
  balance: 4270,
  transactions: 18,
};

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your monthly financial performance.
          </p>
        </div>

        <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
          June 2026
        </span>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Income"
          value={formatCurrency(summary.income)}
          description="Total income this month"
        />

        <SummaryCard
          title="Expenses"
          value={formatCurrency(summary.expenses)}
          description="Total expenses this month"
        />

        <SummaryCard
          title="Final balance"
          value={formatCurrency(summary.balance)}
          description="Income minus expenses"
        />

        <SummaryCard
          title="Transactions"
          value={String(summary.transactions)}
          description="Movements registered"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <MonthlyOverviewChart />
        <RecentTransactions />
      </section>
    </div>
  );
}
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SummaryCard } from "../../components/ui/SummaryCard";
import { formatCurrency } from "../../lib/formatters";
import { getTransactions } from "../transactions/transactions-service";
import { MonthYearSelector } from "./components/MonthYearSelector";
import { MonthlyOverviewChart } from "./components/MonthlyOverviewChart";
import { RecentTransactions } from "./components/RecentTransactions";
import { getMonthlySummary } from "./summaries-service";

function getCurrentPeriod() {
  const currentDate = new Date();

  return {
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  };
}

export function DashboardPage() {
  const currentPeriod = getCurrentPeriod();

  const [month, setMonth] = useState(currentPeriod.month);
  const [year, setYear] = useState(currentPeriod.year);

  const summaryQuery = useQuery({
    queryKey: ["monthly-summary", month, year],
    queryFn: () => getMonthlySummary(month, year),
  });

  const transactionsQuery = useQuery({
    queryKey: ["transactions", { month, year }],
    queryFn: () =>
      getTransactions({
        month,
        year,
      }),
  });

  const summary = summaryQuery.data;

  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpense = summary?.totalExpense ?? 0;
  const finalBalance = summary?.finalBalance ?? 0;
  const transactions = transactionsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track your monthly financial performance.
          </p>
        </div>

        <MonthYearSelector
          month={month}
          year={year}
          onMonthChange={setMonth}
          onYearChange={setYear}
        />
      </header>

      {summaryQuery.isError && (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Could not load the monthly summary.
        </section>
      )}

      {transactionsQuery.isError && (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Could not load transactions for this period.
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Income"
          value={
            summaryQuery.isLoading
              ? "Loading..."
              : formatCurrency(totalIncome)
          }
          description="Total income this month"
        />

        <SummaryCard
          title="Expenses"
          value={
            summaryQuery.isLoading
              ? "Loading..."
              : formatCurrency(totalExpense)
          }
          description="Total expenses this month"
        />

        <SummaryCard
          title="Final balance"
          value={
            summaryQuery.isLoading
              ? "Loading..."
              : formatCurrency(finalBalance)
          }
          description="Income minus expenses"
        />

        <SummaryCard
          title="Transactions"
          value={
            transactionsQuery.isLoading
              ? "Loading..."
              : String(transactions.length)
          }
          description="Movements registered"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <MonthlyOverviewChart
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          finalBalance={finalBalance}
        />

        <RecentTransactions
          transactions={transactions}
          isLoading={transactionsQuery.isLoading}
        />
      </section>
    </div>
  );
}
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Alert } from "../../components/ui/Alert";
import { SummaryCard } from "../../components/ui/SummaryCard";
import { formatCurrency } from "../../lib/formatters";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { getAccounts } from "../accounts/accounts-service";
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

export function MonthlySummaryPage() {
  const currentPeriod = getCurrentPeriod();
  const { currency, locale, t } = useLanguage();

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

  const accountsQuery = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const summary = summaryQuery.data;
  const accounts = accountsQuery.data ?? [];
  const transactions = transactionsQuery.data ?? [];

  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpense = summary?.totalExpense ?? 0;
  const finalBalance = summary?.finalBalance ?? 0;
  const overallBalance = accounts.reduce(
    (total, account) => total + account.currentBalance,
    0
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            {t.summaries.monthlyTitle}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {t.summaries.monthlyDescription}
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
        <Alert variant="error">{t.summaries.loadSummaryError}</Alert>
      )}

      {transactionsQuery.isError && (
        <Alert variant="error">{t.summaries.loadTransactionsError}</Alert>
      )}

      {accountsQuery.isError && (
        <Alert variant="error">{t.summaries.loadAccountsError}</Alert>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title={t.summaries.overallBalance}
          value={
            accountsQuery.isLoading
              ? t.common.loading
              : formatCurrency(overallBalance, locale, currency)
          }
          description={t.summaries.overallBalanceDescription}
        />

        <SummaryCard
          title={t.summaries.totalIncome}
          value={
            summaryQuery.isLoading
              ? t.common.loading
              : formatCurrency(totalIncome, locale, currency)
          }
          description={t.summaries.incomeInPeriod}
        />

        <SummaryCard
          title={t.summaries.totalExpenses}
          value={
            summaryQuery.isLoading
              ? t.common.loading
              : formatCurrency(totalExpense, locale, currency)
          }
          description={t.summaries.expensesInPeriod}
        />

        <SummaryCard
          title={t.common.finalBalance}
          value={
            summaryQuery.isLoading
              ? t.common.loading
              : formatCurrency(finalBalance, locale, currency)
          }
          description={t.summaries.incomeMinusExpenses}
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

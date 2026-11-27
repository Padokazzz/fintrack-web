import { Link } from "react-router-dom";
import { QuickExpense } from "../transactions/components/QuickExpense";
import { SpendingInsights } from "./components/SpendingInsights";
import { UpcomingRecurrences } from "../recurrences/UpcomingRecurrences";
import { CategoryReport } from "./components/CategoryReport";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Alert } from "../../components/ui/Alert";
import { ChevronDown, Plus } from "lucide-react";
import { formatCurrency } from "../../lib/formatters";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { getTransactions } from "../transactions/transactions-service";
import { MonthYearSelector } from "./components/MonthYearSelector";
import { MonthlyOverviewChart } from "./components/MonthlyOverviewChart";
import { RecentTransactions } from "./components/RecentTransactions";
import { getMonthlySummary, getOverallBalance } from "./summaries-service";

function getCurrentPeriod() {
  const currentDate = new Date();

  return {
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  };
}

export function DashboardPage() {
  const currentPeriod = getCurrentPeriod();
  const { currency, locale, t, language } = useLanguage();

  const pt = language === "pt-BR";
  const unavailable = pt ? "Indisponível" : "Unavailable";

  const [month, setMonth] = useState(currentPeriod.month);
  const [year, setYear] = useState(currentPeriod.year);

  const summaryQuery = useQuery({
    queryKey: ["monthly-summary", month, year],
    queryFn: () => getMonthlySummary(month, year),
  });

  const transactionsQuery = useQuery({
    queryKey: ["transactions", { month, year }, 1, 5],
    queryFn: () => getTransactions({ month, year }, 1, 5),
  });

  const overallBalanceQuery = useQuery({
    queryKey: ["overall-balance"],
    queryFn: getOverallBalance,
  });

  const [showDetails, setShowDetails] = useState(false);
  const summary = summaryQuery.data;
  const overallBalance = overallBalanceQuery.data?.totalBalance ?? 0;

  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpense = summary?.totalExpense ?? 0;
  const finalBalance = summary?.finalBalance ?? 0;
  const transactions = transactionsQuery.data?.items ?? [];

  return (
    <div className="space-y-4 sm:space-y-5">
      <header className="grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{t.summaries.dashboardTitle}</h1>
        <MonthYearSelector month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />
      </header>

      <div className="space-y-2">
        <QuickExpense />
        <Link to="/recurrences?new=1" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-emerald-700">
          <Plus aria-hidden="true" className="size-4 shrink-0" />
          {pt ? "Agendar conta ou salário" : "Schedule a bill or salary"}
        </Link>
      </div>

      {summaryQuery.isError && (
        <Alert variant="error">{t.summaries.loadSummaryError}</Alert>
      )}

      {transactionsQuery.isError && (
        <Alert variant="error">{t.summaries.loadTransactionsError}</Alert>
      )}

      {overallBalanceQuery.isError && (
        <Alert variant="error">{t.summaries.loadAccountsError}</Alert>
      )}

      <section aria-label={pt ? "Saldos" : "Balances"} className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <dl>
          <div className="pb-3">
            <dt className="text-sm font-medium text-slate-600">{pt ? "Saldo líquido das contas" : "Net account balance"}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-950 sm:text-3xl">
              {overallBalanceQuery.isError ? unavailable : overallBalanceQuery.isLoading ? t.common.loading : formatCurrency(overallBalance, locale, currency)}
            </dd>
            <dd className="mt-1 text-xs text-slate-500">{pt ? "Inclui as dívidas dos cartões" : "Includes card debt"}</dd>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-3 border-t border-slate-200 pt-3 sm:grid-cols-3">
            {[
              { label: t.common.income, value: totalIncome },
              { label: t.common.expenses, value: totalExpense },
              { label: pt ? "Resultado do mês" : "Monthly result", value: finalBalance },
            ].map(({ label, value }) => (
              <div key={label} className="min-w-0">
                <dt className="text-xs text-slate-600">{label}</dt>
                <dd className="mt-1 text-sm font-semibold tabular-nums text-slate-950 sm:text-base">
                  {summaryQuery.isError ? unavailable : summaryQuery.isLoading ? t.common.loading : formatCurrency(value, locale, currency)}
                </dd>
              </div>
            ))}
          </div>
        </dl>
      </section>

      <UpcomingRecurrences />
      <SpendingInsights />
      {!transactionsQuery.isError && <RecentTransactions transactions={transactions} isLoading={transactionsQuery.isLoading} />}
      <details className="group min-w-0 rounded-xl border border-slate-200 bg-white" onToggle={(event) => setShowDetails(event.currentTarget.open)}>
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-4 text-sm font-semibold text-slate-950 [&::-webkit-details-marker]:hidden">
          {pt ? "Gráfico e gastos por categoria" : "Chart and spending by category"}
          <ChevronDown aria-hidden="true" className="size-4 shrink-0 group-open:rotate-180" />
        </summary>
        {showDetails && <div className="grid min-w-0 gap-3 border-t border-slate-200 p-2 sm:p-3 lg:grid-cols-2">
          {!summaryQuery.isError && <MonthlyOverviewChart totalIncome={totalIncome} totalExpense={totalExpense} finalBalance={finalBalance} />}
          <CategoryReport month={month} year={year} />
        </div>}
      </details>
    </div>
  );
}

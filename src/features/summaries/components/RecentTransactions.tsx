import { formatCurrency, formatDate } from "../../../lib/formatters";
import { useLanguage } from "../../../lib/i18n/useLanguage";
import type { Transaction } from "../../transactions/types";

type RecentTransactionsProps = {
  transactions: Transaction[];
  isLoading?: boolean;
};

export function RecentTransactions({
  transactions,
  isLoading = false,
}: RecentTransactionsProps) {
  const { currency, locale, t } = useLanguage();
  const recentTransactions = transactions.slice(0, 5);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-950">
          {t.summaries.recentTransactions}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {t.summaries.recentTransactionsDescription}
        </p>
      </div>

      {isLoading && (
        <p className="text-sm text-slate-500">
          {t.summaries.loadingRecentTransactions}
        </p>
      )}

      {!isLoading && recentTransactions.length === 0 && (
        <p className="text-sm text-slate-500">
          {t.summaries.noTransactionsThisMonth}
        </p>
      )}

      {!isLoading && recentTransactions.length > 0 && (
        <div className="space-y-4">
          {recentTransactions.map((transaction) => {
            const isIncome = transaction.type === 1;

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-950">
                    {transaction.description}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {transaction.categoryName} · {formatDate(transaction.date, locale)}
                  </p>
                </div>

                <strong
                  className={
                    isIncome
                      ? "whitespace-nowrap text-sm font-semibold text-emerald-600"
                      : "whitespace-nowrap text-sm font-semibold text-rose-600"
                  }
                >
                  {isIncome ? "+" : "-"}
                  {formatCurrency(transaction.amount, locale, currency)}
                </strong>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

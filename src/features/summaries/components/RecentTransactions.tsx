import { formatCurrency } from "../../../lib/formatters";

const transactions = [
  {
    id: "1",
    description: "Salary",
    category: "Work",
    type: "Income",
    amount: 8500,
  },
  {
    id: "2",
    description: "Rent",
    category: "Housing",
    type: "Expense",
    amount: 2200,
  },
  {
    id: "3",
    description: "Groceries",
    category: "Food",
    type: "Expense",
    amount: 430,
  },
];

export function RecentTransactions() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-950">
          Recent transactions
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Latest movements in your accounts
        </p>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => {
          const isIncome = transaction.type === "Income";

          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium text-slate-950">
                  {transaction.description}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {transaction.category} · {transaction.type}
                </p>
              </div>

              <strong
                className={
                  isIncome
                    ? "text-sm font-semibold text-emerald-600"
                    : "text-sm font-semibold text-rose-600"
                }
              >
                {isIncome ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}
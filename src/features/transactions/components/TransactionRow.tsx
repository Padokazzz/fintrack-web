import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "../../../lib/formatters";
import type { Transaction } from "../types";

type TransactionRowProps = {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

function formatDate(value: string) {
  const datePart = value.slice(0, 10);
  const [year, month, day] = datePart.split("-");

  return `${month}/${day}/${year}`;
}

export function TransactionRow({
  transaction,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const isIncome = transaction.type === 1;

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
        {formatDate(transaction.date)}
      </td>

      <td className="px-4 py-4">
        <p className="text-sm font-medium text-slate-950">
          {transaction.description}
        </p>
      </td>

      <td className="px-4 py-4 text-sm text-slate-600">
        {transaction.categoryName}
      </td>

      <td className="px-4 py-4 text-sm text-slate-600">
        {transaction.accountName}
      </td>

      <td className="px-4 py-4">
        <span
          className={
            isIncome
              ? "inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
              : "inline-flex rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700"
          }
        >
          {isIncome ? "Income" : "Expense"}
        </span>
      </td>

      <td
        className={
          isIncome
            ? "whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-emerald-700"
            : "whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-rose-700"
        }
      >
        {isIncome ? "+" : "-"}
        {formatCurrency(transaction.amount)}
      </td>

      <td className="px-4 py-4">
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => onEdit(transaction)}
            title="Edit transaction"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(transaction)}
            title="Delete transaction"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
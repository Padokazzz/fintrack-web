import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "../../../lib/formatters";
import { accountTypeLabels, type Account } from "../types";

type AccountCardProps = {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
};

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            {account.name}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {accountTypeLabels[account.type]}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(account)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label="Edit account"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(account)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-rose-600 transition hover:bg-rose-50"
            aria-label="Delete account"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-slate-500">Current balance</p>
        <strong className="mt-1 block text-2xl font-semibold text-slate-950">
          {formatCurrency(account.currentBalance)}
        </strong>
      </div>
    </article>
  );
}

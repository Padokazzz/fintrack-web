import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLanguage } from "../../../lib/i18n/useLanguage";
import type { Account } from "../../accounts/types";
import {
  createTransferSchema,
  type TransferFormData,
} from "../transfer-schemas";

type TransferFormProps = {
  accounts: Account[];
  isSubmitting: boolean;
  onSubmit: (data: TransferFormData) => void;
};

function getCurrentDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function TransferForm({
  accounts,
  isSubmitting,
  onSubmit,
}: TransferFormProps) {
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransferFormData>({
    resolver: zodResolver(createTransferSchema(t)),
    defaultValues: {
      description: "",
      amount: 0,
      date: getCurrentDate(),
      fromAccountId: "",
      toAccountId: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-slate-700">
            {t.transfers.descriptionLabel}
          </label>
          <input
            type="text"
            placeholder={t.transfers.descriptionPlaceholder}
            {...register("description")}
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-rose-600">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            {t.transfers.fromAccount}
          </label>
          <select
            {...register("fromAccountId")}
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">{t.transfers.selectFromAccount}</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          {errors.fromAccountId && (
            <p className="mt-1 text-sm text-rose-600">
              {errors.fromAccountId.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            {t.transfers.toAccount}
          </label>
          <select
            {...register("toAccountId")}
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">{t.transfers.selectToAccount}</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          {errors.toAccountId && (
            <p className="mt-1 text-sm text-rose-600">
              {errors.toAccountId.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            {t.transfers.amount}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            {...register("amount", { valueAsNumber: true })}
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-rose-600">
              {errors.amount.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            {t.transfers.date}
          </label>
          <input
            type="date"
            {...register("date")}
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-rose-600">
              {errors.date.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? t.common.saving : t.transfers.createTransfer}
      </button>
    </form>
  );
}

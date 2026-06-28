import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useLanguage } from "../../../lib/i18n/useLanguage";
import type { Account } from "../../accounts/types";
import type {
  Category,
  TransactionType,
} from "../../categories/types";
import {
  createTransactionSchema,
  type TransactionFormData,
} from "../transaction-schemas";

type TransactionFormProps = {
  accounts: Account[];
  categories: Category[];
  defaultValues?: Partial<TransactionFormData>;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
};

const transactionTypes: {
  label: string;
  value: TransactionType;
}[] = [
  { label: "Income", value: 1 },
  { label: "Expense", value: 2 },
];

function getCurrentDate() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function TransactionForm({
  accounts,
  categories,
  defaultValues,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(createTransactionSchema(t)),
    defaultValues: {
      description: defaultValues?.description ?? "",
      amount: defaultValues?.amount ?? 0,
      date: defaultValues?.date ?? getCurrentDate(),
      type: defaultValues?.type ?? 2,
      accountId: defaultValues?.accountId ?? "",
      categoryId: defaultValues?.categoryId ?? "",
    },
  });

  const selectedType = useWatch({
    control,
    name: "type",
  });

  const availableCategories = categories.filter(
    (category) => category.type === selectedType
  );

  const typeRegistration = register("type", {
    valueAsNumber: true,
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-slate-700">
            {t.transactions.descriptionLabel}
          </label>

          <input
            type="text"
            placeholder={t.transactions.descriptionPlaceholder}
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
            {t.transactions.amount}
          </label>

          <input
            type="number"
            step="0.01"
            min="0"
            {...register("amount", {
              valueAsNumber: true,
            })}
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
            {t.transactions.date}
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

        <div>
          <label className="text-sm font-medium text-slate-700">
            {t.common.type}
          </label>

          <select
            {...typeRegistration}
            onChange={(event) => {
              typeRegistration.onChange(event);

              setValue("categoryId", "", {
                shouldValidate: false,
              });
            }}
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          >
            {transactionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.value === 1 ? t.common.income : t.common.expense}
              </option>
            ))}
          </select>

          {errors.type && (
            <p className="mt-1 text-sm text-rose-600">
              {errors.type.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            {t.transactions.account}
          </label>

          <select
            {...register("accountId")}
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">{t.transactions.selectAccount}</option>

            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>

          {errors.accountId && (
            <p className="mt-1 text-sm text-rose-600">
              {errors.accountId.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            {t.transactions.category}
          </label>

          <select
            {...register("categoryId")}
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">{t.transactions.selectCategory}</option>

            {availableCategories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          {errors.categoryId && (
            <p className="mt-1 text-sm text-rose-600">
              {errors.categoryId.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 items-center rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t.common.saving : submitLabel}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {t.common.cancel}
        </button>
      </div>
    </form>
  );
}

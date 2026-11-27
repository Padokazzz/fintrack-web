import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { InlineFinancialSetup } from "../../../components/ui/InlineFinancialSetup";
import { localDateInput } from "../../../lib/formatters";
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

export function TransactionForm({
  accounts,
  categories,
  defaultValues,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const { t, language } = useLanguage();
  const pt = language === "pt-BR";

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
      date: defaultValues?.date ?? localDateInput(),
      type: defaultValues?.type ?? 2,
      accountId: defaultValues?.accountId ?? (accounts.length === 1 ? accounts[0].id : ""),
      categoryId: defaultValues?.categoryId ?? "",
    },
  });

  const selectedType = useWatch({
    control,
    name: "type",
  });

  const selectedAccount = useWatch({ control, name: "accountId" });
  const selectedCategory = useWatch({ control, name: "categoryId" });

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
          <label htmlFor="transaction-description" className="text-sm font-medium text-slate-700">
            {t.transactions.descriptionLabel}
          </label>

          <input
            type="text"
            placeholder={t.transactions.descriptionPlaceholder}
            id="transaction-description"
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
          <label htmlFor="transaction-amount" className="text-sm font-medium text-slate-700">
            {t.transactions.amount}
          </label>

          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            id="transaction-amount"
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
          <label htmlFor="transaction-date" className="text-sm font-medium text-slate-700">
            {t.transactions.date}
          </label>

          <input
            type="date"
            id="transaction-date"
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
          <label htmlFor="transaction-type" className="text-sm font-medium text-slate-700">
            {t.common.type}
          </label>

          <select
            id="transaction-type"
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
          <label htmlFor="transaction-accountId" className="text-sm font-medium text-slate-700">
            {t.transactions.account}
          </label>

          <select
            id="transaction-accountId"
            value={selectedAccount}
            {...register("accountId")}
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">{t.transactions.selectAccount}</option>

            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.type === 4 ? `${account.name} · ${pt ? "Crédito" : "Credit"}` : account.name}
              </option>
            ))}
          </select>

          <InlineFinancialSetup kind="account" onCreated={(id) => setValue("accountId", id, { shouldValidate: true })} />
          {errors.accountId && (
            <p className="mt-1 text-sm text-rose-600">
              {errors.accountId.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="transaction-categoryId" className="text-sm font-medium text-slate-700">
            {t.transactions.category}
          </label>

          <select
            id="transaction-categoryId"
            value={selectedCategory}
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

          <InlineFinancialSetup key={selectedType} kind="category" type={selectedType} suggestion={selectedType === 2 ? (pt ? "Outros gastos" : "Other expenses") : (pt ? "Outras receitas" : "Other income")}
            onCreated={(id) => setValue("categoryId", id, { shouldValidate: true })} />
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

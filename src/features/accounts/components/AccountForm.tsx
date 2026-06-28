import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLanguage } from "../../../lib/i18n/useLanguage";
import { createAccountSchema, type AccountFormData } from "../account-schemas";
import type { AccountType } from "../types";

type AccountFormProps = {
  defaultValues?: Partial<AccountFormData>;
  submitLabel: string;
  isSubmitting: boolean;
  showInitialBalance?: boolean;
  onSubmit: (data: AccountFormData) => void;
};

const accountTypes: { labelKey: keyof ReturnType<typeof useLanguage>["t"]["accountTypes"]; value: AccountType }[] = [
  { labelKey: "checking", value: 1 },
  { labelKey: "savings", value: 2 },
  { labelKey: "cash", value: 3 },
  { labelKey: "creditCard", value: 4 },
  { labelKey: "investment", value: 5 },
];

export function AccountForm({
  defaultValues,
  submitLabel,
  isSubmitting,
  showInitialBalance = true,
  onSubmit,
}: AccountFormProps) {
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(createAccountSchema(t)),
    defaultValues: {
      name: defaultValues?.name ?? "",
      type: defaultValues?.type ?? 1,
      initialBalance: defaultValues?.initialBalance ?? 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">
          {t.common.name}
        </label>
        <input
          type="text"
          {...register("name")}
          className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-rose-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          {t.common.type}
        </label>
        <select
          {...register("type", { valueAsNumber: true })}
          className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
        >
          {accountTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {t.accountTypes[type.labelKey]}
            </option>
          ))}
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-rose-600">{errors.type.message}</p>
        )}
      </div>

      {showInitialBalance && (
        <div>
          <label className="text-sm font-medium text-slate-700">
            {t.accounts.initialBalance}
          </label>
          <input
            type="number"
            step="0.01"
            {...register("initialBalance", { valueAsNumber: true })}
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          />
          {errors.initialBalance && (
            <p className="mt-1 text-sm text-rose-600">
              {errors.initialBalance.message}
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-10 items-center rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? t.common.saving : submitLabel}
      </button>
    </form>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useLanguage } from "../../../lib/i18n/useLanguage";
import { createAccountSchema, type AccountFormData } from "../account-schemas";
import type { Account, AccountType } from "../types";

type AccountFormProps = {
  bankAccounts?: Account[];
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
  bankAccounts = [],
  defaultValues,
  submitLabel,
  isSubmitting,
  showInitialBalance = true,
  onSubmit,
}: AccountFormProps) {
  const { t, language } = useLanguage();
  const pt = language === "pt-BR";

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(createAccountSchema(t)),
    defaultValues: {
      name: defaultValues?.name ?? "",
      type: defaultValues?.type ?? 1,
      initialBalance: defaultValues?.initialBalance ?? 0,
      linkedBankAccountId: defaultValues?.linkedBankAccountId ?? "",
      creditLimit: defaultValues?.creditLimit,
      initialUsedCredit: defaultValues?.initialUsedCredit,
    },
  });

  const isCard = useWatch({ control, name: "type" }) === 4;
  const optionalNumber = (value: string) => value === "" ? undefined : Number(value);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="account-name" className="text-sm font-medium text-slate-700">
          {t.common.name}
        </label>
        <input
          type="text"
          id="account-name"
          {...register("name")}
          className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-rose-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="account-type" className="text-sm font-medium text-slate-700">
          {t.common.type}
        </label>
        <select
          id="account-type"
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

      {isCard && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            {pt ? "Conta bancária vinculada" : "Linked bank account"}
            <select {...register("linkedBankAccountId")} className="h-11 rounded-md border border-slate-300 px-3">
              <option value="">{pt ? "Vincular depois" : "Link later"}</option>
              {bankAccounts.map((bank) => <option key={bank.id} value={bank.id}>{bank.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            {pt ? "Limite total do cartão" : "Total credit limit"}
            <input type="number" inputMode="decimal" min="0.01" step="0.01"
              {...register("creditLimit", { setValueAs: optionalNumber })} className="h-11 rounded-md border border-slate-300 px-3" />
            {errors.creditLimit && <span role="alert">{errors.creditLimit.message}</span>}
          </label>
          {showInitialBalance && <label className="grid gap-1 text-sm">
            {pt ? "Quanto do limite já foi usado? (opcional)" : "Credit already used (optional)"}
            <input type="number" inputMode="decimal" min="0" step="0.01"
              {...register("initialUsedCredit", { setValueAs: optionalNumber })} className="h-11 rounded-md border border-slate-300 px-3" />
            {errors.initialUsedCredit && <span role="alert">{errors.initialUsedCredit.message}</span>}
          </label>}
        </div>
      )}

      {showInitialBalance && !isCard && (
        <div>
          <label htmlFor="account-initialBalance" className="text-sm font-medium text-slate-700">
            {t.accounts.initialBalance}
          </label>
          <input
            type="number"
            step="0.01"
            id="account-initialBalance"
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

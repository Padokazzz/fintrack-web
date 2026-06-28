import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLanguage } from "../../../lib/i18n/useLanguage";
import { createCategorySchema, type CategoryFormData } from "../category-schemas";
import type { TransactionType } from "../types";

type CategoryFormProps = {
  defaultValues?: Partial<CategoryFormData>;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (data: CategoryFormData) => void;
};

const transactionTypes: {
  labelKey: "income" | "expense";
  value: TransactionType;
}[] = [
  { labelKey: "income", value: 1 },
  { labelKey: "expense", value: 2 },
];

export function CategoryForm({
  defaultValues,
  submitLabel,
  isSubmitting,
  onSubmit,
}: CategoryFormProps) {
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(createCategorySchema(t)),
    defaultValues: {
      name: defaultValues?.name ?? "",
      type: defaultValues?.type ?? 2,
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
          {transactionTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {t.common[type.labelKey]}
            </option>
          ))}
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-rose-600">{errors.type.message}</p>
        )}
      </div>

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

import type {
  Category,
  TransactionType,
} from "../../categories/types";
import { useLanguage } from "../../../lib/i18n/useLanguage";
import type { TransactionFilters as Filters } from "../types";

type TransactionFiltersProps = {
  filters: Filters;
  categories: Category[];
  onChange: (filters: Filters) => void;
};

export function TransactionFilters({
  filters,
  categories,
  onChange,
}: TransactionFiltersProps) {
  const { t } = useLanguage();

  const availableCategories = filters.type
    ? categories.filter(
        (category) => category.type === filters.type
      )
    : categories;

  function clearFilters() {
    onChange({});
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div>
          <label className="text-sm font-medium text-slate-700">
            {t.summaries.month}
          </label>

          <select
            value={filters.month ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                month: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              })
            }
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">{t.transactions.allMonths}</option>

            {t.summaries.months.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            {t.summaries.year}
          </label>

          <input
            type="number"
            min="2000"
            max="2100"
            value={filters.year ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                year: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              })
            }
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            {t.common.type}
          </label>

          <select
            value={filters.type ?? ""}
            onChange={(event) => {
              const type = event.target.value
                ? (Number(event.target.value) as TransactionType)
                : undefined;

              onChange({
                ...filters,
                type,
                categoryId: undefined,
              });
            }}
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">{t.transactions.allTypes}</option>
            <option value={1}>{t.common.income}</option>
            <option value={2}>{t.common.expense}</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            {t.transactions.category}
          </label>

          <select
            value={filters.categoryId ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                categoryId:
                  event.target.value || undefined,
              })
            }
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">{t.transactions.allCategories}</option>

            {availableCategories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={clearFilters}
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {t.transactions.clearFilters}
          </button>
        </div>
      </div>
    </section>
  );
}

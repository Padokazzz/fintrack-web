import type {
  Category,
  TransactionType,
} from "../../categories/types";
import type { TransactionFilters as Filters } from "../types";

type TransactionFiltersProps = {
  filters: Filters;
  categories: Category[];
  onChange: (filters: Filters) => void;
};

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export function TransactionFilters({
  filters,
  categories,
  onChange,
}: TransactionFiltersProps) {
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
            Month
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
            <option value="">All months</option>

            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Year
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
            Type
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
            <option value="">All types</option>
            <option value={1}>Income</option>
            <option value={2}>Expense</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Category
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
            <option value="">All categories</option>

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
            Clear filters
          </button>
        </div>
      </div>
    </section>
  );
}
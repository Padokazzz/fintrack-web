import { Pencil, Trash2 } from "lucide-react";
import { transactionTypeLabels, type Category } from "../types";

type CategoryCardProps = {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

export function CategoryCard({
  category,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  const isIncome = category.type === 1;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            {category.name}
          </h2>

          <span
            className={
              isIncome
                ? "mt-2 inline-flex rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                : "mt-2 inline-flex rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700"
            }
          >
            {transactionTypeLabels[category.type]}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label="Edit category"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(category)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-rose-600 transition hover:bg-rose-50"
            aria-label="Delete category"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

import { useLanguage } from "../../lib/i18n/useLanguage";
import type { Page } from "../../lib/pagination";

type PaginationProps = {
  result: Page<unknown>;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export function Pagination({ result, onPageChange, disabled }: PaginationProps) {
  const { t } = useLanguage();
  const { page, pageSize, totalCount } = result;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));

  if (pageCount === 1 && page === 1) {
    return null;
  }

  const buttonClass =
    "rounded-md border border-slate-300 px-3 py-2 text-sm font-medium disabled:opacity-50";

  return (
    <nav
      aria-label={t.pagination.label}
      className="flex flex-wrap items-center justify-end gap-3"
    >
      <button
        type="button"
        className={buttonClass}
        onClick={() => onPageChange(Math.min(page - 1, pageCount))}
        disabled={disabled || page <= 1}
      >
        {t.pagination.previous}
      </button>
      <span className="text-sm text-slate-600" aria-live="polite">
        {t.pagination.position(page, pageCount)}
      </span>
      <button
        type="button"
        className={buttonClass}
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= pageCount}
      >
        {t.pagination.next}
      </button>
    </nav>
  );
}

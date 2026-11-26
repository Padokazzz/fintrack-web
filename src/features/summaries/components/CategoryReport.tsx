import { useMutation, useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useState } from "react";
import { Alert } from "../../../components/ui/Alert";
import { formatCurrency } from "../../../lib/formatters";
import { isNativeMobile } from "../../../lib/platform/desktop";
import { useLanguage } from "../../../lib/i18n/useLanguage";
import { getCategoryTotals, downloadTransactions } from "../summaries-service";

export function CategoryReport({ month, year }: { month: number; year: number }) {
  const { t, locale, currency } = useLanguage();
  const labels = t.categoryReport;
  const [type, setType] = useState<1 | 2>(2);
  const totals = useQuery({
    queryKey: ["category-totals", month, year, type],
    queryFn: () => getCategoryTotals(month, year, type),
  });
  const download = useMutation({ mutationFn: () => downloadTransactions(month, year) });
  const maxTotal = Math.max(1, ...(totals.data ?? []).map((item) => item.total));

  return (
    <section className="min-w-0 space-y-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-semibold">{labels.title}</h2>
        <div className="flex flex-wrap items-end gap-2">
          <label className="grid gap-1 text-sm">
            <span>{labels.type}</span>
            <select value={type} onChange={(event) => setType(event.target.value === "1" ? 1 : 2)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3">
              <option value={2}>{labels.expenses}</option>
              <option value={1}>{labels.income}</option>
            </select>
          </label>
          {!isNativeMobile && <button type="button" onClick={() => download.mutate()} disabled={download.isPending}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium disabled:opacity-50">
            <Download className="h-4 w-4" /> {labels.export}
          </button>}
        </div>
      </div>
      {download.isError && <Alert variant="error">{labels.exportError}</Alert>}
      {totals.isPending && <p className="text-sm text-slate-500">{t.common.loading}</p>}
      {totals.isError && <Alert variant="error">{labels.loadError}</Alert>}
      {totals.data?.length === 0 && <p className="text-sm text-slate-500">{labels.empty}</p>}
      {totals.data && totals.data.length > 0 && (
        <ul className="space-y-3">
          {totals.data.map((item) => (
            <li key={item.categoryId} className="space-y-1">
              <div className="flex flex-wrap justify-between gap-x-4 text-sm">
                <span className="min-w-0 break-words">{item.categoryName} · {labels.count(item.count)}</span>
                <span className="font-medium">{formatCurrency(item.total, locale, currency)}</span>
              </div>
              <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className={type === 1 ? "h-full bg-emerald-600" : "h-full bg-rose-600"}
                  style={{ width: `${item.total / maxTotal * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

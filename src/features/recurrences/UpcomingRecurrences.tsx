import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Alert } from "../../components/ui/Alert";
import { formatCurrency } from "../../lib/formatters";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { formatScheduledDate, getAgenda } from "./recurrences-service";

export function UpcomingRecurrences() {
  const { t, locale, currency } = useLanguage();
  const agenda = useQuery({ queryKey: ["recurrence-agenda"], queryFn: getAgenda, refetchInterval: 15000 });

  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-slate-950">{t.recurrences.upcoming}</h2>
        <Link className="text-sm font-medium text-emerald-700 underline" to="/recurrences">
          {t.recurrences.openAgenda}
        </Link>
      </header>
      {agenda.isPending && <p className="text-sm text-slate-500">{t.common.loading}</p>}
      {agenda.isError && <Alert variant="error">{t.recurrences.loadError}</Alert>}
      {agenda.data?.items.length === 0 && <p className="text-sm text-slate-500">{t.recurrences.emptyAgenda}</p>}
      {agenda.data && agenda.data.items.length > 0 && (
        <ul className="divide-y divide-slate-100">
          {agenda.data.items.slice(0, 5).map((item) => (
            <li key={`${item.ruleId}-${item.date}`} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
              <span>{item.description} · {formatScheduledDate(item.date, locale)}</span>
              <span>{item.amount === null
                ? t.recurrences.unknownAmount
                : formatCurrency(item.type === 1 ? item.amount : -item.amount, locale, currency)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

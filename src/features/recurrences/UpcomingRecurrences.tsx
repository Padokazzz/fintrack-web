import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert } from "../../components/ui/Alert";
import { formatCurrency } from "../../lib/formatters";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { OccurrenceConfirmation } from "./OccurrenceConfirmation";
import { RecurrenceEditor } from "./RecurrenceEditor";
import { formatScheduledDate, getAgenda } from "./recurrences-service";

export function UpcomingRecurrences() {
  const { t, locale, currency, language } = useLanguage();
  const pt = language === "pt-BR";
  const [editing, setEditing] = useState<string>();
  const [message, setMessage] = useState("");
  const agenda = useQuery({ queryKey: ["recurrence-agenda"], queryFn: getAgenda, refetchInterval: 15000 });

  const accounts = new Map(agenda.data?.accounts.map((account) => [account.id, account.name]));
  const items = agenda.data?.items ?? [];
  const preview = [...items.filter((item) => item.pending), ...items.filter((item) => !item.pending)].slice(0, 5);

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
      {message && <Alert variant="success">{message}</Alert>}
      {preview.length > 0 && (
        <ul className="divide-y divide-slate-100">
          {preview.map((item) => (
            <li key={`${item.ruleId}-${item.date}`} className="space-y-2 py-3 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <strong>{item.description}</strong>
                  <p className="text-slate-600">{[formatScheduledDate(item.date, locale), accounts.get(item.accountId)].filter(Boolean).join(" · ")}</p>
                </div>
                <span>{item.amount === null ? t.recurrences.unknownAmount
                  : formatCurrency(item.type === 1 ? item.amount : -item.amount, locale, currency)}</span>
              </div>
              {item.pending ? <OccurrenceConfirmation item={item} onConfirmed={() => setMessage(pt ? "Lançamento confirmado." : "Entry confirmed.")} /> : (
                <button type="button" className="min-h-10 text-emerald-800 underline" onClick={() => setEditing(item.ruleId)}>
                  {pt ? "Editar próximos" : "Edit future entries"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {editing && agenda.data && <RecurrenceEditor key={editing} id={editing} today={agenda.data.today} onClose={() => setEditing(undefined)} />}
    </section>
  );
}

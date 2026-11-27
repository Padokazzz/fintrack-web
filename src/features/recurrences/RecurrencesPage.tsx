import { ChevronDown } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert } from "../../components/ui/Alert";
import { getApiErrorMessage } from "../../lib/api-error";
import { formatCurrency } from "../../lib/formatters";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { getAccounts } from "../accounts/accounts-service";
import { getCategories } from "../categories/categories-service";
import { AmortizationPanel } from "./AmortizationPanel";
import { OccurrenceConfirmation } from "./OccurrenceConfirmation";
import { RecurrenceEditor } from "./RecurrenceEditor";
import { refreshRecurrenceData } from "./recurrence-cache";
import { RecurrenceForm } from "./RecurrenceForm";
import {
  createRule, deleteRule, formatScheduledDate, getAgenda,
  getRules, paymentMethods, setRulePaused, type Rule,
} from "./recurrences-service";

const actionClass = "rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium disabled:opacity-50";

export function RecurrencesPage() {
  const { t, currency, locale, language } = useLanguage();
  const labels = t.recurrences;
  const queryClient = useQueryClient();
  const pt = language === "pt-BR";
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<string>();
  const [amortizing, setAmortizing] = useState<string>();
  const showForm = params.get("new") === "1";
  function setShowForm(open: boolean) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (open) next.set("new", "1");
      else next.delete("new");
      return next;
    }, { replace: true });
  }
  const rules = useQuery({ queryKey: ["recurrences"], queryFn: getRules, refetchInterval: 15000 });
  const agenda = useQuery({ queryKey: ["recurrence-agenda"], queryFn: getAgenda, refetchInterval: 15000 });
  const accounts = useQuery({ queryKey: ["accounts"], queryFn: getAccounts });
  const categories = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  const refresh = () => refreshRecurrenceData(queryClient);

  const creation = useMutation({
    mutationFn: createRule,
    onSuccess: async () => {
      setShowForm(false);
      await refresh();
    },
  });
  const toggle = useMutation({
    mutationFn: (rule: Rule) => setRulePaused(rule.id, !rule.paused),
    onSuccess: refresh,
  });
  const removal = useMutation({ mutationFn: deleteRule, onSuccess: refresh });
  const pending = toggle.isPending || removal.isPending;
  const operationError = creation.error ?? toggle.error ?? removal.error;
  const accountNames = new Map(agenda.data?.accounts.map((account) => [account.id, account.name]));

  function paymentLabel(method: Rule["paymentMethod"]) {
    const payment = paymentMethods.find(({ id }) => id === method);
    return payment ? ` · ${pt ? payment.pt : payment.en}` : "";
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{labels.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{labels.subtitle}</p>
        </div>
        <button type="button" aria-expanded={showForm} className={actionClass} onClick={() => setShowForm(!showForm)}>
          {showForm ? labels.close : labels.newRule}
        </button>
      </header>

      {creation.isSuccess && <Alert variant="success">{pt ? "Agendamento salvo." : "Schedule saved."}</Alert>}
      {(agenda.isError || rules.isError || accounts.isError || categories.isError) &&
        <Alert variant="error">{labels.loadError}</Alert>}
      {operationError && <Alert variant="error">{getApiErrorMessage(operationError, labels.saveError)}</Alert>}
      {(agenda.isPending || rules.isPending) && <p className="text-sm text-slate-500">{t.common.loading}</p>}

      {showForm && agenda.data && (
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <RecurrenceForm accounts={accounts.data ?? []} categories={categories.data ?? []}
            today={agenda.data.today} pending={creation.isPending} onCreate={creation.mutate} />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-950">{labels.upcoming}</h2>
        {agenda.data?.items.length === 0 && <p className="text-sm text-slate-500">{labels.emptyAgenda}</p>}
        {agenda.data?.items.map((item) => (
          <article key={`${item.ruleId}-${item.date}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <p className="font-medium">{item.description}</p>
              <p className="text-sm text-slate-500">
                {formatScheduledDate(item.date, locale)} · {accountNames.get(item.accountId)}{paymentLabel(item.paymentMethod)} · {item.pending ? labels.pending : item.automatic ? labels.automatic : labels.manual}
              </p>
            </div>
            {item.pending ? (
              <OccurrenceConfirmation item={item} />
            ) : (
              <p className="text-sm font-medium">{item.amount === null
                ? labels.unknownAmount
                : formatCurrency(item.type === 1 ? item.amount : -item.amount, locale, currency)}</p>
            )}
          </article>
        ))}
      </section>

      {agenda.data && (
        <details className="group min-w-0 rounded-lg border border-slate-200 bg-white">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            {labels.projection}
            <ChevronDown aria-hidden="true" className="size-4 shrink-0 group-open:rotate-180" />
          </summary>
          <div className="space-y-3 border-t border-slate-200 p-3">
            <p className="text-sm text-slate-500">{labels.projectionHint(formatScheduledDate(agenda.data.through, locale))}</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {agenda.data.accounts.map((account) => (
                <article key={account.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-sm font-medium">{account.name}</p>
                  <p className="mt-1 text-xl font-semibold">{formatCurrency(account.projectedBalance, locale, currency)}</p>
                  <p className="text-sm text-slate-500">{labels.current} {formatCurrency(account.currentBalance, locale, currency)}</p>
                  {account.hasUnknownAmounts && <p className="mt-1 text-xs text-amber-700">{labels.incomplete}</p>}
              </article>
              ))}
            </div>
          </div>
        </details>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-950">{labels.rules}</h2>
        {rules.data?.length === 0 && <p className="text-sm text-slate-500">{labels.emptyRules}</p>}
        {rules.data?.map((rule) => {
          const ended = Boolean(rule.endsOn && rule.nextDate > rule.endsOn);
          return (
            <article key={rule.id} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
              <div>
                <p className="font-medium">{rule.description}</p>
                <p className="text-sm text-slate-500">
                  {accountNames.get(rule.accountId)}{paymentLabel(rule.paymentMethod)} · {rule.automatic ? labels.automatic : labels.manual} · {ended ? (pt ? "Encerrado" : "Ended") : rule.paused ? labels.paused : labels.nextRun(formatScheduledDate(rule.nextDate, locale))}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!ended && <button type="button" className={actionClass} onClick={() => setEditing(editing === rule.id ? undefined : rule.id)}>
                  {pt ? "Editar próximos" : "Edit future entries"}
                </button>}
                {rule.type === 2 && <button type="button" className={actionClass} aria-expanded={amortizing === rule.id}
                  onClick={() => setAmortizing(amortizing === rule.id ? undefined : rule.id)}>
                  {pt ? "Amortizações" : "Extra payments"}
                </button>}
                {!ended && <button type="button" className={actionClass} disabled={pending} onClick={() => toggle.mutate(rule)}>
                  {rule.paused ? labels.resume : labels.pause}
                </button>}
                <button type="button" className={actionClass} disabled={pending} onClick={() => {
                  if (window.confirm(labels.confirmDelete)) removal.mutate(rule.id);
                }}>{labels.remove}</button>
              </div>
              {editing === rule.id && agenda.data && <RecurrenceEditor id={rule.id} today={agenda.data.today} onClose={() => setEditing(undefined)} />}
              {amortizing === rule.id && agenda.data && <AmortizationPanel rule={rule} today={agenda.data.today} />}
            </article>
          );
        })}
      </section>
    </div>
  );
}

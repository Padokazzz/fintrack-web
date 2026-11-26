import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Alert } from "../../components/ui/Alert";
import { getApiErrorMessage } from "../../lib/api-error";
import { formatCurrency } from "../../lib/formatters";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { getAccounts } from "../accounts/accounts-service";
import { getCategories } from "../categories/categories-service";
import { RecurrenceForm } from "./RecurrenceForm";
import {
  confirmOccurrence, createRule, deleteRule, formatScheduledDate, getAgenda,
  getRules, setRulePaused, type Rule, type Scheduled,
} from "./recurrences-service";

const actionClass = "rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium disabled:opacity-50";

export function RecurrencesPage() {
  const { t, currency, locale } = useLanguage();
  const labels = t.recurrences;
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const rules = useQuery({ queryKey: ["recurrences"], queryFn: getRules, refetchInterval: 15000 });
  const agenda = useQuery({ queryKey: ["recurrence-agenda"], queryFn: getAgenda, refetchInterval: 15000 });
  const accounts = useQuery({ queryKey: ["accounts"], queryFn: getAccounts });
  const categories = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  async function refresh() {
    await Promise.all([
      "recurrences", "recurrence-agenda", "accounts", "transactions", "spending-insights", "monthly-summary", "overall-balance", "category-totals",
    ].map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
  }

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
  const confirmation = useMutation({
    mutationFn: ({ item, amount }: { item: Scheduled; amount: number | null }) => confirmOccurrence(item, amount),
    onSuccess: refresh,
  });
  const pending = toggle.isPending || removal.isPending || confirmation.isPending;
  const operationError = creation.error ?? toggle.error ?? removal.error ?? confirmation.error;
  const accountNames = new Map(agenda.data?.accounts.map((account) => [account.id, account.name]));

  function submitConfirmation(event: FormEvent<HTMLFormElement>, item: Scheduled) {
    event.preventDefault();
    const amount = String(new FormData(event.currentTarget).get("amount"));
    confirmation.mutate({ item, amount: amount === "" ? null : Number(amount) });
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

      {(agenda.isError || rules.isError || accounts.isError || categories.isError) &&
        <Alert variant="error">{labels.loadError}</Alert>}
      {operationError && <Alert variant="error">{getApiErrorMessage(operationError, labels.saveError)}</Alert>}
      {(agenda.isPending || rules.isPending) && <p className="text-sm text-slate-500">{t.common.loading}</p>}

      {showForm && agenda.data && (
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          {!accounts.isPending && !categories.isPending && (!accounts.data?.length || !categories.data?.length) &&
            <Alert variant="warning">{labels.needsSetup}</Alert>}
          <RecurrenceForm accounts={accounts.data ?? []} categories={categories.data ?? []}
            today={agenda.data.today} pending={creation.isPending} onCreate={creation.mutate} />
        </section>
      )}

      {agenda.data && (
        <section className="space-y-3">
          <div>
            <h2 className="font-semibold text-slate-950">{labels.projection}</h2>
            <p className="text-sm text-slate-500">{labels.projectionHint(formatScheduledDate(agenda.data.through, locale))}</p>
          </div>
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
                {formatScheduledDate(item.date, locale)} · {accountNames.get(item.accountId)} · {item.pending ? labels.pending : item.automatic ? labels.automatic : labels.manual}
              </p>
            </div>
            {item.pending ? (
              <form className="flex flex-wrap items-end gap-2" onSubmit={(event) => submitConfirmation(event, item)}>
                <label className="space-y-1 text-xs">
                  <span>{labels.actualAmount}</span>
                  <input name="amount" type="number" min="0.01" step="0.01" required defaultValue={item.amount ?? undefined}
                    className="block w-28 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm" />
                </label>
                <button type="submit" className={actionClass} disabled={pending}>{labels.confirm}</button>
              </form>
            ) : (
              <p className="text-sm font-medium">{item.amount === null
                ? labels.unknownAmount
                : formatCurrency(item.type === 1 ? item.amount : -item.amount, locale, currency)}</p>
            )}
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-950">{labels.rules}</h2>
        {rules.data?.length === 0 && <p className="text-sm text-slate-500">{labels.emptyRules}</p>}
        {rules.data?.map((rule) => (
          <article key={rule.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <p className="font-medium">{rule.description}</p>
              <p className="text-sm text-slate-500">
                {accountNames.get(rule.accountId)} · {rule.automatic ? labels.automatic : labels.manual} · {rule.paused ? labels.paused : labels.nextRun(formatScheduledDate(rule.nextDate, locale))}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={actionClass} disabled={pending} onClick={() => toggle.mutate(rule)}>
                {rule.paused ? labels.resume : labels.pause}
              </button>
              <button type="button" className={actionClass} disabled={pending} onClick={() => {
                if (window.confirm(labels.confirmDelete)) removal.mutate(rule.id);
              }}>{labels.remove}</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

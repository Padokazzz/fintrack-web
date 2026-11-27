import { ChevronDown } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "../../../components/ui/Alert";
import { api } from "../../../lib/api";
import { formatCurrency } from "../../../lib/formatters";
import { useLanguage } from "../../../lib/i18n/useLanguage";

type Budget = {
  categoryId: string | null;
  category: string | null;
  amount: number;
  limit: number;
  status: "under" | "near" | "reached";
};

type Insights = {
  month: string;
  smallPurchaseLimit: number;
  budgets: Budget[];
  categories: { id: string; name: string }[];
  weeks: {
    start: string;
    end: string;
    total: number;
    previousTotal: number;
    count: number;
    smallCount: number;
    smallTotal: number;
    categories: { categoryId: string; category: string; amount: number; previousAmount: number; count: number }[];
  }[];
};

type Limits = { overallLimit: number | null; categories: { categoryId: string; limit: number }[] };

const label = {
  pt: {
    title: "Resumo semanal", history: "Semana do resumo", previous: "Semana anterior",
    purchases: "Despesas registradas", small: "Despesas de até", byCategory: "Despesas por categoria",
    budgets: "Limites mensais", general: "Todas as despesas", edit: "Configurar limites",
    cancel: "Cancelar", save: "Salvar limites", saved: "Limites salvos.", saveError: "Não foi possível salvar os limites.",
    loadError: "Não foi possível carregar o resumo semanal.", empty: "Nenhuma despesa registrada nesta semana.",
    noLimits: "Defina um limite geral ou por categoria para acompanhar seus gastos.",
    blank: "Deixe em branco os limites que quiser remover.",
    near: "Atingiu 80% do limite", reached: "Limite atingido", exceeded: "Acima do limite",
  },
  en: {
    title: "Weekly summary", history: "Summary week", previous: "Previous week",
    purchases: "Recorded expenses", small: "Expenses up to", byCategory: "Expenses by category",
    budgets: "Monthly limits", general: "All expenses", edit: "Set limits",
    cancel: "Cancel", save: "Save limits", saved: "Limits saved.", saveError: "Could not save limits.",
    loadError: "Could not load the weekly summary.", empty: "No expenses recorded this week.",
    noLimits: "Set an overall or category limit to track your spending.",
    blank: "Leave any limits you want to remove blank.",
    near: "Reached 80% of limit", reached: "Limit reached", exceeded: "Over the limit",
  },
};

export function SpendingInsights() {
  const client = useQueryClient();
  const { locale, currency, t } = useLanguage();
  const copy = locale.startsWith("pt") ? label.pt : label.en;
  const money = (value: number) => formatCurrency(value, locale, currency);
  const date = (value: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(new Date(value));
  const period = (start: string, end: string) =>
    `${date(start, { day: "numeric", month: "short" })} – ${date(end, { day: "numeric", month: "short", year: "numeric" })}`;

  const query = useQuery({
    queryKey: ["spending-insights"],
    queryFn: async () => (await api.get<Insights>("/insights")).data,
  });
  const [selectedWeek, setSelectedWeek] = useState("");
  const [editing, setEditing] = useState(false);
  const mutation = useMutation({
    mutationFn: (limits: Limits) => api.put("/insights/limits", limits),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["spending-insights"] });
      setEditing(false);
    },
  });
  const data = query.data;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    const form = new FormData(event.currentTarget);
    const amount = (name: string) => Number(form.get(name)) || null;
    const categories = data.categories.flatMap(({ id }) => {
      const limit = amount(id);
      return limit === null ? [] : [{ categoryId: id, limit }];
    });
    mutation.mutate({ overallLimit: amount("overall"), categories });
  }

  if (query.isPending) return <p className="text-sm text-slate-500">{t.common.loading}</p>;
  if (!data) return <Alert variant="error">{copy.loadError}</Alert>;
  const week = data.weeks.find((item) => item.start === selectedWeek) ?? data.weeks[0];
  const limitInput = (name: string, title: string, categoryId: string | null) => (
    <label key={name} className="grid gap-1 text-sm font-medium">
      {title}
      <input name={name} type="number" min="0.01" max="999999999" step="0.01"
        defaultValue={data.budgets.find((item) => item.categoryId === categoryId)?.limit}
        className="w-full rounded-lg border border-slate-300 px-3 py-2" />
    </label>
  );

  return (
    <section className="grid min-w-0 gap-3">
      <div className="min-w-0 space-y-3 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold">{copy.budgets}</h2>
            <p className="text-sm text-slate-600">{date(data.month, { month: "long", year: "numeric" })}</p>
          </div>
          {!editing && <button type="button" className="rounded-lg border px-3 py-2 text-sm font-medium"
            onClick={() => { mutation.reset(); setEditing(true); }}>{copy.edit}</button>}
        </div>
        {editing ? (
          <form onSubmit={save} className="space-y-3">
            <p className="text-sm text-slate-600">{copy.blank}</p>
            <fieldset disabled={mutation.isPending} className="grid gap-3 sm:grid-cols-2">
              {limitInput("overall", copy.general, null)}
              {data.categories.map(({ id, name }) => limitInput(id, name, id))}
            </fieldset>
            {mutation.isError && <Alert variant="error">{copy.saveError}</Alert>}
            <div className="flex gap-2">
              <button type="submit" disabled={mutation.isPending}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">{copy.save}</button>
              <button type="button" disabled={mutation.isPending} className="rounded-lg border px-3 py-2 text-sm"
                onClick={() => setEditing(false)}>{copy.cancel}</button>
            </div>
          </form>
        ) : (
          <>
            {mutation.isSuccess && <p role="status" className="text-sm text-emerald-800">{copy.saved}</p>}
            {data.budgets.length === 0 ? <p className="text-sm text-slate-600">{copy.noLimits}</p> : (
              <ul className="space-y-3">
                {data.budgets.map((budget) => (
                  <li key={budget.categoryId ?? "overall"} className="space-y-1 text-sm">
                    <div className="flex flex-wrap justify-between gap-x-2">
                      <strong>{budget.category ?? copy.general}</strong>
                      <span>{money(budget.amount)} / {money(budget.limit)}</span>
                    </div>
                    <progress aria-label={budget.category ?? copy.general} max={budget.limit}
                      value={Math.min(budget.amount, budget.limit)} className="h-2 w-full" />
                    {budget.amount < budget.limit && <p className="text-slate-600">
                      {locale.startsWith("pt") ? `Restam ${money(budget.limit - budget.amount)} neste mês.` : `${money(budget.limit - budget.amount)} left this month.`}
                    </p>}
                    {budget.status === "near" && <p className="text-amber-800">{copy.near}</p>}
                    {budget.status === "reached" && <p className="text-red-800">
                      {budget.amount > budget.limit ? `${copy.exceeded} · ${money(budget.amount - budget.limit)}` : copy.reached}
                    </p>}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
      <details className="group min-w-0 rounded-xl border border-slate-200 bg-white">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-4 text-sm font-semibold text-slate-950 [&::-webkit-details-marker]:hidden">
          {copy.title}
          <ChevronDown aria-hidden="true" className="size-4 shrink-0 group-open:rotate-180" />
        </summary>
        <div className="min-w-0 space-y-3 border-t border-slate-200 p-4">
          <label className="grid gap-1 text-sm font-medium">
            {copy.history}
            <select className="rounded-lg border border-slate-300 px-3 py-2" value={week.start}
              onChange={(event) => setSelectedWeek(event.target.value)}>
              {data.weeks.map((item) => <option key={item.start} value={item.start}>{period(item.start, item.end)}</option>)}
            </select>
          </label>
          <p className="text-2xl font-semibold">{money(week.total)}</p>
          <p className="text-sm text-slate-600">{copy.previous} · {money(week.previousTotal)}</p>
          {week.count === 0 ? <p className="text-sm text-slate-600">{copy.empty}</p> : (
            <>
              <p className="text-sm">{copy.purchases} · {week.count}</p>
              {week.smallCount > 0 && <p className="text-sm">
                {copy.small} {money(data.smallPurchaseLimit)} · {week.smallCount} · {money(week.smallTotal)}
              </p>}
              <h3 className="text-sm font-semibold">{copy.byCategory}</h3>
              <ul className="divide-y divide-slate-100 text-sm">
                {week.categories.map((item) => (
                  <li key={item.categoryId} className="py-2">
                    <div className="flex justify-between gap-3"><span>{item.category} ({item.count})</span><strong>{money(item.amount)}</strong></div>
                    <p className="text-xs text-slate-600">{copy.previous} · {money(item.previousAmount)}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </details>
    </section>
  );
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Alert } from "../../components/ui/Alert";
import { formatCurrency } from "../../lib/formatters";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { AmortizationComparisonForm } from "./AmortizationComparisonForm";
import { refreshRecurrenceData } from "./recurrence-cache";
import { formatScheduledDate, getAmortizations, recordAmortization, type Amortization, type Rule } from "./recurrences-service";

export function AmortizationPanel({ rule, today }: { rule: Rule; today: string }) {
  const { language, locale, currency } = useLanguage();
  const pt = language === "pt-BR";
  const client = useQueryClient();
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [comparisonId, setComparisonId] = useState<string>();
  const queryKey = ["recurrence-amortizations", rule.id];
  const history = useQuery({ queryKey, queryFn: () => getAmortizations(rule.id) });
  const mutation = useMutation({
    mutationFn: (item: Amortization) => recordAmortization(rule.id, item),
    onSuccess: async (_, item) => {
      await Promise.all([refreshRecurrenceData(client), client.invalidateQueries({ queryKey })]);
      setRequestId(crypto.randomUUID());
      setComparisonId(item.id);
    },
  });
  const canReduceTerm = Boolean(rule.endsOn && rule.nextDate <= rule.endsOn);

  const calculations = history.data?.filter((item) => item.savings != null) ?? [];
  const total = calculations.reduce((sum, item) => sum + Math.round((item.savings ?? 0) * 100), 0) / 100;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const amount = Number(values.get("amount")) || null;
    const installments = Number(values.get("installments")) || 0;
    if (amount === null && installments === 0) {
      event.currentTarget.querySelector<HTMLInputElement>("[name=amount]")?.focus();
      return;
    }

    mutation.mutate({ id: requestId, date: String(values.get("date")), amount, installments });
  }

  return (
    <section className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <h3 className="font-semibold">{pt ? "Amortizações" : "Extra payments"}</h3>
      <p className="text-sm text-slate-600">{pt
        ? "Informe o valor que pagou ou as parcelas finais que abateu. O histórico da amortização fica aqui. A saída de dinheiro é lançada em Lançamentos."
        : "Enter the amount paid or the final installments removed. This is your extra payment history. Record any cash outflow in Entries."}</p>
      {calculations.length > 0 && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
        <p className="text-sm font-medium text-emerald-900">{pt ? "Economia líquida acumulada" : "Total net savings"}</p>
        <p className="text-xl font-semibold text-slate-950">{formatCurrency(total, locale, currency)}</p>
        <p className="text-xs text-slate-600">
          {pt ? `${calculations.length} de ${history.data?.length} amortizações com cálculo` : `${calculations.length} of ${history.data?.length} extra payments calculated`}
        </p>
      </div>}
      <form key={requestId} onSubmit={submit} className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm">
          {pt ? "Data do pagamento" : "Payment date"}
          <input name="date" type="date" defaultValue={today} max={today} min="2000-01-01" required className="min-h-11 rounded-md border px-2" />
        </label>
        <label className="grid gap-1 text-sm">
          {pt ? "Valor pago" : "Amount paid"}
          <input name="amount" type="number" min="0.01" step="0.01" inputMode="decimal" className="min-h-11 rounded-md border px-2" />
        </label>
        <label className="grid gap-1 text-sm">
          {pt ? "Parcelas finais abatidas" : "Final installments removed"}
          <input name="installments" type="number" min="0" max="1212" step="1" disabled={!canReduceTerm}
            inputMode="numeric" className="min-h-11 rounded-md border px-2 disabled:opacity-50" />
        </label>
        {!canReduceTerm && <p className="text-sm text-slate-600 sm:col-span-3">
          {pt ? "Para abater parcelas, o agendamento precisa ter uma data final e parcelas futuras." : "To remove installments, set an end date and make sure future installments remain."}
        </p>}
        <button type="submit" disabled={mutation.isPending} className="min-h-11 rounded-md bg-emerald-700 px-3 text-sm text-white disabled:opacity-50 sm:col-span-3 sm:justify-self-start">
          {pt ? "Salvar amortização" : "Save extra payment"}
        </button>
      </form>
      {mutation.isSuccess && <Alert variant="success">{pt ? "Amortização salva." : "Extra payment saved."}</Alert>}
      {mutation.isError && <Alert variant="error">{pt ? "Não foi possível salvar. Confira a data e quantas parcelas futuras ainda faltam." : "Could not save. Check the date and number of remaining future installments."}</Alert>}
      {history.isError && <Alert variant="error">{pt ? "Não foi possível carregar o histórico." : "Could not load history."}</Alert>}
      {history.data && history.data.length > 0 && (
        <ul className="divide-y text-sm">
          {history.data.map((item) => (
            <li key={item.id} className="py-2">
              {[
                formatScheduledDate(item.date, locale),
                item.amount === null ? null : formatCurrency(item.amount, locale, currency),
                item.installments ? (pt ? `Parcelas abatidas: ${item.installments}` : `Installments removed: ${item.installments}`) : null,
              ].filter(Boolean).join(" · ")}
              {item.savings != null && <p className="font-medium">
                {item.savings >= 0 ? (pt ? "Economia estimada" : "Estimated savings") : (pt ? "Custo adicional estimado" : "Estimated extra cost")} · {formatCurrency(Math.abs(item.savings), locale, currency)}
              </p>}
              {comparisonId === item.id ? (
                <AmortizationComparisonForm key={item.id} ruleId={rule.id} item={item} onClose={() => setComparisonId(undefined)} />
              ) : (
                <button type="button" className="min-h-11 text-sm text-emerald-800 underline"
                  onClick={() => setComparisonId(item.id)}>
                  {item.savings == null ? (pt ? "Calcular economia" : "Calculate savings") : (pt ? "Editar cálculo" : "Edit calculation")}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

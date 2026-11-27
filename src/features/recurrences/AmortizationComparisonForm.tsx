import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Alert } from "../../components/ui/Alert";
import { formatCurrency } from "../../lib/formatters";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { saveAmortizationComparison, type AmortizationComparison, type SavedAmortization } from "./recurrences-service";

export function AmortizationComparisonForm({ ruleId, item, onClose }: {
  ruleId: string;
  item: SavedAmortization;
  onClose: () => void;
}) {
  const { language, locale, currency } = useLanguage();
  const pt = language === "pt-BR";
  const client = useQueryClient();
  const [before, setBefore] = useState(String(item.remainingBefore ?? ""));
  const [after, setAfter] = useState(String(item.remainingAfter ?? ""));
  const [payment, setPayment] = useState(String(item.amount ?? item.comparedPayment ?? ""));
  const ready = before !== "" && after !== "" && Number(payment) > 0;
  const savings = (Math.round(Number(before) * 100) - Math.round(Number(payment) * 100) - Math.round(Number(after) * 100)) / 100;
  const mutation = useMutation({
    mutationFn: (input: AmortizationComparison) => saveAmortizationComparison(ruleId, item.id, input),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["recurrence-amortizations", ruleId] });
      onClose();
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (ready) mutation.mutate({
      remainingBefore: Number(before), remainingAfter: Number(after), payment: Number(payment),
    });
  }

  const fields = [
    { label: pt ? "Total das parcelas restantes antes" : "Total remaining installments before", value: before, set: setBefore, min: "0", readOnly: false },
    { label: pt ? "Valor pago nesta amortização" : "Amount paid in this extra payment", value: payment, set: setPayment, min: "0.01", readOnly: item.amount != null },
    { label: pt ? "Total das parcelas restantes depois" : "Total remaining installments after", value: after, set: setAfter, min: "0", readOnly: false },
  ];

  return (
    <form onSubmit={submit} className="mt-2 space-y-3 rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-sm text-slate-600">{pt
        ? "Use os totais mostrados pelo banco imediatamente antes e depois desta amortização. Se quitou a dívida, informe zero no total depois."
        : "Use the lender’s installment totals immediately before and after this extra payment. Enter zero afterward if you paid off the debt."}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {fields.map(({ label, value, set, min, readOnly }) => (
          <label key={label} className="grid gap-1 text-sm">
            {label}
            <input type="number" inputMode="decimal" step="0.01" min={min} required value={value}
              readOnly={readOnly} onChange={(event) => set(event.target.value)}
              className="min-h-11 w-full rounded-md border border-slate-300 px-2 read-only:bg-slate-100" />
          </label>
        ))}
      </div>
      {ready && <p role="status" className="text-sm font-semibold">
        {savings >= 0 ? (pt ? "Economia estimada" : "Estimated savings") : (pt ? "Custo adicional estimado" : "Estimated extra cost")} · {formatCurrency(Math.abs(savings), locale, currency)}
      </p>}
      {mutation.isError && <Alert variant="error">{pt ? "Não foi possível salvar. Confira os valores e tente novamente." : "Could not save. Check the totals and try again."}</Alert>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={!ready || mutation.isPending} className="min-h-11 rounded-md bg-emerald-700 px-3 text-sm text-white disabled:opacity-50">
          {pt ? "Salvar cálculo" : "Save calculation"}
        </button>
        <button type="button" disabled={mutation.isPending} onClick={onClose} className="min-h-11 px-3 text-sm underline">
          {pt ? "Cancelar" : "Cancel"}
        </button>
      </div>
    </form>
  );
}

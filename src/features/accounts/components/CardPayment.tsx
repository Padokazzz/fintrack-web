import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Alert } from "../../../components/ui/Alert";
import { localDateInput } from "../../../lib/formatters";
import { useLanguage } from "../../../lib/i18n/useLanguage";
import { createTransfer } from "../../transfers/transfers-service";
import type { Account } from "../types";

export function CardPayment({ card, bank }: { card: Account; bank: Account }) {
  const { language } = useLanguage();
  const pt = language === "pt-BR";
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const payment = useMutation({
    mutationFn: createTransfer,
    onSuccess: async () => {
      setOpen(false);
      await Promise.all(["accounts", "transfers", "overall-balance", "recurrence-agenda"].map(
        (key) => client.invalidateQueries({ queryKey: [key] }),
      ));
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    payment.mutate({
      fromAccountId: bank.id,
      toAccountId: card.id,
      amount: Number(data.get("amount")),
      date: String(data.get("date")),
      description: pt ? "Pagamento do cartão" : "Credit card payment",
    });
  }

  return (
    <div className="mt-3 space-y-3">
      {payment.isSuccess && <Alert variant="success">{pt ? "Pagamento registrado." : "Payment recorded."}</Alert>}
      {open ? (
        <form onSubmit={submit} className="grid gap-3">
          <p className="text-sm text-slate-600">{pt ? `O valor sai de ${bank.name} e reduz o saldo devedor do cartão.` : `Payment comes from ${bank.name} and reduces the card balance.`}</p>
          <label className="grid gap-1 text-sm">
            {pt ? "Valor pago" : "Amount paid"}
            <input name="amount" type="number" min="0.01" step="0.01" inputMode="decimal" defaultValue={card.usedCredit ?? undefined} required className="h-11 rounded-md border px-3" />
          </label>
          <label className="grid gap-1 text-sm">
            {pt ? "Data do pagamento" : "Payment date"}
            <input name="date" type="date" defaultValue={localDateInput()} required className="h-11 rounded-md border px-3" />
          </label>
          {payment.isError && <Alert variant="error">{pt ? "Não foi possível registrar o pagamento. Confira os dados e tente novamente." : "Could not record payment. Check the details and try again."}</Alert>}
          <div className="flex flex-wrap gap-3">
            <button disabled={payment.isPending} className="min-h-11 rounded-md bg-emerald-700 px-3 text-sm text-white disabled:opacity-60">{pt ? "Confirmar pagamento" : "Confirm payment"}</button>
            <button type="button" disabled={payment.isPending} onClick={() => setOpen(false)} className="min-h-11 px-3 text-sm">{pt ? "Cancelar" : "Cancel"}</button>
          </div>
        </form>
      ) : (card.usedCredit ?? 0) > 0 && (
        <button type="button" disabled={payment.isPending} onClick={() => { payment.reset(); setOpen(true); }} className="min-h-11 rounded-md border border-slate-300 px-3 text-sm">
          {pt ? "Registrar pagamento do cartão" : "Record card payment"}
        </button>
      )}
    </div>
  );
}

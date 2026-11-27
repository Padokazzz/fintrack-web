import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert } from "../../../components/ui/Alert";
import { useLanguage } from "../../../lib/i18n/useLanguage";
import { getAccounts } from "../../accounts/accounts-service";
import { getCategories } from "../../categories/categories-service";
import { createTransaction } from "../transactions-service";
import { TransactionForm } from "./TransactionForm";

export function QuickExpense() {
  const { language } = useLanguage();
  const pt = language === "pt-BR";
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const accounts = useQuery({ queryKey: ["accounts"], queryFn: getAccounts, enabled: open });
  const categories = useQuery({ queryKey: ["categories"], queryFn: getCategories, enabled: open });
  const create = useMutation({
    mutationFn: createTransaction,
    onSuccess: async () => {
      await Promise.all([
        "transactions", "accounts", "overall-balance", "monthly-summary", "category-totals", "recurrence-agenda", "spending-insights",
      ].map((key) => client.invalidateQueries({ queryKey: [key] })));
      setOpen(false);
    },
  });

  return (
    <section className="space-y-3">
      {!open && (
        <button type="button" className="min-h-11 w-full rounded-md bg-emerald-700 px-4 font-semibold text-white sm:w-auto"
          onClick={() => { create.reset(); setOpen(true); }}>
          {pt ? "Registrar gasto" : "Record expense"}
        </button>
      )}
      {!open && create.isSuccess && <Alert variant="success">{pt ? "Lançamento salvo." : "Entry saved."}</Alert>}
      {open && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">{pt ? "Novo lançamento" : "New entry"}</h2>
          {(accounts.isError || categories.isError) && <Alert variant="error">{pt ? "Não foi possível carregar contas e categorias." : "Could not load accounts and categories."}</Alert>}
          {(accounts.isPending || categories.isPending) && <p role="status">{pt ? "Carregando…" : "Loading…"}</p>}
          {create.isError && <Alert variant="error">{pt ? "Não foi possível salvar o lançamento. Confira os dados e tente novamente." : "Could not save the entry. Check the details and try again."}</Alert>}
          {accounts.data && categories.data ? (
            <TransactionForm accounts={accounts.data} categories={categories.data}
              onSubmit={create.mutate} onCancel={() => setOpen(false)} isSubmitting={create.isPending}
              submitLabel={pt ? "Salvar lançamento" : "Save entry"} />
          ) : (
            <button type="button" onClick={() => setOpen(false)} className="min-h-11 px-3 text-sm">{pt ? "Fechar" : "Close"}</button>
          )}
        </div>
      )}
    </section>
  );
}

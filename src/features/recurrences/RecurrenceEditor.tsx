import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "../../components/ui/Alert";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { getAccounts } from "../accounts/accounts-service";
import { getCategories } from "../categories/categories-service";
import { RecurrenceForm } from "./RecurrenceForm";
import { refreshRecurrenceData } from "./recurrence-cache";
import { getRules, updateRule, type RuleInput } from "./recurrences-service";

export function RecurrenceEditor({ id, today, onClose }: { id: string; today: string; onClose: () => void }) {
  const { language, t } = useLanguage();
  const pt = language === "pt-BR";
  const client = useQueryClient();
  const rules = useQuery({ queryKey: ["recurrences"], queryFn: getRules });
  const accounts = useQuery({ queryKey: ["accounts"], queryFn: getAccounts });
  const categories = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const update = useMutation({
    mutationFn: (data: RuleInput) => updateRule(id, data),
    onSuccess: async () => {
      await refreshRecurrenceData(client);
      onClose();
    },
  });
  const rule = rules.data?.find((item) => item.id === id);

  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="font-semibold">{pt ? "Editar próximos lançamentos" : "Edit future entries"}</h3>
      <p className="text-sm text-slate-600">
        {pt ? "As parcelas já registradas ou aguardando confirmação continuam com os dados originais." : "Posted entries and installments already awaiting confirmation keep their original details."}
      </p>
      {(rules.isPending || accounts.isPending || categories.isPending) && <p role="status">{t.common.loading}</p>}
      {(rules.isError || accounts.isError || categories.isError) && <Alert variant="error">{t.recurrences.loadError}</Alert>}
      {update.isError && <Alert variant="error">{pt ? "Confira os dados. Se mudar a próxima data, escolha um mês posterior ao da última parcela gerada." : "Check the details. If you change the next date, choose a month after the last generated installment."}</Alert>}
      {rule && accounts.data && categories.data && <RecurrenceForm initialRule={rule} today={today}
        accounts={accounts.data} categories={categories.data} pending={update.isPending} onCreate={update.mutate} />}
      <button type="button" onClick={onClose} disabled={update.isPending} className="min-h-11 px-2 text-sm underline">
        {pt ? "Fechar edição" : "Close editor"}
      </button>
    </section>
  );
}

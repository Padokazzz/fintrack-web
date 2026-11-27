import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { Alert } from "../../components/ui/Alert";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { refreshRecurrenceData } from "./recurrence-cache";
import { confirmOccurrence, type Scheduled } from "./recurrences-service";

export function OccurrenceConfirmation({ item, onConfirmed }: { item: Scheduled; onConfirmed?: () => void }) {
  const { t } = useLanguage();
  const client = useQueryClient();
  const confirmation = useMutation({
    mutationFn: (amount: number) => confirmOccurrence(item, amount),
    onSuccess: () => {
      onConfirmed?.();
      return refreshRecurrenceData(client);
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    confirmation.mutate(Number(new FormData(event.currentTarget).get("amount")));
  }

  return (
    <form className="space-y-2" onSubmit={submit}>
      <div className="flex flex-wrap items-end gap-2">
        <label className="grid gap-1 text-xs">
          {t.recurrences.actualAmount}
          <input name="amount" type="number" inputMode="decimal" min="0.01" step="0.01" required defaultValue={item.amount ?? undefined}
            className="min-h-11 w-28 rounded-md border border-slate-300 px-2 text-sm" />
        </label>
        <button type="submit" disabled={confirmation.isPending}
          className="min-h-11 rounded-md border border-emerald-700 px-3 text-sm font-medium text-emerald-800 disabled:opacity-50">
          {t.recurrences.confirm}
        </button>
      </div>
      {confirmation.isError && <Alert variant="error">{t.recurrences.saveError}</Alert>}
    </form>
  );
}

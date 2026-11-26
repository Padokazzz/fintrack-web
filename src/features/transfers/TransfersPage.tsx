import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ArrowRightLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Alert } from "../../components/ui/Alert";
import { EmptyState } from "../../components/ui/EmptyState";
import { getApiErrorMessage } from "../../lib/api-error";
import { formatCurrency, formatDate } from "../../lib/formatters";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { getAccounts } from "../accounts/accounts-service";
import { TransferForm } from "./components/TransferForm";
import type { TransferFormData } from "./transfer-schemas";
import {
  createTransfer,
  deleteTransfer,
  getTransfers,
} from "./transfers-service";
import type { Transfer } from "./types";

export function TransfersPage() {
  const queryClient = useQueryClient();
  const { currency, locale, t } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const transfersQuery = useQuery({
    queryKey: ["transfers"],
    queryFn: getTransfers,
  });

  const accountsQuery = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  async function refreshFinancialData() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["transfers"] }),
      queryClient.invalidateQueries({ queryKey: ["accounts"] }),
      queryClient.invalidateQueries({ queryKey: ["overall-balance"] }),
    ]);
  }

  const createMutation = useMutation({
    mutationFn: createTransfer,
    onSuccess: async () => {
      await refreshFinancialData();
      setIsFormOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransfer,
    onSuccess: refreshFinancialData,
  });

  function handleCreate(data: TransferFormData) {
    createMutation.mutate(data);
  }

  function handleDelete(transfer: Transfer) {
    const confirmed = window.confirm(
      t.transfers.confirmDelete(transfer.description)
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(transfer.id);
  }

  const transfers = transfersQuery.data ?? [];
  const accounts = accountsQuery.data ?? [];
  const canCreateTransfer = accounts.length >= 2;

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            {t.transfers.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t.transfers.description}
          </p>
        </div>

        <button
          type="button"
          disabled={!canCreateTransfer || accountsQuery.isLoading}
          onClick={() => setIsFormOpen((current) => !current)}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          {t.transfers.newTransfer}
        </button>
      </header>

      {!accountsQuery.isLoading && accounts.length < 2 && (
        <Alert variant="warning">{t.transfers.needsTwoAccounts}</Alert>
      )}

      {isFormOpen && canCreateTransfer && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-950">
            {t.transfers.createTransfer}
          </h2>

          {createMutation.isError && (
            <div className="mb-4">
              <Alert variant="error">
                {getApiErrorMessage(
                  createMutation.error,
                  t.transfers.createError
                )}
              </Alert>
            </div>
          )}

          <TransferForm
            accounts={accounts}
            isSubmitting={createMutation.isPending}
            onSubmit={handleCreate}
          />
        </section>
      )}

      {transfersQuery.isLoading && (
        <p className="text-sm text-slate-500">{t.transfers.loading}</p>
      )}

      {transfersQuery.isError && (
        <Alert variant="error">
          {getApiErrorMessage(transfersQuery.error, t.transfers.loadError)}
        </Alert>
      )}

      {!transfersQuery.isLoading &&
        !transfersQuery.isError &&
        transfers.length === 0 && (
          <EmptyState
            title={t.transfers.emptyTitle}
            description={t.transfers.emptyDescription}
          />
        )}

      {transfers.length > 0 && (
        <section className="grid gap-4 lg:grid-cols-2">
          {transfers.map((transfer) => (
            <article
              key={transfer.id}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-slate-950">
                    {transfer.description}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(transfer.date, locale)}
                  </p>
                </div>

                <strong className="shrink-0 text-sm font-semibold text-slate-950">
                  {formatCurrency(transfer.amount, locale, currency)}
                </strong>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-md bg-slate-50 p-3">
                <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                  {transfer.fromAccountName}
                </span>
                <ArrowRightLeft className="h-4 w-4 shrink-0 text-slate-500" />
                <span className="min-w-0 flex-1 truncate text-right text-sm text-slate-700">
                  {transfer.toAccountName}
                </span>
              </div>

              {deleteMutation.isError && (
                <div className="mt-4">
                  <Alert variant="error">
                    {getApiErrorMessage(
                      deleteMutation.error,
                      t.transfers.deleteError
                    )}
                  </Alert>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleDelete(transfer)}
                disabled={deleteMutation.isPending}
                className="mt-4 h-9 w-full rounded-md border border-rose-200 bg-white px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {t.transfers.deleteTransfer}
              </button>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

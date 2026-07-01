import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Alert } from "../../components/ui/Alert";
import { EmptyState } from "../../components/ui/EmptyState";
import { getApiErrorMessage } from "../../lib/api-error";
import { useLanguage } from "../../lib/i18n/useLanguage";
import type { AccountFormData } from "./account-schemas";
import {
  createAccount,
  deleteAccount,
  getAccounts,
  updateAccount,
} from "./accounts-service";
import { AccountCard } from "./components/AccountCard";
import { AccountForm } from "./components/AccountForm";
import type { Account } from "./types";

export function AccountsPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const accountsQuery = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const createMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["overall-balance"] });
      setIsFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AccountFormData }) =>
      updateAccount(id, {
        name: data.name,
        type: data.type,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["overall-balance"] });
      setEditingAccount(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["overall-balance"] });
    },
  });

  function handleCreate(data: AccountFormData) {
    createMutation.mutate({
      name: data.name,
      type: data.type,
      initialBalance: data.initialBalance ?? 0,
    });
  }

  function handleUpdate(data: AccountFormData) {
    if (!editingAccount) {
      return;
    }

    updateMutation.mutate({
      id: editingAccount.id,
      data,
    });
  }

  function handleDelete(account: Account) {
    const confirmed = window.confirm(
      t.accounts.confirmDelete(account.name)
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(account.id);
  }

  const accounts = accountsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            {t.accounts.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t.accounts.description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingAccount(null);
            setIsFormOpen((current) => !current);
          }}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          {t.accounts.newAccount}
        </button>
      </div>

      {isFormOpen && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-950">
            {t.accounts.createAccount}
          </h2>

          {createMutation.isError && (
            <div className="mb-4">
              <Alert variant="error">
                {getApiErrorMessage(
                  createMutation.error,
                  t.accounts.createError
                )}
              </Alert>
            </div>
          )}

          <AccountForm
            submitLabel={t.accounts.createAccount}
            isSubmitting={createMutation.isPending}
            onSubmit={handleCreate}
          />
        </section>
      )}

      {editingAccount && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-950">
            {t.accounts.editAccount}
          </h2>

          {updateMutation.isError && (
            <div className="mb-4">
              <Alert variant="error">
                {getApiErrorMessage(
                  updateMutation.error,
                  t.accounts.updateError
                )}
              </Alert>
            </div>
          )}

          <AccountForm
            defaultValues={{
              name: editingAccount.name,
              type: editingAccount.type,
            }}
            submitLabel={t.common.saveChanges}
            isSubmitting={updateMutation.isPending}
            showInitialBalance={false}
            onSubmit={handleUpdate}
          />
        </section>
      )}

      {accountsQuery.isLoading && (
        <p className="text-sm text-slate-500">{t.accounts.loading}</p>
      )}

      {accountsQuery.isError && (
        <Alert variant="error">
          {getApiErrorMessage(accountsQuery.error, t.accounts.loadError)}
        </Alert>
      )}

      {!accountsQuery.isLoading && !accountsQuery.isError && accounts.length === 0 && (
        <EmptyState
          title={t.accounts.emptyTitle}
          description={t.accounts.emptyDescription}
        />
      )}

      {accounts.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={(selectedAccount) => {
                setIsFormOpen(false);
                setEditingAccount(selectedAccount);
              }}
              onDelete={handleDelete}
            />
          ))}
        </section>
      )}
    </div>
  );
}

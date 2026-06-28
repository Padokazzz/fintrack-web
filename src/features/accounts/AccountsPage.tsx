import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Alert } from "../../components/ui/Alert";
import { EmptyState } from "../../components/ui/EmptyState";
import { getApiErrorMessage } from "../../lib/api-error";
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
      setEditingAccount(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
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
      `Are you sure you want to delete "${account.name}"?`
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
          <h1 className="text-2xl font-semibold text-slate-950">Accounts</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage the financial accounts used in your transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingAccount(null);
            setIsFormOpen((current) => !current);
          }}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          New account
        </button>
      </div>

      {isFormOpen && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-950">
            Create account
          </h2>

          {createMutation.isError && (
            <div className="mb-4">
              <Alert variant="error">
                {getApiErrorMessage(
                  createMutation.error,
                  "Could not create account. Check the form data and try again."
                )}
              </Alert>
            </div>
          )}

          <AccountForm
            submitLabel="Create account"
            isSubmitting={createMutation.isPending}
            onSubmit={handleCreate}
          />
        </section>
      )}

      {editingAccount && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-950">
            Edit account
          </h2>

          {updateMutation.isError && (
            <div className="mb-4">
              <Alert variant="error">
                {getApiErrorMessage(
                  updateMutation.error,
                  "Could not update account. Check the form data and try again."
                )}
              </Alert>
            </div>
          )}

          <AccountForm
            defaultValues={{
              name: editingAccount.name,
              type: editingAccount.type,
            }}
            submitLabel="Save changes"
            isSubmitting={updateMutation.isPending}
            showInitialBalance={false}
            onSubmit={handleUpdate}
          />
        </section>
      )}

      {accountsQuery.isLoading && (
        <p className="text-sm text-slate-500">Loading accounts...</p>
      )}

      {accountsQuery.isError && (
        <Alert variant="error">
          {getApiErrorMessage(accountsQuery.error, "Could not load accounts.")}
        </Alert>
      )}

      {!accountsQuery.isLoading && !accountsQuery.isError && accounts.length === 0 && (
        <EmptyState
          title="No accounts yet"
          description="Create your first account to start tracking your finances."
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

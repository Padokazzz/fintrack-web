import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const { t, language } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [bankForNewCard, setBankForNewCard] = useState<Account | null>(null);

  const formHeading = useRef<HTMLHeadingElement>(null);
  const formVisible = Boolean(isFormOpen || bankForNewCard || editingAccount);
  useEffect(() => {
    if (formVisible) formHeading.current?.focus();
  }, [formVisible, bankForNewCard, editingAccount]);

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
      setBankForNewCard(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AccountFormData }) =>
      updateAccount(id, {
        name: data.name,
        type: data.type,
        linkedBankAccountId: data.type === 4 ? data.linkedBankAccountId || null : null,
        creditLimit: data.type === 4 ? data.creditLimit ?? null : null,
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
      initialBalance: data.type === 4 ? 0 : data.initialBalance ?? 0,
      linkedBankAccountId: data.type === 4 ? data.linkedBankAccountId || null : null,
      creditLimit: data.type === 4 ? data.creditLimit ?? null : null,
      initialUsedCredit: data.type === 4 ? data.initialUsedCredit : undefined,
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

  const banks = accounts.filter((account) => account.type === 1 || account.type === 2);
  const pt = language === "pt-BR";

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
            setBankForNewCard(null);
            setIsFormOpen((current) => !current);
          }}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          {t.accounts.newAccount}
        </button>
      </div>

      {(isFormOpen || bankForNewCard) && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 ref={formHeading} tabIndex={-1} className="mb-4 text-base font-semibold text-slate-950">
            {bankForNewCard ? (pt ? "Adicionar cartão" : "Add card") : t.accounts.createAccount}
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
            key={bankForNewCard?.id ?? "new"}
            bankAccounts={banks}
            defaultValues={bankForNewCard ? {
              name: pt ? `Cartão ${bankForNewCard.name}` : `${bankForNewCard.name} card`,
              type: 4,
              linkedBankAccountId: bankForNewCard.id,
            } : undefined}
            submitLabel={bankForNewCard ? (pt ? "Salvar cartão" : "Save card") : t.accounts.createAccount}
            isSubmitting={createMutation.isPending}
            onSubmit={handleCreate}
          />
        </section>
      )}

      {editingAccount && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 ref={formHeading} tabIndex={-1} className="mb-4 text-base font-semibold text-slate-950">
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
            key={editingAccount.id}
            bankAccounts={banks.filter((bank) => bank.id !== editingAccount.id)}
            defaultValues={{
              name: editingAccount.name,
              type: editingAccount.type,
              creditLimit: editingAccount.creditLimit ?? undefined,
              linkedBankAccountId: editingAccount.linkedBankAccountId ?? undefined,
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
          {accounts.filter((account) => !account.linkedBankAccountId || !banks.some((bank) => bank.id === account.linkedBankAccountId)).map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              bank={banks.find((bank) => bank.id === account.linkedBankAccountId)}
              linkedCards={accounts.filter((card) => card.linkedBankAccountId === account.id)}
              onAddCard={banks.includes(account) ? () => {
                setEditingAccount(null);
                setIsFormOpen(false);
                setBankForNewCard(account);
              } : undefined}
              onEdit={(selectedAccount) => {
                setIsFormOpen(false);
                setBankForNewCard(null);
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

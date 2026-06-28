import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Alert } from "../../components/ui/Alert";
import { EmptyState } from "../../components/ui/EmptyState";
import { getApiErrorMessage } from "../../lib/api-error";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { getAccounts } from "../accounts/accounts-service";
import { getCategories } from "../categories/categories-service";
import type { TransactionFormData } from "./transaction-schemas";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "./transactions-service";
import { TransactionFilters } from "./components/TransactionFilters";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionRow } from "./components/TransactionRow";
import type {
  Transaction,
  TransactionFilters as Filters,
} from "./types";

function getInitialFilters(): Filters {
  const currentDate = new Date();

  return {
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  };
}

export function TransactionsPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const [filters, setFilters] = useState<Filters>(
    getInitialFilters
  );

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const transactionsQuery = useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => getTransactions(filters),
  });

  const accountsQuery = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  async function refreshFinancialData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["monthly-summary"],
      }),
    ]);
  }

  const createMutation = useMutation({
    mutationFn: createTransaction,

    onSuccess: async () => {
      await refreshFinancialData();
      setIsFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: TransactionFormData;
    }) => updateTransaction(id, data),

    onSuccess: async () => {
      await refreshFinancialData();
      setEditingTransaction(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,

    onSuccess: async () => {
      await refreshFinancialData();
    },
  });

  function handleCreate(data: TransactionFormData) {
    createMutation.mutate(data);
  }

  function handleUpdate(data: TransactionFormData) {
    if (!editingTransaction) {
      return;
    }

    updateMutation.mutate({
      id: editingTransaction.id,
      data,
    });
  }

  function handleDelete(transaction: Transaction) {
    const confirmed = window.confirm(
      t.transactions.confirmDelete(transaction.description)
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(transaction.id);
  }

  const transactions = transactionsQuery.data ?? [];
  const accounts = accountsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const isReferenceDataLoading =
    accountsQuery.isLoading || categoriesQuery.isLoading;

  const canCreateTransaction =
    accounts.length > 0 && categories.length > 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            {t.transactions.title}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {t.transactions.description}
          </p>
        </div>

        <button
          type="button"
          disabled={
            isReferenceDataLoading ||
            !canCreateTransaction
          }
          onClick={() => {
            setEditingTransaction(null);
            setIsFormOpen((current) => !current);
          }}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {t.transactions.newTransaction}
        </button>
      </header>

      {!accountsQuery.isLoading &&
        accounts.length === 0 && (
          <Alert variant="warning">
            {t.transactions.needsAccount}
          </Alert>
        )}

      {!categoriesQuery.isLoading &&
        categories.length === 0 && (
          <Alert variant="warning">
            {t.transactions.needsCategory}
          </Alert>
        )}

      <TransactionFilters
        filters={filters}
        categories={categories}
        onChange={setFilters}
      />

      {isFormOpen && canCreateTransaction && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-950">
            {t.transactions.createTransaction}
          </h2>

          {createMutation.isError && (
            <div className="mb-4">
              <Alert variant="error">
                {getApiErrorMessage(
                  createMutation.error,
                  t.transactions.createError
                )}
              </Alert>
            </div>
          )}

          <TransactionForm
            accounts={accounts}
            categories={categories}
            submitLabel={t.transactions.createTransaction}
            isSubmitting={createMutation.isPending}
            onSubmit={handleCreate}
            onCancel={() => setIsFormOpen(false)}
          />
        </section>
      )}

      {editingTransaction && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-950">
            {t.transactions.editTransaction}
          </h2>

          {updateMutation.isError && (
            <div className="mb-4">
              <Alert variant="error">
                {getApiErrorMessage(
                  updateMutation.error,
                  t.transactions.updateError
                )}
              </Alert>
            </div>
          )}

          <TransactionForm
            key={editingTransaction.id}
            accounts={accounts}
            categories={categories}
            defaultValues={{
              description: editingTransaction.description,
              amount: editingTransaction.amount,
              date: editingTransaction.date.slice(0, 10),
              type: editingTransaction.type,
              accountId: editingTransaction.accountId,
              categoryId: editingTransaction.categoryId,
            }}
            submitLabel={t.common.saveChanges}
            isSubmitting={updateMutation.isPending}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTransaction(null)}
          />
        </section>
      )}

      {transactionsQuery.isLoading && (
        <p className="text-sm text-slate-500">
          {t.transactions.loading}
        </p>
      )}

      {transactionsQuery.isError && (
        <Alert variant="error">
          {getApiErrorMessage(
            transactionsQuery.error,
            t.transactions.loadError
          )}
        </Alert>
      )}

      {!transactionsQuery.isLoading &&
        !transactionsQuery.isError &&
        transactions.length === 0 && (
          <EmptyState
            title={t.transactions.emptyTitle}
            description={t.transactions.emptyDescription}
          />
        )}

      {transactions.length > 0 && (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    {t.transactions.table.date}
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    {t.transactions.table.description}
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    {t.transactions.table.category}
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    {t.transactions.table.account}
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    {t.transactions.table.type}
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                    {t.transactions.table.amount}
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                    {t.transactions.table.actions}
                  </th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={(selectedTransaction) => {
                      setIsFormOpen(false);
                      setEditingTransaction(
                        selectedTransaction
                      );
                    }}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

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
import { formatCurrency, formatDate } from "../../lib/formatters";
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
  const { currency, locale, t } = useLanguage();

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
        queryKey: ["overall-balance"],
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
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
        <section className="grid gap-3 md:hidden">
          {transactions.map((transaction) => {
            const isIncome = transaction.type === 1;

            return (
              <article
                key={transaction.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {transaction.description}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(transaction.date, locale)}
                    </p>
                  </div>

                  <strong
                    className={
                      isIncome
                        ? "shrink-0 text-sm font-semibold text-emerald-700"
                        : "shrink-0 text-sm font-semibold text-rose-700"
                    }
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(transaction.amount, locale, currency)}
                  </strong>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      {t.transactions.category}
                    </dt>
                    <dd className="mt-1 truncate text-slate-700">
                      {transaction.categoryName}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      {t.transactions.account}
                    </dt>
                    <dd className="mt-1 truncate text-slate-700">
                      {transaction.accountName}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      {t.common.type}
                    </dt>
                    <dd className="mt-1 text-slate-700">
                      {isIncome ? t.common.income : t.common.expense}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingTransaction(transaction);
                    }}
                    className="h-9 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    {t.common.edit}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(transaction)}
                    className="h-9 flex-1 rounded-md border border-rose-200 bg-white px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                  >
                    {t.common.delete}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {transactions.length > 0 && (
        <section className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white md:block">
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

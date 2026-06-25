import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
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
      `Are you sure you want to delete "${transaction.description}"?`
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
            Transactions
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Register income and expenses across your accounts.
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
          New transaction
        </button>
      </header>

      {!accountsQuery.isLoading &&
        accounts.length === 0 && (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Create an account before registering transactions.
          </section>
        )}

      {!categoriesQuery.isLoading &&
        categories.length === 0 && (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Create a category before registering transactions.
          </section>
        )}

      <TransactionFilters
        filters={filters}
        categories={categories}
        onChange={setFilters}
      />

      {isFormOpen && canCreateTransaction && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-950">
            Create transaction
          </h2>

          {createMutation.isError && (
            <p className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              Could not create transaction. Check the
              information and try again.
            </p>
          )}

          <TransactionForm
            accounts={accounts}
            categories={categories}
            submitLabel="Create transaction"
            isSubmitting={createMutation.isPending}
            onSubmit={handleCreate}
            onCancel={() => setIsFormOpen(false)}
          />
        </section>
      )}

      {editingTransaction && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-950">
            Edit transaction
          </h2>

          {updateMutation.isError && (
            <p className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              Could not update transaction. Check the
              information and try again.
            </p>
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
            submitLabel="Save changes"
            isSubmitting={updateMutation.isPending}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTransaction(null)}
          />
        </section>
      )}

      {transactionsQuery.isLoading && (
        <p className="text-sm text-slate-500">
          Loading transactions...
        </p>
      )}

      {transactionsQuery.isError && (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Could not load transactions.
        </section>
      )}

      {!transactionsQuery.isLoading &&
        !transactionsQuery.isError &&
        transactions.length === 0 && (
          <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-base font-semibold text-slate-950">
              No transactions found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Register a transaction or change the selected
              filters.
            </p>
          </section>
        )}

      {transactions.length > 0 && (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Description
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Category
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Account
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Type
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                    Amount
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                    Actions
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
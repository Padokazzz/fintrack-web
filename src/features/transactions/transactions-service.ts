import { api } from "../../lib/api";
import type { Page } from "../../lib/pagination";
import type {
  Transaction,
  TransactionFilters,
  TransactionRequest,
} from "./types";

function withUtcDate(data: TransactionRequest): TransactionRequest {
  return {
    ...data,
    date: data.date.includes("T")
      ? data.date
      : `${data.date}T00:00:00.000Z`,
  };
}

export async function getTransactions(filters: TransactionFilters, page: number, pageSize?: number) {
  const response = await api.get<Page<Transaction>>("/Transactions/page", {
    params: { ...filters, page, pageSize },
  });

  return response.data;
}

export async function createTransaction(data: TransactionRequest) {
  const response = await api.post<Transaction>(
    "/Transactions",
    withUtcDate(data)
  );

  return response.data;
}

export async function updateTransaction(id: string, data: TransactionRequest) {
  const response = await api.put<Transaction>(
    `/Transactions/${id}`,
    withUtcDate(data)
  );

  return response.data;
}

export async function deleteTransaction(id: string) {
  await api.delete(`/Transactions/${id}`);
}

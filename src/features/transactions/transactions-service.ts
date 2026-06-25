import { api } from "../../lib/api";
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

export async function getTransactions(filters: TransactionFilters) {
  const response = await api.get<Transaction[]>("/Transactions", {
    params: filters,
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

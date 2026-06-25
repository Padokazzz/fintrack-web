import type { TransactionType } from "../categories/types";

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  accountId: string;
  accountName: string;
  categoryId: string;
  categoryName: string;
};

export type TransactionRequest = {
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  accountId: string;
  categoryId: string;
};

export type TransactionFilters = {
  month?: number;
  year?: number;
  type?: TransactionType;
  categoryId?: string;
};
export type TransactionType = 1 | 2;

export const transactionTypeLabels: Record<TransactionType, string> = {
  1: "Income",
  2: "Expense",
};

export type Category = {
  id: string;
  name: string;
  type: TransactionType;
};

export type CreateCategoryRequest = {
  name: string;
  type: TransactionType;
};

export type UpdateCategoryRequest = {
  name: string;
  type: TransactionType;
};

export type AccountType = 1 | 2 | 3 | 4 | 5;

export const accountTypeLabels: Record<AccountType, string> = {
  1: "Checking",
  2: "Savings",
  3: "Cash",
  4: "Credit card",
  5: "Investment",
};

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
  createdAt: string;
};

export type CreateAccountRequest = {
  name: string;
  type: AccountType;
  initialBalance: number;
};

export type UpdateAccountRequest = {
  name: string;
  type: AccountType;
};

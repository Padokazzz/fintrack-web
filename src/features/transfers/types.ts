export type Transfer = {
  id: string;
  description: string;
  amount: number;
  date: string;
  fromAccountId: string;
  fromAccountName: string;
  toAccountId: string;
  toAccountName: string;
};

export type TransferRequest = {
  description: string;
  amount: number;
  date: string;
  fromAccountId: string;
  toAccountId: string;
};

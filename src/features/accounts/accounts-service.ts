import { api } from "../../lib/api";
import type { Account, CreateAccountRequest, UpdateAccountRequest } from "./types";

export async function getAccounts() {
  const response = await api.get<Account[]>("/Accounts");
  return response.data;
}

export async function createAccount(data: CreateAccountRequest) {
  const response = await api.post<Account>("/Accounts", data);
  return response.data;
}

export async function updateAccount(id: string, data: UpdateAccountRequest) {
  const response = await api.put<Account>(`/Accounts/${id}`, data);
  return response.data;
}

export async function deleteAccount(id: string) {
  await api.delete(`/Accounts/${id}`);
}
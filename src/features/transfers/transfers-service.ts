import { api } from "../../lib/api";
import type { Page } from "../../lib/pagination";
import type { Transfer, TransferRequest } from "./types";

function withUtcDate(data: TransferRequest): TransferRequest {
  return {
    ...data,
    date: data.date.includes("T")
      ? data.date
      : `${data.date}T00:00:00.000Z`,
  };
}

export async function getTransfers(page: number) {
  const response = await api.get<Page<Transfer>>("/Transfers/page", { params: { page } });

  return response.data;
}

export async function createTransfer(data: TransferRequest) {
  const response = await api.post<Transfer>("/Transfers", withUtcDate(data));

  return response.data;
}

export async function deleteTransfer(id: string) {
  await api.delete(`/Transfers/${id}`);
}

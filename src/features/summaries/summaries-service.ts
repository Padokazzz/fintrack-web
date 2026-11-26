import { api } from "../../lib/api";
import type { MonthlySummary, OverallBalance } from "./types";

export async function getMonthlySummary(
  month: number,
  year: number
) {
  const response = await api.get<MonthlySummary>(
    "/Summaries/monthly",
    {
      params: {
        month,
        year,
      },
    }
  );

  return response.data;
}

export async function getOverallBalance() {
  const response = await api.get<OverallBalance>(
    "/Summaries/overall-balance"
  );

  return response.data;
}

type CategoryTotal = {
  categoryId: string;
  categoryName: string;
  type: 1 | 2;
  total: number;
  count: number;
};

export async function getCategoryTotals(month: number, year: number, type: 1 | 2) {
  const { data } = await api.get<CategoryTotal[]>("/reports/categories", { params: { month, year, type } });
  return data;
}

export async function downloadTransactions(month: number, year: number) {
  const { data } = await api.get<Blob>("/reports/transactions.csv", { params: { month, year }, responseType: "blob" });
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fintrack-${year}-${String(month).padStart(2, "0")}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

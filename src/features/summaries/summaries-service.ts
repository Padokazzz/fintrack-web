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

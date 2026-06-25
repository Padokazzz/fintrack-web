import { api } from "../../lib/api";
import type { MonthlySummary } from "./types";

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
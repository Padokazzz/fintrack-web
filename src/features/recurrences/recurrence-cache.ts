import type { QueryClient } from "@tanstack/react-query";

export async function refreshRecurrenceData(client: QueryClient) {
  await Promise.all([
    "recurrences", "recurrence-agenda", "accounts", "transactions", "spending-insights",
    "monthly-summary", "overall-balance", "category-totals",
  ].map((key) => client.invalidateQueries({ queryKey: [key] })));
}

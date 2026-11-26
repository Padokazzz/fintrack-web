// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, test, vi } from "vitest";
import { api } from "../../../lib/api";
import { LanguageProvider } from "../../../lib/i18n/LanguageProvider";
import { CategoryReport } from "./CategoryReport";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

test("requests category totals for the selected period and switches from expenses to income", async () => {
  const get = vi.spyOn(api, "get")
    .mockResolvedValueOnce({
      data: [{ categoryId: "2", categoryName: "Groceries", type: 2, total: 30, count: 1 }],
    })
    .mockResolvedValueOnce({
      data: [{ categoryId: "1", categoryName: "Salary", type: 1, total: 500, count: 1 }],
    });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <LanguageProvider><CategoryReport month={11} year={2026} /></LanguageProvider>
    </QueryClientProvider>,
  );

  expect(await screen.findByText(/Groceries/)).toBeTruthy();
  expect(get).toHaveBeenCalledWith("/reports/categories", { params: { month: 11, year: 2026, type: 2 } });
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } });
  expect(await screen.findByText(/Salary/)).toBeTruthy();
  expect(get).toHaveBeenCalledWith("/reports/categories", { params: { month: 11, year: 2026, type: 1 } });
  await waitFor(() => expect(screen.queryByText(/Groceries/)).toBeNull());
});

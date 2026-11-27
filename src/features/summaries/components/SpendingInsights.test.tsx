// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, test, vi } from "vitest";
import { api } from "../../../lib/api";
import { LanguageProvider } from "../../../lib/i18n/LanguageProvider";
import { SpendingInsights } from "./SpendingInsights";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

test("shows past weeks and submits overall and category limits", async () => {
  const latest = {
    start: "2026-11-16", end: "2026-11-22", total: 20, previousTotal: 0,
    count: 1, smallCount: 1, smallTotal: 20,
    categories: [{ categoryId: "meals", category: "Meals", amount: 20, previousAmount: 0, count: 1 }],
  };
  const data = {
    month: "2026-11-01", smallPurchaseLimit: 30, categories: [{ id: "meals", name: "Meals" }],
    weeks: [latest, { ...latest, start: "2026-11-09", end: "2026-11-15", total: 0, count: 0, categories: [] }],
    budgets: [],
  };
  vi.spyOn(api, "get").mockResolvedValueOnce({ data }).mockResolvedValue({
    data: { ...data, budgets: [{ categoryId: null, category: null, amount: 80, limit: 100, status: "near" }] },
  });
  const put = vi.spyOn(api, "put").mockResolvedValue({ status: 204 });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <LanguageProvider><SpendingInsights /></LanguageProvider>
    </QueryClientProvider>,
  );

  fireEvent.click(await screen.findByText(/Resumo semanal|Weekly summary/));
  expect(await screen.findByText("Meals (1)")).toBeTruthy();
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "2026-11-09" } });
  expect(screen.getByText(/Nenhuma despesa registrada|No expenses recorded/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: /Configurar limites|Set limits/ }));
  fireEvent.change(screen.getByRole("spinbutton", { name: /Todas as despesas|All expenses/ }), { target: { value: "100" } });
  fireEvent.change(screen.getByRole("spinbutton", { name: "Meals" }), { target: { value: "50" } });
  fireEvent.click(screen.getByRole("button", { name: /Salvar limites|Save limits/ }));

  expect(await screen.findByText(/Atingiu 80%|Reached 80%/)).toBeTruthy();
  expect(put).toHaveBeenCalledWith("/insights/limits", {
    overallLimit: 100, categories: [{ categoryId: "meals", limit: 50 }],
  });
});

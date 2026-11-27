// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { api } from "../../lib/api";
import { LanguageProvider } from "../../lib/i18n/LanguageProvider";
import { AmortizationPanel } from "./AmortizationPanel";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test("calculates a historical payment and includes it in the debt's total", async () => {
  let first = { id: "first", date: "2026-10-15", amount: 30, installments: 0, savings: null as number | null };
  const second = { id: "second", date: "2026-11-15", amount: 180, installments: 2, savings: 60 };
  vi.spyOn(api, "get").mockImplementation(async () => ({ data: [first, second] }));
  const put = vi.spyOn(api, "put").mockImplementation(async () => {
    first = { ...first, savings: 30 };
    return {};
  });

  render(<QueryClientProvider client={new QueryClient()}><LanguageProvider>
    <AmortizationPanel today="2026-11-27" rule={{
      id: "loan", description: "Loan", accountId: "bank", categoryId: "loans", type: 2,
      amount: 100, startsOn: "2026-09-15", nextDate: "2026-12-15", automatic: false, paused: false,
    }} />
  </LanguageProvider></QueryClientProvider>);

  fireEvent.click(await screen.findByRole("button", { name: /Calcular economia|Calculate savings/ }));
  fireEvent.change(screen.getByLabelText(/restantes antes|installments before/), { target: { value: "300" } });
  fireEvent.change(screen.getByLabelText(/restantes depois|installments after/), { target: { value: "240" } });
  fireEvent.click(screen.getByRole("button", { name: /Salvar cálculo|Save calculation/ }));
  expect(await screen.findByText(/2 de 2 amortizações|2 of 2 extra payments/)).toBeTruthy();
  expect(screen.getByText(/^[^0-9]*90[,.]00$/)).toBeTruthy();
  expect(put).toHaveBeenCalledWith("/recurrences/loan/amortizations/first/comparison", {
    remainingBefore: 300, payment: 30, remainingAfter: 240,
  });
});

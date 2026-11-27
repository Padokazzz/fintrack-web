// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "../../lib/i18n/LanguageProvider";
import { RecurrenceForm } from "./RecurrenceForm";

afterEach(cleanup);

test("sets up a monthly streaming expense on a credit card from the preset", () => {
  const onCreate = vi.fn();
  const client = new QueryClient();
  render(<QueryClientProvider client={client}><LanguageProvider>
    <RecurrenceForm accounts={[{
      id: "card", name: "Card", type: 4, initialBalance: 0, currentBalance: 0, createdAt: "",
    }]} categories={[{ id: "streaming", name: "Streaming", type: 2 }]}
      today="2026-11-27" pending={false} onCreate={onCreate} />
  </LanguageProvider></QueryClientProvider>);

  fireEvent.click(screen.getByRole("button", { name: "Streaming" }));
  fireEvent.change(screen.getByLabelText(/Como registrar|Mode/), { target: { value: "automatic" } });
  fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "19.90" } });
  fireEvent.click(screen.getByRole("button", { name: /Salvar agendamento|Save recurrence|Save rule/ }));
  expect(onCreate).toHaveBeenCalledWith({
    description: "Streaming", accountId: "card", categoryId: "streaming", type: 2,
    startsOn: "2026-11-27", automatic: true, amount: 19.9,
  });
});

test("links a financing installment to a bank for direct debit while keeping confirmation manual", () => {
  const onCreate = vi.fn();
  const client = new QueryClient();
  const base = { initialBalance: 0, currentBalance: 0, createdAt: "" };
  render(<QueryClientProvider client={client}><LanguageProvider>
    <RecurrenceForm accounts={[
      { ...base, id: "bank", name: "Bank", type: 1 },
      { ...base, id: "card", name: "Credit card", type: 4 },
    ]} categories={[
      { id: "financing", name: "Financing", type: 2 },
      { id: "financiamento", name: "Financiamento", type: 2 },
    ]} today="2026-11-27" pending={false} onCreate={onCreate} />
  </LanguageProvider></QueryClientProvider>);

  fireEvent.click(screen.getByRole("button", { name: /Financiamento|Financing/ }));
  fireEvent.change(screen.getByLabelText(/Como você paga|How do you pay/), { target: { value: "1" } });
  expect(screen.queryByRole("option", { name: /Credit card/ })).toBeNull();
  fireEvent.change(screen.getByLabelText(/Até quando|End date/), { target: { value: "2027-11-27" } });
  fireEvent.click(screen.getByRole("button", { name: /Salvar agendamento|Save recurrence/ }));
  expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({
    accountId: "bank", type: 2, paymentMethod: 1, automatic: false, endsOn: "2027-11-27",
  }));
});

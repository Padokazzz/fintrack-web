// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { api } from "../../../lib/api";
import { LanguageProvider } from "../../../lib/i18n/LanguageProvider";
import { QuickExpense } from "./QuickExpense";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test("creates the first bank account and category without losing an expense draft", async () => {
  const account = { id: "7932a953-a6a3-4a46-89cd-467b882fa08f", name: "Banco", type: 1 };
  const category = { id: "d3ef63df-6686-4f79-a871-14b54c8465a5", name: "Mercado", type: 2 };
  let accounts: typeof account[] = [];
  let categories: typeof category[] = [];
  vi.spyOn(api, "get").mockImplementation(async (url) => ({
    data: url === "/Accounts" ? accounts : categories,
  }));
  const post = vi.spyOn(api, "post").mockImplementation(async (url) => {
    if (url === "/Accounts") {
      accounts = [account];
      return { data: account };
    }
    if (url === "/Categories") {
      categories = [category];
      return { data: category };
    }
    return { data: {} };
  });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><LanguageProvider><QuickExpense /></LanguageProvider></QueryClientProvider>);

  fireEvent.click(screen.getByRole("button", { name: /Registrar gasto|Record expense/ }));
  const description = await screen.findByRole("textbox");
  fireEvent.change(description, { target: { value: "Compra semanal" } });
  fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "45.25" } });

  fireEvent.click(screen.getByRole("button", { name: /Criar conta bancária|Add bank account/ }));
  fireEvent.change(screen.getByLabelText(/Nome do banco|Bank or account name/), { target: { value: "Banco" } });
  fireEvent.click(screen.getByRole("button", { name: /Criar conta bancária|Add bank account/ }));
  await waitFor(() => expect((screen.getByRole("combobox", { name: /^(Conta|Account)$/ }) as HTMLSelectElement).value).toBe(account.id));

  fireEvent.click(screen.getByRole("button", { name: /Criar categoria|Add category/ }));
  fireEvent.change(screen.getByLabelText(/Nome da categoria|Category name/), { target: { value: "Mercado" } });
  fireEvent.click(screen.getByRole("button", { name: /Criar categoria|Add category/ }));
  await waitFor(() => expect((screen.getByRole("combobox", { name: /^(Categoria|Category)$/ }) as HTMLSelectElement).value).toBe(category.id));

  fireEvent.click(screen.getByRole("button", { name: /Salvar lançamento|Save entry/ }));
  expect(await screen.findByText(/Lançamento salvo|Entry saved/)).toBeTruthy();
  expect(post).toHaveBeenLastCalledWith("/Transactions", expect.objectContaining({
    description: "Compra semanal", amount: 45.25, type: 2, accountId: account.id, categoryId: category.id,
  }));
});

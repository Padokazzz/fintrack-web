// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";
import { api } from "../../lib/api";
import { LanguageProvider } from "../../lib/i18n/LanguageProvider";
import { UpcomingRecurrences } from "./UpcomingRecurrences";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test("confirms the actual amount for a pending bill without leaving the dashboard", async () => {
  let pending = true;
  vi.spyOn(api, "get").mockImplementation(async () => ({
    data: {
      today: "2026-11-27", through: "2026-12-27",
      accounts: [{ id: "bank", name: "Banco" }],
      items: pending ? [{
        ruleId: "internet", date: "2026-11-27", description: "Internet", accountId: "bank", type: 2,
        amount: 90, pending: true, automatic: false,
      }] : [],
    },
  }));
  const post = vi.spyOn(api, "post").mockImplementation(async () => {
    pending = false;
    return { status: 204 };
  });
  render(<QueryClientProvider client={new QueryClient()}>
    <MemoryRouter><LanguageProvider><UpcomingRecurrences /></LanguageProvider></MemoryRouter>
  </QueryClientProvider>);

  const amount = await screen.findByRole("spinbutton");
  fireEvent.change(amount, { target: { value: "94.50" } });
  fireEvent.click(screen.getByRole("button", { name: /Confirmar lançamento|Confirm transaction/ }));
  expect(await screen.findByText(/Lançamento confirmado|Entry confirmed/)).toBeTruthy();
  expect(post).toHaveBeenCalledWith("/recurrences/internet/occurrences/2026-11-27/confirm", { amount: 94.5 });
});

// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";
import { api } from "../../lib/api";
import { LanguageProvider } from "../../lib/i18n/LanguageProvider";
import { MyDataPage } from "./PrivacyPages";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test("deletes the profile only after password and explicit confirmation", async () => {
  const post = vi.spyOn(api, "post").mockResolvedValue({ status: 204 });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <LanguageProvider>
        <MemoryRouter initialEntries={["/my-data"]}>
          <Routes>
            <Route path="/my-data" element={<MyDataPage />} />
            <Route path="/login" element={<p>Login destination</p>} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>
    </QueryClientProvider>,
  );
  const confirmation = screen.getByRole("checkbox");
  const form = confirmation.closest("form")!;
  const password = form.querySelector('input[type="password"]')!;
  const submit = screen.getByRole("button", { name: /Excluir definitivamente|Delete permanently/ });
  fireEvent.change(password, { target: { value: "current-password" } });
  fireEvent.click(submit);
  expect(post).not.toHaveBeenCalled();

  fireEvent.click(confirmation);
  fireEvent.click(submit);

  await waitFor(() => expect(post).toHaveBeenCalledExactlyOnceWith("/auth/privacy/delete", { password: "current-password" }));
  expect(await screen.findByText("Login destination")).toBeTruthy();
});

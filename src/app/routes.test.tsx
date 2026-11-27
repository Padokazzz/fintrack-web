// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, expect, test } from "vitest";
import { LanguageProvider } from "../lib/i18n/LanguageProvider";
import { routes } from "./routes";

afterEach(cleanup);

test("unknown paths show the FinTrack 404 and a link home", async () => {
  const router = createMemoryRouter(routes, { initialEntries: ["/uma/pagina/inexistente"] });
  render(<LanguageProvider><RouterProvider router={router} /></LanguageProvider>);
  expect(await screen.findByRole("heading", { name: /Página não encontrada|Page not found/ })).toBeTruthy();
  expect(screen.getByRole("link", { name: /Voltar ao início|Back to home/ }).getAttribute("href")).toBe("/");
});

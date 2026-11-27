// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "../../lib/i18n/LanguageProvider";
import { InstallWebApp } from "./InstallWebApp";

afterEach(cleanup);

test("uses the browser installation prompt once and hides the action after acceptance", async () => {
  const event = new Event("beforeinstallprompt", { cancelable: true });
  const prompt = vi.fn().mockResolvedValue({ outcome: "accepted" });
  Object.assign(event, { prompt });

  render(<LanguageProvider><InstallWebApp /></LanguageProvider>);
  act(() => { window.dispatchEvent(event); });

  const install = /Instalar FinTrack|Install FinTrack/;
  expect(event.defaultPrevented).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: install }));
  expect(prompt).toHaveBeenCalledOnce();
  await waitFor(() => expect(screen.queryByRole("button", { name: install })).toBeNull());
});

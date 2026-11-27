// @vitest-environment jsdom
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { afterEach, expect, test, vi } from "vitest";
import { api, authApi, refreshSession, revokeSession } from "./api";
import { clearLegacyWebSession, clearSession, getToken, getUser, saveToken } from "./auth-storage";

const originalAdapter = api.defaults.adapter;

afterEach(() => {
  api.defaults.adapter = originalAdapter;
  clearSession();
  localStorage.clear();
  vi.restoreAllMocks();
});

function response(config: InternalAxiosRequestConfig, status: number, data: unknown = {}) {
  return { config, data, status, statusText: "", headers: {} };
}

test("shares a refresh across concurrent 401 responses and retries with the renewed token", async () => {
  saveToken("expired");
  const refresh = vi.spyOn(authApi, "post").mockResolvedValue({ data: { token: "renewed" } });
  const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
    if (config.headers.Authorization === "Bearer renewed") return response(config, 200);
    throw new AxiosError("Expired", "ERR_BAD_REQUEST", config, undefined, response(config, 401));
  });
  api.defaults.adapter = adapter;

  await Promise.all([api.get("/accounts"), api.get("/transactions")]);

  expect(refresh).toHaveBeenCalledExactlyOnceWith("/auth/refresh", null, {
    headers: { "X-FinTrack-Session": "1" },
  });
  expect(adapter).toHaveBeenCalledTimes(4);
  expect(getToken()).toBe("renewed");
});

test("revokes the remote session before clearing the local token", async () => {
  saveToken("current");
  const logout = vi.spyOn(authApi, "post").mockResolvedValue({});
  await revokeSession();
  expect(logout).toHaveBeenCalledExactlyOnceWith("/auth/logout", null, {
    headers: { "X-FinTrack-Session": "1" },
  });
  expect(getToken()).toBeNull();
});

test("restores a web session from the refresh cookie and keeps the token out of storage", async () => {
  localStorage.setItem("fintrack_token", "legacy-token");
  localStorage.setItem("fintrack_user", "{}");
  clearLegacyWebSession();
  const session = { token: "fresh", userId: "123", name: "Test", email: "test@example.com" };
  vi.spyOn(authApi, "post").mockResolvedValue({ data: session });

  expect(getToken()).toBeNull();
  await refreshSession();

  expect(getToken()).toBe("fresh");
  expect(getUser()).toEqual({ userId: "123", name: "Test", email: "test@example.com" });
  expect(localStorage.getItem("fintrack_token")).toBeNull();
  expect(localStorage.getItem("fintrack_user")).toBeNull();
  expect(sessionStorage.getItem("fintrack_token")).toBeNull();
});

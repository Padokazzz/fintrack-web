import type { AuthResponse } from "../features/auth/types";
import axios, { type InternalAxiosRequestConfig } from "axios";
import { clearSession, getToken, saveToken, saveUser } from "./auth-storage";
import { desktopAdapter, desktopApiBase, isDesktop } from "./platform/desktop";

const baseURL = isDesktop ? desktopApiBase : (import.meta.env.VITE_API_BASE_URL ?? "/api");
const adapter = isDesktop ? desktopAdapter : undefined;
const sessionHeaders = { "X-FinTrack-Session": "1" };

export const api = axios.create({ baseURL, adapter });
export const authApi = axios.create({ baseURL, adapter, withCredentials: true });

let refreshing: Promise<string> | undefined;
let signingOut = false;

const sessionEvents = !isDesktop && typeof BroadcastChannel !== "undefined"
  ? new BroadcastChannel("fintrack-session") : null;
let sessionGeneration = 0;

function redirectToLogin() {
  if (isDesktop) window.location.hash = "/login";
  else window.location.assign("/login");
}

sessionEvents?.addEventListener("message", (event) => {
  if (event.data !== "logout") return;
  sessionGeneration++;
  clearSession();
  if (window.location.pathname !== "/login") redirectToLogin();
});

function serializeSession<T>(action: () => Promise<T>): Promise<T> {
  return !isDesktop && navigator.locks
    ? navigator.locks.request("fintrack-session", action)
    : action();
}

export function refreshSession() {
  const generation = sessionGeneration;
  refreshing ??= serializeSession(() => authApi.post<AuthResponse>(
    "/auth/refresh", null, { headers: sessionHeaders },
  ))
    .then(({ data }) => {
      if (generation === sessionGeneration) {
        saveToken(data.token);
        saveUser(data);
      }
      return data.token;
    })
    .finally(() => { refreshing = undefined; });
  return refreshing;
}

export async function revokeSession() {
  signingOut = true;
  try {
    await refreshing?.catch(() => undefined);
    await serializeSession(() => authApi.post("/auth/logout", null, { headers: sessionHeaders }));
    sessionGeneration++;
    clearSession();
    sessionEvents?.postMessage("logout");
  } finally {
    signingOut = false;
  }
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config || signingOut) {
      throw error;
    }

    const config = error.config as InternalAxiosRequestConfig & { sessionRetried?: boolean };
    const currentToken = getToken();
    if (config.sessionRetried || !currentToken) {
      throw error;
    }
    config.sessionRetried = true;

    try {
      if (config.headers.Authorization === `Bearer ${currentToken}`) {
        await refreshSession();
      }
    } catch (refreshError) {
      if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401) {
        clearSession();
        redirectToLogin();
      }
      throw refreshError;
    }

    if (!getToken() || signingOut) throw error;
    return api(config);
  },
);

import axios, { type InternalAxiosRequestConfig } from "axios";
import { getToken, removeToken, saveToken } from "./auth-storage";
import { desktopAdapter, desktopApiBase, isDesktop } from "./platform/desktop";

const baseURL = isDesktop ? desktopApiBase : (import.meta.env.VITE_API_BASE_URL ?? "/api");
const adapter = isDesktop ? desktopAdapter : undefined;
const sessionHeaders = { "X-FinTrack-Session": "1" };

export const api = axios.create({ baseURL, adapter });
export const authApi = axios.create({ baseURL, adapter, withCredentials: true });

let refreshing: Promise<string> | undefined;
let signingOut = false;

function refreshSession() {
  refreshing ??= authApi.post<{ token: string }>("/auth/refresh", null, { headers: sessionHeaders })
    .then(({ data }) => {
      saveToken(data.token);
      return data.token;
    })
    .finally(() => { refreshing = undefined; });
  return refreshing;
}

export async function revokeSession() {
  signingOut = true;
  try {
    await refreshing?.catch(() => undefined);
    await authApi.post("/auth/logout", null, { headers: sessionHeaders });
    removeToken();
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
        removeToken();
        if (isDesktop) window.location.hash = "/login";
        else window.location.assign("/login");
      }
      throw refreshError;
    }

    return api(config);
  },
);

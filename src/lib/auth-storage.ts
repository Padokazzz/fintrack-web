import type { AuthResponse } from "../features/auth/types";
import { isDesktop } from "./platform/desktop";

const TOKEN_KEY = "fintrack_token";
const USER_KEY = "fintrack_user";
let webToken: string | null = null;
let webUser: Pick<AuthResponse, "userId" | "name" | "email"> | null = null;

export function saveToken(token: string) {
  if (isDesktop) sessionStorage.setItem(TOKEN_KEY, token);
  else webToken = token;
}

export function getToken() {
  return isDesktop ? sessionStorage.getItem(TOKEN_KEY) : webToken;
}

export function removeToken() {
  if (isDesktop) sessionStorage.removeItem(TOKEN_KEY);
  else webToken = null;
}

export function saveUser({ userId, name, email }: AuthResponse) {
  const user = { userId, name, email };
  if (isDesktop) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  else webUser = user;
}

export function getUser() {
  const stored = isDesktop ? sessionStorage.getItem(USER_KEY) : null;
  return stored ? JSON.parse(stored) as typeof webUser : webUser;
}

export function clearSession() {
  removeToken();
  if (isDesktop) sessionStorage.removeItem(USER_KEY);
  else webUser = null;
}

export function clearLegacyWebSession() {
  if (isDesktop) return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // Storage may be blocked by the browser.
  }
}

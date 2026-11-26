import { isDesktop } from "./platform/desktop";

const TOKEN_KEY = "fintrack_token";

export function saveToken(token: string) {
  getSessionStorage().setItem(TOKEN_KEY, token);
}

export function getToken() {
  return getSessionStorage().getItem(TOKEN_KEY);
}

export function removeToken() {
  getSessionStorage().removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function getSessionStorage() {
  return isDesktop ? sessionStorage : localStorage;
}

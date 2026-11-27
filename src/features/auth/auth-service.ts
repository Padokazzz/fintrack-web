import { authApi } from "../../lib/api";
import type { AuthResponse, AuthResult, LoginRequest, RegisterRequest } from "./types";

export async function registerUser(data: RegisterRequest) {
  const response = await authApi.post<AuthResult>("/auth/register", data);
  return response.data;
}

export async function loginUser(data: LoginRequest) {
  const response = await authApi.post<AuthResult>("/auth/login", data);
  return response.data;
}

export async function verifyEmailCode(challengeId: string, code: string) {
  const { data } = await authApi.post<AuthResponse>("/auth/verify-email", { challengeId, code });
  return data;
}

import { authApi } from "../../lib/api";
import type { AuthResponse, LoginRequest, RegisterRequest } from "./types";

export async function registerUser(data: RegisterRequest) {
  const response = await authApi.post<AuthResponse>("/auth/register", data);
  return response.data;
}

export async function loginUser(data: LoginRequest) {
  const response = await authApi.post<AuthResponse>("/auth/login", data);
  return response.data;
}
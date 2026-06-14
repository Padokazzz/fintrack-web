import { api } from "../../lib/api";
import type { AuthResponse, LoginRequest, RegisterRequest } from "./types";

export async function registerUser(data: RegisterRequest) {
  const response = await api.post<AuthResponse>("/Auth/register", data);
  return response.data;
}

export async function loginUser(data: LoginRequest) {
  const response = await api.post<AuthResponse>("/Auth/login", data);
  return response.data;
}
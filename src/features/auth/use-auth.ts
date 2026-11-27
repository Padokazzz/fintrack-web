import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { revokeSession } from "../../lib/api";
import { getUser, saveToken, saveUser } from "../../lib/auth-storage";
import type { AuthResponse } from "./types";

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function handleLoginSuccess(response: AuthResponse) {
    queryClient.clear();
    saveToken(response.token);
    saveUser(response);
    navigate("/dashboard");
  }

  async function logout() {
    await revokeSession();
    queryClient.clear();
    navigate("/login");
  }

  return {
    user: getUser(),
    handleLoginSuccess,
    logout,
  };
}
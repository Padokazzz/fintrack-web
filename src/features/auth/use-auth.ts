import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { revokeSession } from "../../lib/api";
import { getSessionStorage, saveToken } from "../../lib/auth-storage";
import type { AuthResponse } from "./types";

const USER_KEY = "fintrack_user";

export function saveUser(user: AuthResponse) {
  getSessionStorage().setItem(
    USER_KEY,
    JSON.stringify({
      userId: user.userId,
      name: user.name,
      email: user.email,
    })
  );
}

export function getUser() {
  const user = getSessionStorage().getItem(USER_KEY);

  if (!user) {
    return null;
  }

  return JSON.parse(user) as {
    userId: string;
    name: string;
    email: string;
  };
}

export function removeUser() {
  getSessionStorage().removeItem(USER_KEY);
}

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
    removeUser();
    navigate("/login");
  }

  return {
    user: getUser(),
    handleLoginSuccess,
    logout,
  };
}
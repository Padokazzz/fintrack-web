import { useNavigate } from "react-router-dom";
import { saveToken, removeToken } from "../../lib/auth-storage";
import type { AuthResponse } from "./types";

const USER_KEY = "fintrack_user";

export function saveUser(user: AuthResponse) {
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      userId: user.userId,
      name: user.name,
      email: user.email,
    })
  );
}

export function getUser() {
  const user = localStorage.getItem(USER_KEY);

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
  localStorage.removeItem(USER_KEY);
}

export function useAuth() {
  const navigate = useNavigate();

  function handleLoginSuccess(response: AuthResponse) {
    saveToken(response.token);
    saveUser(response);
    navigate("/dashboard");
  }

  function logout() {
    removeToken();
    removeUser();
    navigate("/login");
  }

  return {
    user: getUser(),
    handleLoginSuccess,
    logout,
  };
}
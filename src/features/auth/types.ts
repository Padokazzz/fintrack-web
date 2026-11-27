export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  userId: string;
  name: string;
  email: string;
  token: string;
};
export type EmailChallenge = { challengeId: string };

export type AuthResult = AuthResponse | EmailChallenge;

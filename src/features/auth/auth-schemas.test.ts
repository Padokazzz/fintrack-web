import { expect, test } from "vitest";
import { registerSchema } from "./auth-schemas";

test("registration requires the same password in both fields", () => {
  const valid = { name: "Test User", email: "user@example.com", password: "password-123" };
  const result = registerSchema.safeParse({ ...valid, confirmPassword: "different" });
  expect(result.success).toBe(false);
  if (!result.success) expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
  expect(registerSchema.safeParse({ ...valid, confirmPassword: valid.password }).success).toBe(true);
});

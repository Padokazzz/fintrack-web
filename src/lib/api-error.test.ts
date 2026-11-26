import { AxiosError } from "axios";
import { expect, test } from "vitest";
import { getApiErrorMessage } from "./api-error";

test("uses the unavailable API message for a network failure", () => {
  expect(getApiErrorMessage(
    new AxiosError("Connection refused", AxiosError.ERR_NETWORK),
    "Invalid credentials",
    "API unavailable",
  )).toBe("API unavailable");
});

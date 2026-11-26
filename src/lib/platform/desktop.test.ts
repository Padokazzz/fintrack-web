import axios from "axios";
import { beforeEach, expect, test, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { desktopAdapter, desktopApiBase, saveDesktopCsv } from "./desktop";

vi.mock("@tauri-apps/api/core", () => ({
  isTauri: () => true,
  invoke: vi.fn(),
}));

const native = vi.mocked(invoke);
const client = axios.create({ adapter: desktopAdapter, baseURL: desktopApiBase });

beforeEach(() => {
  native.mockReset();
});

test("passes the API route and returns a JSON response through the desktop bridge", async () => {
  native.mockResolvedValue({
    status: 200,
    contentType: "application/json",
    bytes: Array.from(new TextEncoder().encode('{"items":[]}')),
  });

  const response = await client.get("/transactions/page", {
    params: { page: 2 },
    headers: { Authorization: "Bearer test" },
  });

  expect(native).toHaveBeenCalledWith("api_request", {
    request: {
      method: "GET",
      path: "/api/transactions/page?page=2",
      body: null,
      authorization: "Bearer test",
      sessionRequest: false,
    },
  });
  expect(response.data).toEqual({ items: [] });
});

test("preserves a session renewal error as an Axios 401 response", async () => {
  native.mockResolvedValue({ status: 401, contentType: "", bytes: [] });
  await expect(client.post("/auth/refresh", null, { headers: { "X-FinTrack-Session": "1" } }))
    .rejects.toMatchObject({ response: { status: 401 } });
  expect(native).toHaveBeenCalledWith("api_request", {
    request: expect.objectContaining({ sessionRequest: true }),
  });
});

test("sends the original CSV bytes to the native save dialog", async () => {
  const bytes = Array.from(new TextEncoder().encode("value\r\n12.00\r\n"));
  native.mockResolvedValueOnce({ status: 200, contentType: "text/csv", bytes });
  native.mockResolvedValueOnce(false);

  const response = await client.get<Blob>("/reports/transactions.csv", { responseType: "blob" });
  await expect(saveDesktopCsv(response.data, 2026, 11)).resolves.toBe(false);
  expect(native).toHaveBeenLastCalledWith("save_csv", { year: 2026, month: 11, bytes });
});

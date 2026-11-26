import { invoke, isTauri } from "@tauri-apps/api/core";
import axios, { AxiosError, AxiosHeaders, type AxiosAdapter } from "axios";

export const isDesktop = isTauri();
export const desktopApiBase = "https://fintrack.invalid/api";

interface NativeResponse {
  status: number;
  contentType: string;
  bytes: number[];
}

export const desktopAdapter: AxiosAdapter = async (config) => {
  const url = new URL(axios.getUri(config));
  if (url.origin !== new URL(desktopApiBase).origin) {
    throw new AxiosError("Invalid desktop API origin.", AxiosError.ERR_INVALID_URL, config);
  }

  let native: NativeResponse;
  try {
    native = await invoke<NativeResponse>("api_request", {
      request: {
        path: url.pathname + url.search,
        method: (config.method ?? "get").toUpperCase(),
        body: typeof config.data === "string" ? config.data : null,
        authorization: config.headers.get("Authorization") || null,
        sessionRequest: config.headers.get("X-FinTrack-Session") === "1",
      },
    });
  } catch (error) {
    const message = typeof error === "string" ? error : "Could not reach the FinTrack API.";
    throw new AxiosError(message, AxiosError.ERR_NETWORK, config);
  }

  const bytes = Uint8Array.from(native.bytes);
  const response = {
    data: config.responseType === "blob"
      ? new Blob([bytes], { type: native.contentType })
      : new TextDecoder().decode(bytes),
    status: native.status,
    statusText: String(native.status),
    headers: new AxiosHeaders({ "content-type": native.contentType }),
    config,
  };
  if (config.validateStatus && !config.validateStatus(response.status)) {
    const code = response.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST;
    throw new AxiosError(`Request failed with status code ${response.status}`, code, config, undefined, response);
  }
  return response;
};

export async function saveDesktopCsv(data: Blob, year: number, month: number) {
  return invoke<boolean>("save_csv", {
    year,
    month,
    bytes: Array.from(new Uint8Array(await data.arrayBuffer())),
  });
}

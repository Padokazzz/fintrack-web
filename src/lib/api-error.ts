import axios from "axios";

type ApiErrorResponse = {
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
};

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string
) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallbackMessage;
  }

  const data = error.response?.data;

  if (data?.message) {
    return data.message;
  }

  if (data?.title) {
    return data.title;
  }

  const firstValidationError = data?.errors
    ? Object.values(data.errors).flat()[0]
    : undefined;

  return firstValidationError ?? fallbackMessage;
}

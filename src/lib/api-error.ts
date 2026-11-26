import axios from "axios";

type ApiErrorResponse = {
  message?: string;
  title?: string;
  errors?: { message: string }[] | Record<string, string[]>;
};

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string
) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallbackMessage;
  }

  const data = error.response?.data;

  const errors = data?.errors;
  const firstValidationError = Array.isArray(errors)
    ? errors[0]?.message
    : Object.values(errors ?? {}).flat()[0];

  if (firstValidationError) {
    return firstValidationError;
  }

  if (data?.message) {
    return data.message;
  }

  if (data?.title) {
    return data.title;
  }

  return fallbackMessage;
}

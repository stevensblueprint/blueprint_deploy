import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: apiBaseUrl || undefined,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (typeof error.response?.data === "string") {
      return error.response.data;
    }

    const message =
      (error.response?.data as { message?: string } | undefined)?.message ||
      error.message;

    return message || "Request failed.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
};

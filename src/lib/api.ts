import axios from "axios";

const deployApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export type DeployRequest = {
  name: string;
  subdomain: string;
  githubRepositoryName: string;
  githubBranchName: string;
  requiresAuth: boolean;
  includeRootDomain: boolean;
};

export type Deployment = DeployRequest;

export type DeployResponse = {
  message: string;
  pipelineExecutionId: string;
};

export type UpdateDeploymentRequest = {
  subdomain: string;
};

export type DeploymentStatus =
  | "InProgress"
  | "Succeeded"
  | "Failed"
  | "Canceled";

export interface Stage {
  name: string;
  status: string;
  lastUpdate?: string;
}

export type DeploymentStatusResponse = {
  executionId: string;
  status: string;
  stages: Stage[];
  url: string | null;
  error: string | null;
};

export const deployApi = axios.create({
  baseURL: deployApiBaseUrl || undefined,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export const createDeployment = (payload: DeployRequest) => {
  return deployApi.post<DeployResponse>("/deploy", payload);
};

export const updateDeployment = (
  appName: string,
  payload: UpdateDeploymentRequest,
) => {
  return deployApi.put<DeployResponse>(
    `/deployment/${encodeURIComponent(appName)}`,
    payload,
  );
};

export const getDeployments = () => deployApi.get<Deployment[]>("/deployments");

export const deleteDeployment = (data: {
  name: string;
  githubRepositoryName: string;
  subdomain: string;
}) =>
  deployApi.delete("/deployment", {
    data,
  });

export const getDeploymentStatus = (executionId: string) => {
  return deployApi.get<DeploymentStatusResponse>(`/deployment/${executionId}`);
};

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (typeof error.response?.data === "string") {
      // Try to extract JSON from error strings like:
      // "Internal server error: GitHub API error 422 for <URL>: {JSON}"
      const jsonMatch = error.response.data.match(/:\s*(\{.*\})\s*$/);
      if (jsonMatch) {
        try {
          const parsedError = JSON.parse(jsonMatch[1]);
          if (parsedError.message) {
            return parsedError.message;
          }
        } catch {
          // If JSON parsing fails, fall through to return the original string
        }
      }
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

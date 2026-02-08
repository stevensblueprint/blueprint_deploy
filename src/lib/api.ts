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

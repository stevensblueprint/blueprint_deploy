import {
  CheckCircle2,
  Loader2,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import {
  getApiErrorMessage,
  getDeploymentStatus,
  type DeploymentStatusResponse,
} from "@/lib/api";
import { cn } from "@/lib/utils";

interface DeploymentStatusViewProps {
  executionId: string;
  onReset: () => void;
}

const STAGE_ORDER = ["Source", "Build", "Deploy"];

const STAGE_DESCRIPTIONS: Record<string, string> = {
  Source:
    "Getting configuration and preparing source artifacts. This stage ensures all necessary files and settings are pulled and validated before the build begins.",
  Build:
    "Building your AWS resources. This involves provisioning core infrastructure, compiling code, and preparing the cloud environment according to your specifications.",
  Deploy:
    "Deploying AWS resources. The final stage where your application is pushed to the target environment, making it accessible at the provided URL.",
};

export function DeploymentStatusView({
  executionId,
}: DeploymentStatusViewProps) {
  const [statusData, setStatusData] = useState<DeploymentStatusResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const pollerRef = useRef<number | null>(null);

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await getDeploymentStatus(executionId);
        setStatusData(response.data);

        if (
          (response.data.status === "Succeeded" ||
            response.data.status === "Failed" ||
            response.data.status === "Canceled") &&
          pollerRef.current
        ) {
          window.clearInterval(pollerRef.current);
          pollerRef.current = null;
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }
        setError(getApiErrorMessage(error));
      }
    };

    pollStatus();
    pollerRef.current = window.setInterval(pollStatus, 5000); // Poll every 5 seconds for better UX

    return () => {
      if (pollerRef.current) {
        window.clearInterval(pollerRef.current);
        pollerRef.current = null;
      }
    };
  }, [executionId]);

  const getStatusIcon = (status: string, size = "h-5 w-5") => {
    switch (status) {
      case "Succeeded":
        return <CheckCircle2 className={cn(size, "text-green-500")} />;
      case "InProgress":
        return <Loader2 className={cn(size, "text-blue-500 animate-spin")} />;
      case "Failed":
        return <XCircle className={cn(size, "text-red-500")} />;
      case "Canceled":
        return <XCircle className={cn(size, "text-gray-500")} />;
      default:
        return <Clock className={cn(size, "text-muted-foreground")} />;
    }
  };

  const sortedStages = STAGE_ORDER.map((stageName) => {
    const stage = statusData?.stages.find((s) => s.name === stageName);
    return (
      stage || {
        name: stageName,
        status: "Pending",
      }
    );
  });

  return (
    <div className="space-y-12 py-8">
      {/* Info and Status Card */}
      <Card className="max-w-4xl mx-auto border-none shadow-none bg-transparent">
        <CardContent className="space-y-8">
          {error && (
            <p className="text-sm text-red-600 text-center" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col items-center space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Deployment Pipeline
              </h2>
              <p className="text-sm text-muted-foreground flex flex-col items-center gap-1">
                <span>
                  Execution ID:{" "}
                  <span className="font-mono text-xs font-semibold">
                    {executionId}
                  </span>
                </span>
                <a
                  href={`https://904233098281-tm3revhu.us-east-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/blueprint-deployments-pipeline/executions/${executionId}/visualization?region=us-east-1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  View in AWS CodePipeline
                </a>
              </p>
              {statusData?.status && (
                <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-semibold gap-2 mt-4 bg-muted/50 border">
                  {getStatusIcon(statusData.status, "h-4 w-4")}
                  <span className="capitalize">
                    Pipeline Status: {statusData.status}
                  </span>
                </div>
              )}
            </div>

            {statusData?.url && statusData.status === "Succeeded" && (
              <div className="w-full p-8 bg-green-50/50 rounded-2xl border-2 border-green-100 flex flex-col items-center text-center space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-6 w-6" />
                  <p className="text-lg font-bold">Your Deployment is Live!</p>
                </div>
                <a
                  href={statusData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl text-blue-600 hover:text-blue-700 font-black break-all hover:underline decoration-4 underline-offset-8 transition-all"
                >
                  {statusData.url}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Stages Section */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4 lg:gap-8 px-4">
        {sortedStages.map((stage, index) => (
          <div
            key={stage.name}
            className="flex flex-col md:flex-row items-center gap-4 lg:gap-8"
          >
            <Card
              className={cn(
                "w-64 md:w-72 lg:w-80 shadow-md transition-all duration-300 transform hover:scale-[1.02] group relative overflow-hidden",
                stage.status === "InProgress"
                  ? "border-blue-500 ring-2 ring-blue-500/20"
                  : stage.status === "Succeeded"
                    ? "border-green-200 bg-green-50/10"
                    : "border-border",
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold tracking-tight">
                    {stage.name}
                  </h3>
                  {getStatusIcon(stage.status, "h-8 w-8")}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        stage.status === "Succeeded"
                          ? "bg-green-500"
                          : stage.status === "InProgress"
                            ? "bg-blue-500 animate-pulse"
                            : "bg-muted-foreground/30",
                      )}
                    />
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {stage.status}
                    </p>
                  </div>
                  {stage.lastUpdate && (
                    <p className="text-xs text-muted-foreground/70">
                      Updated: {new Date(stage.lastUpdate).toLocaleTimeString()}
                    </p>
                  )}
                </div>

                {/* Hover Overlay Information */}
                <div className="absolute inset-0 bg-background/95 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-6 flex flex-col justify-center text-center">
                  <h4 className="text-sm font-bold uppercase tracking-wider mb-2 text-primary">
                    Stage Details
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {STAGE_DESCRIPTIONS[stage.name] ||
                      "Detailed information for this stage is currently unavailable."}
                  </p>
                </div>
              </CardContent>
            </Card>
            {index < sortedStages.length - 1 && (
              <>
                <div className="hidden md:flex items-center justify-center">
                  <ArrowRight className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <div className="md:hidden flex items-center justify-center py-2">
                  <ArrowRight className="h-8 w-8 text-muted-foreground/30 rotate-90" />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

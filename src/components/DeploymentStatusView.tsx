import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getApiErrorMessage,
  getDeploymentStatus,
} from "@/lib/api";

interface DeploymentStatusViewProps {
  executionId: string;
  onReset: () => void;
}

export function DeploymentStatusView({ executionId, onReset }: DeploymentStatusViewProps) {
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollerRef = useRef<number | null>(null);

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await getDeploymentStatus(executionId);
        const { status } = response.data;
        setExecutionStatus(status);

        if (status === "Succeeded" && pollerRef.current) {
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
    pollerRef.current = window.setInterval(pollStatus, 30000);

    return () => {
      if (pollerRef.current) {
        window.clearInterval(pollerRef.current);
        pollerRef.current = null;
      }
    };
  }, [executionId]);

  return (
    <Card className="app-card">
      <CardHeader>
        <CardTitle>Deployment Status</CardTitle>
        <CardDescription>
          Monitoring the progress of your deployment.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <p className="text-sm font-medium">Execution ID:</p>
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
            {executionId}
          </code>
        </div>
        <div className="grid gap-2">
          <p className="text-sm font-medium">Status:</p>
          <p className="text-sm text-muted-foreground" role="status">
            {executionStatus || "Fetching status..."}
          </p>
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <Button onClick={onReset} variant="outline" className="mt-4">
          Create New Deployment
        </Button>
      </CardContent>
    </Card>
  );
}

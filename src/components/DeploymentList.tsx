import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  type Deployment,
  getDeployments,
  deleteDeployment,
  getApiErrorMessage,
} from "@/lib/api";

interface DeploymentListProps {
  onCreateNew: () => void;
}

export function DeploymentList({ onCreateNew }: DeploymentListProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeployments = async () => {
    setIsLoading(true);
    try {
      const response = await getDeployments();
      setDeployments(response.data);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, []);

  const handleDelete = async (name: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the deployment "${name}"?`,
      )
    ) {
      return;
    }

    try {
      await deleteDeployment(name);
      await fetchDeployments();
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <Card className="app-card">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Loading deployments...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative z-10 flex flex-col gap-6 items-center w-full max-w-4xl">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-2xl font-bold">Active Deployments</h1>
        <Button onClick={onCreateNew}>Create New Deployment</Button>
      </div>

      {error && (
        <Card className="w-full border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {deployments.length === 0 ? (
        <Card className="w-full">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No active deployments found.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 w-full md:grid-cols-2">
          {deployments.map((deployment) => (
            <Card key={deployment.name} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{deployment.name}</CardTitle>
                    <CardDescription>
                      {deployment.subdomain}.sitblueprint.com
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Repository:</span>
                    <span className="font-medium">
                      {deployment.githubRepositoryName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Branch:</span>
                    <span className="font-medium">
                      {deployment.githubBranchName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auth:</span>
                    <span className="font-medium">
                      {deployment.requiresAuth ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => handleDelete(deployment.name)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

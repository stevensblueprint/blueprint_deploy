import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="relative z-10 flex flex-col gap-6 items-center w-full max-w-5xl">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-2xl font-bold">Active Deployments</h1>
        <Button
          onClick={onCreateNew}
          className="bg-[#95C9FF] hover:bg-[#0078E8] text-white transition-colors"
        >
          Create New Deployment
        </Button>
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
        <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-0">Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Repository</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Auth</TableHead>
                <TableHead className="text-right px-0">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployments.map((deployment) => (
                <TableRow key={deployment.name}>
                  <TableCell className="font-medium px-0">
                    {deployment.name}
                  </TableCell>
                  <TableCell>{deployment.subdomain}.sitblueprint.com</TableCell>
                  <TableCell>{deployment.githubRepositoryName}</TableCell>
                  <TableCell>{deployment.githubBranchName}</TableCell>
                  <TableCell>
                    {deployment.requiresAuth ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="text-right px-0">
                    <Button
                      variant="ghost"
                      className="text-black/60 hover:text-black"
                      onClick={() => handleDelete(deployment.name)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

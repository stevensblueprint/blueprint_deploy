import { X, Github, ExternalLink, GitFork } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [deploymentToDelete, setDeploymentToDelete] = useState<string | null>(
    null,
  );

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

  const handleDelete = async () => {
    if (!deploymentToDelete) return;

    try {
      await deleteDeployment(deploymentToDelete);
      await fetchDeployments();
      setDeploymentToDelete(null);
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
          className="bg-[#0078E8] hover:bg-[#0058A9] text-white transition-colors"
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
                  <TableCell>
                    <a
                      href={`https://${deployment.subdomain}.sitblueprint.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-foreground hover:text-blue-600 transition-colors group"
                    >
                      <span>{deployment.subdomain}.sitblueprint.com</span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`https://github.com/stevensblueprint/${deployment.githubRepositoryName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-2 py-1 rounded-md border border-border bg-muted/30 hover:bg-muted transition-colors text-foreground"
                    >
                      <Github className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {deployment.githubRepositoryName}
                      </span>
                    </a>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <GitFork className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{deployment.githubBranchName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {deployment.requiresAuth ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="text-right px-0">
                    <Button
                      variant="ghost"
                      className="text-black/60 hover:text-black"
                      onClick={() => setDeploymentToDelete(deployment.name)}
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

      <Dialog
        open={!!deploymentToDelete}
        onOpenChange={(open) => !open && setDeploymentToDelete(null)}
      >
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the deployment{" "}
              <strong>{deploymentToDelete}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeploymentToDelete(null)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

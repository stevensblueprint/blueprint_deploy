import {
  Pencil,
  X,
  Github,
  ExternalLink,
  GitFork,
  Loader2,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  type Deployment,
  getDeployments,
  deleteDeployment,
  getApiErrorMessage,
} from "@/lib/api";

interface DeploymentListProps {
  onCreateNew: () => void;
  onUpdateDeployment: (deployment: Deployment) => void;
}

export function DeploymentList({
  onCreateNew,
  onUpdateDeployment,
}: DeploymentListProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deploymentToDelete, setDeploymentToDelete] =
    useState<Deployment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchDeployments = async () => {
    setIsLoading(true);
    try {
      const response = await getDeployments();
      setDeployments(Array.isArray(response.data) ? response.data : []);
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

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteDeployment({
        name: deploymentToDelete.name,
        githubRepositoryName: deploymentToDelete.githubRepositoryName,
        subdomain: deploymentToDelete.subdomain,
      });
      await fetchDeployments();
      setDeploymentToDelete(null);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center space-y-4 py-12">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="text-lg font-medium text-muted-foreground animate-pulse">
          Loading deployments...
        </p>
      </div>
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
        <div className="w-full flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {deployments.length === 0 ? (
        <p className="text-sm text-neutral-400 pl-1 italic">
          No active deployments found.
        </p>
      ) : (
        <div className="w-full overflow-hidden rounded-xl border border-neutral-200 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-neutral-600">
                  Name
                </th>
                <th className="px-6 py-3 font-semibold text-neutral-600">
                  URL
                </th>
                <th className="px-6 py-3 font-semibold text-neutral-600">
                  Repository
                </th>
                <th className="px-6 py-3 font-semibold text-neutral-600">
                  Branch
                </th>
                <th className="px-6 py-3 font-semibold text-neutral-600">
                  Auth
                </th>
                <th className="px-6 py-3 font-semibold text-neutral-600 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {deployments.map((deployment) => (
                <tr
                  key={deployment.name}
                  className="hover:bg-neutral-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-neutral-900">
                    {deployment.name}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`https://${deployment.subdomain}.sitblueprint.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-neutral-700 hover:text-blue-600 transition-colors group"
                    >
                      <span>{deployment.subdomain}.sitblueprint.com</span>
                      <ExternalLink className="h-3.5 w-3.5 text-neutral-400 group-hover:text-blue-600 transition-colors" />
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`https://github.com/stevensblueprint/${deployment.githubRepositoryName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-2 py-1 rounded-md border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition-colors text-neutral-700"
                    >
                      <Github className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {deployment.githubRepositoryName}
                      </span>
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <GitFork className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="text-neutral-700">
                        {deployment.githubBranchName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-700">
                    {deployment.requiresAuth ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onUpdateDeployment(deployment)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setDeleteError(null);
                          setDeploymentToDelete(deployment);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deploymentToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDeploymentToDelete(null);
          }}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="text-base font-semibold text-neutral-900">
                Delete Deployment
              </h2>
              <button
                onClick={() => setDeploymentToDelete(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-neutral-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-neutral-900">
                  "{deploymentToDelete.name}"
                </span>
                ? This action cannot be undone.
              </p>

              {deleteError && (
                <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {deleteError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setDeploymentToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isDeleting ? "Deleting…" : "Delete Deployment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

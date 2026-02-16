import { useState, useEffect } from "react";
import { DeploymentForm } from "../components/DeploymentForm";
import { DeploymentStatusView } from "../components/DeploymentStatusView";
import { DeploymentList } from "../components/DeploymentList";
import { Navbar } from "../components/Navbar";
import { type Deployment } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function Home() {
  const [executionId, setExecutionId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("pipelineExecutionId");
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "update">("create");
  const [deploymentToUpdate, setDeploymentToUpdate] =
    useState<Deployment | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setExecutionId(params.get("pipelineExecutionId"));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSuccess = (id: string) => {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("pipelineExecutionId", id);
    window.history.pushState(null, "", nextUrl.toString());
    setExecutionId(id);
    setIsFormOpen(false);
  };

  const handleReset = () => {
    window.history.pushState(null, "", window.location.pathname);
    setExecutionId(null);
    setIsFormOpen(false);
  };

  const openCreateDialog = () => {
    setFormMode("create");
    setDeploymentToUpdate(null);
    setIsFormOpen(true);
  };

  const openUpdateDialog = (deployment: Deployment) => {
    setFormMode("update");
    setDeploymentToUpdate(deployment);
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="app-shell flex-1">
        {executionId ? (
          <DeploymentStatusView
            executionId={executionId}
            onReset={handleReset}
          />
        ) : (
          <>
            <DeploymentList
              onCreateNew={openCreateDialog}
              onUpdateDeployment={openUpdateDialog}
            />
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogContent className="sm:max-w-130">
                <DialogHeader>
                  <DialogTitle className="text-lg">
                    {formMode === "create"
                      ? "Create Deployment"
                      : "Update Deployment"}
                  </DialogTitle>
                  <DialogDescription>
                    {formMode === "create"
                      ? "Define your deployment details to generate a new environment."
                      : "Update only the subdomain for this deployment and trigger a new pipeline execution."}
                  </DialogDescription>
                </DialogHeader>
                <DeploymentForm
                  onSuccess={handleSuccess}
                  mode={formMode}
                  initialName={deploymentToUpdate?.name}
                  initialSubdomain={deploymentToUpdate?.subdomain}
                />
              </DialogContent>
            </Dialog>
          </>
        )}
      </main>
    </div>
  );
}

export default Home;

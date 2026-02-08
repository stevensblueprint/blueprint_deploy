import { useState, useEffect } from "react";
import "./App.css";
import { DeploymentForm } from "./components/DeploymentForm";
import { DeploymentStatusView } from "./components/DeploymentStatusView";
import { DeploymentList } from "./components/DeploymentList";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function App() {
  const [executionId, setExecutionId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("pipelineExecutionId");
  });
  
  const [isCreating, setIsCreating] = useState(false);

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
    setIsCreating(false);
  };

  const handleReset = () => {
    window.history.pushState(null, "", window.location.pathname);
    setExecutionId(null);
    setIsCreating(false);
  };

  return (
    <div className="app-shell">
      {executionId ? (
        <DeploymentStatusView executionId={executionId} onReset={handleReset} />
      ) : (
        <>
          <DeploymentList onCreateNew={() => setIsCreating(true)} />
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Create Deployment</DialogTitle>
                <DialogDescription>
                  Define your deployment details to generate a new environment.
                </DialogDescription>
              </DialogHeader>
              <DeploymentForm onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

export default App;

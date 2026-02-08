import { useState, useEffect } from "react";
import "./App.css";
import { DeploymentForm } from "./components/DeploymentForm";
import { DeploymentStatusView } from "./components/DeploymentStatusView";
import { DeploymentList } from "./components/DeploymentList";
import { Button } from "./components/ui/button";

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
      <div className="app-glow" />
      {executionId ? (
        <DeploymentStatusView executionId={executionId} onReset={handleReset} />
      ) : isCreating ? (
        <div className="relative z-10 flex flex-col gap-4 items-center w-full">
          <div className="flex justify-start w-full max-w-[520px]">
            <Button variant="ghost" onClick={() => setIsCreating(false)}>
              ← Back to list
            </Button>
          </div>
          <DeploymentForm onSuccess={handleSuccess} />
        </div>
      ) : (
        <DeploymentList onCreateNew={() => setIsCreating(true)} />
      )}
    </div>
  );
}

export default App;

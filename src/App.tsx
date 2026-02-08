import { useState, useEffect } from "react";
import "./App.css";
import { DeploymentForm } from "./components/DeploymentForm";
import { DeploymentStatusView } from "./components/DeploymentStatusView";

function App() {
  const [executionId, setExecutionId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("pipelineExecutionId");
  });

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
  };

  const handleReset = () => {
    window.history.pushState(null, "", window.location.pathname);
    setExecutionId(null);
  };

  return (
    <div className="app-shell">
      <div className="app-glow" />
      {executionId ? (
        <DeploymentStatusView executionId={executionId} onReset={handleReset} />
      ) : (
        <DeploymentForm onSuccess={handleSuccess} />
      )}
    </div>
  );
}

export default App;

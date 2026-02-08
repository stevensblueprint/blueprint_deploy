import { useMemo, useState } from "react";

import "./App.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type DeploymentFormState = {
  name: string;
  subdomain: string;
  githubRepositoryName: string;
  githubBranchName: string;
  requiresAuth: boolean;
  includeRootDomain: boolean;
};

const initialFormState: DeploymentFormState = {
  name: "",
  subdomain: "",
  githubRepositoryName: "",
  githubBranchName: "",
  requiresAuth: false,
  includeRootDomain: false,
};

function App() {
  const [formState, setFormState] =
    useState<DeploymentFormState>(initialFormState);
  const [submitted, setSubmitted] = useState(false);

  const payloadPreview = useMemo(
    () => JSON.stringify(formState, null, 2),
    [formState],
  );

  const handleChange = (key: keyof DeploymentFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    setSubmitted(false);
  };

  const handleToggle = (key: keyof DeploymentFormState, value: boolean) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    setSubmitted(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="app-shell">
      <div className="app-glow" />
      <Card className="app-card">
        <CardHeader>
          <CardTitle>Create Deployment</CardTitle>
          <CardDescription>
            Define your deployment details to generate a new environment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="app-form" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Application name</Label>
              <Input
                id="name"
                value={formState.name}
                onChange={(event) => handleChange("name", event.target.value)}
                placeholder="inreach"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <Input
                id="subdomain"
                value={formState.subdomain}
                onChange={(event) =>
                  handleChange("subdomain", event.target.value)
                }
                placeholder="inreach"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="githubRepositoryName">GitHub repository</Label>
              <Input
                id="githubRepositoryName"
                value={formState.githubRepositoryName}
                onChange={(event) =>
                  handleChange("githubRepositoryName", event.target.value)
                }
                placeholder="inreach_repo"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="githubBranchName">GitHub branch</Label>
              <Input
                id="githubBranchName"
                value={formState.githubBranchName}
                onChange={(event) =>
                  handleChange("githubBranchName", event.target.value)
                }
                placeholder="main"
              />
            </div>

            <div className="app-toggle">
              <div className="grid gap-1">
                <Label htmlFor="requiresAuth">Requires auth</Label>
                <span className="text-xs text-muted-foreground">
                  Protect this deployment behind authentication.
                </span>
              </div>
              <Switch
                id="requiresAuth"
                checked={formState.requiresAuth}
                onChange={(event) =>
                  handleToggle("requiresAuth", event.target.checked)
                }
              />
            </div>

            <div className="app-toggle">
              <div className="grid gap-1">
                <Label htmlFor="includeRootDomain">Include root domain</Label>
                <span className="text-xs text-muted-foreground">
                  Serve traffic from the apex domain as well.
                </span>
              </div>
              <Switch
                id="includeRootDomain"
                checked={formState.includeRootDomain}
                onChange={(event) =>
                  handleToggle("includeRootDomain", event.target.checked)
                }
              />
            </div>

            <Button type="submit" className="w-full">
              Create deployment
            </Button>
          </form>
        </CardContent>
        <CardFooter className="app-footer">
          <div className="app-preview">
            <div className="app-preview-header">
              <span className="text-sm font-medium">Payload preview</span>
              {submitted && (
                <span className="text-xs text-emerald-600">
                  Ready to deploy
                </span>
              )}
            </div>
            <pre>{payloadPreview}</pre>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default App;

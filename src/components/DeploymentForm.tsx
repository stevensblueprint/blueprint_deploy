import { Github, GitFork, Info } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createDeployment, getApiErrorMessage } from "@/lib/api";

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

interface DeploymentFormProps {
  onSuccess: (executionId: string) => void;
}

export function DeploymentForm({ onSuccess }: DeploymentFormProps) {
  const [formState, setFormState] =
    useState<DeploymentFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (key: keyof DeploymentFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key: keyof DeploymentFormState, value: boolean) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await createDeployment({
        name: formState.name,
        subdomain: formState.subdomain,
        githubRepositoryName: formState.githubRepositoryName,
        githubBranchName: formState.githubBranchName,
        requiresAuth: formState.requiresAuth,
        includeRootDomain: formState.includeRootDomain,
      });
      const { pipelineExecutionId } = response.data;

      if (pipelineExecutionId) {
        onSuccess(pipelineExecutionId);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        return;
      }
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <form
          className="app-form"
          onSubmit={handleSubmit}
          aria-busy={isSubmitting}
        >
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="name">Application name</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="cursor-default">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>A unique name for your application.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="name"
              required
              autoFocus
              value={formState.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="inreach"
            />
          </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="subdomain">Subdomain</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="cursor-default">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>The subdomain where your app will be hosted. E.g., 'myapp' results in 'myapp.sitblueprint.com'.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="subdomain"
            required
            value={formState.subdomain}
            onChange={(event) => handleChange("subdomain", event.target.value)}
            placeholder="inreach"
          />
          {formState.subdomain && (
            <p className="text-sm text-muted-foreground">
              Preview: <span className="font-medium text-blue-600 underline">https://{formState.subdomain}.sitblueprint.com</span>
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="githubRepositoryName"
              className="flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              <span>GitHub repository</span>
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="cursor-default">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>The name of the repository in your GitHub account containing the application code.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="githubRepositoryName"
            required
            value={formState.githubRepositoryName}
            onChange={(event) =>
              handleChange("githubRepositoryName", event.target.value)
            }
            placeholder="inreach_repo"
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="githubBranchName" className="flex items-center gap-2">
              <GitFork className="h-4 w-4" />
              <span>GitHub branch</span>
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="cursor-default">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>The specific branch you want to deploy (e.g., 'main' or 'staging').</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="githubBranchName"
            required
            value={formState.githubBranchName}
            onChange={(event) =>
              handleChange("githubBranchName", event.target.value)
            }
            placeholder="main"
          />
        </div>

        <div className="app-toggle">
          <div className="grid gap-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="requiresAuth">Requires auth</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="cursor-default">
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Protect this deployment with authentication. Users will need to sign in to access the app.</p>
                </TooltipContent>
              </Tooltip>
            </div>
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
            <div className="flex items-center gap-2">
              <Label htmlFor="includeRootDomain">Include root domain</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="cursor-default">
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Serve traffic from the apex domain as well. Note: only one app can be assigned to the root domain.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <Switch
            id="includeRootDomain"
            checked={formState.includeRootDomain}
            onChange={(event) =>
              handleToggle("includeRootDomain", event.target.checked)
            }
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#0078E8] hover:bg-[#0058A9] text-white transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating deployment..." : "Create deployment"}
        </Button>
        {submitError && (
          <p className="text-sm text-red-600" role="alert">
            {submitError}
          </p>
        )}
      </form>
    </div>
  </TooltipProvider>
  );
}

# Technical Design Document (TDD)

> **Status: Draft – not approved.** This document describes the frontend as currently implemented, plus planned behavior. Statements marked _Unverified_, _Assumed_, _Unknown_ or _Planned_ have not been confirmed or built. For audit findings, see [CURRENT_STATE.md](./CURRENT_STATE.md).

## 1. Component Design

### 1.1 `DeploymentStatusView.tsx`

This component is responsible for polling the API to update the status of a specific deployment execution.

- **Input**: `executionId` (string).
- **Behavior**: Calls `getDeploymentStatus` 2 seconds after loading, then every 5 seconds until the pipeline reaches a final state (Succeeded, Failed or Canceled).
- **UI States**:
  - **Loading**: Initial fetch.
  - **Active**: Showing list of stages (Source, Build, Deploy) with current status icons.
  - **Terminal**: Shows the final status, and a link to the deployed site on success. _Planned:_ a button to return to the list. This is not implemented yet: `Home` passes an `onReset` prop, but the component doesn't use it.

### 1.2 `DeploymentForm.tsx`

A controlled form using React `useState` (verified in code; no form library is used). It has two modes: **create** (all fields) and **update** (subdomain only).

- **Validation**:
  - All visible fields are required (HTML `required`).
  - _Planned:_ GitHub repository, branch and subdomain must match patterns. This is not enforced in the client yet.
- **Submission**: Calls `createDeployment` (create mode) or `updateDeployment` (update mode), then triggers the `onSuccess` callback with the returned `pipelineExecutionId`.

## 2. API Interaction Pattern

The application follows a consistent pattern for API calls:

1. Define TypeScript interfaces for payload and response in `src/lib/api.ts`.
2. Use the `deployApi` axios instance.
3. Handle errors using the `getApiErrorMessage` helper to display user-friendly messages.

Example:

```typescript
const handleCreate = async (data: DeployRequest) => {
  try {
    const res = await createDeployment(data);
    // Success logic
  } catch (err) {
    const errorMsg = getApiErrorMessage(err);
    // Display error to user
  }
};
```

## 3. Navigation and State

The application uses **URL-driven state** for its main view transition.

- `/` -> Default view showing `DeploymentList`.
- `/?pipelineExecutionId=XYZ` -> Monitoring view for execution XYZ.
  This allows users to bookmark a deployment status page or share it with others.

## 4. Authentication Flow

- `main.tsx` configures Amplify with the Cognito settings, and `AuthProvider` tracks the session.
- `ProtectedRoute` checks if the user is authenticated.
- If not, it redirects to the login page (managed by Cognito).
- After login, the `/callback` route handles the session cleanup and redirects the user back to the dashboard.

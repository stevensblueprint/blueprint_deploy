# Technical Design Document (TDD)

## 1. Component Design

### 1.1 `DeploymentStatusView.tsx`

This component is responsible for polling the API to update the status of a specific deployment execution.

- **Input**: `executionId` (string).
- **Behavior**: Calls `getDeploymentStatus` every few seconds (polling logic).
- **UI States**:
  - **Loading**: Initial fetch.
  - **Active**: Showing list of stages (Source, Build, Deploy) with current status icons.
  - **Terminal**: Showing "Success" or "Failed" message with a button to return to the list.

### 1.2 `DeploymentForm.tsx`

A controlled form using standard React state or a library like `react-hook-form` (verify in code if needed).

- **Validation**:
  - Name and Subdomain are required.
  - GitHub repository and branch must match patterns.
- **Submission**: Calls `createDeployment` and triggers the `onSuccess` callback with the new `pipelineExecutionId`.

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

- The `AuthProvider` initializes the Amplify library.
- `ProtectedRoute` checks if the user is authenticated.
- If not, it redirects to the login page (managed by Cognito).
- After login, the `/callback` route handles the session cleanup and redirects the user back to the dashboard.

# Software Requirements Specification (SRS)

> **Status: Draft – not approved.** These requirements have not yet been approved by the Project Owner. Statements marked _Unverified_, _Assumed_, _Unknown_ or _Planned_ have not been confirmed or built. For audit findings, see [CURRENT_STATE.md](./CURRENT_STATE.md).

## 1. Introduction

### 1.1 Purpose

The purpose of the Blueprint Deploy dashboard is to provide a user-friendly interface for managing cloud deployment pipelines. It abstracts the complexity of CI/CD pipelines into a simple, task-oriented interface for developers and operations teams.

### 1.2 Scope

The application handles:

- Authentication through AWS Cognito (OAuth). _Unknown:_ which identity providers the user pool is configured with.
- Creation of new deployment requests (subdomains, repositories, branches).
- Listing and management of active deployments.
- Monitoring of deployment pipeline stages. This currently uses polling; real-time updates are _Planned_ (see the backlog).

## 2. Functional Requirements

### 2.1 User Authentication

- Users must be able to sign in using their corporate credentials.
- Protected routes must prevent unauthorized access to the dashboard.
- Authentication state should persist across sessions where appropriate.

### 2.2 Deployment Management

- **Create**: Users can specify deployment parameters:
  - Unique Name
  - Subdomain
  - GitHub Repository Name
  - Branch Name
  - Authentication Requirement toggle
  - Root Domain inclusion toggle
- **List**: Display existing deployments with their metadata.
- **Update**: Change the subdomain of an existing deployment. Other fields cannot be updated yet.
- **Delete**: Remove existing deployments.

### 2.3 Monitoring

- Display the status of a deployment execution (InProgress, Succeeded, Failed, Canceled).
- Show granular stage-by-stage progress of the underlying CI/CD pipeline.
- Provide direct links to the deployed environment once successful.

## 3. Non-Functional Requirements

### 3.1 Performance

- The UI should remain responsive while polling for deployment status.
- API timeouts should be handled gracefully (configured to 15s).

### 3.2 Security

- Secrets and API URLs must be managed via environment variables.
- Sensitive deployment actions must be protected by authentication.

### 3.3 Usability

- The interface should use a clean, modern design system (currently Tailwind CSS with shadcn/ui).
- Error messages from the API should be clearly communicated to the user.

# Product Requirements Document (PRD)

## 1. Target Audience
- Developers needing to spin up ephemeral environments.
- DevOps engineers monitoring deployment health.
- Product managers verifying features in specific branches.

## 2. User Stories

| ID | User Story | Priority |
|---|---|---|
| US1 | As a developer, I want to deploy a specific branch from GitHub so that I can test my changes in a live environment. | High |
| US2 | As a user, I want to see the progress of my deployment in real-time so that I know if something went wrong and where. | High |
| US3 | As an administrator, I want to see a list of all active deployments so that I can manage infrastructure costs. | Medium |
| US4 | As a developer, I want my deployment to have its own subdomain so that it's easily accessible and professional. | High |
| US5 | As a user, I want to delete a deployment when it's no longer needed to free up resources. | Medium |

## 3. Features & User Experience

### 3.1 Dashboard (Home)
- The home page serves as the control center.
- It displays a searchable list of deployments.
- A prominent "Create" button opens a modal for new requests.

### 3.2 Deployment Workflow
1. **Initiation**: User fills out the form in the modal.
2. **Execution**: On submission, the user is redirected to a status view (or the view is updated in place via URL params).
3. **Feedback**: The status view polls the backend and updates stage icons/text.
4. **Completion**: A direct link to the site appears once the "Deploy" stage succeeds.

### 3.3 Visual Identity
- Use the "Blueprint" branding (logo and color scheme).
- Clean, white background with professional typography.
- Mobile-responsive layout for monitoring on the go.

## 4. Success Metrics
- Reduction in time taken to provision a new environment.
- Increased visibility into deployment failures.
- Ease of decommissioning unused environments.

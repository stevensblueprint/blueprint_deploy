# Blueprint Deploy: Project Context

This project is a React-based deployment orchestration dashboard. It allows users to manage and monitor cloud-based environments through a centralized UI.

## Architecture Overview

- **Frontend**: React 19 with Vite and TypeScript.
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS).
- **Authentication**: AWS Amplify (Cognito) integration via `AuthContext`.
- **API**: Axios-based client for interacting with a deployment backend.
- **CI/CD**: GitHub Actions for building and deploying static assets to AWS (S3 + CloudFront).

## Key Files & Directories

- `src/lib/api.ts`: API client definitions and types for deployments.
- `src/contexts/AuthContext.tsx`: Authentication logic and state management.
- `src/pages/Home.tsx`: Main dashboard orchestrating the list, create, and status views.
- `src/components/DeploymentForm.tsx`: Form for capturing deployment parameters.
- `src/components/DeploymentStatusView.tsx`: Real-time (polling) view of deployment pipeline stages.

## Project Conventions

- **State Management**: React Context for global state (Auth), local state for UI transitions.
- **Styling**: Tailwind CSS with utility-first approach.
- **Routing**: React Router 7 for navigation and URL-based state (execution IDs).
- **Types**: Strict TypeScript usage for API payloads and responses.

## Development Setup

1. Install dependencies: `npm install`
2. Configure `.env` with `VITE_API_BASE_URL` and AWS Amplify credentials.
3. Start development server: `npm run dev`

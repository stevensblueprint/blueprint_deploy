<picture>
  <source
    media="(prefers-color-scheme: dark)"
    srcset="https://sitblueprint.com/assets/logos/logo_banner_negative.webp"
  />
  <img
    alt="Blueprint"
    src="https://sitblueprint.com/assets/logos/logo_banner.webp"
  />
</picture>

# Blueprint Deploy Dashboard

The Blueprint Deploy Dashboard is a centralized interface for managing cloud-native environment deployments. It allows teams to orchestrate pipelines, monitor environment health, and manage ephemeral infrastructure with ease.

## Project Status

> **Status: In discovery (Sprint 1).** This repository contains the React frontend only. It builds and implements the core deployment workflow, but it is still being audited, and its connection to the live AWS environment and backend has not been verified yet.
>
> See [`docs/CURRENT_STATE.md`](./docs/CURRENT_STATE.md) for verified facts, unknowns, known limitations, security gaps and open technical decisions.

## Core Features

These are implemented in the frontend. For gaps, such as the missing logout button and the lack of tests, see [Current State §2](./docs/CURRENT_STATE.md#2-existing-code--implemented-features).

- 🔐 **Authentication**: Sign-in through AWS Cognito (Hosted UI) via AWS Amplify.
- 🚀 **Deployments**: Deploy a specific GitHub branch to a subdomain of `sitblueprint.com`.
- 📊 **Pipeline Monitoring**: Stage-by-stage status (Source, Build, Deploy), refreshed by polling every 5 seconds.
- 📋 **Deployment Management**: List deployments, change a deployment's subdomain, and delete deployments.
- 🔗 **Deep Linking**: Status pages have shareable URLs (`/?pipelineExecutionId=…`).

## Documentation

Detailed documentation is available in the `docs/` directory:

- [Current State (audit findings)](./docs/CURRENT_STATE.md)
- [Software Requirements Specification (SRS)](./docs/software-requirements-specification.md)
- [Product Requirements Document (PRD)](./docs/product-requirements-document.md)
- [Architecture Design Document (ADD)](./docs/architecture-design-document.md)
- [Technical Design Document (TDD)](./docs/technical-design-document.md)
- [Product Backlog](./docs/backlog.md)

> **Note:** The design documents above (SRS, PRD, ADD, TDD) are **drafts** and have not been approved. Statements that have not been verified are labeled _Unverified_, _Assumed_, _Unknown_ or _Planned_.

## Getting Started

### Prerequisites

- Node.js 22 (the version the Build workflow uses)
- Access to the Blueprint backend API. _Unknown:_ where the backend repository lives (see [Current State §1](./docs/CURRENT_STATE.md#1-repository--branch-locations)).
- Cognito user pool details for the `.env.local` file below
- AWS credentials are **not** needed locally. Deploys run in GitHub Actions through OIDC.

### Local Development

1. **Clone and Install**:

   ```bash
   npm install
   ```

2. **Configure Environment**:
   Create a `.env.local` file with the following. These are the variable names the code reads.

   ```env
   VITE_API_BASE_URL=https://api.your-domain.com
   VITE_COGNITO_USER_POOL_ID=your-pool-id
   VITE_COGNITO_USER_POOL_CLIENT_ID=your-client-id
   VITE_COGNITO_AUTH_DOMAIN=your-cognito-domain
   VITE_COGNITO_REDIRECT_SIGN_IN=http://localhost:5173/callback
   VITE_COGNITO_REDIRECT_SIGN_OUT=http://localhost:5173/
   ```

   The localhost redirect URLs must also be registered as callback and sign-out URLs on the Cognito app client.

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```

## GitHub Workflows

This project includes two primary workflows:

- **Build (`build.yml`)**: Continuous integration ensuring code quality (lint, format, build).
- **Deploy (`deploy.yml`)**: Continuous deployment to AWS (S3 + CloudFront) on every push to `main`.

Note: the two workflows currently run independently, so a commit that fails the Build workflow still deploys. See [Current State §4](./docs/CURRENT_STATE.md#4-known-operational-limitations).

## Scripts

- `npm run dev`: Start Vite dev server.
- `npm run build`: Production build and type checking.
- `npm run lint`: Run ESLint.
- `npm run format:check`: Verify code formatting.
- `npm run format:fix`: Apply Prettier formatting.
- `npm run preview`: Serve the production build locally.

There is no test script yet.

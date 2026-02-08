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

## Core Features

- 🔐 **Secure Authentication**: Integrated with AWS Cognito via AWS Amplify.
- 🚀 **One-Click Deployments**: Easily deploy specific GitHub branches to custom subdomains.
- 📊 **Real-Time Monitoring**: Granular visibility into CI/CD pipeline stages (Source, Build, Deploy).
- 📋 **Deployment Management**: List and decommission environments from a single view.
- 🔗 **Deep Linking**: URL-based execution tracking for easy sharing and bookmarking.

## Documentation

Detailed documentation is available in the `docs/` directory:

- [Software Requirements Specification (SRS)](./docs/software-requirements-specification.md)
- [Product Requirements Document (PRD)](./docs/product-requirements-document.md)
- [Architecture Design Document (ADD)](./docs/architecture-design-document.md)
- [Technical Design Document (TDD)](./docs/technical-design-document.md)
- [Product Backlog](./docs/backlog.md)

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- Access to the Blueprint Backend API
- AWS Credentials (for deployment workflows)

### Local Development

1. **Clone and Install**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Create a `.env.local` file with the following:
   ```env
   VITE_API_BASE_URL=https://api.your-domain.com
   VITE_AWS_REGION=your-region
   VITE_USER_POOL_ID=your-pool-id
   VITE_USER_POOL_CLIENT_ID=your-client-id
   ```

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```

## GitHub Workflows

This project includes two primary workflows:

- **Build (`build.yml`)**: Continuous integration ensuring code quality (lint, format, build).
- **Deploy (`deploy.yml`)**: Continuous deployment to AWS (S3 + CloudFront).

## Scripts

- `npm run dev`: Start Vite dev server.
- `npm run build`: Production build and type checking.
- `npm run lint`: Run ESLint.
- `npm run format:check`: Verify code formatting.
- `npm run format:fix`: Apply Prettier formatting.

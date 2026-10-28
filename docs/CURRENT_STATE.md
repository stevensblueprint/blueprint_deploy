# Blueprint Deploy: Current State

This document records the current state of the `blueprint_deploy` repository, based on a review of the code, configuration, git history and tooling. It covers:

1. Repository and branch locations
2. Existing code and implemented features
3. Existing environments and verified AWS resources
4. Known operational limitations
5. Development setup status
6. Security gaps
7. Pending technical decisions
8. Reuse recommendation

**Last verified:** 2026-10-28, against commit `bbbf5de` on `main`.

## Summary: Verified Facts vs Unknowns

**Verified** (checked directly in the repository or by running the tooling):

- The repository location, the single `main` branch and the commit history (§1)
- The languages, frameworks and implemented features, which were read from the source code (§2)
- The CI/CD workflow configuration and the GitHub secrets it expects (§3)
- `npm ci`, `npm run lint`, `npm run build` and `npm run format:check` all pass. There are no tests (§5).
- The `npm audit` results from 2026-10-28 (§6)

**Unknown** (not checked yet, and needs someone with access):

- Whether the AWS resources referenced in the repo exist and match (§3). The AWS CLI and credentials were not available.
- Where the backend API, the deployment CodePipeline and their infrastructure code live, and how the API authenticates requests
- GitHub settings: branch protection, Dependabot, secret scanning, and whether the Actions secrets are set
- Whether the dashboard works end to end against the real backend
- Which identity providers the Cognito user pool is configured with
- Whether the layout works on mobile

## 1) Repository & Branch Locations

| Item           | Value                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| Remote         | `https://github.com/stevensblueprint/blueprint_deploy.git` (GitHub org `stevensblueprint`)                         |
| Branches       | `main` only, both locally and on `origin`. No feature, staging or release branches exist.                          |
| Default branch | `main` (`origin/HEAD -> origin/main`)                                                                              |
| History        | 41 commits, from 2026-02-07 to 2026-03-04. All were authored by one contributor (`miguel-merlin` / Miguel Merlin). |

- This repository contains **only the React frontend**. The backend API, the CodePipeline that builds user deployments, and any infrastructure-as-code (CDK/Terraform) live somewhere else. That location is not referenced anywhere in this repo.
- Branch protection rules and GitHub security settings could not be checked from the CLI because `gh` is not authenticated. Someone with org access needs to confirm them in GitHub.

## 2) Existing Code & Implemented Features

**Stack:** React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, shadcn/ui (Radix, "new-york" style), React Router 7, Axios, and AWS Amplify v6 (Cognito). The app is a single-page app of about 20 source files under `src/`.

| Feature                                                                                | Status                                                                                                                                                               | Where                                                                       |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Cognito login via Hosted UI (OAuth code flow)                                          | Implemented                                                                                                                                                          | `src/main.tsx`, `src/contexts/AuthContext.tsx`                              |
| Protected routes that redirect to login and then back to the original URL              | Implemented                                                                                                                                                          | `src/components/ProtectedRoute.tsx`, `/callback` route in `src/App.tsx`     |
| List active deployments (name, URL, repo, branch, auth flag)                           | Implemented                                                                                                                                                          | `src/components/DeploymentList.tsx` → `GET /deployments`                    |
| Create deployment (name, subdomain, repo, branch, `requiresAuth`, `includeRootDomain`) | Implemented                                                                                                                                                          | `src/components/DeploymentForm.tsx` → `POST /deploy`                        |
| Update deployment (changing the **subdomain** is the only option)                      | Implemented                                                                                                                                                          | `DeploymentForm` in update mode → `PUT /deployment/{name}`                  |
| Delete deployment, with a confirmation dialog                                          | Implemented                                                                                                                                                          | `DeploymentList` → `DELETE /deployment` (JSON body)                         |
| Pipeline status view with Source, Build and Deploy stages                              | Implemented. Starts 2 s after load, then polls every 5 s until the run succeeds, fails or is canceled.                                                               | `src/components/DeploymentStatusView.tsx` → `GET /deployment/{executionId}` |
| Shareable status URL (`/?pipelineExecutionId=…`)                                       | Implemented                                                                                                                                                          | `src/pages/Home.tsx`                                                        |
| Direct link to the execution in the AWS CodePipeline console                           | Implemented, but the account and pipeline are hardcoded (see §3)                                                                                                     | `DeploymentStatusView.tsx`                                                  |
| Logout                                                                                 | **Coded but not reachable.** `AuthContext` provides `logout()`, but no button or menu calls it. `Navbar` shows only the logo.                                        | `src/components/Navbar.tsx`                                                 |
| "Back to list" from the status view                                                    | **Missing.** `Home` passes an `onReset` prop to `DeploymentStatusView`, but the component never uses it. Users have to use the browser Back button or the logo link. | `DeploymentStatusView.tsx`                                                  |
| Automated tests                                                                        | **None.** There is no test framework, no test files, and no `test` script.                                                                                           | —                                                                           |

Planned but not started: see `docs/backlog.md`. It includes WebSocket/AppSync status updates, search and filtering, error logs in the UI, templates, quotas, dark mode, team sharing, webhooks and custom domains.

## 3) Existing Environments & Verified AWS Resources

> The AWS CLI is not installed in this environment, and no AWS credentials were available. **None of the resources below have been checked against the live AWS account.** They are what the repository references. A team member with AWS access needs to confirm each one.

**Environments:** There is a single environment, production. It is deployed from `main` on every push. The repo has no staging or preview environment for the dashboard itself.

| Resource                                                | What the repo shows                                                                                                                   | Verified in AWS? |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| AWS account                                             | `904233098281`. It is hardcoded in the CodePipeline console link. The deploy workflow also reads it from the `AWS_ACCOUNT_ID` secret. | No               |
| Region                                                  | `us-east-1` is hardcoded in the console link. The workflow reads it from the `AWS_REGION` / `VITE_AWS_REGION` secrets.                | No               |
| CodePipeline                                            | `blueprint-deployments-pipeline`, with stages Source, Build and Deploy. It builds the user deployments.                               | No               |
| IAM role (GitHub OIDC)                                  | `arn:aws:iam::<account>:role/github-deployer-blueprint_deploy`                                                                        | No               |
| S3 bucket (dashboard static site)                       | Name stored in the `S3_BUCKET` secret                                                                                                 | No               |
| CloudFront distribution (dashboard)                     | ID stored in the `DISTRIBUTION_ID` secret                                                                                             | No               |
| Cognito user pool, app client and Hosted UI domain      | Values stored in the `VITE_COGNITO_*` secrets                                                                                         | No               |
| Backend API (presumed API Gateway + Lambda per the ADD) | URL stored in the `VITE_API_BASE_URL` secret                                                                                          | No               |
| Deployed apps domain                                    | `*.sitblueprint.com` (hardcoded in the UI)                                                                                            | No               |

GitHub Actions secrets the deploy workflow expects: `AWS_ACCOUNT_ID`, `AWS_REGION`, `S3_BUCKET`, `DISTRIBUTION_ID`, `VITE_AWS_REGION`, `VITE_API_BASE_URL`, `VITE_COGNITO_AUTH_DOMAIN`, `VITE_COGNITO_REDIRECT_SIGN_IN`, `VITE_COGNITO_REDIRECT_SIGN_OUT`, `VITE_COGNITO_USER_POOL_CLIENT_ID`, `VITE_COGNITO_USER_POOL_ID`. Whether these are set could not be checked.

## 4) Known Operational Limitations

The earlier statement that there are "no current issues" is not accurate. The review found these:

- **Deploys are not gated on CI.** `build.yml` (lint, format, build) and `deploy.yml` both trigger independently on pushes to `main`. A commit that fails lint or Prettier still deploys to production.
- **CI Node versions differ.** `build.yml` uses Node 22 and `deploy.yml` uses Node 20. `build.yml` also uses the older `actions/checkout@v3` and `actions/setup-node@v3`.
- **Hardcoded values.** The AWS account ID, region, pipeline name, `sitblueprint.com` domain and the `stevensblueprint` GitHub org are hardcoded in components. Moving to another account, pipeline or domain therefore needs code changes.
- **The CodePipeline console link probably only works for one person.** The link in `DeploymentStatusView.tsx` uses a session-specific console address (`904233098281-tm3revhu.us-east-1.console.aws.amazon.com`), which was likely copied from one person's browser. Other team members will probably get an error or a sign-in prompt. The standard address (`us-east-1.console.aws.amazon.com/...`) works for anyone signed in to the account.
- **The logout fallback is broken.** If `signOut()` fails, `AuthContext` builds the logout URL from `VITE_COGNITO_DOMAIN`. Nothing defines that variable: the workflow and `main.tsx` use `VITE_COGNITO_AUTH_DOMAIN`.
- **The README's environment variables are wrong.** It lists `VITE_USER_POOL_ID`, `VITE_USER_POOL_CLIENT_ID` and `VITE_AWS_REGION`. The code reads `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_USER_POOL_CLIENT_ID`, `VITE_COGNITO_AUTH_DOMAIN`, `VITE_COGNITO_REDIRECT_SIGN_IN` and `VITE_COGNITO_REDIRECT_SIGN_OUT`, and never reads `VITE_AWS_REGION`. A new developer who follows the README will not be able to log in.
- **Status uses polling.** The status view polls every 5 seconds and has no backoff or maximum retry count. It keeps polling through errors until the run ends or the user leaves the page.
- **Deployment list limits.** The list has no pagination, search or filtering, and it reloads only on page load or after a delete.
- **Little form validation.** The form only checks that fields are filled in. The TDD says repository and branch values must match patterns, but this is not checked in the client. Subdomains are not format-checked either.
- **Update only changes the subdomain.** Changing the branch, repository or auth settings means deleting the deployment and creating it again.
- **No tests**, so every change has to be checked by hand.
- **The docs differ from the code.** The TDD describes a "return to list" button on terminal states, which does not exist.

## 5) Development Setup Status

These were checked on 2026-10-28 with Node v22.23.3 and npm 10.9.9 (WSL2):

| Step                                     | Result                                                                                                                                                     |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`                                 | ✅ Installs cleanly from `package-lock.json`                                                                                                               |
| `npm run lint`                           | ✅ Passes with no errors                                                                                                                                   |
| `npm run build` (`tsc -b && vite build`) | ✅ Passes. JS bundle is about 462 kB (152 kB gzipped).                                                                                                     |
| `npm run format:check`                   | ⚠️ Fails, but only on `docs/CURRENT_STATE.md`. This file must be run through `npm run format:fix` before it is committed, or the Build workflow will fail. |
| `npm run dev` against a real backend     | ❌ Not verified. There is no `.env.local`, and no API or Cognito values were available.                                                                    |
| Tests                                    | ❌ No test setup exists                                                                                                                                    |

Gaps in the setup:

- The repo has no `.env.example`, and the README's variable list is wrong (see §4). The correct `.env.local` is:

  ```env
  VITE_API_BASE_URL=
  VITE_COGNITO_USER_POOL_ID=
  VITE_COGNITO_USER_POOL_CLIENT_ID=
  VITE_COGNITO_AUTH_DOMAIN=
  VITE_COGNITO_REDIRECT_SIGN_IN=http://localhost:5173/callback
  VITE_COGNITO_REDIRECT_SIGN_OUT=http://localhost:5173/
  ```

  The localhost redirect URLs also need to be registered on the Cognito app client.

- There is no local mock of the backend API, so the UI cannot be exercised without the deployed backend.
- `package.json` still has the template name `vite-react-template`.
- There is no `.nvmrc` or `engines` field to pin the Node version.

## 6) Security Gaps

- **No authorization or roles.** Every authenticated Cognito user can create, update and delete every deployment. There are no admin or member roles and no ownership checks in the UI. This is related to the open question below about who should have access.
- **No security policy.** We need to agree with the Project Owner which users on a project team can access sensitive project data and this project itself. The repo has no `SECURITY.md`, `CODEOWNERS` or `LICENSE`.
- **No automated scanning is configured in the repo.** There is no `.github/dependabot.yml` and no CodeQL or code-scanning workflow. Whether Dependabot alerts and secret scanning are enabled at the org or repo level could not be checked (`gh` is not authenticated). They need to be confirmed in GitHub Settings → Code security.
- **Infrastructure details are exposed.** The AWS account ID and pipeline name are hardcoded in the client bundle, and in the repo if it is public. That alone is low risk, but it should be moved to configuration.
- **Auth details are written to the console.** `AuthContext` logs auth errors and "Starting logout..." with `console.*` in production builds.
- **Workflow hygiene.** Deploys use GitHub OIDC with no long-lived AWS keys, which is good. The IAM role's trust policy should be checked to make sure it only allows `repo:stevensblueprint/blueprint_deploy:ref:refs/heads/main`.

### Dependency vulnerabilities (`npm audit`)

`npm audit` was re-run on 2026-10-28. It now reports **40** vulnerabilities, up from **39** in the initial report. The new one is a **Low** advisory in `deepmerge` ([GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)). It comes in through `shadcn`, and fixing it requires a breaking `shadcn` upgrade (`npm audit fix --force`).

| Severity  | Initial report | Re-run 2026-10-28 | Production deps only (`--omit=dev`) |
| --------- | -------------- | ----------------- | ----------------------------------- |
| Low       | 2              | 3                 | 1                                   |
| Moderate  | 8              | 8                 | 3                                   |
| High      | 27             | 27                | 12                                  |
| Critical  | 2              | 2                 | 1                                   |
| **Total** | **39**         | **40**            | **17**                              |

17 of the 40 are in packages that ship in the production bundle. These are the ones to fix first. The Critical one is `fast-xml-parser` (pulled in by the AWS SDK via Amplify), and the High ones include `axios`, `react-router`/`react-router-dom`, `lodash`, `js-cookie` and `form-data`. The other 23 are in dev or build tooling only (`vite`, `rollup`, `hono`, `@modelcontextprotocol/sdk` via `shadcn`, and so on). They do not ship to users, but they still affect developer machines and CI. Apart from the `shadcn`/`zod`/`deepmerge` chain, all of them can be fixed with a plain `npm audit fix`.

> Note: `npm audit` counts 37 directly vulnerable packages plus 3 packages flagged only because they depend on one (`@aws-sdk/xml-builder`, `react-router-dom`, `shadcn`). Those dependents are listed under the package they depend on. `@aws-sdk/xml-builder` is listed under `fast-xml-parser` (Critical) but counts toward Moderate. `react-router-dom` and `shadcn` count toward High.

#### 1) Low — 3 vulnerabilities

##### `deepmerge` `>=4.2.0 <=4.3.1`

- deepmerge mergeObject() allows prototype poisoning of returned objects — [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)

**Fix:** Fix available via `npm audit fix --force` (installs a breaking `shadcn` version)  
**Path(s):** `node_modules/deepmerge`

##### `@babel/core` `<=7.29.0`

- @babel/core: Arbitrary File Read via sourceMappingURL Comment — [GHSA-4x5r-pxfx-6jf8](https://github.com/advisories/GHSA-4x5r-pxfx-6jf8)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/@babel/core`

##### `esbuild` `0.27.3 - 0.28.0`

- esbuild allows arbitrary file read when running the development server on Windows — [GHSA-g7r4-m6w7-qqqr](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/esbuild`

---

#### 2) Moderate — 8 vulnerabilities

##### `@humanfs/node` `<0.16.8`

- humanfs: Recursive copy follows symlinked files and copies data from outside the source tree — [GHSA-p498-v437-472g](https://github.com/advisories/GHSA-p498-v437-472g)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/@humanfs/node`

##### `ajv` `<6.14.0 || >=7.0.0-alpha.0 <8.18.0`

- ajv has ReDoS when using `$data` option — [GHSA-2g4f-4pwh-qvx6](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/@modelcontextprotocol/sdk/node_modules/ajv`, `node_modules/ajv`, `node_modules/ajv-formats/node_modules/ajv`

##### `baseline-browser-mapping` `>=2.0.0 <2.11.0`

- baseline-browser-mapping process termination on invalid input causes denial of service — [GHSA-w5vr-8v7q-w6rv](https://github.com/advisories/GHSA-w5vr-8v7q-w6rv)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/baseline-browser-mapping`

##### `follow-redirects` `<=1.15.11`

- follow-redirects leaks Custom Authentication Headers to Cross-Domain Redirect Targets — [GHSA-r4q5-vmmm-2653](https://github.com/advisories/GHSA-r4q5-vmmm-2653)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/follow-redirects`

##### `postcss-selector-parser` `<=7.1.5`

- postcss-selector-parser allows denial of service through uncontrolled AST recursion — [GHSA-w9m9-85wc-3x92](https://github.com/advisories/GHSA-w9m9-85wc-3x92)
- PostCSS: Quadratic complexity in flat selector parsing allows CPU exhaustion — [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/postcss-selector-parser`

##### `qs` `2.2.5 - 6.15.3`

- qs's arrayLimit bypass in comma parsing allows denial of service — [GHSA-w7fw-mjwx-w883](https://github.com/advisories/GHSA-w7fw-mjwx-w883)
- qs has a remotely triggerable DoS: qs.stringify crashes with TypeError on null/undefined entries in comma-format arrays when encodeValuesOnly is set — [GHSA-q8mj-m7cp-5q26](https://github.com/advisories/GHSA-q8mj-m7cp-5q26)
- qs: Denial of Service via Attacker Controlled isBuffer — [GHSA-4mjr-xmp4-gh2g](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/qs`

##### `uuid` `<11.1.1`

- uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided — [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/uuid`

---

#### 3) High — 27 vulnerabilities

##### `@hono/node-server` `<=1.19.14`

- @hono/node-server has authorization bypass for protected static paths via encoded slashes in Serve Static Middleware — [GHSA-wc8c-qw6v-h7f6](https://github.com/advisories/GHSA-wc8c-qw6v-h7f6)
- @hono/node-server: Middleware bypass via repeated slashes in serveStatic — [GHSA-92pp-h63x-v22m](https://github.com/advisories/GHSA-92pp-h63x-v22m)
- Node.js Adapter for Hono: Path traversal in `serve-static` on Windows via encoded backslash (`%5C`) — [GHSA-frvp-7c67-39w9](https://github.com/advisories/GHSA-frvp-7c67-39w9)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/@hono/node-server`

##### `@modelcontextprotocol/sdk` `<=1.31.0`

- MCP TypeScript SDK: OAuth client could send credentials to an authorization server chosen by the MCP server — [GHSA-6qxp-vccf-f47h](https://github.com/advisories/GHSA-6qxp-vccf-f47h)
- MCP TypeScript SDK: Experimental tasks were not tied to the session that created them — [GHSA-22jm-h49p-29qw](https://github.com/advisories/GHSA-22jm-h49p-29qw)
- MCP TypeScript client SDK: HTTP client transports and OAuth requests followed cross-origin redirects and re-sent custom headers and request bodies — [GHSA-6prh-2h8m-c8cw](https://github.com/advisories/GHSA-6prh-2h8m-c8cw)
- MCP TypeScript SDK: One HTTP request within the default size limit could exhaust server memory during validation — [GHSA-46jr-4wx8-v453](https://github.com/advisories/GHSA-46jr-4wx8-v453)
- MCP TypeScript SDK: Server bearer authentication accepted tokens issued for another service — [GHSA-rvq5-wwqv-78pq](https://github.com/advisories/GHSA-rvq5-wwqv-78pq)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/@modelcontextprotocol/sdk`

##### `axios` `1.0.0 - 1.19.0`

- Axios has a NO_PROXY Hostname Normalization Bypass that Leads to SSRF — [GHSA-3p68-rc4w-qgx5](https://github.com/advisories/GHSA-3p68-rc4w-qgx5)
- Axios: Authentication Bypass via Prototype Pollution Gadget in `validateStatus` Merge Strategy — [GHSA-w9j2-pvgh-6h63](https://github.com/advisories/GHSA-w9j2-pvgh-6h63)
- Axios: Incomplete Fix for CVE-2025-62718 — NO_PROXY Protection Bypassed via RFC 1122 Loopback Subnet (127.0.0.0/8) in Axios 1.15.0 — [GHSA-pmwg-cvhr-8vh7](https://github.com/advisories/GHSA-pmwg-cvhr-8vh7)
- Axios: Invisible JSON Response Tampering via Prototype Pollution Gadget in `parseReviver` — [GHSA-3w6x-2g7m-8v23](https://github.com/advisories/GHSA-3w6x-2g7m-8v23)
- Axios: Null Byte Injection via Reverse-Encoding in AxiosURLSearchParams — [GHSA-xhjh-pmcv-23jw](https://github.com/advisories/GHSA-xhjh-pmcv-23jw)
- Axios: CRLF Injection in multipart/form-data body via unsanitized blob.type in formDataToStream — [GHSA-445q-vr5w-6q77](https://github.com/advisories/GHSA-445q-vr5w-6q77)
- Axios: no_proxy bypass via IP alias allows SSRF — [GHSA-m7pr-hjqh-92cm](https://github.com/advisories/GHSA-m7pr-hjqh-92cm)
- Axios' HTTP adapter-streamed uploads bypass maxBodyLength when maxRedirects: 0 — [GHSA-5c9x-8gcm-mpgx](https://github.com/advisories/GHSA-5c9x-8gcm-mpgx)
- Axios: HTTP adapter streamed responses bypass maxContentLength — [GHSA-vf2m-468p-8v99](https://github.com/advisories/GHSA-vf2m-468p-8v99)
- Axios: Prototype Pollution Gadgets - Response Tampering, Data Exfiltration, and Request Hijacking — [GHSA-pf86-5x62-jrwf](https://github.com/advisories/GHSA-pf86-5x62-jrwf)
- Axios: Header Injection via Prototype Pollution — [GHSA-6chq-wfr3-2hj9](https://github.com/advisories/GHSA-6chq-wfr3-2hj9)
- Axios: XSRF Token Cross-Origin Leakage via Prototype Pollution Gadget in `withXSRFToken` Boolean Coercion — [GHSA-xx6v-rp6x-q39c](https://github.com/advisories/GHSA-xx6v-rp6x-q39c)
- Axios is Vulnerable to Denial of Service via \_\_proto\_\_ Key in mergeConfig — [GHSA-43fc-jf86-j433](https://github.com/advisories/GHSA-43fc-jf86-j433)
- Axios has prototype pollution read-side gadgets in HTTP adapter that allow credential injection and request hijacking — [GHSA-q8qp-cvcw-x6jj](https://github.com/advisories/GHSA-q8qp-cvcw-x6jj)
- Axios has Unrestricted Cloud Metadata Exfiltration via Header Injection Chain — [GHSA-fvcv-3m26-pcqx](https://github.com/advisories/GHSA-fvcv-3m26-pcqx)
- Axios: unbounded recursion in toFormData causes DoS via deeply nested request data — [GHSA-62hf-57xw-28j9](https://github.com/advisories/GHSA-62hf-57xw-28j9)
- Axios: Regular Expression Denial of Service (ReDoS) via Cookie Name Injection — [GHSA-hfxv-24rg-xrqf](https://github.com/advisories/GHSA-hfxv-24rg-xrqf)
- Allocation of Resources Without Limits or Throttling in Axios — [GHSA-777c-7fjr-54vf](https://github.com/advisories/GHSA-777c-7fjr-54vf)
- Axios: Proxy-Authorization Credential Leak to Origin Server Across HTTP-to-HTTPS Redirect in Axios Node.js HTTP Adapter — [GHSA-p92q-9vqr-4j8v](https://github.com/advisories/GHSA-p92q-9vqr-4j8v)
- Axios: Proxy-Authorization header leaks to redirect target when proxy is re-evaluated to direct connection — [GHSA-j5f8-grm9-p9fc](https://github.com/advisories/GHSA-j5f8-grm9-p9fc)
- axios Vulnerable to Credential Theft and Response Hijacking via Prototype Pollution Gadget in Config Merge — [GHSA-3g43-6gmg-66jw](https://github.com/advisories/GHSA-3g43-6gmg-66jw)
- axios Vulnerable to Full Man-in-the-Middle via Prototype Pollution Gadget in `config.proxy` — [GHSA-35jp-ww65-95wh](https://github.com/advisories/GHSA-35jp-ww65-95wh)
- axios has DoS & Header Injection via Prototype Pollution Read-Side Gadgets in axios merge functions — [GHSA-898c-q2cr-xwhg](https://github.com/advisories/GHSA-898c-q2cr-xwhg)
- Axios: Prototype pollution gadgets can alter axios request construction — [GHSA-mmx7-hfxf-jppx](https://github.com/advisories/GHSA-mmx7-hfxf-jppx)
- Axios: Deep formToJSON Key Recursion Can Cause Denial of Service — [GHSA-pmv8-rq9r-6j72](https://github.com/advisories/GHSA-pmv8-rq9r-6j72)
- Axios: HTTP/2 streamed uploads bypass `maxBodyLength` — [GHSA-mwf2-3pr3-8698](https://github.com/advisories/GHSA-mwf2-3pr3-8698)
- Axios: Nested axios option objects can consume polluted prototype values — [GHSA-7q8q-rj6j-mhjq](https://github.com/advisories/GHSA-7q8q-rj6j-mhjq)
- Axios: Fetch adapter `ReadableStream` uploads bypass `maxBodyLength` — [GHSA-jqh4-m9w3-8hp9](https://github.com/advisories/GHSA-jqh4-m9w3-8hp9)
- Axios: Excessive recursion in formDataToJSON can cause denial of service — [GHSA-42h9-826w-cgv3](https://github.com/advisories/GHSA-42h9-826w-cgv3)
- Axios: Prototype pollution gadget in fetch adapter can alter outbound requests — [GHSA-vh66-26gq-q6x8](https://github.com/advisories/GHSA-vh66-26gq-q6x8)
- Axios: Prototype-Pollution Gadget in the Default Instance Allows Inherited Object.prototype.method to Override HTTP Method — [GHSA-9fr6-4gfg-395g](https://github.com/advisories/GHSA-9fr6-4gfg-395g)
- Axios: HTTP/2 adapter bypasses configured DNS lookup and proxy controls — [GHSA-3pq3-5fj3-cg6v](https://github.com/advisories/GHSA-3pq3-5fj3-cg6v)
- Axios: Denial of Service via Unhandled 'error' Event in HTTP/2 ClientHttp2Session Initialization — [GHSA-542g-h47m-68v8](https://github.com/advisories/GHSA-542g-h47m-68v8)
- Axios: Header Injection via Inherited headers After Minimal Interceptor — [GHSA-j8rh-479h-cp32](https://github.com/advisories/GHSA-j8rh-479h-cp32)
- Axios: Fetch Adapter Header Injection via Inherited FormData getHeaders — [GHSA-4hqw-qxg8-jxx2](https://github.com/advisories/GHSA-4hqw-qxg8-jxx2)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/axios`

##### `body-parser` `2.0.0 - 2.3.0`

- body-parser vulnerable to denial of service when invalid limit value silently disables size enforcement — [GHSA-v422-hmwv-36x6](https://github.com/advisories/GHSA-v422-hmwv-36x6)
- body-parser vulnerable to Denial of Service via trailing bytes after a compressed request body — [GHSA-27r3-jxmh-p828](https://github.com/advisories/GHSA-27r3-jxmh-p828)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/body-parser`

##### `brace-expansion` `<=1.1.20 || 2.0.0 - 2.1.6`

- brace-expansion: Zero-step sequence causes process hang and memory exhaustion — [GHSA-f886-m6hf-6m8v](https://github.com/advisories/GHSA-f886-m6hf-6m8v)
- brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups — [GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp)
- brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash — [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg)
- brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation — [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895)
- brace-expansion: Quadratic-time expansion of the `{a},b}` rewrite causes CPU denial of service — [GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr)
- brace-expansion: DoS via uncontrolled recursion on nested brace groups causing stack exhaustion — [GHSA-qhr7-859c-m2p7](https://github.com/advisories/GHSA-qhr7-859c-m2p7)
- brace-expansion: DoS via uncontrolled recursion in parseCommaParts causing stack exhaustion — [GHSA-6j4f-fj2g-mc7p](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion`, `node_modules/brace-expansion`

##### `browserslist` `<=4.28.6`

- Browserslist: Unbounded memory growth (no cache eviction) via distinct query results, leading to eventual OOM — [GHSA-c83g-rgw3-j3cx](https://github.com/advisories/GHSA-c83g-rgw3-j3cx)
- Browserslist: Uncaught crash / prototype write via untrusted browserslist-stats.json custom stats (normalizeStats) — [GHSA-73wf-gq98-2v4g](https://github.com/advisories/GHSA-73wf-gq98-2v4g)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/browserslist`

##### `express-rate-limit` `8.0.1 - 8.5.0`

- express-rate-limit: IPv4-mapped IPv6 addresses bypass per-client rate limiting on servers with dual-stack network — [GHSA-46wh-pxpv-q5gq](https://github.com/advisories/GHSA-46wh-pxpv-q5gq)
- Depends on vulnerable versions of ip-address

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/express-rate-limit`

##### `fast-uri` `3.0.0 - 3.1.8`

- fast-uri vulnerable to host confusion via literal backslash authority delimiter — [GHSA-v2hh-gcrm-f6hx](https://github.com/advisories/GHSA-v2hh-gcrm-f6hx)
- fast-uri vulnerable to host confusion via backslash authority introducer — [GHSA-7p8r-x3mc-p8w7](https://github.com/advisories/GHSA-7p8r-x3mc-p8w7)
- fast-uri vulnerable to path traversal via percent-encoded dot segments — [GHSA-q3j6-qgpj-74h6](https://github.com/advisories/GHSA-q3j6-qgpj-74h6)
- fast-uri vulnerable to host confusion via percent-encoded authority delimiters — [GHSA-v39h-62p7-jpjc](https://github.com/advisories/GHSA-v39h-62p7-jpjc)
- fast-uri vulnerable to server-side request forgery via malformed IPv6 normalization — [GHSA-f65p-4m7j-42xc](https://github.com/advisories/GHSA-f65p-4m7j-42xc)
- fast-uri vulnerable to host confusion via percent-encoded scheme normalization — [GHSA-jqff-g426-hqxp](https://github.com/advisories/GHSA-jqff-g426-hqxp)
- fast-uri vulnerable to host confusion via failed IDN canonicalization — [GHSA-4c8g-83qw-93j6](https://github.com/advisories/GHSA-4c8g-83qw-93j6)
- fast-uri vulnerable to authority injection via an unvalidated port in serialize — [GHSA-qw65-cvwx-89v3](https://github.com/advisories/GHSA-qw65-cvwx-89v3)
- fast-uri vulnerable to inconsistent host case normalization via percent-encoded octets — [GHSA-hrr3-gc8f-f4qj](https://github.com/advisories/GHSA-hrr3-gc8f-f4qj)
- fast-uri vulnerable to URI scheme spoofing via percent-encoded scheme decoding — [GHSA-w74x-v6f9-j3xg](https://github.com/advisories/GHSA-w74x-v6f9-j3xg)
- fast-uri vulnerable to improper path equivalence in relative reference normalization — [GHSA-xhq7-xmqj-769h](https://github.com/advisories/GHSA-xhq7-xmqj-769h)
- fast-uri vulnerable to scheme injection via an unescaped first-segment colon in suffix references — [GHSA-333x-w4r6-6crp](https://github.com/advisories/GHSA-333x-w4r6-6crp)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/fast-uri`

##### `flatted` `<=3.4.1`

- flatted vulnerable to unbounded recursion DoS in parse() revive phase — [GHSA-25h7-pfq9-p65f](https://github.com/advisories/GHSA-25h7-pfq9-p65f)
- Prototype Pollution via parse() in NodeJS flatted — [GHSA-rf6f-7fwh-wjgh](https://github.com/advisories/GHSA-rf6f-7fwh-wjgh)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/flatted`

##### `form-data` `4.0.0 - 4.0.5`

- form-data: CRLF injection in form-data via unescaped multipart field names and filenames — [GHSA-hmw2-7cc7-3qxx](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/form-data`

##### `hono` `<=4.13.6`

- Hono added timing comparison hardening in basicAuth and bearerAuth — [GHSA-gq3j-xvxp-8hrf](https://github.com/advisories/GHSA-gq3j-xvxp-8hrf)
- Hono Vulnerable to Cookie Attribute Injection via Unsanitized domain and path in setCookie() — [GHSA-5pq2-9x2x-5p6w](https://github.com/advisories/GHSA-5pq2-9x2x-5p6w)
- Hono Vulnerable to SSE Control Field Injection via CR/LF in writeSSE() — [GHSA-p6xx-57qc-3wxr](https://github.com/advisories/GHSA-p6xx-57qc-3wxr)
- Hono vulnerable to arbitrary file access via serveStatic vulnerability — [GHSA-q5qw-h33p-qvwr](https://github.com/advisories/GHSA-q5qw-h33p-qvwr)
- Hono: Non-breaking space prefix bypass in cookie name handling in getCookie() — [GHSA-r5rp-j6wh-rvv4](https://github.com/advisories/GHSA-r5rp-j6wh-rvv4)
- Hono: Path traversal in toSSG() allows writing files outside the output directory — [GHSA-xf4j-xp2r-rqqx](https://github.com/advisories/GHSA-xf4j-xp2r-rqqx)
- Hono: Middleware bypass via repeated slashes in serveStatic — [GHSA-wmmm-f939-6g9c](https://github.com/advisories/GHSA-wmmm-f939-6g9c)
- Hono has incorrect IP matching in ipRestriction() for IPv4-mapped IPv6 addresses — [GHSA-xpcf-pg52-r92g](https://github.com/advisories/GHSA-xpcf-pg52-r92g)
- Hono has CSS Declaration Injection via Style Object Values in JSX SSR — [GHSA-qp7p-654g-cw7p](https://github.com/advisories/GHSA-qp7p-654g-cw7p)
- Hono has improper validation of NumericDate claims (exp, nbf, iat) in JWT verify() — [GHSA-hm8q-7f3q-5f36](https://github.com/advisories/GHSA-hm8q-7f3q-5f36)
- Hono's Cache Middleware ignores Vary: Authorization / Vary: Cookie leading to cross-user cache leakage — [GHSA-p77w-8qqv-26rm](https://github.com/advisories/GHSA-p77w-8qqv-26rm)
- Hono: bodyLimit() can be bypassed for chunked / unknown-length requests — [GHSA-9vqf-7f2p-gf9v](https://github.com/advisories/GHSA-9vqf-7f2p-gf9v)
- hono/jsx has Unvalidated JSX Tag Names that May Allow HTML Injection — [GHSA-69xw-7hcm-h432](https://github.com/advisories/GHSA-69xw-7hcm-h432)
- Hono: IP Restriction bypasses static deny rules for non-canonical IPv6 — [GHSA-xrhx-7g5j-rcj5](https://github.com/advisories/GHSA-xrhx-7g5j-rcj5)
- Hono: Cookie helper does not sanitize sameSite and priority, allowing Set-Cookie injection — [GHSA-3hrh-pfw6-9m5x](https://github.com/advisories/GHSA-3hrh-pfw6-9m5x)
- Hono: JWT middleware accepts any Authorization scheme, not only Bearer — [GHSA-f577-qrjj-4474](https://github.com/advisories/GHSA-f577-qrjj-4474)
- Hono: app.mount() strips mount prefix using undecoded path, causing incorrect routing for percent-encoded paths — [GHSA-2gcr-mfcq-wcc3](https://github.com/advisories/GHSA-2gcr-mfcq-wcc3)
- hono Improperly Handles JSX Attribute Names Allows HTML Injection in hono/jsx SSR — [GHSA-458j-xx4x-4375](https://github.com/advisories/GHSA-458j-xx4x-4375)
- hono: Body Limit Middleware can be bypassed on AWS Lambda by understating `Content-Length` — [GHSA-rv63-4mwf-qqc2](https://github.com/advisories/GHSA-rv63-4mwf-qqc2)
- hono: Lambda@Edge adapter keeps only the last value of a repeated request header, dropping the rest — [GHSA-wgpf-jwqj-8h8p](https://github.com/advisories/GHSA-wgpf-jwqj-8h8p)
- hono: CORS Middleware reflects any Origin with credentials when `origin` defaults to the wildcard — [GHSA-88fw-hqm2-52qc](https://github.com/advisories/GHSA-88fw-hqm2-52qc)
- hono: Path traversal in `serve-static` on Windows via encoded backslash (`%5C`) — [GHSA-wwfh-h76j-fc44](https://github.com/advisories/GHSA-wwfh-h76j-fc44)
- hono: AWS Lambda adapter merges multiple `Set-Cookie` headers into one value, dropping cookies on ALB single-header and Lattice — [GHSA-j6c9-x7qj-28xf](https://github.com/advisories/GHSA-j6c9-x7qj-28xf)
- Hono: API Gateway v1 adapter can drop a distinct repeated request header value during de-duplication — [GHSA-xgm2-5f3f-mvvc](https://github.com/advisories/GHSA-xgm2-5f3f-mvvc)
- hono/jsx does not isolate context per request, leading to cross-request data disclosure — [GHSA-hvrm-45r6-mjfj](https://github.com/advisories/GHSA-hvrm-45r6-mjfj)
- Hono: Server-Side XSS via JSX Escaping Bypass in cx() Utility — [GHSA-w62v-xxxg-mg59](https://github.com/advisories/GHSA-w62v-xxxg-mg59)
- Hono: ReDoS in CORS middleware via Access-Control-Request-Headers — [GHSA-8j4g-w8fx-2239](https://github.com/advisories/GHSA-8j4g-w8fx-2239)
- Hono: `memo()` retains SSR output across requests, leading to cross-user data disclosure — [GHSA-f23p-vx2j-j53r](https://github.com/advisories/GHSA-f23p-vx2j-j53r)
- Hono: Proxy Helper does not remove response headers listed in the `Connection` header — [GHSA-79qm-7rj5-m7r9](https://github.com/advisories/GHSA-79qm-7rj5-m7r9)
- Hono: Incomplete fix for CVE-2026-39408: `toSSG()` still writes files outside the output directory — [GHSA-gqvv-2mrq-wpjv](https://github.com/advisories/GHSA-gqvv-2mrq-wpjv)
- Hono: Unbounded dot-notation nesting in `parseBody()` can cause memory exhaustion — [GHSA-g6gw-c38x-mqfc](https://github.com/advisories/GHSA-g6gw-c38x-mqfc)
- Hono: Query parser reads parameters after the URL fragment, causing cache-key and proxy interpretation differentials — [GHSA-crvj-82cr-hjcx](https://github.com/advisories/GHSA-crvj-82cr-hjcx)
- Hono missing validation of cookie name on write path in setCookie() — [GHSA-26pp-8wgv-hjvm](https://github.com/advisories/GHSA-26pp-8wgv-hjvm)
- hono/jsx renders plain strings unescaped in boundary components, leading to XSS — [GHSA-hxh3-vqpv-xpqv](https://github.com/advisories/GHSA-hxh3-vqpv-xpqv)
- Hono vulnerable to Prototype Pollution possible through \_\_proto\_\_ key allowed in parseBody({ dot: true }) — [GHSA-v8w9-8mx6-g223](https://github.com/advisories/GHSA-v8w9-8mx6-g223)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/hono`

##### `ip-address` `<=10.7.3`

- ip-address has XSS in Address6 HTML-emitting methods — [GHSA-v2v4-37r5-5v8g](https://github.com/advisories/GHSA-v2v4-37r5-5v8g)
- ip-address: Address4 decodes leading-zero octets as decimal while resolvers decode them as octal, allowing SSRF and trust-boundary bypass — [GHSA-mwp4-54f8-5fhr](https://github.com/advisories/GHSA-mwp4-54f8-5fhr)
- ip-address: Address6.isLinkLocal() recognizes fe80::/64 rather than fe80::/10, allowing SSRF and trust-boundary bypass to on-link hosts — [GHSA-rpw4-54j3-4h4q](https://github.com/advisories/GHSA-rpw4-54j3-4h4q)
- ip-address: isInSubnet() and isHostInSubnet() compare addresses of different families as if they shared an address space, allowing an allowlist check to admit an address outside its range — [GHSA-j6r3-76f7-8jcv](https://github.com/advisories/GHSA-j6r3-76f7-8jcv)
- ip-address: Address6 builds a parse diagnostic proportional to the input with no length bound, allowing a single long string to stall or crash the process — [GHSA-h3mg-xc3c-68pw](https://github.com/advisories/GHSA-h3mg-xc3c-68pw)
- ip-address: Address6 matches a zone identifier in quadratic time ahead of its length limit, allowing a single long string to stall the process — [GHSA-rxp7-6hxx-x8q5](https://github.com/advisories/GHSA-rxp7-6hxx-x8q5)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/ip-address`

##### `js-cookie` `<=3.0.5`

- JavaScript Cookie: Per-instance prototype hijack in assign() enables cookie-attribute injection — [GHSA-qjx8-664m-686j](https://github.com/advisories/GHSA-qjx8-664m-686j)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/js-cookie`

##### `js-yaml` `4.0.0 - 4.3.1`

- JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases — [GHSA-h67p-54hq-rp68](https://github.com/advisories/GHSA-h67p-54hq-rp68)
- js-yaml: YAML merge-key chains can force quadratic CPU consumption — [GHSA-52cp-r559-cp3m](https://github.com/advisories/GHSA-52cp-r559-cp3m)
- JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) — CVE-2026-59870 fix not backported — [GHSA-5p4m-2wfm-xmqj](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj)
- js-yaml: maxTotalMergeKeys does not limit CPU use for empty merge sources — [GHSA-2883-xcg3-v3hh](https://github.com/advisories/GHSA-2883-xcg3-v3hh)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/js-yaml`

##### `lodash` `<=4.17.23`

- lodash vulnerable to Code Injection via `_.template` imports key names — [GHSA-r5fr-rjxr-66jc](https://github.com/advisories/GHSA-r5fr-rjxr-66jc)
- lodash vulnerable to Prototype Pollution via array path bypass in `_.unset` and `_.omit` — [GHSA-f23m-r3pf-42rh](https://github.com/advisories/GHSA-f23m-r3pf-42rh)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/lodash`

##### `minimatch` `<=3.1.3 || 9.0.0 - 9.0.6 || 10.0.0 - 10.2.2`

- minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern — [GHSA-3ppc-4f35-3m26](https://github.com/advisories/GHSA-3ppc-4f35-3m26)
- minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments — [GHSA-7r86-cg39-jmmj](https://github.com/advisories/GHSA-7r86-cg39-jmmj)
- minimatch ReDoS: nested \*() extglobs generate catastrophically backtracking regular expressions — [GHSA-23c5-xmqv-rm74](https://github.com/advisories/GHSA-23c5-xmqv-rm74)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/@ts-morph/common/node_modules/minimatch`, `node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch`, `node_modules/minimatch`

##### `nanoid` `<=3.3.17`

- nanoid: non-secure generators can loop indefinitely with negative size — [GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv)
- nanoid: custom generators can loop indefinitely when size is zero — [GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8)
- nanoid: Integer Overflow or Wraparound — [GHSA-xwg4-73v4-xw9w](https://github.com/advisories/GHSA-xwg4-73v4-xw9w)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/nanoid`

##### `path-to-regexp` `8.0.0 - 8.3.0`

- path-to-regexp vulnerable to Denial of Service via sequential optional groups — [GHSA-j3q9-mxjg-w52f](https://github.com/advisories/GHSA-j3q9-mxjg-w52f)
- path-to-regexp vulnerable to Regular Expression Denial of Service via multiple wildcards — [GHSA-27v5-c462-wpq7](https://github.com/advisories/GHSA-27v5-c462-wpq7)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/router/node_modules/path-to-regexp`

##### `picomatch` `<=2.3.1 || 4.0.0 - 4.0.3`

- Picomatch: Method Injection in POSIX Character Classes causes incorrect Glob Matching — [GHSA-3v7f-55p6-f55p](https://github.com/advisories/GHSA-3v7f-55p6-f55p)
- Picomatch has a ReDoS vulnerability via extglob quantifiers — [GHSA-c2c7-rcm5-vvqj](https://github.com/advisories/GHSA-c2c7-rcm5-vvqj)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/micromatch/node_modules/picomatch`, `node_modules/picomatch`

##### `postcss` `<=8.5.22`

- PostCSS has XSS via Unescaped &lt;/style&gt; in its CSS Stringify Output — [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93)
- PostCSS: Arbitrary file read and information disclosure via attacker-controlled sourceMappingURL in CSS comments — [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q)
- PostCSS: incomplete fix of GHSA-6g55-p6wh-862q — attacker-controlled sourceMappingURL reads arbitrary .map files when `from` is unset — [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp)
- PostCSS: Path Traversal in Previous Source Map Auto-Loading (sourceMappingURL) leads to Arbitrary .map File Disclosure — [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/postcss`

##### `react-router` `6.0.0 - 7.18.1`

- React Router's vendored turbo-stream v2 allows arbitrary constructor invocation via TYPE_ERROR deserialization leading to Unauth RCE — [GHSA-49rj-9fvp-4h2h](https://github.com/advisories/GHSA-49rj-9fvp-4h2h)
- React Router vulnerable to XSS in unstable RSC redirect handling via javascript: redirect targets — [GHSA-8646-j5j9-6r62](https://github.com/advisories/GHSA-8646-j5j9-6r62)
- React Router vulnerable to DoS via unbounded path expansion in \_\_manifest endpoint — [GHSA-8x6r-g9mw-2r78](https://github.com/advisories/GHSA-8x6r-g9mw-2r78)
- React Router vulnerable to Denial of Service via reflected user input in single-fetch — [GHSA-rxv8-25v2-qmq8](https://github.com/advisories/GHSA-rxv8-25v2-qmq8)
- React Router: Potential CSRF via PUT/PATCH/DELETE document requests — [GHSA-84g9-w2xq-vcv6](https://github.com/advisories/GHSA-84g9-w2xq-vcv6)
- React Router: Open redirect via backslash in &lt;Link&gt; and useNavigate (CVE-2025-68470 bypass) — [GHSA-wrjc-x8rr-h8h6](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6)
- React Router: RSCErrorHandler Missing Protocol Validation (XSS) — [GHSA-h8fp-f39c-q6mh](https://github.com/advisories/GHSA-h8fp-f39c-q6mh)
- React Router: Arbitrary Constructor Injection via deserializeErrors() in React Router SSR Hydration — [GHSA-337j-9hxr-rhxg](https://github.com/advisories/GHSA-337j-9hxr-rhxg)
- React Router: Unauthenticated Denial of Service via Inefficient Route Matching — [GHSA-chx6-hx7r-mcp5](https://github.com/advisories/GHSA-chx6-hx7r-mcp5)
- React Router's same-origin redirect with path starting // causes open redirect via protocol-relative URL reinterpretation — [GHSA-2j2x-hqr9-3h42](https://github.com/advisories/GHSA-2j2x-hqr9-3h42)
- React Router: RSC Mode CSRF Bypass Allows Action Execution Before 400 Response — [GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2)
- React Router has stored XSS via unescaped Location header in prerendered redirect HTML — [GHSA-f22v-gfqf-p8f3](https://github.com/advisories/GHSA-f22v-gfqf-p8f3)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/react-router`

**Dependent package:** `react-router-dom` `7.0.0-pre.0 - 7.14.1` — Depends on vulnerable versions of react-router  
**Path(s):** `node_modules/react-router-dom`

##### `rollup` `4.0.0 - 4.58.0`

- Rollup 4 has Arbitrary File Write via Path Traversal — [GHSA-mw96-cpmx-2vgc](https://github.com/advisories/GHSA-mw96-cpmx-2vgc)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/rollup`

##### `source-map-js` `1.0.0 - 1.2.1`

- source-map-js allows event-loop denial of service through indexed source-map section offsets — [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/source-map-js`

##### `vite` `7.0.0 - 7.3.6`

- Vite Vulnerable to Path Traversal in Optimized Deps `.map` Handling — [GHSA-4w7w-66w2-5vf9](https://github.com/advisories/GHSA-4w7w-66w2-5vf9)
- Vite: `server.fs.deny` bypassed with queries — [GHSA-v2wj-q39q-566r](https://github.com/advisories/GHSA-v2wj-q39q-566r)
- Vite Vulnerable to Arbitrary File Read via Vite Dev Server WebSocket — [GHSA-p9ff-h696-f583](https://github.com/advisories/GHSA-p9ff-h696-f583)
- launch-editor: NTLMv2 hash disclosure via UNC path handling on Windows — [GHSA-v6wh-96g9-6wx3](https://github.com/advisories/GHSA-v6wh-96g9-6wx3)
- vite: `server.fs.deny` bypass on Windows alternate paths — [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff)
- launch-editor: escapeCmdArgs() omits % escaping on Windows — [GHSA-698v-4r3x-3vcv](https://github.com/advisories/GHSA-698v-4r3x-3vcv)
- launch-editor: Editor CLI flag misinterpretation causing arbitrary command execution for some editors — [GHSA-r825-w8mm-5pxw](https://github.com/advisories/GHSA-r825-w8mm-5pxw)
- launch-editor: `fs.existsSync()` existence check can be bypassed on Windows — [GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm)
- Vite: Cross origin script execution through Vite custom middleware — [GHSA-9jrq-w75r-8gcw](https://github.com/advisories/GHSA-9jrq-w75r-8gcw)
- Vite: Files outside `server.fs.allow` could be served when project paths match system paths on non-Windows machine — [GHSA-rq7h-c2jc-7f22](https://github.com/advisories/GHSA-rq7h-c2jc-7f22)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/vite`

##### `zod` `<4.6.6`

- Zod can exhaust memory while validating oversized constrained collections — [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5)
- Will install shadcn@4.22.1, which is a breaking change

**Fix:** Fix available via `npm audit fix --force`  
**Path(s):** `node_modules/shadcn/node_modules/zod`, `node_modules/zod`

**Dependent package:** `shadcn` `<=0.0.0-rc-20261007105214 || 2.0.0 - 4.21.5` — Depends on vulnerable versions of zod  
**Path(s):** `node_modules/shadcn`

---

#### 4) Critical — 2 vulnerabilities

##### `fast-xml-parser` `<=5.6.0`

- fast-xml-parser has an entity encoding bypass via regex injection in DOCTYPE entity names — [GHSA-m7jm-9gc2-mpf2](https://github.com/advisories/GHSA-m7jm-9gc2-mpf2)
- fast-xml-parser affected by DoS through entity expansion in DOCTYPE (no expansion limit) — [GHSA-jmr7-xgp7-cmfj](https://github.com/advisories/GHSA-jmr7-xgp7-cmfj)
- fast-xml-parser has stack overflow in XMLBuilder with preserveOrder — [GHSA-fj3w-jwp8-x2g3](https://github.com/advisories/GHSA-fj3w-jwp8-x2g3)
- fast-xml-parser affected by numeric entity expansion bypassing all entity expansion limits (incomplete fix for CVE-2026-26278) — [GHSA-8gc5-j5rx-235r](https://github.com/advisories/GHSA-8gc5-j5rx-235r)
- Entity Expansion Limits Bypassed When Set to Zero Due to JavaScript Falsy Evaluation in fast-xml-parser — [GHSA-jp2q-39xq-3w4g](https://github.com/advisories/GHSA-jp2q-39xq-3w4g)
- fast-xml-parser XMLBuilder: XML Comment and CDATA Injection via Unescaped Delimiters — [GHSA-gh4j-gqv2-49f6](https://github.com/advisories/GHSA-gh4j-gqv2-49f6)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/@aws-sdk/xml-builder/node_modules/fast-xml-parser`, `node_modules/fast-xml-parser`

**Dependent package:** `@aws-sdk/xml-builder` `3.894.0 - 3.972.18` — Depends on vulnerable versions of fast-xml-parser  
**Path(s):** `node_modules/@aws-sdk/xml-builder`

##### `proxy-addr` `1.1.0 - 2.0.7`

- proxy-addr vulnerable to IP spoofing via IPv4-mapped IPv6 trust subnet — [GHSA-jqcg-44mw-7w3h](https://github.com/advisories/GHSA-jqcg-44mw-7w3h)

**Fix:** Fix available via `npm audit fix`  
**Path(s):** `node_modules/proxy-addr`

---

40 vulnerabilities (3 low, 8 moderate, 27 high, 2 critical)

## 7) Pending Technical Decisions

These need to be discussed in the next sprint planning:

1. **API authentication:** Confirm with the backend team how the API authenticates requests from the dashboard. To be discussed with the Project Owner, Pranav Goyal.
2. **Access model:** Who can create, update and delete deployments? Should there be roles (admin vs. member), and should deployments have owners? This needs input from the Project Owner.
3. **Dependency remediation:** Run `npm audit fix` now, and decide whether to take the breaking `shadcn` upgrade, or drop `shadcn` from devDependencies since it is only a CLI for generating components.
4. **CI/CD gating:** Should `deploy.yml` run only after `build.yml` passes (`needs:` / `workflow_run`), and which single Node version should both use?
5. **Environments:** Do we need a staging or preview environment for the dashboard, and branch protection or required reviews on `main`?
6. **Configuration:** Move the hardcoded account ID, region, pipeline name and domain into `VITE_*` variables, and add a `.env.example`.
7. **Status updates:** Keep polling (and add backoff and limits), or move to WebSockets or AppSync as the backlog proposes?
8. **Testing:** Choose a test stack (for example Vitest and React Testing Library) and decide how much coverage CI must enforce.
9. **Backend repo:** Where do the backend API and CodePipeline/IaC live? They should be linked from this repo's docs so AWS resources can be traced and verified.
10. **Scanning:** Turn on Dependabot (`.github/dependabot.yml`), CodeQL code scanning and secret scanning.

## 8) Reuse Recommendation

**Recommendation: keep and extend the existing frontend. Do not rewrite it.**

Reasons:

- It installs, lints and builds cleanly on the current toolchain (§5).
- The core workflow is already implemented: login, and listing, creating, updating, deleting and monitoring deployments (§2).
- The stack is current and widely used: React 19, Vite 7, TypeScript, Tailwind 4 and shadcn/ui.
- The codebase is small (about 2,100 lines in `src/`), so it is easy for a new team to learn and own.
- The gaps found in §4 and §6 can each be fixed in small changes. None of them needs a redesign.

| Area                                                             | Recommendation                                                                                       |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Auth flow (`AuthContext.tsx`, `ProtectedRoute.tsx`, `/callback`) | Reuse as is. Add a logout button.                                                                    |
| API layer (`src/lib/api.ts`)                                     | Reuse. Changes depend on pending decision 1.                                                         |
| Deployment list and form                                         | Reuse. Add input validation, and add search later from the backlog.                                  |
| Status view (`DeploymentStatusView.tsx`)                         | Reuse with fixes: console link, back button, polling limits.                                         |
| UI components (`src/components/ui/`)                             | Reuse as is.                                                                                         |
| CI/CD workflows                                                  | Reuse. Keep the OIDC deploy, gate it on the Build workflow, and use one Node version in both.        |
| Backend, pipeline and infrastructure                             | **No recommendation yet.** They are not in this repo and have not been located (pending decision 9). |

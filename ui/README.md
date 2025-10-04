# TestingTesina UI E2E Tests

End-to-end test suite for the TestingTesina UI, built with Playwright and TypeScript. The project follows the Page Object Model and focuses on high-level user flows such as authentication, user administration, and regression checks for modal-driven interactions.

## Prerequisites

- Node.js 18 LTS or newer (Playwright supports 18/20/22)
- npm 9+ (bundled with Node) or another compatible package manager
- Recommended: Git for version control

Playwright downloads browser binaries on demand. The first install may take extra time or require additional system dependencies (see the [official docs](https://playwright.dev/docs/cli#install-system-dependencies)).

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Install Playwright browsers (first run only)**
   ```bash
   npx playwright install --with-deps
   ```
3. **Configure environment variables**
   Create a `.env` file at the repository root (next to `playwright.config.ts`). It is loaded automatically by `dotenv` in the config.
   ```dotenv
   URL=https://your-app-url.example
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=super-secret
   ```

## Project Structure

```
.
├── e2e/
│   ├── factories/          # Test data builders (e.g., makeNewUser)
│   ├── fixtures/           # Custom Playwright fixtures (auth, etc.)
│   ├── pages/              # Page Objects and modular components
│   │   ├── admin/          # Screens under /admin
│   │   ├── base/           # Shared flows such as Login
│   │   └── components/     # Reusable pieces (modals, datepickers)
│   ├── routes/             # Centralized app route definitions
│   ├── test/               # Spec files grouped by domain (admin, auth)
│   ├── types/              # Shared TypeScript types for test data
│   └── utils/              # Helpers (env guards, formatting)
├── playwright.config.ts    # Global Playwright configuration
├── playwright-report/      # HTML reports (generated)
├── test-results/           # Traces/screenshots from the last run (generated)
├── package.json            # Dependencies
└── README.md               # Project documentation
```

## Useful Commands

Run the full test suite in headless mode (default):

```bash
npx playwright test
```

Run a single spec:

```bash
npx playwright test e2e/test/admin/create-user.spec.ts
```

Run on a specific project (Chromium) in headed mode for debugging:

```bash
npx playwright test --project=chromium --headed
```

Open the interactive UI mode (pick tests, inspect locators):

```bash
npx playwright test --ui
```

Show the latest HTML report:

```bash
npx playwright show-report
```

Generate code snippets for new tests:

```bash
npx playwright codegen https://your-app-url.example
```

## Development Tips

- Specs use the fixtures defined in `e2e/fixtures`. The `auth.fixture.ts` exports a `test` object that already logs in using `ADMIN_EMAIL`/`ADMIN_PASSWORD`. Import it instead of `@playwright/test`’s default `test` when you need authenticated flows.
- Page Objects live under `e2e/pages`. Keep selectors and user interactions inside these classes to keep specs expressive and maintainable.
- Test data is centralized in `e2e/factories`. Reuse helpers like `makeNewUser` to avoid brittle inline data.
- When adding new environment variables, extend `requireEnv` in `e2e/utils/require-env.util.ts` so missing values fail fast.

## Continuous Integration

- The configuration retries failed tests twice in CI and records traces on the first retry (`trace: 'on-first-retry'`).
- `forbidOnly` is enabled to prevent accidental `test.only` commits.
- Configure your CI pipeline to run `npm ci` followed by `npx playwright install --with-deps` and `npx playwright test`.

## Troubleshooting

- **Browsers fail to launch**: Run `npx playwright install --with-deps` and ensure all required system libraries are present (especially on Linux CI agents).
- **Environment errors**: Missing `.env` values will throw via `requireEnv`. Double-check the variable names and ensure the config file is in the repo root.
- **Stale reports**: Remove `playwright-report/` and `test-results/` if you need a clean slate; they are generated artifacts and can be deleted safely.

Happy testing! 🚀

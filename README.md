# bnbu_frontend_app

React + TypeScript frontend for the BnBu application, built with Vite and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn

### Install dependencies

```bash
npm install
# or
yarn install
```

### Run the dev server

```bash
npm run dev
```

The app will start on the port configured by Vite (commonly `http://localhost:5173`).

## Available Scripts

- `npm run dev` – Start the Vite dev server.
- `npm run build` – Type-check and build the production bundle.
- `npm run preview` – Preview the built production bundle locally.
- `npm run lint` – Run ESLint on the `src` directory.
- `npm run test` – Run the unit test suite once using Vitest.
- `npm run test:watch` – Run tests in watch mode using Vitest.

## Testing

This project uses **Vitest** with **@testing-library/react** and **jsdom**:

- `src/setupTests.ts` configures `@testing-library/jest-dom` for better assertions.
- `src/App.test.tsx` provides an initial routing smoke test.
- `src/components/__tests__/PrivateRoute.test.tsx` covers authenticated vs unauthenticated routing behavior.

When adding new features or fixing bugs, prefer:

- Small, focused tests that describe observable behavior.
- Tests colocated near the components/modules they cover.

## Project Structure (high level)

- `src/App.tsx` – Top-level routing configuration.
- `src/pages/` – Page-level route components.
- `src/components/` – Reusable UI and layout components.
- `src/store/` – Redux store and slices.
- `src/services/api.ts` – API helper utilities.
- `src/types/` – Shared TypeScript types.

## Contribution & Commits

When working on this project:

- Keep changes logically grouped and incremental.
- Use commit messages in the form:

  ```text
  Feature::Task::Task Description
  ```

- Add or update unit tests for each feature, bug fix, or refactor where practical.


# Repository Guidelines

## Project Structure & Module Organization

This monorepo groups runnable surfaces under `apps/`, each with its own `package.json`, `tsconfig.json`, and entry point. Publishable libraries live in `packages/<name>/src`, with companion tests in `packages/<name>/test`. Shared static assets live in `assets/`, while generated output such as `dist/` and `coverage/` must never be edited directly. Remember to register new workspaces in `pnpm-workspace.yaml`, `turbo.json`, and other root configs so Turbo and pnpm can discover them.

## Build, Test, and Development Commands

Use `pnpm install` (Node ≥20, pnpm 10) to sync dependencies; the `only-allow pnpm` hook rejects npm or yarn. Run `pnpm dev` to launch `turbo run dev --parallel`, keeping affected apps and packages in watch mode. `pnpm build` runs the Turbo pipeline (tsup/unbuild under the hood) and should pass before submitting PRs. Execute `pnpm test` for a coverage-enforced Vitest suite, and prefer `pnpm test:dev` when you need interactive debugging.

## Coding Style & Naming Conventions

All workspaces use TypeScript in ESM mode with 2-space indentation and single quotes, mirroring `packages/sonofmagic/src/index.ts`. Adopt `camelCase` for functions, `PascalCase` for types and enums, and kebab-case for folders. Keep entry points in `index.ts`. Run ESLint and Stylelint via `pnpm lint`, and rely on lint-staged plus Husky to block non-compliant commits.

## Testing Guidelines

Author unit tests in `test/*.test.ts` adjacent to the package under test, scoped with descriptive `describe('package-name', ...)` blocks. Maintain coverage expectations enforced by CI; run `pnpm test -- --coverage` locally before merging. When adding new features, include regression tests that capture the entry point or public API.

## Commit & Pull Request Guidelines

Follow Conventional Commits (use `pnpm commit` for guidance) and create a Changeset with `pnpm changeset` for any user-facing change. PRs should document scope (e.g., `apps/cli`, `packages/profile`), link related issues, and attach CLI output or screenshots when behavior shifts. Ensure `pnpm lint`, `pnpm test`, and `pnpm build` succeed locally; note explicit exceptions in the PR description.

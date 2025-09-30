# Repository Guidelines

## Project Structure & Module Organization

- Root configs (`turbo.json`, `vitest.workspace.ts`, `monorepo.config.ts`) drive shared tooling; keep them in sync when adding workspaces.
- `apps/` hosts runnable surfaces (e.g., `apps/cli`); each app owns its `package.json` and `tsconfig.json`.
- `packages/` contains publishable libraries. Place implementation under `src/`, tests under `test/`, and reuse the existing `tsup.config.ts` pattern.
- `assets/` stores shared static files, while `dist/` and `coverage/` are generated outputs—never edit them manually.
- Register new workspaces in `pnpm-workspace.yaml` and `turbo.json` so Turbo and pnpm pick them up.

## Build, Test, and Development Commands

- `pnpm install` (Node ≥20, pnpm 10) respects the enforced `only-allow pnpm` preinstall hook.
- `pnpm dev` runs `turbo run dev --parallel` so affected apps and packages watch and rebuild together.
- `pnpm build` executes the workspace build pipeline via Turbo (tsup/unbuild under the hood).
- `pnpm test` runs Vitest with coverage; prefer `pnpm test:dev` for interactive debugging.
- `pnpm lint` fans out ESLint and Stylelint tasks through Turbo; add `--filter <workspace>` to focus on one package.
- Utility scripts: `pnpm script:clean` clears build artifacts, `pnpm script:sync` aligns scaffolding, and `pnpm script:mirror` mirrors template changes.

## Coding Style & Naming Conventions

- TypeScript + ESM are standard; keep 2-space indentation and single quotes, mirroring `packages/sonofmagic/src/index.ts`.
- Prefer `camelCase` for functions, `PascalCase` for types/enums, and kebab-case folder names; colocate entry points in `index.ts`.
- Run ESLint (`eslint.config.js`), Stylelint, and lint-staged before pushing. Avoid bypassing Husky hooks.

## Testing Guidelines

- Author unit tests with Vitest in `test/*.test.ts`, matching the source file name and package.
- Maintain coverage by running `pnpm test` locally; CI enforces the same `--coverage.enabled` flag.
- Use descriptive `describe` blocks scoped to the package (`describe('sonofmagic', ...)`) to simplify triage.

## Commit & Pull Request Guidelines

- Follow Conventional Commits; `pnpm commit` launches the commitlint prompt to keep messages compliant.
- Create a Changeset (`pnpm changeset`) for any user-facing change destined for release.
- Ensure PRs document scope (`apps/cli`, `packages/<name>`), link relevant issues, and attach CLI snapshots or screenshots when behavior changes.
- Before requesting review, run `pnpm lint`, `pnpm test`, and `pnpm build`; note any skipped steps with a rationale in the PR description.

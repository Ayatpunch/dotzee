# Zest: Discussion Log

## Phase 1: Core Reactivity & Basic `defineStore` (MVP)

- **Task 1: Project Setup**
  - Discussed tools and configurations for:
    - TypeScript project initialization (`npm init`/`yarn init`, `package.json`).
    - TypeScript configuration (`tsconfig.json` with strict settings, module types, output paths).
    - Bundler selection (Rollup, esbuild, Parcel) and configuration (input/output, formats, plugins).
    - Testing framework selection (Jest, Vitest) and configuration (TS transformation, environment, coverage).
    - Linting (ESLint) and formatting (Prettier) setup with relevant plugins and configurations).
    - Git repository initialization (`git init`, `.gitignore`).

- **Task 2: Reactive Core (`@reactivity/core` or similar module)**
  - Discussed the objective: to build the foundational reactive engine for the library.
  - Key implementation points:
    - Utilizing JavaScript `Proxy` for reactivity in plain objects and arrays.
    - Trapping `get` operations for dependency tracking (conceptual for now).
    - Trapping `set` operations to trigger notifications.
    - Handling nested reactive objects/arrays.
    - Implementing a `subscribe(callback)` mechanism for change notifications.
    - Need for basic unit tests to cover object mutation and subscriber notification.

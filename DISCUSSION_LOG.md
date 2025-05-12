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

- **Task 3: Store Implementation (`@store/core` or similar module)**
  - Discussed naming conventions, opting for `defineZestStore` to differentiate from Pinia while acknowledging its influence.
  - Defined core TypeScript types:
    - `StoreActions<S>`: For action definitions, ensuring `this` context is typed to the state `S`.
    - `DefineZestStoreOptions<S, A>`: For the options object passed to `defineZestStore`, including `state` factory and `actions`.
    - `StoreInstance<S, A>`: Representing the combined state and actions of a store instance.
    - `ZestStoreHook<S, A>`: Typing the hook function returned by `defineZestStore`.
  - Implemented `defineZestStore` function in `src/store/defineZestStore.ts`:
    - Established an internal `storeRegistry` (Map) to manage store instances and ensure singleton behavior per ID.
    - Initial state is created via a factory function and made reactive using the `reactive()` utility.
    - Actions are bound to the reactive store instance, ensuring `this` inside actions refers to the combined state and actions object.
    - The function returns a hook (`() => storeInstance`) for accessing the store.
  - Created `src/store/types.ts` for type definitions and `src/store/index.ts` to export public APIs from the store module.
  - Updated the main library entry point `src/index.ts` to re-export store functionalities.
  - Iteratively developed and refined unit tests for `defineZestStore` in `src/store/defineZestStore.test.ts`:
    - Initial tests revealed issues with store instance composition (state not updating on instance), `this` context in actions (not referring to the full store), and reactivity for nested objects (subscriptions not triggering).
    - Refactored `defineZestStore` to ensure the store instance itself is the reactive object and actions are correctly bound to this instance.
    - Updated `src/reactivity/reactive.ts` to correctly handle subscriptions to proxies of nested objects by resolving them to their original targets.
    - All unit tests for `defineZestStore` are now passing, confirming correct state initialization, action behavior, reactivity, and singleton pattern.

- **Task 4: React Integration (`src/react/`)**
  - Discussed the main hook (`useZestStore(storeHook)`). Although the actual file `src/react/useZestStore.ts` isn't created yet, its conceptual requirements were addressed.
  - Modified `defineZestStore` in `src/store/defineZestStore.ts` to return an augmented hook function (`ZestStoreHook`).
  - This hook includes `$id` (string) and `$changeSignal` (a `Ref<number>`) properties.
  - The design anticipates that `useZestStore` (when implemented) will use React 18's `useSyncExternalStore`.
    - The `subscribe` function for `useSyncExternalStore` will leverage `storeHook.$changeSignal` to listen for store updates.
    - The `getSnapshot` function will return the store instance obtained by calling `storeHook()`.
  - Unit tests for `defineZestStore` were updated to verify the structure and content of the returned `ZestStoreHook`, including the presence and type of `$id` and `$changeSignal`.

- **Task 5: Initial TypeScript Typing**
  - Reviewed the existing TypeScript implementation in `src/store/types.ts` and `src/store/defineZestStore.ts`.
  - Confirmed that basic generic types for `defineZestStore` are in place:
    - For Options Stores: `defineZestStore<Id extends string, S extends object, A extends StoreActions<S>>(id, options)` infers state type `S` and action types `A`.
    - For Setup Stores: `defineZestStore<Id extends string, R extends SetupStoreReturnType>(id, setup)` infers the return type `R`.
  - `StoreActions<S>` provides basic typing for actions within Options Stores.
  - The `ZestStoreHook<T>` type correctly types the augmented hook function, ensuring the store instance returned by `useStore()` (e.g., `const store = useCounterStore()`) is properly typed.
  - Current unit tests in `defineZestStore.test.ts` implicitly validate these initial typings, as they pass TypeScript checks.
  - Marked Task 5 as complete in `IMPLEMENTATION_PLAN.md`.

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

- **Task 6: Example Application UI & Reactivity**
  - Implemented `useZestStore` in `src/react/useZestStore.ts` using `useSyncExternalStore` and `subscribeRef`.
  - Updated `CounterOptions.tsx` and `CounterSetup.tsx` in the example app to use `useZestStore`.
  - **Debugging Invalid Hook Call:**
    - Encountered "Invalid hook call" errors in the example app.
    - Identified the cause as multiple React instances due to the library not marking `react` and `react-dom` as external in its `esbuild` configuration.
    - Updated `package.json` build scripts (`build:esm`, `build:cjs`) to include `--external:react` and `--external:react-dom`.
    - Rebuilt the library, resolving the hook call error.
  - **Fixing UI Reactivity:**
    - After fixing the hook call error, the UI was still not updating on state change.
    - Identified that `useSyncExternalStore`'s `getSnapshot` returning the store instance itself (which didn't change reference) caused React to bail out of re-renders.
    - Modified `getSnapshot` in `src/react/useZestStore.ts` to return the `changeSignal.value` instead. This ensured the snapshot value changed, forcing React to re-render.
    - The UI in the example app now updates correctly.
  - **Example Application UI Overhaul:**
    - Completely revamped the UI of `zest-example-app` for a modern and professional look.
    - Implemented a new color scheme with dark mode support.
    - Redesigned counter components as visually distinct cards with hover effects, gradient highlights, and type badges.
    - Added animations for count changes and button clicks (ripple effect).
    - Improved overall layout, typography, and added decorative background elements and a footer.
    - Ensured proper centering and responsive design.

- **Debugging TypeScript Errors in Example App:**
    - Encountered TypeScript errors in `zest-example-app/src/components/CounterSetup.tsx` when using `useZestStore`.
    - Errors indicated that properties like `.value` and action methods were not recognized on the `counter` instance returned by `useZestStore(useCounterSetupStore)`.
    - Identified the root cause: The implementation signature and internal logic of `defineZestStore` were losing the specific inferred return type (`R`) of the setup function, defaulting to the broader `StoreInstanceType`.
    - Resolved by:
        - Making `SetupStoreFunction` generic (`SetupStoreFunction<R>`) in `src/store/types.ts` to capture the specific return type `R`.
        - Updating the setup store overload and the implementation signature of `defineZestStore` in `src/store/defineZestStore.ts` to correctly use `SetupStoreFunction<R>`.
        - Adjusting internal type casts within `defineZestStore` to ensure the specific type `R` (for setup stores) or `StoreInstance<S, A, G>` (for options stores) was preserved and returned in the `ZestStoreHook`.
    - Confirmed that the TypeScript errors in the example application are now resolved.

## Phase 2: Getters, Async Actions & Improved Typing

- **Task 1: Getters (Computed Properties)**
  - Reviewed the current implementation of getters for Options Stores (`defineZestStore` processing `options.getters`).
  - Confirmed that the existing implementation utilizes the `computed` primitive from `src/reactivity/computed.ts`.
  - Analyzed how `computed`, combined with `track` and `trigger` in the `reactive` core, should already provide the intended fine-grained reactivity (getters re-evaluating only when their specific state dependencies change) and caching.
  - Existing tests cover basic calculation, reactivity, caching, and access within actions.
  - Concluded that the main work for this task is to add *specific unit tests* to rigorously verify the fine-grained dependency tracking and selective re-evaluation of getters, ensuring they don't re-run unnecessarily when unrelated state changes.
  - Decided against implementing `this` access within getters for now, keeping the simpler `(state) => value` signature.

- **Task 2: Asynchronous Actions**
  - Discussed the requirement for supporting `async` actions in both Options and Setup stores.
  - Confirmed the hypothesis that the existing reactivity system (`Proxy` traps and `ref` setters) and `this` binding should inherently handle state mutations after `await` without core modifications.
  - Added unit tests to `src/store/defineZestStore.test.ts` specifically covering:
    - Options Store: `async` actions modifying state after `await`, triggering the change signal, and updating dependent getters.
    - Setup Store: `async` actions modifying `ref`s after `await` and triggering the change signal.
  - Confirmed that all added tests passed, verifying correct asynchronous action handling and reactivity.

- **Task 3: Advanced TypeScript Typing**
  - Discussed refining types for state (`S`), getters (`G`), and actions (`A`).
  - Evaluated `this` context typing in Options stores:
    - Confirmed `this` in actions (`S & MappedGetters<S, G> & A`) seems correct.
    - Decided *not* to implement `this` access within getters, retaining the `(state: S)` signature for simplicity and explicitness.
  - Discussed async action return type inference (`Promise<ResolvedType>`), concluding existing types should suffice.
  - Agreed the primary goal was verification of current types rather than major rewriting.
  - Added specific type-checking tests to `src/store/defineZestStore.test.ts`:
    - Verified `this` context in Options Store actions (accessing state, getters, other actions).
    - Verified inference of `async` action return types.
    - Verified the `useZestStore` hook returns a fully typed store instance.
  - Confirmed all type-checking tests passed, validating the current advanced typing approach.

- **Task 4: Example Application Updates**
  - Enhanced both Options and Setup stores to include getters and async actions:
    - Added `doubledCount` and `countStatus` getters to the Options store
    - Added `doubledCount` and `countStatus` computed properties to the Setup store
    - Added `incrementAsync` async action to both stores with loading state
  - Updated the counter components to display computed values and provide async action buttons:
    - Added getters section to show computed values
    - Added async action buttons with loading indicators
  - Improved UI styling:
    - Enhanced getters section with visual styling including badges and separation
    - Added loading state animation for async buttons
    - Ensured consistent design between Options and Setup store components
    - Added proper styling for the third button
    - Improved responsiveness for mobile devices
  - Completed the export of the `computed` function from the library to support Setup stores.

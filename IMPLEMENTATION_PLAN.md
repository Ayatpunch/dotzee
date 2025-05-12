# Zest: Implementation Plan

This document outlines the development phases and tasks for creating the Pinia-like reactive state library for React.

The prompt is:

```
Start discussing Phase n: ${Phase title} in more detail.
Specifically look at Task n: Project Setup within Phase n and think about the tools and configurations.
```

## Proposed Project Directory Structure

This section outlines the anticipated directory structure for the `src` folder of the Zest library as it evolves through the development phases. This structure aims for modularity, clear separation of concerns, and maintainability.

```text
src/
├── reactivity/         # Core Proxy-based reactivity engine
│   ├── reactive.ts     # Main function to create reactive objects, subscription logic
│   ├── effect.ts       # (Later) For dependency tracking & effects (e.g., for getters)
│   └── index.ts        # Exports the public API of this module
│
├── store/              # Store definition, management, and core logic
│   ├── defineZestStore.ts  # The main `defineZestStore` function
│   ├── store.ts        # Internal logic for a single store instance
│   ├── storeRegistry.ts# Manages store instances (singleton pattern)
│   ├── types.ts        # TypeScript types specific to stores
│   └── index.ts        # Exports `defineZestStore` and related types
│
├── react/              # React integration hooks and utilities
│   ├── useStore.ts     # The primary hook (e.g., useZestStore or use[StoreName])
│   # Potentially other React-specific utilities or hooks
│   └── index.ts        # Exports the React hooks
│
├── devtools/           # DevTools Integration (e.g., with Redux DevTools Extension)
│   ├── connector.ts    # Logic to connect to DevTools
│   ├── formatters.ts   # Functions to format actions and state for DevTools
│   └── index.ts        # Main setup/initialization for DevTools integration
│
├── ssr/                # Server-Side Rendering (SSR) Support
│   ├── hydration.ts    # Client-side hydration logic
│   ├── serialization.ts# Server-side state serialization logic
│   └── index.ts        # Utilities and setup for SSR
│
├── plugins/            # Plugin System
│   ├── createPlugin.ts # API for users to create plugins
│   ├── pluginManager.ts# Internal logic to manage and apply plugins
│   └── index.ts        # Exports plugin creation API
│
├── types/              # Global TypeScript types and interfaces for the library
│   └── index.ts
│
├── utils/              # Common utility functions used across modules
│   └── index.ts        # (e.g., isObject, warning messages, type guards)
│
└── index.ts            # Main public entry point of the Zest library
                        # Re-exports the main user-facing APIs
```

This structure is a guideline and may be refined as development progresses and new requirements emerge.

## Phase 1: Core Reactivity, Dual Store Definitions & React Integration (MVP+)

**Goal:** Establish the fundamental reactive engine (including `ref` and `computed` primitives), the initial `defineZestStore` API supporting both **Options** and **Setup** syntaxes, and the core React hook integration.

**Estimated Time:** 2.5 - 4.5 months (Increased due to Setup Store support)

### Tasks:

1.  **Project Setup:**

    - [x] Initialize a new TypeScript project (e.g., using `npm init`, `yarn init`).
    - [x] Configure TypeScript (`tsconfig.json`) with strict settings.
    - [x] Set up a bundler (e.g., Rollup, esbuild, or Parcel) for library distribution.
    - [x] Set up a testing framework (e.g., Jest, Vitest).
    - [x] Set up linting (ESLint) and formatting (Prettier).
    - [x] Initialize a Git repository.

2.  **Reactive Core Enhancements (`src/reactivity/`):**

    - [x] Implement Proxy-based reactivity for plain objects (`reactive`).
    - [x] Implement `ref(initialValue)` for standalone reactive values, instrumented to trigger store updates.
    - [ ] Implement basic `computed(getterFunction)` for derived values (re-calculates on access initially), instrumented to integrate with store updates.
    - [x] Implement store-level change signaling mechanism (e.g., an internal `ref` or counter) triggered by mutations in reactive objects or `ref` updates.
    - [x] Trap `get` operations for dependency tracking (initially conceptual, for getters/computeds).
    - [x] Trap `set` operations to trigger notifications *and* the store-level change signal.
    - [x] Handle nested objects/arrays within `reactive`.
    - [x] Implement a subscription mechanism (`subscribe`) for direct reactivity (used internally and potentially by plugins).
    - [x] Unit tests for `ref`, `computed` (only ref tested), and change signal integration (tested via reactive/store tests).

3.  **Store Implementation (`src/store/`):**

    - [x] Design the internal structure for a single store instance, incorporating the change signal.
    - [x] Adapt `defineZestStore(id, options | setupFunction)` to handle both definition styles:
      - [x] **Options Store (`options` object):**
        - [x] `id`: Unique string identifier.
        - [x] `options.state`: Function returning the initial state object (wrapped with `reactive`).
        - [x] `options.actions`: Synchronous methods (using `this` bound to the store instance). Mutations trigger reactivity *and* the change signal.
        - [x] `options.getters`: Derived state (uses `computed` internally, implemented and tested).
      - [x] **Setup Store (`setupFunction`):**
        - [x] `id`: Unique string identifier.
        - [x] Call the setup function.
        - [x] User utilizes `ref`, `computed` (only ref tested), and regular functions within the setup function.
        - [x] The returned object properties (refs, computeds, functions) form the store's public interface.
        - [x] Ensure `ref` and `computed` usage within setup triggers the store's change signal correctly (verified for `ref`).
    - [x] Store registry: Internal mechanism for singleton instances per ID.

4.  **React Integration (`src/react/`):**

    - [x] Create the main hook (`useZestStore(storeHook)`) in `src/react/useZestStore.ts`.
    - [x] Modify `defineZestStore` to return an augmented hook function (`ZestStoreHook`) containing `$id` and `$changeSignal` properties needed by `useZestStore`.
    - [x] Hook retrieves the store instance and subscribes to changes using `useSyncExternalStore` (built-in for React 18+).
        - [x] `subscribe` function links to the specific store instance's **central change signal** (obtained via `storeHook.$changeSignal`).
        - [x] `getSnapshot` function returns the `changeSignal.value` to ensure React re-renders.
    - [x] Basic tests for component re-rendering on state change (verified via example app functionality).

5.  **Initial TypeScript Typing:**

    - [x] Basic generic types for `defineZestStore` to infer state type.
    - [x] Basic types for actions.
    - [x] Type the return value of the `useStore` hook.
    - [x] Refined type handling in `defineZestStore` to ensure correct type inference for Setup Store return types.

6.  **Simple Example Application:** (Setup Complete, Functionality Implemented & Tested)
    - [x] Create a very basic React app (e.g., using Vite or Create React App) to test the library.
    - [x] Implement a counter store and component.
    - [x] Resolved hook errors and UI reactivity issues.
    - [x] Significantly improved UI/UX.

## Phase 2: Getters, Async Actions & Improved Typing

**Goal:** Enhance stores with computed properties (getters) and support for asynchronous operations in actions. Significantly improve TypeScript inference.

**Estimated Time:** +1 - 2 months

### Tasks:

1.  **Getters (Computed Properties):**

    - [x] Add `options.getters` to `defineZestStore`.
    - [x] Getters should be functions that take `state` as an argument.
    - [x] Integrate getters into the store instance, making them accessible (e.g., `store.myGetter`).
    - [x] Ensure getters are reactive:
      - [x] Track dependencies (state properties accessed within the getter) using `computed`.
      - [x] Re-evaluate getters when their dependencies change (verified via tests).
    - [x] Unit tests for getters (calculation, reactivity, caching, fine-grained reactivity).

2.  **Asynchronous Actions:**

    - [x] Ensure `actions` can be `async` functions.
    - [x] State mutations within async actions (e.g., after an `await`) should still trigger reactivity correctly.
    - [x] No special handling needed if the reactive core and `this` binding are solid.
    - [x] Unit tests for async actions (e.g., fetching data and updating state) added and passing.

3.  **Advanced TypeScript Typing:**

    - [x] Refine `defineZestStore` generics for:
      - [x] Inferring state type `S`.
      - [x] Inferring getters type `G` (and their return types).
      - [x] Inferring actions type `A` (including parameters and return types of async functions).
    - [x] Ensure `this` context in actions and getters is correctly typed to `S & G & A` (or `Readonly<S> & G` for getters if state is not directly mutable from getters) - Verified for actions; keeping getters as `(state: S)`.
    - [x] Ensure the `useStore()` hook returns a fully typed store instance.
    - [x] Aim for "zero-configuration" type safety for users.
    - [x] Explore mapped types, conditional types, and `infer` to achieve this - Existing types verified as sufficient for now.

4.  **Example Application Updates:**
    - [x] Add examples demonstrating getters and async actions.

## Phase 3: DevTools Integration

**Goal:** Provide debugging capabilities by integrating with Redux DevTools Extension.

**Estimated Time:** +1 - 2 months

### Tasks:

1.  **Redux DevTools Connector:**

    - [x] Implement a utility (`src/devtools/connector.ts`) to connect to the DevTools (`enableZestDevTools`).
        - [x] Send initial state to DevTools on store creation (`_internal_initStoreState` called from `defineZestStore`).
        - [x] Send state snapshots and action information to DevTools for **Options Stores**:
            - [x] Capture action name and basic payload.
            - [x] Capture *global* state snapshot after action.
            - [x] Format messages according to Redux DevTools expected action format (`{ type: 'storeId/actionName', payload: ... }`).
        - [x] Send action/state updates for **Setup Stores** (by wrapping returned functions).
    - [x] Wrap or augment actions (for Options Stores) to automatically dispatch information.
    - [x] Wrap or augment functions returned by Setup Stores to automatically dispatch information.
    - [x] Consider how to name actions in DevTools (`storeId/actionName` format used).

2.  **State Snapshots & Time Travel:**

    - [x] Implement logic to capture serializable *global* state snapshots (`getGlobalZestStateSnapshot`).
    - [x] Implement logic to "jump" to a past state (Time Travel) (`_internal_resetStoreState` and subscriber logic).
    - [x] Ensure DevTools can display the (global) state tree (basic implementation).

3.  **DevTools Configuration:**

    - [x] Provide an easy way for users to enable DevTools integration (`enableZestDevTools(registry, options)`).
    - [x] Allow disabling in production (by conditional import/call in user code).

4.  **Example Application Updates:**
    - [x] Demonstrate DevTools integration in the example app (Initial connection & Options Store actions verified).

## Phase 4: SSR, Modularity & Plugins

**Goal:** Ensure the library is suitable for larger applications by adding SSR support, store modularity, and an extensibility mechanism.

**Estimated Time:** +1.5 - 2.5 months

### Tasks:

1.  **Server-Side Rendering (SSR) Support:**

    - [x] **Registry Scoping:** Implemented request-scoped registries (`createZestRegistry`, `setActiveZestRegistry`, `resetActiveZestRegistry`, `getActiveZestRegistry`) to prevent state sharing between requests on the server. `defineZestStore` now uses the active registry.
    - [x] **State Serialization:** Implemented `serializeZestState(registry)` (using `getGlobalZestStateSnapshot` internally) to capture the state of a specific registry (e.g., the request registry on the server) into a serializable format.
    - [x] **Client-Side Hydration:** Implemented `hydrateZestState(registry, snapshot)` to apply server state to client-side stores (typically the global registry) *before* React hydration, without triggering initial change signals.
    - [x] **Integration Pattern & Testing:** Successfully integrated and tested the SSR flow using Next.js (App Router) demonstrating the pattern:
        - Server Components manage the registry lifecycle for a request.
        - Server Components ensure store definitions run and access store instances *directly from the registry* for initial state setup.
        - Server Components serialize the state and pass it to Client Components.
        - Client Components use `hydrateZestState` on mount and then use standard Zest hooks (`useZestStore`) for reactive UI.   ''
    - [ ] ~~Test with a basic SSR setup (e.g., Next.js or a simple Express server).~~ (Covered by Next.js integration)
    - [ ] ~~Ensure `useSyncExternalStore` works correctly with hydrated state.~~ (Verified through Next.js integration)

2.  **Store Modularity & Lazy Loading:**

    - [ ] Ensure stores register on first use automatically (current behavior seems sufficient).
    - [ ] Verify seamless operation with code-splitting (dynamic imports in frameworks like Next.js/Vite).
    - [ ] Add specific examples/tests for lazy-loaded stores, ensuring correct hydration and DevTools interactions.
    - [ ] (Optional) Explore explicit API for manual store registration/unregistration if needed.

3.  **Plugin System:**

    - [ ] Design a plugin API:
      - [ ] Hooks into store lifecycle (e.g., `onStoreCreated`, `beforeAction`, `afterAction`).
      - [ ] Ability for plugins to extend store instances (add properties/methods).
      - [ ] Ability to subscribe to state changes globally or per store.
      - [ ] Consider plugin context (access to registry, store instance, etc.).
    - [ ] Implement the plugin registration mechanism (e.g., `zest.use(plugin)`).
    - [ ] Implement the plugin execution logic within `defineZestStore` and action wrappers.
    - [ ] Example Plugins:
      - [ ] Basic logger plugin.
      - [ ] Persistence plugin (e.g., sync to localStorage).

4.  **Namespacing/IDs Refinement:**
    - [ ] Solidify how store IDs are managed and ensure uniqueness (Documentation/Best Practices).
    - [ ] Consider implications for DevTools and plugins.

## Phase 5: Polish, Testing, Documentation & Advanced Features

**Goal:** Refine the library, ensure robustness through extensive testing, create comprehensive documentation, and consider advanced features.

**Estimated Time:** +2 - 4 months

### Tasks:

1.  **Advanced Reactivity Considerations (if needed):**

    - [ ] Investigate and implement memoization for getters if performance profiling indicates a need (e.g., using `proxy-memoize` concepts).
    - [ ] Implement full, robust reactivity for `Map` and `Set` collections, including their specific methods (e.g., `map.set()`, `set.add()`, `map.get()`, `set.has()`, iteration, `size` property).\
    - [ ] Enhance array reactivity to robustly handle all common mutation methods (e.g., `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`) ensuring notifications are triggered consistently and correctly for direct state and getters.
    - [ ] Ensure robust handling of `Symbol` keys for all reactive operations, including their use in iteration and consideration for DevTools visibility if appropriate.
    - [ ] Investigate and implement reactivity for `Date` objects if common use cases require it (e.g., ensuring mutations to Date objects trigger effects).
    - [ ] Address reactivity for non-enumerable properties if specific use cases arise or for improved DevTools inspection.
    - [ ] Handle other edge cases in reactivity if not fully covered by the above.

2.  **API Review and Refinement:**

    - [ ] Review all public APIs for clarity, consistency, and ease of use.
    - [ ] Gather feedback if possible.

3.  **Extensive Testing:**

    - [ ] **Unit Tests:** Increase coverage for all core modules, edge cases, and utilities.
    - [ ] **Integration Tests:** Test interactions between reactive core, store, and React hooks.
    - [ ] **End-to-End (E2E) Tests:** Test example applications thoroughly.
    - [ ] **Performance Tests:** Basic benchmarks for common operations (state update, getter evaluation, component re-render).
    - [ ] **SSR Tests:** Verify SSR and hydration scenarios.

4.  **Comprehensive Documentation:**

    - [ ] **Getting Started Guide:** Installation, basic usage.
    - [ ] **Core Concepts:** Reactivity, `defineZestStore`, state, getters, actions.
    - [ ] **API Reference:** Detailed documentation for all public functions and types.
    - [ ] **Advanced Guides:** SSR, DevTools, Plugins, TypeScript usage, best practices.
    - [ ] **Examples:** Multiple real-world (though simplified) examples.
    - [ ] **Comparison with other libraries** (similar to the design doc).
    - [ ] Set up a documentation website (e.g., using Docusaurus, VitePress).

5.  **Build and Packaging:**

    - [ ] Finalize bundler configuration for multiple formats (ESM, CJS, UMD if necessary).
    - [ ] Ensure proper generation and inclusion of `.d.ts` files.
    - [ ] Set up CI/CD for automated testing and publishing (e.g., GitHub Actions).
    - [ ] Optimize bundle size.

6.  **Community and Contribution Guidelines:**

    - [ ] Create `README.md` with project overview, installation, and contribution guide.
    - [ ] Set up `CONTRIBUTING.md`, Code of Conduct.
    - [ ] Create issue templates.

7.  **(Optional) Advanced Features/Future Considerations:**
    - [ ] Investigate React Signals integration as an alternative/addition to Proxies.
    - [ ] Batching updates for performance.
    - [ ] More sophisticated DevTools features (e.g., custom panel).
    - [ ] Direct state mutation with patches (like Immer).

This plan provides a structured approach. We can check off tasks as they are completed.

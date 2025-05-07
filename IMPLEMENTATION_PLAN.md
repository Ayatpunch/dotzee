# Zest: Implementation Plan

This document outlines the development phases and tasks for creating the Pinia-like reactive state library for React.

## Phase 1: Core Reactivity & Basic `defineStore` (MVP)

**Goal:** Establish the fundamental reactive engine and the initial `defineStore` API for basic state and synchronous actions.

**Estimated Time:** 1.5 - 3 months

### Tasks:

1.  **Project Setup:**
    *   [ ] Initialize a new TypeScript project (e.g., using `npm init`, `yarn init`).
    *   [ ] Configure TypeScript (`tsconfig.json`) with strict settings.
    *   [ ] Set up a bundler (e.g., Rollup, esbuild, or Parcel) for library distribution.
    *   [ ] Set up a testing framework (e.g., Jest, Vitest).
    *   [ ] Set up linting (ESLint) and formatting (Prettier).
    *   [ ] Initialize a Git repository.

2.  **Reactive Core (`@reactivity/core` or similar module):**
    *   [ ] Implement Proxy-based reactivity for plain objects.
        *   [ ] Trap `get` operations for dependency tracking (initially conceptual, for getters).
        *   [ ] Trap `set` operations to trigger notifications.
        *   [ ] Handle nested objects/arrays.
    *   [ ] Implement a subscription mechanism:
        *   [ ] `subscribe(callback)` function.
        *   [ ] Notify subscribers on state mutations.
    *   [ ] Basic unit tests for reactivity (object mutation, notification).

3.  **Store Implementation (`@store/core` or similar module):**
    *   [ ] Design the internal structure for a single store.
    *   [ ] Implement `defineStore(id, options)` function:
        *   [ ] `id`: Unique string identifier for the store.
        *   [ ] `options.state`: A function returning the initial state object.
        *   [ ] Create a reactive proxy for the state.
    *   [ ] Implement `options.actions`:
        *   [ ] Allow defining synchronous methods.
        *   [ ] Bind actions to the store instance so `this` refers to the state proxy.
        *   [ ] Mutations within actions should trigger the reactive core.
    *   [ ] Store registry:
        *   [ ] Internal mechanism to store and retrieve store instances by ID.
        *   [ ] Ensure singleton pattern for stores (per ID).

4.  **React Integration (`@react-hooks` or similar module):**
    *   [ ] Create the main hook (e.g., `useStore(storeDefinition)` or `use[StoreName]()` derived from `defineStore`):
        *   [ ] Retrieves or creates the store instance.
        *   [ ] Implements `useSyncExternalStore` to subscribe to store changes.
            *   [ ] `subscribe` function (passed to `useSyncExternalStore`) links to the store's subscription.
            *   [ ] `getSnapshot` function (passed to `useSyncExternalStore`) returns the current state (or a relevant part).
    *   [ ] Basic tests for component re-rendering on state change.

5.  **Initial TypeScript Typing:**
    *   [ ] Basic generic types for `defineStore` to infer state type.
    *   [ ] Basic types for actions.
    *   [ ] Type the return value of the `useStore` hook.

6.  **Simple Example Application:**
    *   [ ] Create a very basic React app (e.g., using Vite or Create React App) to test the library.
    *   [ ] Implement a counter store and component.

## Phase 2: Getters, Async Actions & Improved Typing

**Goal:** Enhance stores with computed properties (getters) and support for asynchronous operations in actions. Significantly improve TypeScript inference.

**Estimated Time:** +1 - 2 months

### Tasks:

1.  **Getters (Computed Properties):**
    *   [ ] Add `options.getters` to `defineStore`.
    *   [ ] Getters should be functions that take `state` as an argument.
    *   [ ] Integrate getters into the store instance, making them accessible (e.g., `store.myGetter`).
    *   [ ] Ensure getters are reactive:
        *   [ ] Track dependencies (state properties accessed within the getter).
        *   [ ] Re-evaluate getters when their dependencies change.
        *   [ ] (Consider initial implementation: re-evaluate on access if dependencies might have changed. Defer complex memoization).
    *   [ ] Unit tests for getters (calculation, reactivity).

2.  **Asynchronous Actions:**
    *   [ ] Ensure `actions` can be `async` functions.
    *   [ ] State mutations within async actions (e.g., after an `await`) should still trigger reactivity correctly.
    *   [ ] No special handling needed if the reactive core and `this` binding are solid.
    *   [ ] Unit tests for async actions (e.g., fetching data and updating state).

3.  **Advanced TypeScript Typing:**
    *   [ ] Refine `defineStore` generics for:
        *   [ ] Inferring state type `S`.
        *   [ ] Inferring getters type `G` (and their return types).
        *   [ ] Inferring actions type `A` (including parameters and return types of async functions).
    *   [ ] Ensure `this` context in actions and getters is correctly typed to `S & G & A` (or `Readonly<S> & G` for getters if state is not directly mutable from getters).
    *   [ ] Ensure the `useStore()` hook returns a fully typed store instance.
    *   [ ] Aim for "zero-configuration" type safety for users.
    *   [ ] Explore mapped types, conditional types, and `infer` to achieve this.

4.  **Example Application Updates:**
    *   [ ] Add examples demonstrating getters and async actions.

## Phase 3: DevTools Integration

**Goal:** Provide debugging capabilities by integrating with Redux DevTools Extension.

**Estimated Time:** +1 - 2 months

### Tasks:

1.  **Redux DevTools Connector:**
    *   [ ] Research Redux DevTools Extension API (`window.__REDUX_DEVTOOLS_EXTENSION__`).
    *   [ ] Implement a utility or a store plugin to connect to the DevTools.
    *   [ ] Send initial state to DevTools on store creation/connection.
    *   [ ] Send state snapshots and action information to DevTools:
        *   [ ] Capture action name and payload.
        *   [ ] Capture state before and after action (or just the diff).
        *   [ ] Format messages according to Redux DevTools expected action format (`{ type: 'storeId/actionName', payload: ... }`).
    *   [ ] Handle DevTools messages (e.g., for time-travel).

2.  **Action Patching/Interception (for DevTools):**
    *   [ ] Wrap or augment actions to automatically dispatch information to DevTools before and after execution.
    *   [ ] Consider how to name actions in DevTools (e.g., `counter/increment`).

3.  **State Snapshots & Time Travel:**
    *   [ ] Implement logic to capture serializable state snapshots.
    *   [ ] Implement logic to "jump" to a past state based on DevTools commands. This might involve re-setting the store's reactive proxy state. (This can be complex with direct mutation).
    *   [ ] Ensure DevTools can display the state tree.

4.  **DevTools Configuration:**
    *   [ ] Provide an easy way for users to enable DevTools integration (e.g., a setup function or a plugin).
    *   [ ] Allow disabling in production.

5.  **Example Application Updates:**
    *   [ ] Demonstrate DevTools integration in the example app.

## Phase 4: SSR, Modularity & Plugins

**Goal:** Ensure the library is suitable for larger applications by adding SSR support, store modularity, and an extensibility mechanism.

**Estimated Time:** +1.5 - 2.5 months

### Tasks:

1.  **Server-Side Rendering (SSR) Support:**
    *   [ ] Ensure `defineStore` can create fresh store instances per request on the server.
        *   [ ] Detect SSR environment (e.g., `typeof window === 'undefined'`).
        *   [ ] Mechanism for providing a request-specific context or scope for stores.
    *   [ ] State Serialization:
        *   [ ] Provide a utility to get the current state of all active stores in a serializable format (e.g., JSON).
    *   [ ] Client-Side Hydration:
        *   [ ] Provide a utility to initialize stores on the client with state serialized from the server.
        *   [ ] Ensure `useSyncExternalStore` works correctly with hydrated state.
    *   [ ] Test with a basic SSR setup (e.g., Next.js or a simple Express server).

2.  **Store Modularity & Lazy Loading:**
    *   [ ] Ensure stores register on first use automatically.
    *   [ ] Design for code-splitting: stores defined in dynamically imported chunks should work seamlessly.
    *   [ ] (Optional) Explore explicit API for manual store registration/unregistration if needed.

3.  **Plugin System:**
    *   [ ] Design a plugin API:
        *   [ ] Hooks into store lifecycle (e.g., on store creation, before/after action).
        *   [ ] Ability for plugins to extend store instances (add properties/methods).
        *   [ ] Ability to subscribe to state changes globally or per store.
    *   [ ] Implement the plugin registration and execution mechanism.
    *   [ ] Example Plugins:
        *   [ ] Basic logger plugin.
        *   [ ] Persistence plugin (e.g., sync to localStorage).

4.  **Namespacing/IDs Refinement:**
    *   [ ] Solidify how store IDs are managed and ensure uniqueness.
    *   [ ] Consider implications for DevTools and plugins.

## Phase 5: Polish, Testing, Documentation & Advanced Features

**Goal:** Refine the library, ensure robustness through extensive testing, create comprehensive documentation, and consider advanced features.

**Estimated Time:** +2 - 4 months

### Tasks:

1.  **Advanced Reactivity Considerations (if needed):**
    *   [ ] Investigate and implement memoization for getters if performance profiling indicates a need (e.g., using `proxy-memoize` concepts).
    *   [ ] Handle edge cases in reactivity (e.g., `Map`, `Set`, `Date`, non-enumerable properties, symbol keys) if not fully covered.

2.  **API Review and Refinement:**
    *   [ ] Review all public APIs for clarity, consistency, and ease of use.
    *   [ ] Gather feedback if possible.

3.  **Extensive Testing:**
    *   [ ] **Unit Tests:** Increase coverage for all core modules, edge cases, and utilities.
    *   [ ] **Integration Tests:** Test interactions between reactive core, store, and React hooks.
    *   [ ] **End-to-End (E2E) Tests:** Test example applications thoroughly.
    *   [ ] **Performance Tests:** Basic benchmarks for common operations (state update, getter evaluation, component re-render).
    *   [ ] **SSR Tests:** Verify SSR and hydration scenarios.

4.  **Comprehensive Documentation:**
    *   [ ] **Getting Started Guide:** Installation, basic usage.
    *   [ ] **Core Concepts:** Reactivity, `defineStore`, state, getters, actions.
    *   [ ] **API Reference:** Detailed documentation for all public functions and types.
    *   [ ] **Advanced Guides:** SSR, DevTools, Plugins, TypeScript usage, best practices.
    *   [ ] **Examples:** Multiple real-world (though simplified) examples.
    *   [ ] **Comparison with other libraries** (similar to the design doc).
    *   [ ] Set up a documentation website (e.g., using Docusaurus, VitePress).

5.  **Build and Packaging:**
    *   [ ] Finalize bundler configuration for multiple formats (ESM, CJS, UMD if necessary).
    *   [ ] Ensure proper generation and inclusion of `.d.ts` files.
    *   [ ] Set up CI/CD for automated testing and publishing (e.g., GitHub Actions).
    *   [ ] Optimize bundle size.

6.  **Community and Contribution Guidelines:**
    *   [ ] Create `README.md` with project overview, installation, and contribution guide.
    *   [ ] Set up `CONTRIBUTING.md`, Code of Conduct.
    *   [ ] Create issue templates.

7.  **(Optional) Advanced Features/Future Considerations:**
    *   [ ] Investigate React Signals integration as an alternative/addition to Proxies.
    *   [ ] Batching updates for performance.
    *   [ ] More sophisticated DevTools features (e.g., custom panel).
    *   [ ] Direct state mutation with patches (like Immer).

This plan provides a structured approach. We can check off tasks as they are completed. 
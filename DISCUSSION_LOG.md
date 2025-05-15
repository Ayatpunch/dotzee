# Dotzee: Discussion Log

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
  - Discussed naming conventions, opting for `defineDotzeeStore` to differentiate from Pinia while acknowledging its influence.
  - Defined core TypeScript types:
    - `StoreActions<S>`: For action definitions, ensuring `this` context is typed to the state `S`.
    - `DefineDotzeeStoreOptions<S, A>`: For the options object passed to `defineDotzeeStore`, including `state` factory and `actions`.
    - `StoreInstance<S, A>`: Representing the combined state and actions of a store instance.
    - `DotzeeStoreHook<S, A>`: Typing the hook function returned by `defineDotzeeStore`.
  - Implemented `defineDotzeeStore` function in `src/store/defineDotzeeStore.ts`:
    - Established an internal `storeRegistry` (Map) to manage store instances and ensure singleton behavior per ID.
    - Initial state is created via a factory function and made reactive using the `reactive()` utility.
    - Actions are bound to the reactive store instance, ensuring `this` inside actions refers to the combined state and actions object.
    - The function returns a hook (`() => storeInstance`) for accessing the store.
  - Created `src/store/types.ts` for type definitions and `src/store/index.ts` to export public APIs from the store module.
  - Updated the main library entry point `src/index.ts` to re-export store functionalities.
  - Iteratively developed and refined unit tests for `defineDotzeeStore` in `src/store/defineDotzeeStore.test.ts`:
    - Initial tests revealed issues with store instance composition (state not updating on instance), `this` context in actions (not referring to the full store), and reactivity for nested objects (subscriptions not triggering).
    - Refactored `defineDotzeeStore` to ensure the store instance itself is the reactive object and actions are correctly bound to this instance.
    - Updated `src/reactivity/reactive.ts` to correctly handle subscriptions to proxies of nested objects by resolving them to their original targets.
    - All unit tests for `defineDotzeeStore` are now passing, confirming correct state initialization, action behavior, reactivity, and singleton pattern.

- **Task 4: React Integration (`src/react/`)**
  - Discussed the main hook (`useDotzeeStore(storeHook)`). Although the actual file `src/react/useDotzeeStore.ts` isn't created yet, its conceptual requirements were addressed.
  - Modified `defineDotzeeStore` in `src/store/defineDotzeeStore.ts` to return an augmented hook function (`DotzeeStoreHook`).
  - This hook includes `$id` (string) and `$changeSignal` (a `Ref<number>`) properties.
  - The design anticipates that `useDotzeeStore` (when implemented) will use React 18's `useSyncExternalStore`.
    - The `subscribe` function for `useSyncExternalStore` will leverage `storeHook.$changeSignal` to listen for store updates.
    - The `getSnapshot` function will return the store instance obtained by calling `storeHook()`.
  - Unit tests for `defineDotzeeStore` were updated to verify the structure and content of the returned `DotzeeStoreHook`, including the presence and type of `$id` and `$changeSignal`.

- **Task 5: Initial TypeScript Typing**
  - Reviewed the existing TypeScript implementation in `src/store/types.ts` and `src/store/defineDotzeeStore.ts`.
  - Confirmed that basic generic types for `defineDotzeeStore` are in place:
    - For Options Stores: `defineDotzeeStore<Id extends string, S extends object, A extends StoreActions<S>>(id, options)` infers state type `S` and action types `A`.
    - For Setup Stores: `defineDotzeeStore<Id extends string, R extends SetupStoreReturnType>(id, setup)` infers the return type `R`.
  - `StoreActions<S>` provides basic typing for actions within Options Stores.
  - The `DotzeeStoreHook<T>` type correctly types the augmented hook function, ensuring the store instance returned by `useStore()` (e.g., `const store = useCounterStore()`) is properly typed.
  - Current unit tests in `defineDotzeeStore.test.ts` implicitly validate these initial typings, as they pass TypeScript checks.
  - Marked Task 5 as complete in `IMPLEMENTATION_PLAN.md`.

- **Task 6: Example Application UI & Reactivity**
  - Implemented `useDotzeeStore` in `src/react/useDotzeeStore.ts` using `useSyncExternalStore` and `subscribeRef`.
  - Updated `CounterOptions.tsx` and `CounterSetup.tsx` in the example app to use `useDotzeeStore`.
  - **Debugging Invalid Hook Call:**
    - Encountered "Invalid hook call" errors in the example app.
    - Identified the cause as multiple React instances due to the library not marking `react` and `react-dom` as external in its `esbuild` configuration.
    - Updated `package.json` build scripts (`build:esm`, `build:cjs`) to include `--external:react` and `--external:react-dom`.
    - Rebuilt the library, resolving the hook call error.
  - **Fixing UI Reactivity:**
    - After fixing the hook call error, the UI was still not updating on state change.
    - Identified that `useSyncExternalStore`'s `getSnapshot` returning the store instance itself (which didn't change reference) caused React to bail out of re-renders.
    - Modified `getSnapshot` in `src/react/useDotzeeStore.ts` to return the `changeSignal.value` instead. This ensured the snapshot value changed, forcing React to re-render.
    - The UI in the example app now updates correctly.
  - **Example Application UI Overhaul:**
    - Completely revamped the UI of `dotzee-example-app` for a modern and professional look.
    - Implemented a new color scheme with dark mode support.
    - Redesigned counter components as visually distinct cards with hover effects, gradient highlights, and type badges.
    - Added animations for count changes and button clicks (ripple effect).
    - Improved overall layout, typography, and added decorative background elements and a footer.
    - Ensured proper centering and responsive design.

- **Debugging TypeScript Errors in Example App:**
    - Encountered TypeScript errors in `dotzee-example-app/src/components/CounterSetup.tsx` when using `useDotzeeStore`.
    - Errors indicated that properties like `.value` and action methods were not recognized on the `counter` instance returned by `useDotzeeStore(useCounterSetupStore)`.
    - Identified the root cause: The implementation signature and internal logic of `defineDotzeeStore` were losing the specific inferred return type (`R`) of the setup function, defaulting to the broader `StoreInstanceType`.
    - Resolved by:
        - Making `SetupStoreFunction` generic (`SetupStoreFunction<R>`) in `src/store/types.ts` to capture the specific return type `R`.
        - Updating the setup store overload and the implementation signature of `defineDotzeeStore` in `src/store/defineDotzeeStore.ts` to correctly use `SetupStoreFunction<R>`.
        - Adjusting internal type casts within `defineDotzeeStore` to ensure the specific type `R` (for setup stores) or `StoreInstance<S, A, G>` (for options stores) was preserved and returned in the `DotzeeStoreHook`.
    - Confirmed that the TypeScript errors in the example application are now resolved.

## Phase 2: Getters, Async Actions & Improved Typing

- **Task 1: Getters (Computed Properties)**
  - Reviewed the current implementation of getters for Options Stores (`defineDotzeeStore` processing `options.getters`).
  - Confirmed that the existing implementation utilizes the `computed` primitive from `src/reactivity/computed.ts`.
  - Analyzed how `computed`, combined with `track` and `trigger` in the `reactive` core, should already provide the intended fine-grained reactivity (getters re-evaluating only when their specific state dependencies change) and caching.
  - Existing tests cover basic calculation, reactivity, caching, and access within actions.
  - Concluded that the main work for this task is to add *specific unit tests* to rigorously verify the fine-grained dependency tracking and selective re-evaluation of getters, ensuring they don't re-run unnecessarily when unrelated state changes.
  - Decided against implementing `this` access within getters for now, keeping the simpler `(state) => value` signature.

- **Task 2: Asynchronous Actions**
  - Discussed the requirement for supporting `async` actions in both Options and Setup stores.
  - Confirmed the hypothesis that the existing reactivity system (`Proxy` traps and `ref` setters) and `this` binding should inherently handle state mutations after `await` without core modifications.
  - Added unit tests to `src/store/defineDotzeeStore.test.ts` specifically covering:
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
  - Added specific type-checking tests to `src/store/defineDotzeeStore.test.ts`:
    - Verified `this` context in Options Store actions (accessing state, getters, other actions).
    - Verified inference of `async` action return types.
    - Verified the `useDotzeeStore` hook returns a fully typed store instance.
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

## Phase 3: DevTools Integration

- **Task 1: Redux DevTools Connector & Integration**
  - Created `src/devtools/connector.ts` to manage interactions with the Redux DevTools Extension.
  - Implemented `enableDotzeeDevTools(storeRegistryInstance, options)`:
    - Detects and connects to `window.__REDUX_DEVTOOLS_EXTENSION__`.
    - Stores a reference to the application's main Dotzee store registry.
    - Subscribes to messages from the DevTools extension.
  - Implemented `disconnectDotzeeDevTools()` for cleanup.
  - Added `isDotzeeDevToolsEnabled()` to check connection status.
  - Implemented `getGlobalDotzeeStateSnapshot()`:
    - Iterates through the provided store registry.
    - Serializes the state of each store, correctly handling differences between Options and Setup stores using metadata (`isSetupStore`, `initialStateKeys`) stored in the registry entry.
    - For Setup Stores, unwraps `ref` values and excludes functions.
    - For Options Stores, uses `initialStateKeys` to extract only state properties.
  - Implemented `_internal_resetStoreState(entry, targetStoreState)` for time travel:
    - Resets the state of an individual store based on a snapshot.
    - For Setup Stores, updates `ref.value`.
    - For Options Stores, directly assigns state (relying on Proxy for reactivity).
    - Triggers the store's `changeSignal` to notify React components of the state change.
  - Updated the `connection.subscribe` callback in `enableDotzeeDevTools`:
    - Listens for `DISPATCH` messages with `payload.type` of `JUMP_TO_STATE` or `JUMP_TO_ACTION`.
    - Parses `message.state` (JSON string of global state) into an object.
    - Calls `_internal_resetStoreState` for each relevant store in the snapshot.

- **Task 2: Action Patching/Interception & State Snapshots**
  - Modified `StoreRegistryEntry` type in `src/store/types.ts` to include `isSetupStore: boolean` and `initialStateKeys?: string[]`.
  - Updated `defineDotzeeStore` in `src/store/defineDotzeeStore.ts`:
    - To populate `isSetupStore` and `initialStateKeys` in the `StoreRegistryEntry` upon store creation.
    - To call `_internal_initStoreState` if DevTools are enabled.
      - `_internal_initStoreState` sends a `@@DOTZEE_INIT/${storeId}` action and the global state snapshot to DevTools.
    - To wrap functions for DevTools reporting:
      - **Options Stores:** Original actions in `options.actions` are wrapped. The wrapper calls the original action, then (after promise resolution for async actions) calls `_internal_sendAction` with the store ID, action name, payload, and the (now unused) store instance.
      - **Setup Stores:** Functions returned by the setup function are similarly wrapped. The wrapper calls the original function, then (after promise resolution) calls `_internal_sendAction`.
      - `_internal_sendAction` formats the action (e.g., `storeId/actionName`) and sends it with the full current global state snapshot (obtained via `getGlobalDotzeeStateSnapshot()`) to DevTools.

- **Task 3: DevTools Configuration & Example App**
  - Exported the internal `storeRegistry` (as `_internal_storeRegistry`) from the library's main entry point (`src/index.ts`) for application-level setup.
  - Created `src/devtools/index.ts` to export public DevTools utilities (`enableDotzeeDevTools`, etc.).
  - Updated `dotzee-example-app/src/main.tsx` to:
    - Import `enableDotzeeDevTools` and `_internal_storeRegistry`.
    - Call `enableDotzeeDevTools(_internal_storeRegistry, { name: 'Dotzee Example App', trace: true })` conditionally in development mode (`import.meta.env.MODE === 'development'`).
  - **Testing & Verification:**
    - Confirmed successful connection to Redux DevTools browser extension.
    - Verified initial state reporting for both Options and Setup stores.
    - Verified action logging (e.g., `counterOptions/increment`, `counterSetup/increment`) and state updates for both store types.
    - Confirmed Time Travel functionality (jumping to past states) correctly updates the example application's UI.
  - Decided that explicit disabling of DevTools *within the library* for production builds is not strictly necessary, as conditional import/call by the user (as done in example app) is sufficient. The `typeof window === 'undefined'` check already prevents server-side execution of connection logic.

## Phase 4: SSR, Modularity & Plugins

- **Task 1: Server-Side Rendering (SSR) Support**
  - **Registry Scoping:**
    - Identified the global `storeRegistry` as a potential issue for concurrent requests in SSR environments.
    - Created `src/store/registry.ts` introducing the concept of multiple registries (global vs. active/request-scoped).
    - Implemented `createDotzeeRegistry`, `setActiveDotzeeRegistry`, `resetActiveDotzeeRegistry`, `getActiveDotzeeRegistry`, and `getGlobalDotzeeRegistry` functions to manage registry instances.
    - Refactored `defineDotzeeStore` to use `getActiveDotzeeRegistry()` implicitly, allowing store definitions to work within the context of the currently active registry (set per request on the server).
    - Updated DevTools connector functions (`getGlobalDotzeeStateSnapshot`, `_internal_initStoreState`, `_internal_sendAction`, time travel logic) to accept or use the appropriate registry instance.
    - Fixed resulting test failures in `defineDotzeeStore.test.ts` by explicitly using `getGlobalDotzeeRegistry` in tests where a specific registry wasn't activated.
  - **Hydration & Serialization:**
    - Created `src/ssr/hydration.ts` with `hydrateDotzeeState` and its helper `_internal_hydrateStoreState`. This function applies a server-provided state snapshot to a client-side registry (typically the global one) *without* triggering the `$changeSignal`, preventing unnecessary re-renders during initial hydration.
    - Created `src/ssr/serialization.ts` with `serializeDotzeeState`. This function uses `getGlobalDotzeeStateSnapshot` internally to capture the current state of a given registry (e.g., the request-specific registry on the server) into a serializable JSON format.
    - Exported these functions via `src/ssr/index.ts` and the main library entry point (`src/index.ts`).
    - Fixed export errors related to the `DotzeeRegistry` type and `getGlobalDotzeeRegistry`.
  - **SSR Testing (Vite Attempt - Aborted):**
    - Initially attempted to test SSR integration within the existing Vite-based `dotzee-example-app`.
    - Installed `express` and created basic server (`server.js`), entry (`entry-server.tsx`, `entry-client.tsx`), and modified `index.html` / `package.json` for SSR builds/scripts.
    - Encountered persistent errors during server execution (`node server.js`):
        - `path-to-regexp` related errors, potentially from Vite/Express routing interactions (attempts to fix with different route handlers failed).
        - `Module not found: dotzee` errors despite rebuilding library, trying relative path dependencies (`file:../`), and removing Turbopack flags.
    - Decided to abandon the Vite SSR attempt due to these blocking issues and switch to a framework with more established SSR patterns (Next.js).
  - **SSR Testing (Next.js - Successful):**
    - Reverted SSR-related changes in the Vite example app.
    - Created a new example project `dotzee-next-example` using `create-next-app` with the App Router.
    - Linked the `dotzee` using a relative file path dependency (`"dotzee": "file:../"`) in `package.json` after initial linking issues, requiring a library rebuild.
    - Implemented the recommended SSR pattern for App Router:
        - **`app/page.tsx` (Server Component):**
            - Creates a new registry for the request (`createDotzeeRegistry`).
            - Activates this registry (`setActiveDotzeeRegistry`).
            - Ensures the relevant store definition (`useCounterOptionsStore`) runs within the server context, registering the store in the request-scoped registry.
            - Accesses the store instance *directly* from the registry (e.g., `registry.get('counterOptions')`) to potentially set initial state (though not done in the basic example).
            - Serializes the state from the request registry (`serializeDotzeeState`).
            - Resets the active registry (`resetActiveDotzeeRegistry`) before sending the response.
            - Passes the serialized state as a prop to a Client Component.
        - **`app/ClientPage.tsx` (Client Component):**
            - Receives the `initialDotzeeState` prop.
            - Uses `useEffect` (running only once on mount) to:
                - Get the client-side global registry (`getGlobalDotzeeRegistry`).
                - Call `hydrateDotzeeState` with the global registry and the received `initialDotzeeState`.
                - Optionally enable DevTools (`enableDotzeeDevTools`).
            - Uses the standard `useDotzeeStore(useCounterOptionsStore)` hook to access the store reactively for the UI.
    - Refactored `ClientPage.tsx` into a `components/` directory for better structure.
    - Debugged and fixed an error where `getGlobalDotzeeRegistry` wasn't exported correctly by adjusting exports in `src/store/index.ts` and rebuilding the library.
    - Implicitly confirmed the correct pattern avoids calling React hooks like `useDotzeeStore` in Server Components, resolving potential `useSyncExternalStore` errors in that context.
    - Successfully verified the SSR flow: state rendered on the server, hydrated on the client without flicker, and subsequent interactions were reactive. DevTools integration also worked correctly after hydration.
    - Marked Phase 4, Task 1 (SSR Support) as complete in `IMPLEMENTATION_PLAN.md`

      We've successfully implemented and confirmed SSR functionality with Next.js App Router, following the recommended pattern:

      1. In Server Components:
        - Create a new registry for each request
        - Access stores directly from the registry
        - Serialize state and pass to Client Components

      2. In Client Components:
        - Receive serialized state as props
        - Hydrate on mount using `useEffect`
        - Use standard Dotzee hooks for reactivity

      This approach correctly separates server and client responsibilities, avoids calling React hooks in Server Components, and ensures a smooth hydration process. The implementation in the `dotzee-next-example` project serves as a solid reference implementation.


      While implementing the Next.js example application, we encountered styling issues with Tailwind CSS v4. The dark mode alpha transparency notations (like `dark:bg-purple-900/30`) weren't rendering correctly.

      **Solution:** Downgraded from Tailwind CSS v4 to v3, which fully supports the alpha transparency notation in both light and dark modes. This resolved all styling inconsistencies in the example application.

      **Impact:** The example application now correctly showcases the library with proper styling in both light and dark modes, with all badge components displaying the intended alpha transparency effects.

- **Task 2: Store Modularity & Lazy Loading**
  - **Automatic Registration:** Confirmed that stores register on first use automatically due to `defineDotzeeStore` checking the active registry and creating the store if the ID is new. Marked as complete.
  - **Code-Splitting Compatibility:** Verified seamless operation with code-splitting using the `dotzee-next-example`. The `FeatureComponent` (lazy-loaded) successfully uses `useFeatureStore` (defined in `featureStore.ts`, also effectively lazy-loaded). The library's design allows store definitions to reside in dynamically imported chunks and register correctly upon load. Marked as complete.
  - **Examples for Lazy-Loaded Stores:** The `dotzee-next-example` (with `FeatureComponent` and `featureStore`) serves as a concrete example.
  - **DevTools Interaction for Lazy Stores:** Manually verified that the lazy-loaded `featureStore` in `dotzee-next-example` correctly integrates with DevTools:
    - Appears in DevTools upon component load.
    - Initial state is correctly reported.
    - Actions (`setMessage`, `increment`) are logged with correct state updates.
    - Time travel functions as expected.
  - **SSR Hydration for Lazy-Loaded Stores with Server State (Hydration Gap):**
    - Identified a gap: The current global `hydrateDotzeeState` pattern is for eagerly known stores. It doesn't inherently cover hydrating a lazy-loaded store that needs initial state from the server.
    - **Option A (Current Documented Pattern):** Agreed to document a pattern where:
        1. Server fetches/determines the specific initial state for the lazy store.
        2. This state is passed as props to the lazy-loaded component.
        3. The lazy-loaded component, upon mounting, uses a dedicated action on its own store to initialize itself from these props. The store definition must include such an action.
    - **Option B (Future Enhancement):** Planned for Phase 5 to implement a more integrated library solution (`Enhanced SSR Hydration for Lazy-Loaded Stores`) where `hydrateDotzeeState` could handle pending hydration data for stores defined later.
  - **Automated Tests:** Specific automated tests for lazy-loading scenarios (hydration, DevTools) are deferred to Phase 5.
  - **Manual Store Registration/Unregistration API:** Confirmed as optional and deferred, as the current auto-registration is sufficient.

- **Task 3: Plugin System (Design Discussion)**
  - **Goal:** To create an extensible plugin system allowing users to hook into store lifecycles and actions.
  - **Core Concepts:**
    - **`Plugin` Interface:**
      ```typescript
      interface Plugin {
          name: string; // For identification and debugging
          install: (context: PluginContextApi) => void;
      }
      ```
    - **`PluginContextApi` (Provided to `plugin.install`)**:
      ```typescript
      interface PluginContextApi {
          onStoreCreated: (callback: (context: StoreCreatedContext) => void) => void;
          beforeAction: (callback: (context: ActionContext) => void) => void; // Args are read-only
          afterAction: (callback: (context: AfterActionContext) => void) => void;
          extendStore: <T extends StoreInstanceType, E extends Record<string, any>>(storeInstance: T, extension: E) => void; // Powerful, use with caution
          getStoreStateSnapshot: (storeInstance: StoreInstanceType) => Record<string, any>; // Uses new internal utility
      }
      ```
    - **Context Objects for Callbacks:**
        - `StoreCreatedContext`: `{ storeEntry: StoreRegistryEntry<StoreInstanceType> }`
        - `ActionContext`: `{ storeEntry: StoreRegistryEntry<StoreInstanceType>; actionName: string; args: readonly any[] }`
        - `AfterActionContext`: `{ storeEntry: StoreRegistryEntry<StoreInstanceType>; actionName: string; args: readonly any[]; result?: any; error?: any }`
  - **Plugin Registration:**
    - An internal `dotzeePlugins: Plugin[]` array.
    - A public `useDotzeePlugin(plugin: Plugin)` function:
        - Adds the plugin to the `dotzeePlugins` array.
        - Immediately calls `plugin.install(pluginContextApi)` where `pluginContextApi` is a single, shared, read-only object containing methods to register callbacks.
  - **Internal Notification Functions (e.g., `_notifyStoreCreated`)**:
    - These functions will iterate over the registered plugin callbacks (`onStoreCreatedCallbacks`, `beforeActionCallbacks`, etc.) and execute them, wrapped in `try...catch` blocks to isolate plugin errors.
  - **Integration into `defineDotzeeStore`:**
    - **`_notifyStoreCreated(registryEntry)`:** Called after the base `storeInstance` and `registryEntry` are created. This allows plugins to `extendStore` before the store is fully registered or seen by DevTools.
    - **DevTools Initial State:** `_internal_initStoreState` will be called *after* `_notifyStoreCreated`. It will use a new utility `getStoreStateSnapshotInternal(registryEntry.instance, ...)` to capture the snapshot, ensuring that any stateful properties added by plugins during `onStoreCreated` are included in the initial DevTools view.
  - **Integration into Action Wrappers (in `defineDotzeeStore`):**
    - The sequence for wrapped actions will be:
        1. `_notifyBeforeAction(context)`
        2. Original action execution (with `try...catch` and `await` for async).
        3. `_notifyAfterAction(context)` (passing result or error).
        4. DevTools `_internal_sendAction(...)` (capturing state *after* plugin hooks).
        5. Re-throw error if one occurred during the original action.
  - **New Utility: `getStoreStateSnapshotInternal`:**
    - `getStoreStateSnapshotInternal(instance: StoreInstanceType, isSetupStore: boolean, initialStateKeys?: string[]): Record<string, any>`
    - This utility centralizes logic for creating a serializable snapshot of a store instance, correctly unwrapping refs for setup stores and using `initialStateKeys` to filter state for options stores. It will be used by `PluginContextApi.getStoreStateSnapshot` and for preparing snapshots for DevTools.
  - **`extendStore` Considerations:**
    - Acknowledged as powerful but potentially risky. Users would need TypeScript augmentation for full type safety of extensions.
    - Should primarily be used within `onStoreCreated`.
  - **Next Steps for Plugin System:** Proceed with implementing the defined API, registration mechanism, notification functions, and integrating them into `defineDotzeeStore` and action wrappers. Then, create example plugins (logger, persistence).

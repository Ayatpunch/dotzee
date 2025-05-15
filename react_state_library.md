# Dotzee: A Pinia-like Reactive State Library for React

## Overview & Goals

We propose building a **TypeScript-based** state management library for React that emulates Vue/Pinia's reactivity and developer experience. It will use a **Proxy-based** reactivity core (with an eye on future React Signals), a **composition-friendly API** (akin to Pinia's `defineStore`), and robust **DevTools integration**. Key goals include strong type safety (full generics and inference), support for apps of all sizes (modular stores, lazy loading, SSR), and intuitive patterns for actions and computed state. We will leverage React 18's new hooks (like `useSyncExternalStore`) for subscriptions, and provide a smooth developer experience with autocompletion, hot-reloading, and debugging tools. The library's architecture will explicitly address:

- **Reactivity System**: A Proxy-based reactive store (fine-grained updates) vs. possible Signal abstraction.
- **Store Structure**: Composition-style stores (`defineDotzeeStore` or similar), modularization, lazy registration, and SSR-safe instantiation.
- **Actions & Derived State**: Store methods (actions) for mutations, and getters/computed values for derived data.
- **Type Safety**: Full TypeScript support, leveraging generics so state and actions are strongly typed with perfect IDE completion.
- **DevTools**: Integration (e.g. via Redux DevTools API or custom React DevTools plugin) to inspect state trees, actions, and enable time-travel debugging.

These design choices aim to match Pinia's feel: _"Type Safe, Extensible, and Modular by design"_, with stores that are as "familiar as components" and fully auto-completed.

## Reactivity Model

We will use a **Proxy-based reactive core** for state objects, inspired by Vue 3 and libraries like Valtio. JavaScript's `Proxy` lets us trap get/set operations and notify subscribers on mutations, enabling **fine-grained reactivity**. Vue 3's reactivity (and hence Pinia's) relies on this, giving granular change detection and efficient updates. Likewise, Valtio makes any JS object "self-aware" via Proxy, yielding _"fine-grained subscription and reactivity when making state updates"_. This model avoids diffing whole objects on each change, so only components that access a changed property re-render.

Alternatively, we'll consider a **Signal-based** fallback or future mode. Signals (as in React Signal libraries or SolidJS) also offer fine-grained updates. Signals are independent of React components (they "exist outside the component lifecycle") and only update dependents, avoiding stale props or effect dependencies. As one article notes, Signals provide _"fine-grained reactivity: only components or functions that directly depend on a signal are updated"_, which improves performance for interactive UIs. However, native React Signals are not yet standard (as of 2025), so our initial design will focus on proxies, possibly layering signals later for individual fields.

**Integration with React:** We will hook our reactive store into React using `useSyncExternalStore` (introduced in React 18). This hook safely subscribes to external (non-React) data sources. For example, Valtio's `useSnapshot` is built on `useSyncExternalStore`: one defines a subscribe callback and a snapshot-read function, then uses `useSyncExternalStore(subscribe, getSnapshot)` to pull state into React components. We will emulate this pattern so that React components can `const state = useStore()` and automatically re-render when the relevant state changes. This leverages React's new concurrent-safe subscription mechanism.

**Choice Justification:** Proxy-based reactivity has proven efficient in Vue 3 and in libraries like Valtio. It aligns well with a composition-style store. Signals are promising for even finer granularity, but to start we will use Proxies (with possibility to integrate Signals internally later). In summary, our store state will be a Proxy object that tracks property reads/writes, notifying React via subscriptions. This yields fast updates and lets us implement computed getters that automatically recalc.

## Store API and Structure

### Composition-Friendly Stores with Dual Syntax

We will provide a **`defineDotzeeStore`** API (similar to Pinia's `defineStore`) for creating stores, supporting **two distinct syntaxes** for flexibility:

1.  **Options Store (Object-based):**
    Similar to Vue's Options API, users provide an object with `state`, `actions`, and `getters` properties.

    ```ts
    // Example Options Store
    export const useCounterStore = defineDotzeeStore('counter', {
      state: () => ({ count: 0 }),
      actions: {
        increment() {
          this.count++; // 'this' refers to the store instance
        },
      },
      getters: {
        // Getters will be implemented later, likely using 'computed' internally
        doubleCount: (state) => state.count * 2,
      },
    });
    ```

    *   `state`: A function returning the initial state object (becomes reactive).
    *   `actions`: Methods where `this` is bound to the store instance (state + actions + getters).
    *   `getters`: Computed properties derived from state.

2.  **Setup Store (Function-based):**
    Similar to Vue's Composition API setup function, users provide a function where they define reactive state (`ref`), computed values (`computed`), and methods. The function returns an object containing the properties and methods to expose.

    ```ts
    import { ref, computed } from 'dotzee'; // Assuming these are exported from our library

    // Example Setup Store
    export const useCounterStore = defineDotzeeStore('counterSetup', () => {
      // Reactive state
      const count = ref(0);

      // Computed value (derived state)
      const doubleCount = computed(() => count.value * 2);

      // Action/Method
      function increment() {
        count.value++;
      }

      // Expose public API
      return { count, doubleCount, increment };
    });
    ```

    *   Requires importing and using `ref` and `computed` from our library.
    *   `ref()` creates standalone reactive state properties.
    *   `computed()` creates derived reactive getters.
    *   `function()` defines actions/methods.
    *   Only the returned properties are exposed by the store.
    *   Avoids the use of `this` for state manipulation.

Each store, regardless of definition style, is a **singleton instance** (unless re-created for SSR) keyed by its unique ID. Components call the returned hook (e.g., `useCounterStore()`) to access that store's state and actions.

### Store Lifecycle & Modularization

- **Registration and Lazy Loading:** Stores will register on first use. Supports dynamic import for code splitting.

- **Namespacing/IDs:** Each store has a unique name. Internally we keep a registry mapping names to store instances. If a store is defined in code-splitted chunks, the first call to `useStore()` for that name will load/create it.

- **SSR Support:** For server-side rendering, we must avoid shared mutable state across requests. Thus `defineDotzeeStore` will detect SSR mode and create a fresh store instance per request (or context). Pinia supports SSR safely, and we'll similarly instantiate stores on demand on the server. After rendering, the server can serialize the store's state and hydrate it on the client. On the client, we'll check if there's preloaded state (hydration) to populate initial store values. This ensures no data leaks between users.

- **Provider/Context (optional):** Unlike Redux, we may not need a single Provider since stores can be used via hooks globally. However, we can offer an optional `<StoreProvider>` for bundling all stores or for scoped contexts (e.g., per-tenant data). Support for React Context can help with tree-shaking or multiple store roots, if needed.

- **Plugins/Extensions:** Similar to Pinia's plugin hooks, we will allow plugins to hook into stores. For example, a persistence plugin can subscribe to store changes and save to localStorage. Or a logging plugin can instrument actions. This is facilitated by allowing interceptors around actions or state mutations (e.g. a hook before/after each action, or a `subscribe` API on the store).

### Store Example

Using the Options Store example:

```jsx
// counterStore.ts - Defined using Options Store syntax
export const useCounterStore = defineDotzeeStore('counter', { /* ... as above ... */ });

// CounterComponent.tsx
import { useCounterStore } from './counterStore';

function Counter() {
  const counter = useCounterStore(); // hooks into the reactive store
  return (
    <div>
      <div>Count: {counter.count}</div>
      {/* <div>Double: {counter.doubleCount}</div> */}
      {/* Getters TBD */}
      <button onClick={() => counter.increment()}>Increment</button>
    </div>
  );
}
```

Using the Setup Store example:

```jsx
// counterSetupStore.ts - Defined using Setup Store syntax
import { ref, computed } from 'dotzee';
export const useCounterSetupStore = defineDotzeeStore('counterSetup', () => { /* ... as above ... */ });

// CounterSetupComponent.tsx
import { useCounterSetupStore } from './counterSetupStore';

function CounterSetup() {
  const counter = useCounterSetupStore();
  return (
    <div>
      {/* Access ref state via .value */}
      <div>Count: {counter.count.value}</div>
      {/* Access computed via .value */}
      <div>Double: {counter.doubleCount.value}</div>
      <button onClick={counter.increment}>Increment</button>
    </div>
  );
}
```

In both cases, reading reactive state (`counter.count` or `counter.count.value`) and derived state (`counter.doubleCount.value`) tracks dependencies. Mutations trigger updates via the `useSyncExternalStore` hook.

## Actions and Derived (Computed) State

### Actions

- **Options Stores:** Actions are methods defined in the `actions` object. They operate on the store instance via `this`.
- **Setup Stores:** Actions are regular functions defined within the setup function. They typically operate on `ref` variables directly (e.g., `count.value++`).

### Derived State (Getters/Computed)

- **Options Stores:** Defined in the `getters` object. These will likely use the `computed` primitive internally for reactivity and caching (eventually).
- **Setup Stores:** Defined using the `computed()` function imported from the library, wrapping a getter function.

Both approaches rely on the underlying reactivity system to ensure derived values update when their dependencies change.

## Type Safety and Developer Ergonomics

Our library will be **TypeScript-first**. We aim for full type inference so that users get IDE autocompletion on state, actions, and getters without writing extra types. Pinia boasts that "types are inferred, which means stores provide you with autocompletion even in JavaScript!" Similarly, we will use TS generics and `as const` patterns to infer store shapes.

Concretely, `defineDotzeeStore` can be a generic factory, e.g. `defineDotzeeStore<S, G, A>(name: string, options: StoreOptions<S, G, A>)` where `S` is the state type, `G` derived getters, `A` action functions. TypeScript will infer `S` and `G` from the `state` and `getters` definitions. Actions will be bound so that `this` has type `S & G & A`. This is like how Vue's Composition API infers `ref` types.

We will take advantage of TypeScript's latest features (mapped types, template literal types if needed) to ensure that store usage is strongly typed. For example, if a state field is `count: number`, then `store.count` is known as number. If an action is defined as `(payload: string) => void`, TS will infer that signature on `store.myAction`. We can reference Pinia's TS support as inspiration.

Also, our codebase will be written in TS with strict mode (strictNullChecks, noImplicitAny). We'll export full declaration files. We'll encourage good editor integration so that `useStore()` calls get typed return values with auto-import suggestions. Overall, the dev ergonomics will be similar to using well-typed React hooks.

## DevTools Integration

A core goal is seamless debugging: _"The Redux DevTools make it easy to trace when, where, why, and how your application's state changed"_. We want similar capability. Our plan:

- **Redux DevTools Extension:** We will hook into the Redux DevTools protocol. Many React state libraries do this. For example, Valtio provides a simple `devtools(proxyState, options)` utility which connects the proxy state to the Redux DevTools Extension. We can adopt a similar strategy: publish each action/mutation as a Redux-style action, and send full state snapshots to the extension. This yields a familiar UI showing action history, diffing, and even time-travel controls.

- **Custom React DevTools Panel (Optional):** If feasible, we could also integrate with React DevTools by creating a custom hook that registers our stores. However, React DevTools currently only exposes component state/props out of the box, not arbitrary stores. A more straightforward approach is to utilize the Chrome/Redux DevTools API, which lets us create an "AppState" instance with a slider (time-travel).

- **Action Logging & Plugins:** Within the library, we will allow a devtools plugin to intercept actions. For example, before and after each action runs, we can log to the devtools plugin. We will include metadata (store name, timestamp, payload). We can also create a "timeline" plugin akin to Pinia's: a chronological list of (store, action, snapshot) entries.

- **Visualizer Example:** The image below illustrates a typical Redux DevTools view instrumented by a proxy-based store like Valtio: the left panel lists actions (`@@INIT`, `set:count` etc.), the right panel shows state diffs and the full state tree, and time-travel controls let the developer jump between mutations. This provides invaluable insight during development, matching what Pinia offers with Vue DevTools.

_Figure: Redux DevTools pane showing proxy store state changes. Each action (4) and state diff (1,2) is recorded over time, with play/pause (3) for time-travel debugging._

With this integration, developers can **inspect state trees**, **trace actions/mutations**, and even **time-travel** through past states (a feature cited as a powerful debugging aid). We will document how to activate DevTools in development mode (e.g. via a `devtools` plugin in our store setup), and recommend disabling it in production.

## Comparison with Other Libraries

Below is a high-level comparison of our proposed system versus existing React state solutions. This highlights our design choices in context:

| **Feature**            | **Proposed (Pinia-like)**                                         | **Valtio**                         | **Jotai**                                    | **MobX**                                 | **Redux**                        |
| ---------------------- | ----------------------------------------------------------------- | ---------------------------------- | -------------------------------------------- | ---------------------------------------- | -------------------------------- |
| **Paradigm**           | Stores via `defineDotzeeStore`; actions/mutators                        | Proxy-based global state           | Atomic atoms/selectors                       | Observables + decorators                 | Reducers + immutable state       |
| **Reactivity**         | Proxy-based (fine-grained subscriptions)                          | Proxy (fine-grained)               | Atoms (update only dependent parts)          | Observables (track props accessed)       | Immutable diff on dispatch       |
| **TypeScript Support** | Full TS generics; type inference                                  | Yes (TS-friendly)                  | Yes, scales to enterprise TS                 | Good (MobX 6+ is TS-first)               | Good (with Redux Toolkit)        |
| **API Style**          | Composition-style hooks, actions, getters                         | Minimal hooks (`useSnapshot`)      | React hooks (`useAtom`/`useAtoms`)           | Class decorators or `makeAutoObservable` | Hook (`useSelector/useDispatch`) |
| **DevTools**           | Custom plugin / Redux DevTools support                            | Redux DevTools via `devtools` util | React DevTools or Redux DevTools with plugin | `mobx-react-devtools` panel available    | Official Redux DevTools          |
| **Boilerplate**        | Low (defineDotzeeStore stores, write actions)                                | Very low (just proxy state)        | Low (atom definitions)                       | Low (auto-observable stores)             | Higher (reducers/actions)        |
| **Mutability**         | Mutable state under the hood                                      | Mutable via proxy                  | Immutable usage pattern (atoms)              | Mutable via observables                  | Strictly immutable updates       |
| **Scalability**        | Modules + code-splitting; SSR-friendly                            | Global state (can split proxies)   | Atom-based (any scale)                       | Designed for large apps                  | Centralized store for large apps |
| **Key Use Cases**      | Small to enterprise apps with React, need easy composition and TS | Fine-grained updates, simple state | Fine-grained local/global state              | Complex state + derivations              | Predictable state + time travel  |

_Table: Comparison of state libraries. Our proposed library combines Vue/Pinia's strengths (type-safe, modular stores, computed getters) with React-friendly hooks and devtools. For example, Valtio emphasizes _"fine-grained subscription and reactivity"_ via Proxy, Jotai highlights atom-based granularity, and Redux highlights predictable state and powerful DevTools. Our design aims to offer the best of these: granular updates with intuitive APIs and full debugging support._

## Conclusion

The proposed React state library will deliver **Pinia-like developer experience** in a React setting. By using a **Proxy-based reactive core**, a **defineDotzeeStore composition API**, and **Redux DevTools integration**, we address modern needs: performance, type safety, and debuggability. We draw on best practices from Vue3/Pinia (reactivity and modular stores) and from React state libraries (Valtio, Jotai). The result will be a scalable, type-safe state management solution that feels familiar to Vue developers, but is idiomatic for React.

Overall, this design ensures **complete coverage** of requirements: from **reactivity implementation** and **store lifecycles** (including SSR), to **actions/getters patterns**, **TypeScript ergonomics**, and **rich DevTools support**. As Redux's own docs emphasize, a debuggable architecture "lets you log changes, use 'time-travel debugging', and even send complete error reports". We plan to match or exceed that level of introspection in a lightweight, Pinia-style library for React.

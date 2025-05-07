# Zest: A Pinia-like Reactive State Library for React

## Overview & Goals

We propose building a **TypeScript-based** state management library for React that emulates Vue/Pinia's reactivity and developer experience. It will use a **Proxy-based** reactivity core (with an eye on future React Signals), a **composition-friendly API** (akin to Pinia's `defineStore`), and robust **DevTools integration**. Key goals include strong type safety (full generics and inference), support for apps of all sizes (modular stores, lazy loading, SSR), and intuitive patterns for actions and computed state. We will leverage React 18's new hooks (like `useSyncExternalStore`) for subscriptions, and provide a smooth developer experience with autocompletion, hot-reloading, and debugging tools. The library's architecture will explicitly address:

* **Reactivity System**: A Proxy-based reactive store (fine-grained updates) vs. possible Signal abstraction.
* **Store Structure**: Composition-style stores (`defineStore` or similar), modularization, lazy registration, and SSR-safe instantiation.
* **Actions & Derived State**: Store methods (actions) for mutations, and getters/computed values for derived data.
* **Type Safety**: Full TypeScript support, leveraging generics so state and actions are strongly typed with perfect IDE completion.
* **DevTools**: Integration (e.g. via Redux DevTools API or custom React DevTools plugin) to inspect state trees, actions, and enable time-travel debugging.

These design choices aim to match Pinia's feel: *"Type Safe, Extensible, and Modular by design"*, with stores that are as "familiar as components" and fully auto-completed.

## Reactivity Model

We will use a **Proxy-based reactive core** for state objects, inspired by Vue 3 and libraries like Valtio. JavaScript's `Proxy` lets us trap get/set operations and notify subscribers on mutations, enabling **fine-grained reactivity**. Vue 3's reactivity (and hence Pinia's) relies on this, giving granular change detection and efficient updates. Likewise, Valtio makes any JS object "self-aware" via Proxy, yielding *"fine-grained subscription and reactivity when making state updates"*. This model avoids diffing whole objects on each change, so only components that access a changed property re-render.

Alternatively, we'll consider a **Signal-based** fallback or future mode. Signals (as in React Signal libraries or SolidJS) also offer fine-grained updates. Signals are independent of React components (they "exist outside the component lifecycle") and only update dependents, avoiding stale props or effect dependencies. As one article notes, Signals provide *"fine-grained reactivity: only components or functions that directly depend on a signal are updated"*, which improves performance for interactive UIs. However, native React Signals are not yet standard (as of 2025), so our initial design will focus on proxies, possibly layering signals later for individual fields.

**Integration with React:** We will hook our reactive store into React using `useSyncExternalStore` (introduced in React 18). This hook safely subscribes to external (non-React) data sources. For example, Valtio's `useSnapshot` is built on `useSyncExternalStore`: one defines a subscribe callback and a snapshot-read function, then uses `useSyncExternalStore(subscribe, getSnapshot)` to pull state into React components. We will emulate this pattern so that React components can `const state = useStore()` and automatically re-render when the relevant state changes. This leverages React's new concurrent-safe subscription mechanism.

**Choice Justification:** Proxy-based reactivity has proven efficient in Vue 3 and in libraries like Valtio. It aligns well with a composition-style store. Signals are promising for even finer granularity, but to start we will use Proxies (with possibility to integrate Signals internally later). In summary, our store state will be a Proxy object that tracks property reads/writes, notifying React via subscriptions. This yields fast updates and lets us implement computed getters that automatically recalc.

## Store API and Structure

### Composition-Friendly Stores

We will provide a **`defineStore`**-style API (similar to Pinia) for creating stores. For example:

```ts
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() { this.count++ },
    async fetchCount() { /* ... */ }
  },
  getters: {
    doubleCount: (state) => state.count * 2
  }
});
```

Each store is a **singleton instance** (unless re-created for SSR) keyed by name/ID. Components call `useCounterStore()` (a hook) to get access to that store's state and actions. Because our API is hook-based, it fits naturally into React's composition model. This lets stores be used anywhere (not just under a Provider) and eliminates the rigid modules of old-style Redux/Vuex. Pinia's docs emphasize that stores "are as familiar as components" and let you "forget you are even using a store", a philosophy we adopt.

### Store Lifecycle & Modularization

* **Registration and Lazy Loading:** Stores will register on first use. We can support dynamic import of store modules so that in a large app, code splitting on routes can also split state stores. For example, if a store file is only used in an admin panel, it can be asynchronously loaded when that panel mounts. This mirrors Pinia's "modular by design" idea: *"Build multiple stores and let your bundler code split them automatically."*.

* **Namespacing/IDs:** Each store has a unique name. Internally we keep a registry mapping names to store instances. If a store is defined in code-splitted chunks, the first call to `useStore()` for that name will load/create it.

* **SSR Support:** For server-side rendering, we must avoid shared mutable state across requests. Thus `defineStore` will detect SSR mode and create a fresh store instance per request (or context). Pinia supports SSR safely, and we'll similarly instantiate stores on demand on the server. After rendering, the server can serialize the store's state and hydrate it on the client. On the client, we'll check if there's preloaded state (hydration) to populate initial store values. This ensures no data leaks between users.

* **Provider/Context (optional):** Unlike Redux, we may not need a single Provider since stores can be used via hooks globally. However, we can offer an optional `<StoreProvider>` for bundling all stores or for scoped contexts (e.g., per-tenant data). Support for React Context can help with tree-shaking or multiple store roots, if needed.

* **Plugins/Extensions:** Similar to Pinia's plugin hooks, we will allow plugins to hook into stores. For example, a persistence plugin can subscribe to store changes and save to localStorage. Or a logging plugin can instrument actions. This is facilitated by allowing interceptors around actions or state mutations (e.g. a hook before/after each action, or a `subscribe` API on the store).

### Store Example

A very basic usage might look like:

```jsx
// counterStore.ts
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() { this.count++ },
  },
  getters: {
    doubleCount: (state) => state.count * 2
  }
});

// CounterComponent.tsx
function Counter() {
  const counter = useCounterStore();      // hooks into the reactive store
  return (
    <div>
      <div>Count: {counter.count}</div>
      <div>Double: {counter.doubleCount}</div>
      <button onClick={() => counter.increment()}>Increment</button>
    </div>
  );
}
```

Here, reading `counter.count` and `counter.doubleCount` automatically tracks dependencies. When `increment()` mutates `count`, React re-renders this component because our `useSyncExternalStore` hook will emit a change. This API style closely mimics Pinia/Vue's Composition stores, but in React/TS form.

## Actions and Derived (Computed) State

### Actions

Stores will support **actions** (methods) that modify state, possibly asynchronously. In Pinia, actions are ordinary async functions that `this`-mutate the state. We'll do likewise: an `actions` object in `defineStore` whose functions have the store's state (`this`) bound. Calling `store.someAction()` can perform multiple state mutations or async side-effects. We encourage actions to be the main way to change state (rather than directly mutating state from components), since actions can have meaningful names and be tracked by devtools.

Under the hood, calling an action is just calling a function that mutates the Proxy state. We will still treat these as normal JS methods. Optionally, we may create a commit/dispatch interface (like Redux), but a direct-call action is simpler and more natural here. After an action runs, subscribers (our hook) will get notified of the state change.

### Derived State (Getters/Computed)

For **computed or derived state**, we will let stores define **getters** (akin to Pinia) or simply encourage use of JavaScript getters on the state object. Vue-style "getters" can be written as methods or pure functions that derive from `state`. For example, `doubleCount: (state) => state.count * 2`.

If using the Proxy approach, one way is to define actual JS getters on the store object. Valtio demonstrates that object getters work as computed properties: e.g.,

```js
const state = proxy({
  count: 1,
  get double() { return this.count * 2 }
});
```

Here, `state.double` automatically calculates from `state.count`. This recomputes on each access (unless cached). In our design, we could either use such getters or maintain a cache. Alternatively, we can wrap getters in `computed` or a similar utility (like Valtio's `derive` or MobX's `computed`).

Key is that derived values should update when their dependencies change. Since we use Proxies, whenever any reactive state inside a getter is accessed, the dependency can be tracked. For simplicity, we may recalc getters on each read (as Valtio notes, non-cached getters recalc every call). For memoization, we could add an optional `proxy-memoize` utility or a `computed` function, but that is advanced. Initially, reactive getters (recomputed on demand) suffice.

### Example Getters/Actions

```ts
export const useCartStore = defineStore('cart', {
  state: () => ({ items: [] as Item[] }),
  actions: {
    add(item: Item) { this.items.push(item) },
    remove(id: string) { this.items = this.items.filter(i => i.id !== id) }
  },
  getters: {
    totalPrice: (state) => state.items.reduce((s, i) => s + i.price, 0)
  }
});
```

In a component:

```jsx
const cart = useCartStore();
<div>Total: {cart.totalPrice}</div>
<button onClick={() => cart.add({id: 'x', price: 10})}>Add</button>
```

Here `cart.totalPrice` will update when `items` changes.

## Type Safety and Developer Ergonomics

Our library will be **TypeScript-first**. We aim for full type inference so that users get IDE autocompletion on state, actions, and getters without writing extra types. Pinia boasts that "types are inferred, which means stores provide you with autocompletion even in JavaScript!" Similarly, we will use TS generics and `as const` patterns to infer store shapes.

Concretely, `defineStore` can be a generic factory, e.g. `defineStore<S, G, A>(name: string, options: StoreOptions<S, G, A>)` where `S` is the state type, `G` derived getters, `A` action functions. TypeScript will infer `S` and `G` from the `state` and `getters` definitions. Actions will be bound so that `this` has type `S & G & A`. This is like how Vue's Composition API infers `ref` types.

We will take advantage of TypeScript's latest features (mapped types, template literal types if needed) to ensure that store usage is strongly typed. For example, if a state field is `count: number`, then `store.count` is known as number. If an action is defined as `(payload: string) => void`, TS will infer that signature on `store.myAction`. We can reference Pinia's TS support as inspiration.

Also, our codebase will be written in TS with strict mode (strictNullChecks, noImplicitAny). We'll export full declaration files. We'll encourage good editor integration so that `useStore()` calls get typed return values with auto-import suggestions. Overall, the dev ergonomics will be similar to using well-typed React hooks.

## DevTools Integration

A core goal is seamless debugging: *"The Redux DevTools make it easy to trace when, where, why, and how your application's state changed"*. We want similar capability. Our plan:

* **Redux DevTools Extension:** We will hook into the Redux DevTools protocol. Many React state libraries do this. For example, Valtio provides a simple `devtools(proxyState, options)` utility which connects the proxy state to the Redux DevTools Extension. We can adopt a similar strategy: publish each action/mutation as a Redux-style action, and send full state snapshots to the extension. This yields a familiar UI showing action history, diffing, and even time-travel controls.

* **Custom React DevTools Panel (Optional):** If feasible, we could also integrate with React DevTools by creating a custom hook that registers our stores. However, React DevTools currently only exposes component state/props out of the box, not arbitrary stores. A more straightforward approach is to utilize the Chrome/Redux DevTools API, which lets us create an "AppState" instance with a slider (time-travel).

* **Action Logging & Plugins:** Within the library, we will allow a devtools plugin to intercept actions. For example, before and after each action runs, we can log to the devtools plugin. We will include metadata (store name, timestamp, payload). We can also create a "timeline" plugin akin to Pinia's: a chronological list of (store, action, snapshot) entries.

* **Visualizer Example:** The image below illustrates a typical Redux DevTools view instrumented by a proxy-based store like Valtio: the left panel lists actions (`@@INIT`, `set:count` etc.), the right panel shows state diffs and the full state tree, and time-travel controls let the developer jump between mutations. This provides invaluable insight during development, matching what Pinia offers with Vue DevTools.

*Figure: Redux DevTools pane showing proxy store state changes. Each action (4) and state diff (1,2) is recorded over time, with play/pause (3) for time-travel debugging.*

With this integration, developers can **inspect state trees**, **trace actions/mutations**, and even **time-travel** through past states (a feature cited as a powerful debugging aid). We will document how to activate DevTools in development mode (e.g. via a `devtools` plugin in our store setup), and recommend disabling it in production.

## Comparison with Other Libraries

Below is a high-level comparison of our proposed system versus existing React state solutions. This highlights our design choices in context:

| **Feature**            | **Proposed (Pinia-like)**                                         | **Valtio**                         | **Jotai**                                    | **MobX**                                 | **Redux**                        |
| ---------------------- | ----------------------------------------------------------------- | ---------------------------------- | -------------------------------------------- | ---------------------------------------- | -------------------------------- |
| **Paradigm**           | Stores via `defineStore`; actions/mutators                        | Proxy-based global state           | Atomic atoms/selectors                       | Observables + decorators                 | Reducers + immutable state       |
| **Reactivity**         | Proxy-based (fine-grained subscriptions)                          | Proxy (fine-grained)               | Atoms (update only dependent parts)          | Observables (track props accessed)       | Immutable diff on dispatch       |
| **TypeScript Support** | Full TS generics; type inference                                  | Yes (TS-friendly)                  | Yes, scales to enterprise TS                 | Good (MobX 6+ is TS-first)               | Good (with Redux Toolkit)        |
| **API Style**          | Composition-style hooks, actions, getters                         | Minimal hooks (`useSnapshot`)      | React hooks (`useAtom`/`useAtoms`)           | Class decorators or `makeAutoObservable` | Hook (`useSelector/useDispatch`) |
| **DevTools**           | Custom plugin / Redux DevTools support                            | Redux DevTools via `devtools` util | React DevTools or Redux DevTools with plugin | `mobx-react-devtools` panel available    | Official Redux DevTools          |
| **Boilerplate**        | Low (define stores, write actions)                                | Very low (just proxy state)        | Low (atom definitions)                       | Low (auto-observable stores)             | Higher (reducers/actions)        |
| **Mutability**         | Mutable state under the hood                                      | Mutable via proxy                  | Immutable usage pattern (atoms)              | Mutable via observables                  | Strictly immutable updates       |
| **Scalability**        | Modules + code-splitting; SSR-friendly                            | Global state (can split proxies)   | Atom-based (any scale)                       | Designed for large apps                  | Centralized store for large apps |
| **Key Use Cases**      | Small to enterprise apps with React, need easy composition and TS | Fine-grained updates, simple state | Fine-grained local/global state              | Complex state + derivations              | Predictable state + time travel  |

*Table: Comparison of state libraries. Our proposed library combines Vue/Pinia's strengths (type-safe, modular stores, computed getters) with React-friendly hooks and devtools. For example, Valtio emphasizes *"fine-grained subscription and reactivity"* via Proxy, Jotai highlights atom-based granularity, and Redux highlights predictable state and powerful DevTools. Our design aims to offer the best of these: granular updates with intuitive APIs and full debugging support.*

## Conclusion

The proposed React state library will deliver **Pinia-like developer experience** in a React setting. By using a **Proxy-based reactive core**, a **defineStore composition API**, and **Redux DevTools integration**, we address modern needs: performance, type safety, and debuggability. We draw on best practices from Vue3/Pinia (reactivity and modular stores) and from React state libraries (Valtio, Jotai). The result will be a scalable, type-safe state management solution that feels familiar to Vue developers, but is idiomatic for React.

Overall, this design ensures **complete coverage** of requirements: from **reactivity implementation** and **store lifecycles** (including SSR), to **actions/getters patterns**, **TypeScript ergonomics**, and **rich DevTools support**. As Redux's own docs emphasize, a debuggable architecture "lets you log changes, use 'time-travel debugging', and even send complete error reports". We plan to match or exceed that level of introspection in a lightweight, Pinia-style library for React.

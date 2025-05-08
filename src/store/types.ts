/**
 * Represents the actions of a store.
 * Each key is an action name, and the value is the action function.
 * Action functions will have `this` bound to the store's state.
 */
export type StoreActions<S extends object> = {
    [key: string]: (this: S, ...args: any[]) => any; // For MVP, `any` is fine for args and return. We'll refine in Phase 2.
};

/**
 * Options for defining a new Zest store.
 * @template S - The type of the state.
 * @template A - The type of the actions.
 */
export interface DefineZestStoreOptions<
    S extends object,
    A extends StoreActions<S> = {} // Default to empty object if no actions
> {
    /**
     * A function that returns the initial state object for the store.
     */
    state: () => S;

    /**
     * An object containing action methods for the store.
     * `this` inside actions will refer to the store's state.
     */
    actions?: A;
}

// Placeholder for the actual store instance type (state + actions)
// We will refine this as we build defineZestStore
export type StoreInstance<S extends object, A extends StoreActions<S>> = S & A;

// Placeholder for the hook function returned by defineZestStore
// () => StoreInstance<S, A>
export type ZestStoreHook<S extends object, A extends StoreActions<S>> = () => StoreInstance<S, A>; 
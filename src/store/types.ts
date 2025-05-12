import { Ref } from '../reactivity/ref'; // Import Ref type

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

/**
 * Represents the fully constituted store instance, including state and actions.
 */
export type StoreInstance<S extends object, A extends StoreActions<S>> = S & A;

// --- Types for Setup Stores ---

/**
 * Represents the return type of a setup store function.
 * It's an object where keys are strings and values are refs, computed refs, functions, etc.
 */
export type SetupStoreReturnType = Record<string, any>; // Loosely typed for now

/**
 * Represents the setup function passed to defineZestStore for Setup Stores.
 */
export type SetupStoreFunction = () => SetupStoreReturnType;

// --- Generic Types --- //

/**
 * Represents the user-facing store instance, which can be either an Options store
 * structure (State & Actions) or the return value of a Setup store function.
 */
export type StoreInstanceType<S extends object = any, A extends StoreActions<S> = any, R extends SetupStoreReturnType = any>
    = StoreInstance<S, A> | R;

/**
 * Internal representation of a store held in the registry.
 * Includes the user-facing instance and the internal change signal mechanism.
 */
export interface StoreRegistryEntry<InstanceType extends StoreInstanceType = any> {
    instance: InstanceType;
    changeSignal: Ref<number>; // The internal signal for useSyncExternalStore
}

/**
 * Represents the hook function returned by defineZestStore,
 * providing access to the specific store instance type (Options or Setup).
 */
export type ZestStoreHook<InstanceType extends StoreInstanceType = any> = () => InstanceType; 
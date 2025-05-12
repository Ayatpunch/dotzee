import { Ref } from '../reactivity/ref'; // Import Ref type
import { ComputedRef } from '../reactivity/computed'; // Import ComputedRef

/**
 * Represents the actions of a store.
 * Each key is an action name, and the value is the action function.
 * Action functions will have `this` bound to the store's state, actions and getters.
 */
export type StoreActions<S extends object, G extends StoreGetters<S, G>> = {
    [key: string]: (this: StoreInstance<S, any, G>, ...args: any[]) => any;
};

/**
 * Represents the getters of a store.
 * Each key is a getter name, and the value is a function that takes state as an argument.
 */
export type StoreGetters<S extends object, G extends StoreGetters<S, G>> = {
    // The `this` type in getters should ideally be Readonly<S> & MappedGetters<G>
    // For now, let's make them simple functions of state. We can refine `this` later.
    [K in keyof G]: (state: S) => unknown; // Return type will be inferred later or can be `any`
};

// Utility type to map getter functions to their return types for the store instance
export type MappedGetters<G> = {
    // Ensure G is constrained to functions returning something
    [K in keyof G]: G[K] extends (...args: any[]) => infer R ? R : never;
};

/**
 * Options for defining a new Zest store.
 * @template S - The type of the state.
 * @template A - The type of the actions.
 * @template G - The type of the getters.
 */
export interface DefineZestStoreOptions<
    S extends object,
    // Pass S and G to StoreActions for correct `this` type in actions
    A extends StoreActions<S, G> = {},
    G extends StoreGetters<S, G> = {} // Default to empty object if no getters
> {
    /**
     * A function that returns the initial state object for the store.
     */
    state: () => S;

    /**
     * An object containing action methods for the store.
     * `this` inside actions will refer to the store's state, actions, and getters.
     */
    actions?: A;

    /**
     * An object containing getter functions for the store.
     * Getters take state as an argument and return a derived value.
     * They will be wrapped with `computed` internally.
     */
    getters?: G;
}

/**
 * Represents the fully constituted store instance, including state, actions, and getters.
 * Getters are mapped to their return types and are readonly.
 */
export type StoreInstance<S extends object, A extends StoreActions<S, G>, G extends StoreGetters<S, G>> = S & A & Readonly<MappedGetters<G>>;

// --- Types for Setup Stores ---

/**
 * Represents the return type of a setup store function.
 * It's an object where keys are strings and values are refs, computed refs, functions, etc.
 */
export type SetupStoreReturnType = Record<string, Ref<any> | ComputedRef<any> | ((...args: any[]) => any) | object | any>;

/**
 * Represents the setup function passed to defineZestStore for Setup Stores.
 */
export type SetupStoreFunction<R extends SetupStoreReturnType = SetupStoreReturnType> = () => R;

// --- Generic Types --- //

/**
 * Represents the user-facing store instance, which can be either an Options store
 * structure (State & Actions & Getters) or the return value of a Setup store function.
 */
export type StoreInstanceType<
    S extends object = any,
    A extends StoreActions<S, G> = any,
    G extends StoreGetters<S, G> = any,
    R extends SetupStoreReturnType = any
> = StoreInstance<S, A, G> | R;

/**
 * Internal representation of a store held in the registry.
 */
export interface StoreRegistryEntry<T extends StoreInstanceType = any> {
    hook: ZestStoreHook<T>;
    instance: T;
    changeSignal: Ref<number>;
    id: string;
}

/**
 * Represents the hook function returned by defineZestStore,
 * providing access to the specific store instance type (Options or Setup).
 */
export interface ZestStoreHook<T extends StoreInstanceType> {
    (): T; // The function signature to get the instance
    $id: string; // The unique ID of the store
    $changeSignal: Ref<number>; // The ref used for reactivity signaling
} 
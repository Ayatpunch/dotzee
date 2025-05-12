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
 * Represents the possible structure of a store instance, used internally.
 * This is a generic base type for the registry and other internal logic.
 */
export type StoreInstanceType = Record<string, any>;

// Defines the structure of the properties added to the hook function
interface StoreHookProps {
    $id: string;
    $changeSignal: Ref<number>;
}

/**
 * Represents the hook function returned by defineZestStore,
 * providing access to the specific store instance type (Options or Setup).
 * Includes attached properties like $id and $changeSignal.
 */
export type ZestStoreHook<T extends StoreInstanceType> = (() => T) & StoreHookProps;

/**
 * Represents an entry in the central store registry.
 * @template T The specific type of the store instance this entry holds.
 */
export interface StoreRegistryEntry<T extends StoreInstanceType> {
    hook: ZestStoreHook<T>; // The hook function to get the store instance
    instance: T; // The actual store instance
    changeSignal: Ref<number>; // The ref used to signal changes for this store
    id: string; // The store's unique ID
    isSetupStore: boolean; // True if defined with a setup function, false for options object
    initialStateKeys?: string[]; // For options stores, the keys of the initial state object
} 
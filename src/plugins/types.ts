import type { StoreRegistryEntry, StoreInstanceType } from '../store/types';

// Re-export types from store/types that are used in plugin type definitions
export type { StoreRegistryEntry, StoreInstanceType };

/**
 * Represents a Dotzee plugin.
 * Plugins can hook into store lifecycle events and extend store functionality.
 */
export interface Plugin {
    /** A unique name for the plugin, used for identification and debugging. */
    name: string;
    /**
     * The installation function for the plugin.
     * This function is called once when the plugin is registered via `useDotzeePlugin`.
     * @param context - The plugin context API, providing methods to hook into Dotzee.
     */
    install: (context: PluginContextApi) => void;
}

/**
 * The API provided to plugins during their installation.
 * It allows plugins to register callbacks for various store events.
 */
export interface PluginContextApi {
    /**
     * Registers a callback to be executed when a new store instance is created.
     * This is called after the store's base instance is formed but before it's fully registered
     * or visible to DevTools for its initial state.
     * @param callback - The function to call when a store is created.
     */
    onStoreCreated: (callback: (context: StoreCreatedContext) => void | Promise<void>) => void;

    /**
     * Registers a callback to be executed before an action is invoked.
     * Arguments passed to the action are provided in a read-only manner.
     * @param callback - The function to call before an action.
     */
    beforeAction: (callback: (context: ActionContext) => void) => void;

    /**
     * Registers a callback to be executed after an action has completed (or thrown an error).
     * Provides access to the action's arguments, result (if successful), or error (if failed).
     * @param callback - The function to call after an action.
     */
    afterAction: (callback: (context: AfterActionContext) => void | Promise<void>) => void;

    /**
     * Extends a store instance with additional properties or methods.
     * This is a powerful but potentially risky operation. It should typically be called
     * from within an `onStoreCreated` callback.
     *
     * @remarks
     * Extensions are applied "as-is" directly onto the store instance.
     * The Dotzee library does not perform deep merges or handle `this` binding for
     * any methods added via this extension mechanism. For TypeScript users,
     * module augmentation or casting might be necessary to achieve type safety
     * for these extensions on the store instance.
     *
     * @template T - The type of the store instance being extended.
     * @template E - The type of the extension object.
     * @param storeInstance - The store instance to extend.
     * @param extension - An object containing properties/methods to add to the store instance.
     */
    extendStore: <T extends StoreInstanceType, E extends Record<string, any>>(
        storeInstance: T,
        extension: E
    ) => void;

    /**
     * Retrieves a serializable snapshot of a specific store instance's current state.
     * This respects the store type (Options vs. Setup) for correct serialization,
     * unwrapping refs for setup stores and using initial state keys for options stores.
     * @param storeInstance - The store instance to snapshot.
     * @returns A serializable object representing the store's state.
     */
    getStoreStateSnapshot: (storeInstance: StoreInstanceType) => Record<string, any>;
}

/**
 * Context provided to `onStoreCreated` callbacks.
 */
export interface StoreCreatedContext {
    /** The registry entry for the newly created store. The `instance` property can be extended here. */
    storeEntry: StoreRegistryEntry<StoreInstanceType>;
}

/**
 * Context provided to `beforeAction` callbacks.
 */
export interface ActionContext {
    /** The registry entry for the store whose action is being called. */
    storeEntry: StoreRegistryEntry<StoreInstanceType>;
    /** The name of the action being called. */
    actionName: string;
    /** The arguments passed to the action (read-only). */
    args: readonly any[];
}

/**
 * Context provided to `afterAction` callbacks.
 */
export interface AfterActionContext {
    /** The registry entry for the store whose action was called. */
    storeEntry: StoreRegistryEntry<StoreInstanceType>;
    /** The name of the action that was called. */
    actionName: string;
    /** The arguments that were passed to the action (read-only). */
    args: readonly any[];
    /** The result returned by the action. Will be undefined if the action threw an error or returned void. */
    result?: any;
    /** The error thrown by the action, if any. Will be undefined if the action completed successfully. */
    error?: any;
} 
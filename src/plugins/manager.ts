import type {
    Plugin,
    PluginContextApi,
    StoreCreatedContext,
    ActionContext,
    AfterActionContext,
} from './types';
import type { StoreInstanceType, StoreRegistryEntry } from '../store/types';
import { getStoreStateSnapshotInternal } from '../devtools/connector'; // Placeholder, will create this next

/** Internal list of registered Zest plugins. */
const zestPlugins: Plugin[] = [];

/** Callbacks registered by plugins. */
const onStoreCreatedCallbacks: Array<(context: StoreCreatedContext) => void> = [];
const beforeActionCallbacks: Array<(context: ActionContext) => void> = [];
const afterActionCallbacks: Array<(context: AfterActionContext) => void> = [];

/**
 * The single, shared, read-only context API object provided to plugins.
 */
const pluginContextApi: PluginContextApi = {
    onStoreCreated: (callback) => {
        onStoreCreatedCallbacks.push(callback);
    },
    beforeAction: (callback) => {
        beforeActionCallbacks.push(callback);
    },
    afterAction: (callback) => {
        afterActionCallbacks.push(callback);
    },
    extendStore: <T extends StoreInstanceType, E extends Record<string, any>>(
        storeInstance: T,
        extension: E
    ) => {
        // Directly assign properties from extension to storeInstance
        // This matches Pinia's behavior: https://pinia.vuejs.org/core-concepts/plugins.html#extending-stores
        for (const key in extension) {
            if (Object.prototype.hasOwnProperty.call(extension, key)) {
                (storeInstance as any)[key] = extension[key];
            }
        }
    },
    getStoreStateSnapshot: (storeInstance: StoreInstanceType) => {
        // This will require the storeEntry to determine isSetupStore and initialStateKeys.
        // For now, this is a simplified placeholder. The actual implementation will need more context
        // or `getStoreStateSnapshotInternal` will need to be callable with just the instance
        // if it can infer the rest or if the plugin context needs to provide more.
        // Let's assume `getStoreStateSnapshotInternal` will be adapted or called differently.
        // This will be refined when `getStoreStateSnapshotInternal` is implemented.
        // console.warn('[Zest Plugin] getStoreStateSnapshot from plugin context needs full storeEntry details for accurate snapshot.');
        // This function is expected to be called with a StoreRegistryEntry in practice if we pass it.
        // However, the type signature is (storeInstance: StoreInstanceType)
        // This highlights a detail to resolve: how does this specific function get all necessary info?
        // For now, we assume `getStoreStateSnapshotInternal` will be made to work or this signature will be adjusted.
        // Actually, `getStoreStateSnapshotInternal` needs `isSetupStore` and `initialStateKeys`.
        // This means the `pluginContextApi.getStoreStateSnapshot` might need to be called with more context, or removed/rethought.
        // --> DECISION: For now, let's make it a NO-OP with a warning, as `getStoreStateSnapshotInternal` is better used internally
        // by DevTools or other parts that have the full StoreRegistryEntry.
        // Plugins needing a snapshot for a specific store typically operate within a hook that has access to the storeEntry.

        // Re-evaluating: The plugin context is general. If a plugin wants a snapshot of *any* store it somehow has a reference to,
        // it won't have the `isSetupStore` or `initialStateKeys` readily available for *that arbitrary instance*.
        // The `getGlobalZestStateSnapshot(registry)` is for ALL stores. This one is for A store.
        // The most practical way is if this method is implicitly for the *current store in context* (e.g., within an action hook).
        // However, the method signature `getStoreStateSnapshot: (storeInstance: StoreInstanceType)` implies it can be *any* instance.

        // Let's assume for now `getStoreStateSnapshotInternal` is flexible enough, or we adjust.
        // For the purpose of getting this file structure in place, we use a placeholder call.
        // This will be properly implemented when getStoreStateSnapshotInternal is defined.
        // It is likely that `getStoreStateSnapshotInternal` is the primary way, and plugins should use it if they have enough context.
        // The `PluginContextApi` might not be the best place for a generic snapshot tool if it cannot guarantee context.

        // For now, let's log a warning and return an empty object.
        // The actual implementation will depend on how `getStoreStateSnapshotInternal` is designed.
        console.warn("[Zest Plugin] `getStoreStateSnapshot` in plugin context is a placeholder and may not provide full store details yet.");
        // This is a placeholder. The real call would need isSetupStore and initialStateKeys, which are not available from storeInstance alone.
        // Option 1: Remove this from PluginContextApi if it's too problematic.
        // Option 2: Document that plugins should try to use this within contexts where more info is available.
        // Option 3: `getStoreStateSnapshotInternal` would need to somehow retrieve metadata from the instance (e.g. if instance is a proxy to an object that has this metadata).
        // For now, to unblock, we will assume this function cannot be fully implemented without more context for the storeInstance.
        return {}; // Placeholder
    },
};

/**
 * Registers a Zest plugin.
 * @param plugin - The plugin to register.
 */
export function useZestPlugin(plugin: Plugin): void {
    if (zestPlugins.some(p => p.name === plugin.name)) {
        console.warn(`[Zest] Plugin "${plugin.name}" already registered.`);
        return;
    }
    plugin.install(pluginContextApi);
    zestPlugins.push(plugin);
    // console.log(`[Zest] Plugin "${plugin.name}" registered.`);
}

/**
 * Notifies registered plugins about a store creation event.
 * @internal
 */
export function _notifyStoreCreated(context: StoreCreatedContext): void {
    onStoreCreatedCallbacks.forEach(callback => {
        try {
            callback(context);
        } catch (error) {
            console.error(`[Zest Plugin Error - ${context.storeEntry.id}] Error in onStoreCreated callback of plugin (unknown plugin):`, error);
        }
    });
}

/**
 * Notifies registered plugins before an action is executed.
 * @internal
 */
export function _notifyBeforeAction(context: ActionContext): void {
    beforeActionCallbacks.forEach(callback => {
        try {
            callback(context);
        } catch (error) {
            console.error(`[Zest Plugin Error - ${context.storeEntry.id}] Error in beforeAction callback for action "${context.actionName}" (unknown plugin):`, error);
        }
    });
}

/**
 * Notifies registered plugins after an action has been executed.
 * @internal
 */
export function _notifyAfterAction(context: AfterActionContext): void {
    afterActionCallbacks.forEach(callback => {
        try {
            callback(context);
        } catch (error) {
            console.error(`[Zest Plugin Error - ${context.storeEntry.id}] Error in afterAction callback for action "${context.actionName}" (unknown plugin):`, error);
        }
    });
} 
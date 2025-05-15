import type {
    Plugin,
    PluginContextApi,
    StoreCreatedContext,
    ActionContext,
    AfterActionContext,
} from './types';
import type { StoreInstanceType, StoreRegistryEntry } from '../store/types';
import { getStoreStateSnapshotInternal } from '../devtools/connector'; // Placeholder, will create this next
import { getGlobalDotzeeRegistry } from '../store/registry';

/** Internal list of registered Dotzee plugins. */
const dotzeePlugins: Plugin[] = [];

/** Callbacks registered by plugins. */
const onStoreCreatedCallbacks: Array<(context: StoreCreatedContext) => void | Promise<void>> = [];
const beforeActionCallbacks: Array<(context: ActionContext) => void> = [];
const afterActionCallbacks: Array<(context: AfterActionContext) => void | Promise<void>> = [];

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
        // This requires access to the storeEntry or its properties (isSetupStore, initialStateKeys)
        // For simplicity, if this is called from a plugin, the plugin should ideally already have
        // the storeEntry from onStoreCreated or afterAction context.
        // This direct call from pluginContextApi might be less common or need more context.
        // Let's assume for now this might be a simplified version or used internally with care.
        // A more robust solution might involve passing storeEntry or its relevant parts here.
        // console.warn('[Dotzee] getStoreStateSnapshot in plugin context is basic and assumes direct instance knowledge.');

        // Attempt to find the store entry in the global registry to get metadata
        // This is a workaround and not ideal for performance or multi-registry scenarios.
        const registry = getGlobalDotzeeRegistry(); // Assuming access to some registry
        let foundEntry: StoreRegistryEntry<StoreInstanceType> | undefined;
        for (const entry of registry.values()) {
            if (entry.instance === storeInstance) {
                foundEntry = entry;
                break;
            }
        }

        if (foundEntry) {
            return getStoreStateSnapshotInternal(foundEntry.instance, foundEntry.isSetupStore, foundEntry.initialStateKeys);
        }
        // Fallback if not found or for a very generic case (might be inaccurate for options stores without keys)
        return getStoreStateSnapshotInternal(storeInstance, false, undefined);
    },
};

/**
 * Registers a Dotzee plugin.
 * @param plugin - The plugin to register.
 */
export function useDotzeePlugin(plugin: Plugin): void {
    if (dotzeePlugins.find(p => p.name === plugin.name)) {
        console.warn(`[Dotzee] Plugin "${plugin.name}" already installed.`);
        return;
    }
    try {
        plugin.install(_getPluginContextApi());
        dotzeePlugins.push(plugin);
    } catch (e) {
        console.error(`[Dotzee] Error installing plugin "${plugin.name}":`, e);
    }
}

/**
 * Notifies registered plugins about a store creation event.
 * @internal
 */
export async function _notifyStoreCreated(context: StoreCreatedContext): Promise<void> {
    for (const cb of onStoreCreatedCallbacks) {
        try {
            await cb(context); // Await the callback
        } catch (e) {
            console.error(`[Dotzee] Error in plugin (onStoreCreated) for store "${context.storeEntry.id}":`, e);
        }
    }
}

/**
 * Notifies registered plugins before an action is executed.
 * @internal
 */
export function _notifyBeforeAction(context: ActionContext): void {
    for (const cb of beforeActionCallbacks) {
        try {
            cb(context);
        } catch (e) {
            console.error(`[Dotzee] Error in plugin (beforeAction) for store "${context.storeEntry.id}", action "${context.actionName}":`, e);
        }
    }
}

/**
 * Notifies registered plugins after an action has been executed.
 * @internal
 */
export async function _notifyAfterAction(context: AfterActionContext): Promise<void> {
    for (const cb of afterActionCallbacks) {
        try {
            await cb(context); // Await the callback if it's async
        } catch (e) {
            console.error(`[Dotzee] Error in plugin (afterAction) for store "${context.storeEntry.id}", action "${context.actionName}":`, e);
        }
    }
}

/**
 * @internal For testing purposes only.
 * Clears all registered plugins and their callbacks.
 */
export const _clearDotzeePlugins = (): void => {
    dotzeePlugins.length = 0; // Clear the plugins array
    onStoreCreatedCallbacks.length = 0; // Use .length = 0 for arrays
    beforeActionCallbacks.length = 0; // Use .length = 0 for arrays
    afterActionCallbacks.length = 0;  // Use .length = 0 for arrays
};

// Internal function to get the plugin API context
/** @internal */
export const _getPluginContextApi = (): PluginContextApi => {
    return pluginContextApi;
}; 
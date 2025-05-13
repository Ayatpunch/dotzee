import { isRef } from '../reactivity/ref';
import { isComputed } from '../reactivity/computed';
import type { StoreRegistryEntry, StoreInstanceType } from '../store/types';
// Import registry functions and type
import { ZestRegistry, getActiveZestRegistry, getGlobalZestRegistry } from '../store/registry';

interface DevToolsExtension {
    connect(options?: DevToolsOptions): DevToolsInstance;
    // other potential methods if needed
}

interface DevToolsOptions {
    name?: string;
    trace?: boolean;
    traceLimit?: number;
    // other options as per Redux DevTools Extension API
}

interface DevToolsInstance {
    send(action: string | { type: string;[key: string]: any }, state: any): void;
    subscribe(listener: (message: DevToolsMessage) => void): void;
    init(state: any): void;
    unsubscribe(): void;
    // other methods
}

interface DevToolsMessage {
    type: string;
    payload?: any;
    state?: string; // JSON string representing the state
    id?: any; // Connection ID
}

let connection: DevToolsInstance | null = null;
// let appStoreRegistry: Map<string, StoreRegistryEntry<StoreInstanceType>> | null = null; // REMOVED
let devToolsOptions: DevToolsOptions | null = null;

const ZEST_DEVTOOLS_INIT_ACTION_PREFIX = '@@ZEST_INIT';

/**
 * Checks if Zest DevTools integration is currently enabled and connected.
 * @returns {boolean} True if DevTools are enabled, false otherwise.
 */
export function isZestDevToolsEnabled(): boolean {
    return connection !== null;
}

/**
 * @internal
 * Creates a serializable snapshot of a single store instance.
 * This function is used by both DevTools integration and potentially by plugins.
 *
 * @param instance - The store instance to snapshot.
 * @param isSetupStore - Boolean indicating if it's a setup store.
 * @param initialStateKeys - Optional array of initial state keys (for options stores).
 * @returns A serializable object representing the store's state.
 */
export function getStoreStateSnapshotInternal(
    instance: StoreInstanceType,
    isSetupStore: boolean,
    initialStateKeys?: string[]
): Record<string, any> {
    const snapshot: Record<string, any> = {};
    if (isSetupStore) {
        // Use Reflect.ownKeys to get all own properties (string/symbol, enumerable/non-enumerable)
        Reflect.ownKeys(instance).forEach(key => {
            // Ensure key is a string or symbol that can be used as an object key for the snapshot
            if (typeof key === 'string' || typeof key === 'symbol') {
                const prop = instance[key as keyof StoreInstanceType]; // Use type assertion for safety
                if (typeof prop !== 'function') {
                    if (isRef(prop) && !isComputed(prop)) {
                        snapshot[key.toString()] = prop.value; // toString for symbol keys
                    } else if (!isRef(prop) && !isComputed(prop)) {
                        snapshot[key.toString()] = prop;
                    }
                    // ComputedRefs are intentionally skipped
                }
            }
        });
    } else {
        // For options stores, only include keys that were part of the initial state.
        if (initialStateKeys) {
            initialStateKeys.forEach(key => {
                if (Object.prototype.hasOwnProperty.call(instance, key)) {
                    snapshot[key] = instance[key];
                }
            });
        } else {
            console.warn(`[Zest DevTools] Missing initialStateKeys for options store instance. Snapshot may be incomplete or include non-state properties.`);
        }
    }
    return snapshot;
}

/**
 * Retrieves a snapshot of the current state of all registered Zest stores
 * from the provided registry.
 * @param registry - The ZestRegistry instance to snapshot.
 * @returns An object where keys are store IDs and values are their states.
 */
export function getGlobalZestStateSnapshot(registry: ZestRegistry): Record<string, any> {
    const globalState: Record<string, any> = {};
    if (!registry) {
        console.warn('[Zest DevTools] Cannot get global state snapshot, registry is not available.');
        return globalState;
    }
    registry.forEach((entry, storeId) => {
        // Use the new internal snapshot function for each store
        globalState[storeId] = getStoreStateSnapshotInternal(
            entry.instance,
            entry.isSetupStore,
            entry.initialStateKeys
        );
    });
    return globalState;
}

/**
 * Resets the state of a single store to a target state and triggers its change signal.
 * @param entry The store registry entry.
 * @param targetStoreState The target state for the individual store.
 * @internal
 */
function _internal_resetStoreState(entry: StoreRegistryEntry<StoreInstanceType>, targetStoreState: Record<string, any>): void {
    if (entry.isSetupStore) {
        for (const key in targetStoreState) {
            if (Object.prototype.hasOwnProperty.call(targetStoreState, key) && entry.instance[key] && isRef(entry.instance[key])) {
                entry.instance[key].value = targetStoreState[key];
            }
        }
    } else {
        // For options stores, directly assign to the instance properties
        // This relies on the reactive proxy to handle updates.
        // Ensure only keys present in targetStoreState are updated.
        if (entry.initialStateKeys) {
            entry.initialStateKeys.forEach(key => {
                if (Object.prototype.hasOwnProperty.call(targetStoreState, key)) {
                    (entry.instance as any)[key] = targetStoreState[key];
                }
            });
        } else {
            // Fallback, less safe: merge the whole state
            // This might accidentally add non-state properties if targetStoreState is not clean
            Object.assign(entry.instance, targetStoreState);
        }
    }
    entry.changeSignal.value++; // Trigger update
}

/**
 * Enables Zest DevTools integration by connecting to the Redux DevTools Extension.
 * Call this function once in your application setup.
 *
 * @param options Configuration options for the DevTools connection.
 */
export function enableZestDevTools(options?: DevToolsOptions): void {
    if (typeof window === 'undefined' || !(window as any).__REDUX_DEVTOOLS_EXTENSION__) {
        console.warn('[Zest DevTools] Redux DevTools Extension not found. Zest DevTools will not be enabled.');
        return;
    }
    if (connection) {
        console.warn('[Zest DevTools] Already enabled. Skipping.');
        return;
    }

    // appStoreRegistry = storeRegistryInstance; // REMOVED
    devToolsOptions = options || {};

    const extension = (window as any).__REDUX_DEVTOOLS_EXTENSION__ as DevToolsExtension;
    connection = extension.connect(devToolsOptions);

    connection.subscribe((message: DevToolsMessage) => {
        if (message.type === 'DISPATCH' && message.payload) {
            switch (message.payload.type) {
                case 'JUMP_TO_STATE':
                case 'JUMP_TO_ACTION':
                    if (message.state) {
                        try {
                            const globalZestState = JSON.parse(message.state) as Record<string, any>;
                            const currentActiveRegistry = getActiveZestRegistry(); // Get active registry for the jump

                            Object.keys(globalZestState).forEach(storeId => {
                                const storeEntry = currentActiveRegistry.get(storeId);
                                if (storeEntry && globalZestState[storeId]) {
                                    _internal_resetStoreState(storeEntry, globalZestState[storeId]);
                                }
                            });
                        } catch (e) {
                            console.error('[Zest DevTools] Error parsing state for time travel:', e);
                        }
                    }
                    break;
                // Handle other dispatch actions if needed
            }
        }
    });

    // Initial state for DevTools can be an empty object or a snapshot if available
    // Stores will send their individual initial states via _internal_initStoreState
    connection.init({}); // Initialize with an empty state, stores will populate it

    console.log('[Zest DevTools] Connected to Redux DevTools Extension.', devToolsOptions);
}

/**
 * Disconnects from the Redux DevTools Extension and cleans up.
 */
export function disconnectZestDevTools(): void {
    if (connection) {
        connection.unsubscribe();
        connection = null;
        // appStoreRegistry = null; // REMOVED
        devToolsOptions = null;
        console.log('[Zest DevTools] Disconnected from Redux DevTools Extension.');
    }
}

/**
 * @internal
 * Sends an action and the current global state snapshot to Redux DevTools.
 * Assumes connection is active and registry is set.
 */
export function _internal_sendAction(
    storeId: string,
    actionName: string,
    payload: any, // Payload can be anything, devtools will display it
    // storeInstance: StoreInstanceType, // No longer needed directly here
    currentRegistry: ZestRegistry // Pass the active/relevant registry
): void {
    if (!connection || !currentRegistry) return;

    const actionType = `${storeId}/${actionName}`;
    // console.log(`[Zest DevTools - ${storeId}] Sending action: ${actionType}`, payload);

    // Get the complete current state of *all* stores in the provided registry
    const globalSnapshot = getGlobalZestStateSnapshot(currentRegistry);

    connection.send(
        {
            type: actionType,
            payload: payload !== undefined ? payload : null, // Ensure payload is not undefined
            ...(devToolsOptions?.trace && { stack: new Error().stack }), // Basic stack trace
        },
        globalSnapshot // Send the full state of the registry
    );
}

/**
 * @internal
 * Initializes a store's state with Redux DevTools.
 * Sends a special INIT action for the store along with the global state.
 */
export function _internal_initStoreState(
    storeId: string,
    // initialStoreState: Record<string, any>, // This is now the snapshot from getStoreStateSnapshotInternal
    storeSnapshot: Record<string, any>, // Snapshot of the specific store being initialized
    registry: ZestRegistry
): void {
    if (!connection || !registry) return;

    // console.log(`[Zest DevTools - ${storeId}] Initializing store state with DevTools.`);
    // When a store initializes, we send its specific initial state as the "action payload"
    // and the entire global state of the *current* registry as the state tree.
    const globalSnapshot = getGlobalZestStateSnapshot(registry);

    connection.send(
        {
            type: `@@ZEST_INIT/${storeId}`,
            payload: storeSnapshot, // Send the specific store's initial snapshot as payload
            source: '@zest-state-library',
        },
        globalSnapshot // Send the full current global state
    );
}

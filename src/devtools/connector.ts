import { isRef } from '../reactivity/ref';
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
 * Creates a serializable snapshot of the current state of all stores in the provided registry.
 * For Setup Stores, it unwraps refs and excludes functions.
 * For Options Stores, it uses `initialStateKeys` to extract only state properties.
 * @param registry The ZestRegistry instance to snapshot.
 * @returns A serializable object representing the global Zest state.
 * @internal
 */
export function getGlobalZestStateSnapshot(registry: ZestRegistry): Record<string, any> {
    const globalState: Record<string, any> = {};
    if (!registry) {
        console.warn('[Zest DevTools] Cannot create snapshot: Registry is not available.');
        return globalState;
    }

    registry.forEach((entry, storeId) => {
        const storeState: Record<string, any> = {};
        if (entry.isSetupStore) {
            // For setup stores, iterate over the instance properties
            for (const key in entry.instance) {
                if (Object.prototype.hasOwnProperty.call(entry.instance, key)) {
                    const prop = entry.instance[key];
                    if (typeof prop !== 'function') { // Exclude functions
                        storeState[key] = isRef(prop) ? prop.value : prop;
                    }
                }
            }
        } else {
            // For options stores, use initialStateKeys to get only state props
            if (entry.initialStateKeys) {
                entry.initialStateKeys.forEach(key => {
                    storeState[key] = (entry.instance as any)[key];
                });
            } else {
                // Fallback if initialStateKeys is not defined (should not happen for Options stores)
                // This part might need careful review if options stores can exist without initialStateKeys
                Object.assign(storeState, (entry.instance as any));
            }
        }
        globalState[storeId] = storeState;
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
 * Sends the initial state of a specific store to DevTools.
 * Called from defineZestStore when a store is initialized.
 * @param storeId The ID of the store.
 * @param initialState The serializable initial state of the store.
 * @param registryForSnapshot The ZestRegistry to use for generating the full global state snapshot.
 * @internal
 */
export function _internal_initStoreState(storeId: string, initialState: any, registryForSnapshot: ZestRegistry): void {
    if (!connection) return;

    const actionType = `${ZEST_DEVTOOLS_INIT_ACTION_PREFIX}/${storeId}`;
    const globalStateSnapshot = getGlobalZestStateSnapshot(registryForSnapshot);

    // It seems devtools.init might be better here for each store, but Pinia uses send.
    // For now, we send an action. We might need to adjust how DevTools expects initial states from multiple sources.
    // The current approach sends the *full global state* with each store's init action.
    connection.send({ type: actionType, payload: initialState /* or simply storeId? */ }, globalStateSnapshot);
    // console.log(`[Zest DevTools - ${storeId}] Sent initial state:`, initialState, `Global Snapshot:`, globalStateSnapshot);
}

/**
 * Sends an action and the current global state to DevTools.
 * Called from the wrappers in defineZestStore after an action is executed.
 * @param storeId The ID of the store where the action occurred.
 * @param actionName The name of the action.
 * @param payload The payload of the action (if any).
 * @param storeInstance (Currently unused, but was part of the signature - can be removed if not needed for future formatting)
 * @internal
 */
export function _internal_sendAction(
    storeId: string,
    actionName: string,
    payload: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    storeInstance?: StoreInstanceType // Keep for now, might be useful for payload formatting later
): void {
    if (!connection) return;

    const actionType = `${storeId}/${actionName}`;
    // Get snapshot of the currently active registry's state
    const globalStateSnapshot = getGlobalZestStateSnapshot(getActiveZestRegistry());

    const actionPayload = {
        // Consider more detailed payload formatting here if needed
        // For example, array of args, or just the first arg if simple
        payload: payload,
    };

    connection.send({ type: actionType, ...actionPayload }, globalStateSnapshot);
    if (devToolsOptions?.trace) {
        console.log(`[Zest DevTools TRACE - ${actionType}]`, payload, 'Global Snapshot:', globalStateSnapshot);
    }
}

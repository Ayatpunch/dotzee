import { StoreInstanceType, StoreRegistryEntry } from '../store/types';
import { isRef } from '../reactivity/ref'; // Import isRef

// Type definition for the Redux DevTools Extension API
// Based on common usage, might need refinement based on actual API interaction
interface ReduxDevToolsExtension {
    connect(options?: DevToolsOptions): ReduxDevToolsInstance;
    // Potentially other methods if needed directly
}

interface ReduxDevToolsInstance {
    init(state: any): void;
    send(action: string | { type: string;[key: string]: any }, state: any): void;
    subscribe(listener: (message: any) => void): () => void;
    unsubscribe(): void;
    // Potentially other methods like error, liftedy..
}

interface DevToolsOptions {
    name?: string; // Instance name
    trace?: boolean | (() => string);
    traceLimit?: number;
    actionsBlacklist?: string | string[];
    actionsWhitelist?: string | string[];
    // Add other options from Redux DevTools Extension API as needed
    [key: string]: any; // For other potential options
}

// --- Global State for DevTools Connection ---

let connection: ReduxDevToolsInstance | null = null;
let isEnabled = false; // Flag to control connection attempt - Renamed for clarity
let registryRef: Map<string, StoreRegistryEntry<StoreInstanceType>> | null = null; // Reference to the store registry

/**
 * Checks if Zest DevTools integration is currently enabled and connected.
 *
 * @returns {boolean} True if DevTools are enabled and connected, false otherwise.
 */
export function isZestDevToolsEnabled(): boolean {
    return isEnabled && connection !== null;
}

/**
 * Enables Zest DevTools integration. Attempts to connect to the Redux DevTools Extension.
 * Should be called once during application setup.
 *
 * @param storeRegistryInstance A Map instance representing the Zest store registry.
 * @param options Configuration options for the Redux DevTools connection.
 */
export function enableZestDevTools(
    storeRegistryInstance: Map<string, StoreRegistryEntry<StoreInstanceType>>,
    options: DevToolsOptions = {}
): void {
    if (typeof window === 'undefined' || isEnabled) {
        return; // Don't run on server or if already enabled
    }

    registryRef = storeRegistryInstance; // Store the registry reference

    const devToolsExtension = (window as any).__REDUX_DEVTOOLS_EXTENSION__ as ReduxDevToolsExtension | undefined;

    if (!devToolsExtension) {
        console.warn('[Zest] Redux DevTools Extension not found. Install it to enable debugging.');
        return;
    }

    try {
        connection = devToolsExtension.connect({
            name: options.name || 'Zest App', // Default instance name
            ...options, // Pass other user-provided options
        });
        isEnabled = true;
        console.log('[Zest] Connected to Redux DevTools Extension.');

        // Subscribe to messages from DevTools (e.g., for time travel)
        connection.subscribe((message) => {
            // console.log('[Zest DevTools] Received message:', message);

            // Check for Time Travel messages
            if (message.type === 'DISPATCH' && (message.payload?.type === 'JUMP_TO_STATE' || message.payload?.type === 'JUMP_TO_ACTION')) {
                console.log(`[Zest DevTools] Time travel requested: ${message.payload.type}`);

                if (!registryRef) {
                    console.error('[Zest DevTools] Cannot time travel: Store registry reference is missing.');
                    return;
                }

                try {
                    const targetGlobalState = JSON.parse(message.state);
                    // console.log('[Zest DevTools] Target state snapshot:', targetGlobalState);

                    // Iterate over the stores defined in the target state snapshot
                    for (const storeId in targetGlobalState) {
                        if (Object.prototype.hasOwnProperty.call(targetGlobalState, storeId)) {
                            const targetStoreState = targetGlobalState[storeId];
                            const entry = registryRef.get(storeId);

                            if (entry) {
                                // Reset the state of the specific store
                                _internal_resetStoreState(entry, targetStoreState);
                            } else {
                                console.warn(`[Zest DevTools] Store ID "${storeId}" found in time travel state but not in current registry.`);
                                // This store might have been added/removed since the snapshot was taken.
                            }
                        }
                    }
                    console.log(`[Zest DevTools] Finished attempting state reset for time travel.`);
                } catch (error) {
                    console.error('[Zest DevTools] Error processing time travel state:', error);
                }
            }
        });

    } catch (error) {
        console.error('[Zest] Error connecting to Redux DevTools Extension:', error);
        connection = null;
        isEnabled = false;
    }
}

/**
 * Disconnects from the Redux DevTools Extension.
 */
export function disconnectZestDevTools(): void {
    if (connection) {
        connection.unsubscribe(); // Assuming unsubscribe is the way to disconnect based on common patterns
        connection = null;
        isEnabled = false;
        registryRef = null; // Clear registry reference
        console.log('[Zest] Disconnected from Redux DevTools Extension.');
    }
}

/**
 * Creates a serializable snapshot of the current state of all registered Zest stores.
 *
 * @returns A record where keys are store IDs and values are the serializable state.
 */
function getGlobalZestStateSnapshot(): Record<string, any> {
    if (!registryRef) {
        console.warn('[Zest DevTools] Store registry reference not available for snapshot.');
        return {};
    }

    const snapshot: Record<string, any> = {};
    registryRef.forEach((entry, id) => {
        const storeInstance = entry.instance;
        let serializableState: any = {};

        if (entry.isSetupStore) {
            // --- Serialize Setup Store --- //
            if (typeof storeInstance === 'object' && storeInstance !== null) {
                for (const key in storeInstance) {
                    if (Object.prototype.hasOwnProperty.call(storeInstance, key)) {
                        const prop = (storeInstance as any)[key];
                        if (typeof prop !== 'function') { // Exclude functions
                            serializableState[key] = isRef(prop) ? prop.value : prop;
                        }
                    }
                }
            } else {
                // Handle cases where instance might not be an object (unlikely)
                serializableState = storeInstance;
            }
        } else {
            // --- Serialize Options Store --- //
            if (entry.initialStateKeys && typeof storeInstance === 'object' && storeInstance !== null) {
                // Use the stored keys to extract only the state properties
                entry.initialStateKeys.forEach(key => {
                    // Check if the key still exists on the instance (it should)
                    if (Object.prototype.hasOwnProperty.call(storeInstance, key)) {
                        serializableState[key] = (storeInstance as any)[key];
                    }
                });
            } else {
                // Fallback or warning if keys are missing for an options store
                console.warn(`[Zest DevTools - ${id}] Missing initialStateKeys for options store. Falling back to basic serialization.`);
                // Fallback to simple object clone excluding functions (might include getters)
                if (typeof storeInstance === 'object' && storeInstance !== null) {
                    for (const key in storeInstance) {
                        if (Object.prototype.hasOwnProperty.call(storeInstance, key)) {
                            const prop = (storeInstance as any)[key];
                            if (typeof prop !== 'function') {
                                serializableState[key] = prop;
                            }
                        }
                    }
                } else {
                    serializableState = storeInstance;
                }
            }
        }

        snapshot[id] = serializableState;
    });

    return snapshot;
}

/**
 * Sends the initial state of a newly created store to DevTools.
 * Called internally by defineZestStore if DevTools are enabled.
 *
 * @internal
 * @param storeId The unique ID of the store.
 * @param state The initial state of the store.
 */
export function _internal_initStoreState(storeId: string, state: StoreInstanceType): void {
    if (!connection) return;

    try {
        // DevTools usually expects a single state object. We might send the whole registry state later,
        // but for init, sending the individual store state might be okay, prefixed.
        // However, the standard is usually `init(initialStateObject)`.
        // Let's rethink this - init is usually called ONCE for the whole app state.
        // We might need a central state object representing all Zest stores.

        // --- Alternative Approach: Send an action for store init ---
        // Treat store initialization like an action
        const action = { type: `@@ZEST_INIT/${storeId}` };
        // Get the full current state AFTER this store is conceptually added
        const globalStateSnapshot = getGlobalZestStateSnapshot();

        // Let's stick to the `send` method for initialization for now.
        // It's more flexible if `init` is meant for the absolute initial state.
        console.log(`[Zest DevTools - ${storeId}] Sending initial state.`);
        // Send requires current state *after* action. Since this is init, state *is* the current state.
        // Send the formatted action and the complete global state.
        connection.send(action, globalStateSnapshot);

        // --- Original thought: Using connection.init() ---
        // connection.init({ [storeId]: state }); // This would replace the entire DevTools state

    } catch (error) {
        console.error(`[Zest DevTools - ${storeId}] Error sending initial state:`, error);
    }
}

/**
 * Sends an action and the resulting state to DevTools.
 *
 * @internal
 * @param storeId The ID of the store where the action occurred.
 * @param action The action identifier (e.g., 'increment') or a Redux-style action object.
 * @param payload Optional payload for the action.
 * @param _stateAfterStoreSpecific The state of the *specific store* after the action.
 */
export function _internal_sendAction(
    storeId: string,
    action: string | { type: string;[key: string]: any },
    payload: any | undefined,
    _stateAfterStoreSpecific: StoreInstanceType // Parameter renamed, no longer used directly
): void {
    if (!connection) return;

    try {
        const actionToSend = typeof action === 'string'
            ? { type: `${storeId}/${action}`, ...(payload !== undefined && { payload }) }
            : action; // Use the provided action object directly if it's not a string

        console.log(`[Zest DevTools - ${storeId}] Sending action:`, actionToSend.type);

        // We need the *global* state here for DevTools.
        const globalStateSnapshot = getGlobalZestStateSnapshot();

        connection.send(actionToSend, globalStateSnapshot);

    } catch (error) {
        console.error(`[Zest DevTools - ${storeId}] Error sending action "${String(action)}":`, error);
    }
}

/**
 * Resets the state of a single store instance based on a target state snapshot.
 * Handles differences between Options and Setup stores.
 *
 * @internal
 * @param entry The StoreRegistryEntry for the store to reset.
 * @param targetState The target state object for this specific store.
 */
function _internal_resetStoreState(entry: StoreRegistryEntry<StoreInstanceType>, targetState: Record<string, any>): void {
    const { instance, isSetupStore, id, changeSignal } = entry;
    // console.log(`[Zest DevTools - ${id}] Resetting state for ${isSetupStore ? 'Setup' : 'Options'} store.`);

    try {
        if (isSetupStore) {
            // --- Reset Setup Store --- //
            if (typeof instance === 'object' && instance !== null) {
                for (const key in targetState) {
                    if (Object.prototype.hasOwnProperty.call(targetState, key)) {
                        const targetValue = targetState[key];
                        const currentProp = (instance as any)[key];

                        if (Object.prototype.hasOwnProperty.call(instance, key)) {
                            if (isRef(currentProp) && !isRef(targetValue)) {
                                // If current is a ref, update its value
                                if (currentProp.value !== targetValue) {
                                    currentProp.value = targetValue;
                                }
                            } else if (currentProp !== targetValue) {
                                // Handle plain values or potentially replacing refs/other objects directly
                                // This might disconnect reactivity if we replace a ref object entirely
                                // Only assigning to .value is safer for refs.
                                // For non-refs, direct assignment might be okay, but potentially complex.
                                // Let's stick to updating .value for refs for now.
                                console.warn(`[Zest DevTools - ${id}] Skipping state reset for non-ref property "${key}" during time travel.`);
                            }
                        } else {
                            // Property exists in target state but not current instance - might need creation?
                            console.warn(`[Zest DevTools - ${id}] Property "${key}" exists in time travel state but not in current setup store instance.`);
                        }
                    }
                }
            } else {
                console.warn(`[Zest DevTools - ${id}] Cannot reset non-object setup store instance during time travel.`);
            }
        } else {
            // --- Reset Options Store --- //
            if (typeof instance === 'object' && instance !== null && entry.initialStateKeys) {
                // Iterate known state keys and update instance
                entry.initialStateKeys.forEach(key => {
                    if (Object.prototype.hasOwnProperty.call(targetState, key)) {
                        const targetValue = targetState[key];
                        if ((instance as any)[key] !== targetValue) {
                            // Direct assignment should trigger reactivity via proxy
                            (instance as any)[key] = targetValue;
                        }
                    } else {
                        // Key defined in initial state but not in target state - potentially remove/reset?
                        console.warn(`[Zest DevTools - ${id}] State key "${key}" missing in time travel state snapshot.`);
                    }
                });
                // Also handle keys present in targetState but not in initialStateKeys? Unlikely but possible.
            } else {
                console.warn(`[Zest DevTools - ${id}] Cannot reset options store instance (invalid instance or missing keys) during time travel.`);
            }
        }

        // IMPORTANT: After resetting state, trigger the store's change signal
        // This is crucial for useSyncExternalStore to pick up the change.
        changeSignal.value++;
        // console.log(`[Zest DevTools - ${id}] Triggered change signal after state reset.`);

    } catch (error) {
        console.error(`[Zest DevTools - ${id}] Error resetting store state during time travel:`, error);
    }
}

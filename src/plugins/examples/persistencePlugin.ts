import type { Plugin, PluginContextApi, StoreCreatedContext, AfterActionContext, StoreInstanceType } from '../types';
import { getStoreStateSnapshotInternal } from '../../devtools/connector'; // To get a clean snapshot
import { isRef } from '../../reactivity/ref'; // For checking setup store refs
import type { StoreRegistryEntry } from '../../store/types';

// Define a more specific type for what the plugin expects in store instances for setup stores
interface SetupStoreInstanceWithRefs extends StoreInstanceType {
    [key: string]: any | { value: any };
}


export interface PersistenceOptions {
    stores?: (string | { id: string; paths?: string[] })[]; // Array of store IDs or objects with ID and paths
    keyPrefix?: string;
    storage?: {
        getItem: (key: string) => string | null | Promise<string | null>;
        setItem: (key: string, value: string) => void | Promise<void>;
        removeItem: (key: string) => void | Promise<void>;
    };
    debug?: boolean;
}

const DEFAULT_KEY_PREFIX = 'dotzee_store_';

// Helper to get the actual store ID from a config entry
const getStoreIdFromConfig = (configEntry: string | { id: string; paths?: string[] }): string => {
    return typeof configEntry === 'string' ? configEntry : configEntry.id;
};

// Helper to get paths for a specific store ID
const getPathsForStore = (storeId: string, config: (string | { id: string; paths?: string[] })[] = []): string[] | undefined => {
    const storeConfig = config.find(entry => getStoreIdFromConfig(entry) === storeId);
    if (storeConfig && typeof storeConfig !== 'string') {
        return storeConfig.paths;
    }
    return undefined;
};

// Helper to get a nested property
function getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => (current && current[key] !== undefined ? current[key] : undefined), obj);
}

// Helper to set a nested property
function setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }
    current[keys[keys.length - 1]] = value;
}

export function persistencePlugin(options?: PersistenceOptions): Plugin {
    const { keyPrefix = DEFAULT_KEY_PREFIX, stores = [], storage: customStorage, debug = false } = options || {};
    const storageAPI = customStorage || (typeof window !== 'undefined' ? window.localStorage : undefined);

    const getStorageKey = (storeId: string) => `${keyPrefix}${storeId}`;

    const log = (...args: any[]) => {
        if (debug) {
            console.log('[DotzeePersistence]', ...args);
        }
    };

    const loadState = async <S extends Record<string, any>>(storeId: string): Promise<S | null> => {
        if (!storageAPI) return null;
        try {
            const serializedState = await storageAPI.getItem(getStorageKey(storeId));
            if (serializedState === null) {
                return null;
            }
            return JSON.parse(serializedState) as S;
        } catch (error) {
            console.error(`[DotzeePersistence] Error loading state for store "${storeId}":`, error);
            return null;
        }
    };

    const saveState = async (storeId: string, state: Record<string, any>): Promise<void> => {
        if (!storageAPI) return;
        try {
            const serializedState = JSON.stringify(state);
            await storageAPI.setItem(getStorageKey(storeId), serializedState);
            log(`Saved state for store "${storeId}" to key "${getStorageKey(storeId)}"`, state);
        } catch (error) {
            console.error(`[DotzeePersistence] Error saving state for store "${storeId}":`, error);
        }
    };

    return {
        name: 'DotzeePersistence',
        install: (context: PluginContextApi) => {
            if (!storageAPI) {
                console.warn(`[DotzeePersistence] No storage mechanism available (localStorage or custom). Plugin will not run.`);
                return;
            }

            const activeStores = new Set<string>(stores.map(getStoreIdFromConfig));

            context.onStoreCreated(async (storeContext: StoreCreatedContext) => {
                const { storeEntry } = storeContext;
                const { id: storeId, instance, isSetupStore, initialStateKeys, changeSignal } = storeEntry;

                if (!activeStores.has(storeId)) return;

                const persistedState = await loadState(storeId);
                if (persistedState) {
                    console.log(`[DotzeePersistence] Hydrating store "${storeId}" from storage`, persistedState);
                    let stateChanged = false;

                    if (isSetupStore) {
                        const setupInstance = instance as SetupStoreInstanceWithRefs;
                        for (const key in persistedState) {
                            if (Object.prototype.hasOwnProperty.call(persistedState, key) &&
                                setupInstance[key] && isRef(setupInstance[key])) {
                                if (setupInstance[key].value !== persistedState[key]) {
                                    setupInstance[key].value = persistedState[key];
                                    stateChanged = true;
                                }
                            }
                        }
                    } else { // Options Store
                        const paths = getPathsForStore(storeId, stores) || initialStateKeys;
                        if (paths) {
                            paths.forEach(key => {
                                if (Object.prototype.hasOwnProperty.call(persistedState, key)) {
                                    if ((instance as any)[key] !== persistedState[key]) {
                                        (instance as any)[key] = persistedState[key];
                                        stateChanged = true;
                                    }
                                }
                            });
                        } else { // No paths and no initialStateKeys, attempt to merge all (less safe)
                            for (const key in persistedState) {
                                if (Object.prototype.hasOwnProperty.call(persistedState, key)) {
                                    if ((instance as any)[key] !== persistedState[key]) {
                                        (instance as any)[key] = persistedState[key];
                                        stateChanged = true;
                                    }
                                }
                            }
                        }
                    }
                    if (stateChanged) {
                        changeSignal.value++;
                    }
                }
            });

            context.afterAction(async (actionContext: AfterActionContext) => {
                const { storeEntry, error } = actionContext;
                const { id: storeId, instance, isSetupStore, initialStateKeys } = storeEntry;

                if (!activeStores.has(storeId) || error) return;

                const paths = getPathsForStore(storeId, stores);
                let stateToPersist: Record<string, any>;

                if (isSetupStore) {
                    // For setup stores, paths are ignored, snapshot the whole thing.
                    stateToPersist = getStoreStateSnapshotInternal(instance, true, undefined);
                } else { // Options store
                    const snapshot = getStoreStateSnapshotInternal(instance, false, initialStateKeys);
                    if (paths) {
                        stateToPersist = {};
                        paths.forEach(path => {
                            const value = getNestedProperty(snapshot, path);
                            if (value !== undefined) {
                                setNestedProperty(stateToPersist, path, value);
                            }
                        });
                    } else {
                        // No paths specified, persist based on initialStateKeys (which getStoreStateSnapshotInternal uses)
                        stateToPersist = snapshot;
                    }
                }

                if (stateToPersist && Object.keys(stateToPersist).length > 0) {
                    await saveState(storeId, stateToPersist);
                } else if (stateToPersist && Object.keys(stateToPersist).length === 0 && paths && paths.length > 0) {
                    // If paths were specified but resulted in an empty object, still save it (e.g. to clear out old fields)
                    await saveState(storeId, stateToPersist);
                } else {
                    log(`No state to persist for store "${storeId}" after action "${actionContext.actionName}". Snapshot was empty or not generated.`);
                }
            });

            console.log(`[DotzeePersistence] Plugin installed with options:`, options);
        },
    };
} 
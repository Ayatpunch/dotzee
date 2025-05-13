import type { Plugin, PluginContextApi, StoreCreatedContext, AfterActionContext } from '../types';
import { getStoreStateSnapshotInternal } from '../../devtools/connector'; // To get a clean snapshot

const STORAGE_KEY_PREFIX = 'zest_store_';

/**
 * Tries to load state from localStorage.
 * @param storeId The ID of the store.
 * @returns The persisted state or null if not found or error.
 */
const loadState = <S extends Record<string, any>>(storeId: string): S | null => {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
        const serializedState = localStorage.getItem(`${STORAGE_KEY_PREFIX}${storeId}`);
        if (serializedState === null) {
            return null;
        }
        return JSON.parse(serializedState) as S;
    } catch (error) {
        console.error(`[ZestPersistence] Error loading state for store "${storeId}":`, error);
        return null;
    }
};

/**
 * Tries to save state to localStorage.
 * @param storeId The ID of the store.
 * @param state The state to save.
 */
const saveState = (storeId: string, state: Record<string, any>): void => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${storeId}`, serializedState);
    } catch (error) {
        console.error(`[ZestPersistence] Error saving state for store "${storeId}":`, error);
    }
};

export const persistencePlugin: Plugin = {
    name: 'ZestPersistence',
    install: (context: PluginContextApi) => {
        context.onStoreCreated((storeContext: StoreCreatedContext) => {
            const { storeEntry } = storeContext;
            const { id: storeId, instance, isSetupStore, initialStateKeys, changeSignal } = storeEntry;

            // 1. Load persisted state when store is created
            const persistedState = loadState(storeId);
            if (persistedState) {
                console.log(`[${persistencePlugin.name}] Hydrating store "${storeId}" from localStorage`, persistedState);
                // Apply the persisted state. This is similar to SSR hydration.
                // We need to be careful not to break reactivity or cause unwanted effects.
                if (isSetupStore) {
                    for (const key in persistedState) {
                        if (Object.prototype.hasOwnProperty.call(persistedState, key) && instance[key] && typeof instance[key].value !== 'undefined') { // Check for ref-like structure
                            instance[key].value = persistedState[key];
                        }
                    }
                } else {
                    if (initialStateKeys) {
                        initialStateKeys.forEach(key => {
                            if (Object.prototype.hasOwnProperty.call(persistedState, key)) {
                                (instance as any)[key] = persistedState[key];
                            }
                        });
                    }
                }
                // Important: Trigger change signal *after* hydrating from storage if state actually changed.
                // For simplicity, we trigger it if persistedState was found.
                // A more robust check would compare if values actually changed.
                changeSignal.value++;
            }
        });

        context.afterAction((actionContext: AfterActionContext) => {
            const { storeEntry, error } = actionContext;
            const { id: storeId, instance, isSetupStore, initialStateKeys } = storeEntry;

            // 2. Save state after an action successfully completes
            if (!error) {
                // Get a clean, serializable snapshot of the current store state
                const currentStoreState = getStoreStateSnapshotInternal(instance, isSetupStore, initialStateKeys);
                if (currentStoreState) {
                    // console.log(`[${persistencePlugin.name}] Persisting state for store "${storeId}" after action "${actionContext.actionName}"`, currentStoreState);
                    saveState(storeId, currentStoreState);
                }
            }
        });

        console.log(`[${persistencePlugin.name}] Plugin installed.`);
    },
}; 
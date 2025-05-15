import { isRef } from '../reactivity/ref';
import type { DotzeeRegistry, StoreRegistryEntry, StoreInstanceType } from '../store/types';

/**
 * Hydrates the state of a single store instance based on a snapshot, *without* triggering change signals.
 * Used during initial client-side hydration.
 * @param entry The store registry entry.
 * @param targetStoreState The target state for the individual store from the server snapshot.
 * @internal
 */
function _internal_hydrateStoreState(entry: StoreRegistryEntry<StoreInstanceType>, targetStoreState: Record<string, any>): void {
    const storeId = entry.id;
    if (entry.isSetupStore) {
        // Hydrate Setup Store: Update .value of refs
        for (const key in targetStoreState) {
            if (Object.prototype.hasOwnProperty.call(targetStoreState, key) && entry.instance[key] && isRef(entry.instance[key])) {
                // Only update if the value differs? Or always set? Let's always set for hydration simplicity.
                entry.instance[key].value = targetStoreState[key];
            } else if (Object.prototype.hasOwnProperty.call(targetStoreState, key) && !entry.instance[key]) {
                console.warn(`[Dotzee SSR Hydration - ${storeId}] Property "${key}" found in hydration snapshot but not in client-side setup store instance.`);
            }
        }
    } else {
        // Hydrate Options Store: Directly assign to state properties
        if (entry.initialStateKeys) {
            entry.initialStateKeys.forEach(key => {
                if (Object.prototype.hasOwnProperty.call(targetStoreState, key)) {
                    (entry.instance as any)[key] = targetStoreState[key];
                }
                // else {
                // Optional: Warn if a state key is missing in the hydration snapshot?
                // console.warn(`[Dotzee SSR Hydration - ${storeId}] Initial state key "${key}" missing in hydration snapshot.`);
                //}
            });
        } else {
            // Should not happen for correctly defined Options stores
            console.warn(`[Dotzee SSR Hydration - ${storeId}] Missing initialStateKeys for options store during hydration.`);
            // Attempt a less safe merge as a fallback?
            // Object.assign(entry.instance, targetStoreState);
        }
    }
    // DO NOT increment entry.changeSignal.value++; here!
}

/**
 * Hydrates Dotzee stores on the client with state received from the server.
 * This should be called *before* the main React application is mounted.
 *
 * It iterates through the provided state snapshot and applies the state
 * to the corresponding stores found in the target registry (usually the global registry).
 *
 * @param registry The DotzeeRegistry instance to hydrate (typically the global one on the client).
 * @param initialStateSnapshot The state object received from the server, where keys are store IDs.
 */
export function hydrateDotzeeState(registry: DotzeeRegistry, initialStateSnapshot: Record<string, any>): void {
    if (!initialStateSnapshot || typeof initialStateSnapshot !== 'object') {
        console.warn('[Dotzee SSR Hydration] Invalid initialStateSnapshot received. Skipping hydration.');
        return;
    }

    console.log('[Dotzee SSR Hydration] Starting hydration...', initialStateSnapshot);

    for (const storeId in initialStateSnapshot) {
        if (Object.prototype.hasOwnProperty.call(initialStateSnapshot, storeId)) {
            const targetStoreState = initialStateSnapshot[storeId];
            const entry = registry.get(storeId);

            if (entry) {
                // console.log(`[Dotzee SSR Hydration - ${storeId}] Hydrating store...`);
                _internal_hydrateStoreState(entry, targetStoreState);
            } else {
                // This is expected if the store's defineDotzeeStore hasn't run yet on the client.
                // It usually indicates that the component using the store wasn't part of the initial
                // server render or its module hasn't been loaded/parsed yet.
                // console.warn(`[Dotzee SSR Hydration - ${storeId}] Store definition not found in registry during hydration. State for this store was not applied.`);
                // No warning needed here, as stores might be lazy-loaded after hydration
            }
        }
    }
    console.log('[Dotzee SSR Hydration] Hydration complete.');

} 
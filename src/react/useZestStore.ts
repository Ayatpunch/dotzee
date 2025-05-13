import { useSyncExternalStore } from 'react';
import { ZestStoreHook, StoreInstanceType } from '../store/types';
import { subscribeRef } from '../reactivity/ref';
// Removed import for _test_storeRegistry as it's no longer needed here

/**
 * React hook to subscribe to a Zest store and get its instance.
 *
 * @template T The type of the store instance.
 * @param {ZestStoreHook<T>} storeHook The hook function returned by defineZestStore.
 * @returns {T} The reactive store instance.
 */
export function useZestStore<T extends StoreInstanceType>(storeHook: ZestStoreHook<T>): T {

    // 1. Get the necessary properties directly from the hook function object
    const getStoreInstance = storeHook; // The function itself gets the instance
    const changeSignalRef = storeHook.$changeSignal; // Access the attached signal ref
    const storeId = storeHook.$id; // Access the attached ID

    if (!changeSignalRef) {
        // This check might still be useful during development or if the hook is somehow malformed
        console.error(`[Zest] Store hook for ID '${storeId || 'unknown'}' is missing its change signal.`);
        // Attempt to return the instance non-reactively
        return getStoreInstance();
    }

    // 2. Define the subscribe function for useSyncExternalStore
    const subscribeFn = (onStoreChange: () => void): (() => void) => {
        // Subscribe to the specific store's change signal ref
        const unsubscribe = subscribeRef(changeSignalRef, onStoreChange);
        // console.log(`[Zest - ${storeId}] Subscribing component.`);
        return () => {
            // console.log(`[Zest - ${storeId}] Unsubscribing component.`);
            unsubscribe();
        };
    };

    // 3. Define the getSnapshot function (for client-side updates)
    const getSnapshot = (): number => {
        // console.log(`[Zest - ${storeId}] Getting client snapshot (signal value).`);
        // Return the current value of the change signal
        return changeSignalRef.value;
    };

    // 3.5 Define the getServerSnapshot function (for initial server render)
    //     This needs to return the initial state consistent with the server render.
    //     Since our client getSnapshot relies on the signal value, we return the
    //     initial signal value here as well for consistency.
    const getServerSnapshot = (): number => {
        // console.log(`[Zest - ${storeId}] Getting server snapshot (initial signal value).`);
        return changeSignalRef.value; // Return the initial value (likely 0)
    };

    // 4. Use the hook, now providing getServerSnapshot
    useSyncExternalStore(subscribeFn, getSnapshot, getServerSnapshot); // Use the hook to subscribe

    // console.log(`[Zest - ${storeId}] Component rendering with store instance.`);
    // Return the actual store instance for the component to use
    return getStoreInstance();
} 
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

    // 3. Define the getSnapshot function
    //    This function should return the current state/value that the component depends on.
    //    Returning the entire store instance works for now.
    //    React uses Object.is comparison on snapshots, so returning the same instance
    //    when the signal fires but the relevant state hasn't changed is important.
    // ---> UPDATE: Returning the instance itself can cause React to bail out of updates
    // ---> if the instance reference hasn't changed. Return the signal value instead
    // ---> to force React to acknowledge the change.
    const getSnapshot = (): number => {
        // console.log(`[Zest - ${storeId}] Getting snapshot (signal value).`);
        // Return the current value of the change signal
        return changeSignalRef.value;
    };

    // 4. Use the hook
    //    Even though the snapshot is just the signal's value, useSyncExternalStore
    //    will trigger a re-render. The component then gets the up-to-date store
    //    instance via the `getStoreInstance()` call inside the hook body.
    useSyncExternalStore(subscribeFn, getSnapshot); // Use the hook to subscribe

    // console.log(`[Zest - ${storeId}] Component rendering with store instance.`);
    // Return the actual store instance for the component to use
    return getStoreInstance();
} 
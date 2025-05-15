import { reactive } from '../reactivity/reactive';
import { ref, setActiveStoreTrigger, clearActiveStoreTrigger, Ref, isRef, subscribeRef } from '../reactivity/ref';
import { computed, isComputed } from '../reactivity/computed';
import { useSyncExternalStore } from 'react';
// Import DevTools connector functions and state
import {
    _internal_initStoreState,
    isDotzeeDevToolsEnabled,
    _internal_sendAction,
    getStoreStateSnapshotInternal // Import the new snapshot utility
} from '../devtools/connector';
// Import registry functions
import { getActiveDotzeeRegistry, getGlobalDotzeeRegistry } from './registry';
// Import Plugin notification functions
import { _notifyStoreCreated, _notifyBeforeAction, _notifyAfterAction } from '../plugins/manager';

import type {
    DefineDotzeeStoreOptions,
    StoreActions,
    StoreGetters,
    StoreInstance,
    SetupStoreFunction,
    SetupStoreReturnType,
    StoreInstanceType,
    StoreRegistryEntry,
    DotzeeStoreHook,
    MappedGetters,
    DotzeeRegistry
} from './types';
import type { ActionContext, AfterActionContext } from '../plugins/types'; // For plugin contexts

// Registry uses the generic StoreRegistryEntry
// const storeRegistry = new Map<string, StoreRegistryEntry<StoreInstanceType>>(); // REMOVED: No longer using local registry const

// Export the registry itself for DevTools integration
/** @internal */
// export { storeRegistry as _internal_storeRegistry }; // REMOVED: Exporting getter instead
/** @internal */
export { getGlobalDotzeeRegistry as _internal_storeRegistry }; // Keep this name for DevTools setup compatibility for now


// Export for testing purposes ONLY
/** @internal */
// export const _test_storeRegistry = storeRegistry; // REMOVED: Export getter if needed for tests, or use the global one


// Overload signatures for defineDotzeeStore
export function defineDotzeeStore<
    Id extends string,
    S extends object,
    A extends StoreActions<S, G>,
    G extends StoreGetters<S, G>
>(
    id: Id,
    options: DefineDotzeeStoreOptions<S, A, G>
): DotzeeStoreHook<StoreInstance<S, A, G>>;

export function defineDotzeeStore<Id extends string, R extends SetupStoreReturnType>(
    id: Id,
    setup: SetupStoreFunction<R>
): DotzeeStoreHook<R>;

// Implementation signature - Now returns a more specific DotzeeStoreHook<T>
// We use a conditional type within the implementation's return type as well,
// although the overloads are the primary source of truth for external users.
export function defineDotzeeStore<
    Id extends string,
    S extends object,
    A extends StoreActions<S, G>,
    G extends StoreGetters<S, G>,
    R extends SetupStoreReturnType
>(
    id: Id,
    optionsOrSetup: DefineDotzeeStoreOptions<S, A, G> | SetupStoreFunction<R>
): DotzeeStoreHook<StoreInstance<S, A, G> | R> { // More specific return type

    const currentRegistry = getActiveDotzeeRegistry(); // Get the active registry

    // 1. Check registry - Use the active registry
    if (currentRegistry.has(id)) {
        const entry = currentRegistry.get(id)!;
        return entry.hook as DotzeeStoreHook<StoreInstance<S, A, G> | R>;
    }

    // 2. Create internal signal and trigger (common for both types)
    const changeSignalInternal = ref(0);
    const triggerChange = () => { changeSignalInternal.value++; };

    let storeInstanceInternal: StoreInstance<S, A, G> | R;
    let isSetupStore = typeof optionsOrSetup === 'function';
    let initialStateKeys: string[] | undefined = undefined; // Initialize for options store state keys

    // This will be populated before being used by action wrappers
    let tempRegistryEntryForActionWrappers: StoreRegistryEntry<StoreInstanceType>;

    if (isSetupStore) {
        // --- Setup Store Logic --- //
        const setupFunction = optionsOrSetup as SetupStoreFunction<R>;
        setActiveStoreTrigger(triggerChange);
        let rawSetupResult: R;
        try {
            // User calls our ref() etc. inside this function
            rawSetupResult = setupFunction(); // Get the raw result
        } finally {
            // Always clear the context
            clearActiveStoreTrigger();
        }

        // Wrap functions returned by setup for DevTools action reporting
        const wrappedInstance = {} as R; // Initialize as the inferred return type
        for (const key in rawSetupResult) {
            if (Object.prototype.hasOwnProperty.call(rawSetupResult, key)) {
                const originalProp = (rawSetupResult as any)[key];

                if (typeof originalProp === 'function') {
                    // Wrap the function (potential action)
                    (wrappedInstance as any)[key] = async function (...args: any[]) {
                        const actionCtx: ActionContext = {
                            storeEntry: tempRegistryEntryForActionWrappers!, // Assert non-null: will be set before actions are callable
                            actionName: key,
                            args: args
                        };
                        _notifyBeforeAction(actionCtx);

                        let result: any;
                        let error: any;
                        try {
                            result = originalProp(...args);
                            if (result instanceof Promise) {
                                result = await result;
                            }
                        } catch (e) {
                            error = e;
                        }

                        const afterActionCtx: AfterActionContext = {
                            ...actionCtx,
                            result,
                            error
                        };
                        _notifyAfterAction(afterActionCtx);

                        if (isDotzeeDevToolsEnabled()) {
                            _internal_sendAction(id, key, args.length > 0 ? args[0] : undefined, currentRegistry);
                        }
                        if (error) throw error; // Re-throw after notifications
                        return result;
                    };
                } else {
                    // Assign non-functions directly (refs, computed, values)
                    (wrappedInstance as any)[key] = originalProp;
                }
            }
        }
        storeInstanceInternal = wrappedInstance; // Use the wrapped instance
        // --- End Setup Store Logic --- //
    } else {
        // --- Options Store Logic --- //
        const options = optionsOrSetup as DefineDotzeeStoreOptions<S, A, G>; // Use generics here
        const initialState = options.state();
        initialStateKeys = Object.keys(initialState); // <-- Store initial state keys
        const reactiveState = reactive(initialState, triggerChange); // Link state to trigger

        // Start with the reactive state as the base instance
        // Cast to the specific StoreInstance type
        const instance = reactiveState as StoreInstance<S, A, G>;

        // Define getters first, as actions might need to access them via `this`
        if (options.getters) {
            for (const key in options.getters) {
                if (Object.prototype.hasOwnProperty.call(options.getters, key)) {
                    const getterFn = options.getters[key];
                    // Create computed ref, passing reactive state to the getter function
                    // State type S is implicitly captured here
                    const computedRef = computed(() => getterFn(reactiveState as S));

                    // Define the getter property on the instance
                    Object.defineProperty(instance, key, {
                        get: () => computedRef.value,
                        enumerable: true, // Ensure getter shows up in keys/loops
                        configurable: true, // Should be configurable
                    });
                }
            }
        }

        // Bind actions to the instance (which now includes state and getters)
        if (options.actions) {
            for (const key in options.actions) {
                if (Object.prototype.hasOwnProperty.call(options.actions, key)) {
                    const actionFn = options.actions[key];
                    // Wrap the action to send to DevTools if enabled
                    (instance as any)[key] = async function (...args: any[]) { // Make wrapper async to handle promises
                        const actionCtx: ActionContext = {
                            storeEntry: tempRegistryEntryForActionWrappers!, // Assert non-null
                            actionName: key,
                            args: args
                        };
                        _notifyBeforeAction(actionCtx);

                        let result: any;
                        let error: any;
                        try {
                            result = actionFn.apply(instance, args);
                            if (result instanceof Promise) {
                                result = await result;
                            }
                        } catch (e) {
                            error = e;
                        }

                        const afterActionCtx: AfterActionContext = {
                            ...actionCtx,
                            result,
                            error
                        };
                        _notifyAfterAction(afterActionCtx);

                        if (isDotzeeDevToolsEnabled()) {
                            _internal_sendAction(id, key, args.length > 0 ? args[0] : undefined, currentRegistry);
                        }
                        if (error) throw error; // Re-throw after notifications
                        return result; // Return the original result (e.g., promise or value)
                    };
                }
            }
        }

        storeInstanceInternal = instance; // Instance now includes state, getters, and bound actions
        // --- End Options Store Logic --- //
    }

    // 3. Create the hook function that incorporates useSyncExternalStore logic
    const userFacingHook = (): StoreInstance<S, A, G> | R => {
        if (!changeSignalInternal) { // Should ideally not happen if correctly defined
            console.error(`[Dotzee] Store hook for ID '${id || 'unknown'}' is missing its change signal.`);
            return storeInstanceInternal;
        }

        const subscribeFn = (onStoreChange: () => void): (() => void) => {
            const unsubscribe = subscribeRef(changeSignalInternal, onStoreChange);
            return () => {
                unsubscribe();
            };
        };

        const getSnapshot = (): number => {
            return changeSignalInternal.value;
        };

        const getServerSnapshot = (): number => {
            return changeSignalInternal.value;
        };

        useSyncExternalStore(subscribeFn, getSnapshot, getServerSnapshot);
        return storeInstanceInternal;
    };

    // Attach $id and $changeSignal to the userFacingHook itself
    // Cast to any to attach properties, then cast to DotzeeStoreHook
    (userFacingHook as any).$id = id;
    (userFacingHook as any).$changeSignal = changeSignalInternal;
    const finalHook = userFacingHook as DotzeeStoreHook<StoreInstance<S, A, G> | R>;

    // 4. Create registry entry, storing the final hook
    const registryEntry: StoreRegistryEntry<StoreInstanceType> = {
        hook: finalHook,
        instance: storeInstanceInternal,
        changeSignal: changeSignalInternal,
        id: id,
        isSetupStore: isSetupStore,
        initialStateKeys: initialStateKeys
    };

    // Assign to the temporary variable for action wrappers to use
    tempRegistryEntryForActionWrappers = registryEntry;

    // 5. Store the new entry - Use the active registry
    currentRegistry.set(id, registryEntry);

    // 5.1 If DevTools are enabled, send initial state
    if (isDotzeeDevToolsEnabled()) {
        // Use getStoreStateSnapshotInternal for a complete initial snapshot including plugin modifications
        const initialSnapshotForDevTools = getStoreStateSnapshotInternal(
            registryEntry.instance, // Instance might have been extended by plugins
            registryEntry.isSetupStore,
            registryEntry.initialStateKeys
        );
        _internal_initStoreState(id, initialSnapshotForDevTools, currentRegistry);
    }

    // Notify plugins about store creation (plugins can extend the instance here)
    _notifyStoreCreated({ storeEntry: registryEntry });

    // 6. Return the newly created hook function
    return finalHook;
} 
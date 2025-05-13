import { reactive } from '../reactivity/reactive';
import { ref, setActiveStoreTrigger, clearActiveStoreTrigger, Ref, isRef } from '../reactivity/ref';
import { computed } from '../reactivity/computed';
// Import DevTools connector functions and state
import {
    _internal_initStoreState,
    isZestDevToolsEnabled,
    _internal_sendAction,
    getStoreStateSnapshotInternal // Import the new snapshot utility
} from '../devtools/connector';
// Import registry functions
import { getActiveZestRegistry, getGlobalZestRegistry } from './registry';
// Import Plugin notification functions
import { _notifyStoreCreated, _notifyBeforeAction, _notifyAfterAction } from '../plugins/manager';

import type {
    DefineZestStoreOptions,
    StoreActions,
    StoreGetters,
    StoreInstance,
    SetupStoreFunction,
    SetupStoreReturnType,
    StoreInstanceType,
    StoreRegistryEntry,
    ZestStoreHook,
    MappedGetters,
    ZestRegistry
} from './types';
import type { ActionContext, AfterActionContext } from '../plugins/types'; // For plugin contexts

// Registry uses the generic StoreRegistryEntry
// const storeRegistry = new Map<string, StoreRegistryEntry<StoreInstanceType>>(); // REMOVED: No longer using local registry const

// Export the registry itself for DevTools integration
/** @internal */
// export { storeRegistry as _internal_storeRegistry }; // REMOVED: Exporting getter instead
/** @internal */
export { getGlobalZestRegistry as _internal_storeRegistry }; // Keep this name for DevTools setup compatibility for now


// Export for testing purposes ONLY
/** @internal */
// export const _test_storeRegistry = storeRegistry; // REMOVED: Export getter if needed for tests, or use the global one


// Overload signatures for defineZestStore
export function defineZestStore<
    Id extends string,
    S extends object,
    A extends StoreActions<S, G>,
    G extends StoreGetters<S, G>
>(
    id: Id,
    options: DefineZestStoreOptions<S, A, G>
): ZestStoreHook<StoreInstance<S, A, G>>;

export function defineZestStore<Id extends string, R extends SetupStoreReturnType>(
    id: Id,
    setup: SetupStoreFunction<R>
): ZestStoreHook<R>;

// Implementation signature - Now returns a more specific ZestStoreHook<T>
// We use a conditional type within the implementation's return type as well,
// although the overloads are the primary source of truth for external users.
export function defineZestStore<
    Id extends string,
    S extends object,
    A extends StoreActions<S, G>,
    G extends StoreGetters<S, G>,
    R extends SetupStoreReturnType
>(
    id: Id,
    optionsOrSetup: DefineZestStoreOptions<S, A, G> | SetupStoreFunction<R>
): ZestStoreHook<StoreInstance<S, A, G> | R> { // More specific return type

    const currentRegistry = getActiveZestRegistry(); // Get the active registry

    // 1. Check registry - Use the active registry
    if (currentRegistry.has(id)) {
        const entry = currentRegistry.get(id)!;
        // Return the *stored hook function* itself
        // Cast needed as registry stores the generic StoreRegistryEntry
        // The external overloads ensure the user gets the correctly typed hook
        return entry.hook as ZestStoreHook<StoreInstance<S, A, G> | R>;
    }

    // 2. Create internal signal and trigger (common for both types)
    const changeSignal = ref(0);
    const triggerChange = () => { changeSignal.value++; };

    let storeInstance: StoreInstance<S, A, G> | R;
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

                        if (isZestDevToolsEnabled()) {
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
        storeInstance = wrappedInstance; // Use the wrapped instance
        // --- End Setup Store Logic --- //
    } else {
        // --- Options Store Logic --- //
        const options = optionsOrSetup as DefineZestStoreOptions<S, A, G>; // Use generics here
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

                        if (isZestDevToolsEnabled()) {
                            _internal_sendAction(id, key, args.length > 0 ? args[0] : undefined, currentRegistry);
                        }
                        if (error) throw error; // Re-throw after notifications
                        return result; // Return the original result (e.g., promise or value)
                    };
                }
            }
        }

        storeInstance = instance; // Instance now includes state, getters, and bound actions
        // --- End Options Store Logic --- //
    }

    // 3. Create the hook function *before* creating the registry entry
    // Cast to the combined specific type for the hook
    const newHook = (() => storeInstance) as ZestStoreHook<StoreInstance<S, A, G> | R>;
    newHook.$id = id;
    newHook.$changeSignal = changeSignal;

    // 4. Create registry entry, storing the hook
    // Registry still uses the generic StoreInstanceType for internal storage flexibility
    const registryEntry: StoreRegistryEntry<StoreInstanceType> = {
        hook: newHook, // Store the hook itself (which is now more specifically typed)
        instance: storeInstance, // Keep instance for potential direct internal access
        changeSignal: changeSignal,
        id: id,
        isSetupStore: isSetupStore, // <-- Set the flag
        initialStateKeys: initialStateKeys // <-- Set the keys (undefined for setup stores)
    };

    // Assign to the temporary variable for action wrappers to use
    tempRegistryEntryForActionWrappers = registryEntry;

    // 5. Store the new entry - Use the active registry
    currentRegistry.set(id, registryEntry);

    // 5.1 If DevTools are enabled, send initial state
    if (isZestDevToolsEnabled()) {
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

    // 6. Return the newly created hook function (now correctly typed thanks to overloads and internal casting)
    return newHook;
} 
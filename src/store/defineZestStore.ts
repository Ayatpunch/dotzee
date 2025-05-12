import { reactive } from '../reactivity/reactive';
import { ref, setActiveStoreTrigger, clearActiveStoreTrigger, Ref, isRef } from '../reactivity/ref';
import { computed } from '../reactivity/computed';
// Import DevTools connector functions and state
import { _internal_initStoreState, isZestDevToolsEnabled, _internal_sendAction } from '../devtools/connector';
// Need a way to check if enabled without importing the flag directly
// Let's modify connector.ts later to export a getter function like `isZestDevToolsEnabled()`
// For now, we'll assume a mechanism exists or skip the check temporarily for structure.
// import { isDevToolsEnabled } from '../devtools/connector'; // Temporary import for concept

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
} from './types';

// Registry uses the generic StoreRegistryEntry
const storeRegistry = new Map<string, StoreRegistryEntry<StoreInstanceType>>();

// Export the registry itself for DevTools integration
/** @internal */
export { storeRegistry as _internal_storeRegistry };

// Export for testing purposes ONLY
/** @internal */
export const _test_storeRegistry = storeRegistry;

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
export function defineZestStore<Id extends string,
    S extends object,
    A extends StoreActions<S, G>,
    G extends StoreGetters<S, G>,
    R extends SetupStoreReturnType
>(
    id: Id,
    optionsOrSetup: DefineZestStoreOptions<S, A, G> | SetupStoreFunction<R>
): ZestStoreHook<StoreInstance<S, A, G> | R> { // More specific return type

    // 1. Check registry - Return the stored hook directly if found
    if (storeRegistry.has(id)) {
        const entry = storeRegistry.get(id)!;
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
                        // Note: `this` context inside setup functions isn't typically the store instance itself
                        // We call the original function without binding `this` to the wrappedInstance
                        const result = originalProp(...args);

                        if (isZestDevToolsEnabled()) {
                            let actionPayload = args.length > 0 ? args[0] : undefined;
                            if (result instanceof Promise) {
                                try {
                                    await result;
                                } catch (e) {
                                    console.warn(`[Zest DevTools - ${id}] Action "${key}" (async setup fn) rejected.`, e);
                                    _internal_sendAction(id, key, actionPayload, wrappedInstance); // Send state *after* error
                                    throw e; // Re-throw
                                }
                            }
                            // Send action after sync/async completion
                            _internal_sendAction(id, key, actionPayload, wrappedInstance);
                        }
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
                        const result = actionFn.apply(instance, args);

                        if (isZestDevToolsEnabled()) {
                            let actionPayload = args.length > 0 ? args[0] : undefined;
                            // If the action returns a promise, wait for it to resolve
                            if (result instanceof Promise) {
                                try {
                                    await result;
                                } catch (e) {
                                    // Don't prevent error from propagating, but still log action
                                    console.warn(`[Zest DevTools - ${id}] Action "${key}" (async) rejected.`, e);
                                    // We still send the action, the state after will reflect the pre-error state or partially updated state.
                                    _internal_sendAction(id, key, actionPayload, storeInstance);
                                    throw e; // Re-throw the error
                                }
                            }
                            // Send action after it has completed (and potentially mutated state)
                            _internal_sendAction(id, key, actionPayload, storeInstance);
                        }
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

    // 5. Store the new entry
    storeRegistry.set(id, registryEntry);

    // 5.1 If DevTools are enabled, send initial state
    if (isZestDevToolsEnabled()) {
        // We need a non-proxied, serializable version of the state.
        // For options stores, storeInstance is already the reactive proxy of initialState.
        // For setup stores, storeInstance is the returned object (which might contain refs, plain values, functions).
        // DevTools usually expects plain JS objects.

        let serializableState: any;
        if (isSetupStore) {
            // For setup stores, iterate over the returned properties
            // and unwrap any refs. Functions should probably be omitted.
            serializableState = {};
            for (const key in storeInstance) {
                if (Object.prototype.hasOwnProperty.call(storeInstance, key)) {
                    const prop = (storeInstance as any)[key];
                    if (typeof prop !== 'function') {
                        serializableState[key] = isRef(prop) ? prop.value : prop;
                    }
                }
            }
        } else {
            // For options stores, the storeInstance IS the state (plus methods/getters).
            // We need to extract the original state parts, excluding methods and getters.
            // The `initialState` variable below might not exist here if we refactor.
            // The original options.state() gives the raw initial data.
            serializableState = (optionsOrSetup as DefineZestStoreOptions<S, A, G>).state();
        }
        _internal_initStoreState(id, serializableState);
    }

    // 6. Return the newly created hook function (now correctly typed thanks to overloads and internal casting)
    return newHook;
} 
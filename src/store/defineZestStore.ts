import { reactive } from '../reactivity/reactive';
import { ref, setActiveStoreTrigger, clearActiveStoreTrigger, Ref } from '../reactivity/ref';
import { computed } from '../reactivity/computed';
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

    // Use a type that can hold either instance type
    let storeInstance: StoreInstance<S, A, G> | R;
    let isSetupStore = typeof optionsOrSetup === 'function';

    if (isSetupStore) {
        // --- Setup Store Logic --- //
        const setupFunction = optionsOrSetup as SetupStoreFunction<R>;
        setActiveStoreTrigger(triggerChange);
        try {
            // User calls our ref() etc. inside this function
            storeInstance = setupFunction() as R; // Cast to R here
        } finally {
            // Always clear the context
            clearActiveStoreTrigger();
        }
        // --- End Setup Store Logic --- //
    } else {
        // --- Options Store Logic --- //
        const options = optionsOrSetup as DefineZestStoreOptions<S, A, G>; // Use generics here
        const initialState = options.state();
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
                    // Assign bound action. `this` inside actionFn will be `instance`
                    // Type A is implicitly captured here
                    (instance as any)[key] = actionFn.bind(instance);
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
        changeSignal: changeSignal, // Keep signal for potential direct internal access
        id: id
    };

    // 5. Store the new entry
    storeRegistry.set(id, registryEntry);

    // 6. Return the newly created hook function (now correctly typed thanks to overloads and internal casting)
    return newHook;
} 
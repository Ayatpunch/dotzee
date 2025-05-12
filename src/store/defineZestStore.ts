import { reactive } from '../reactivity/reactive';
import { ref, setActiveStoreTrigger, clearActiveStoreTrigger, Ref } from '../reactivity/ref';
import type {
    DefineZestStoreOptions,
    StoreActions,
    StoreInstance,
    SetupStoreFunction,
    SetupStoreReturnType,
    StoreInstanceType,
    StoreRegistryEntry,
    ZestStoreHook,
} from './types';

// Registry uses the generic StoreRegistryEntry
const storeRegistry = new Map<string, StoreRegistryEntry<StoreInstanceType>>();

// Export for testing purposes ONLY
/** @internal */
export const _test_storeRegistry = storeRegistry;

// Overload signatures for defineZestStore
export function defineZestStore<Id extends string, S extends object, A extends StoreActions<S>>(
    id: Id,
    options: DefineZestStoreOptions<S, A>
): ZestStoreHook<StoreInstance<S, A>>;

export function defineZestStore<Id extends string, R extends SetupStoreReturnType>(
    id: Id,
    setup: SetupStoreFunction
): ZestStoreHook<R>;

// Implementation signature
export function defineZestStore<Id extends string>(
    id: Id,
    optionsOrSetup: DefineZestStoreOptions<any, any> | SetupStoreFunction
): ZestStoreHook<StoreInstanceType> { // Return type uses the interface

    // 1. Check registry - Return the stored hook directly if found
    if (storeRegistry.has(id)) {
        const entry = storeRegistry.get(id)!;
        // Return the *stored hook function* itself
        // Cast needed as registry stores the generic StoreInstanceType entry
        return entry.hook as ZestStoreHook<StoreInstanceType>;
    }

    // 2. Create internal signal and trigger (common for both types)
    const changeSignal = ref(0);
    const triggerChange = () => { changeSignal.value++; };

    let storeInstance: StoreInstanceType;
    let isSetupStore = typeof optionsOrSetup === 'function';

    if (isSetupStore) {
        // --- Setup Store Logic --- //
        const setupFunction = optionsOrSetup as SetupStoreFunction;
        setActiveStoreTrigger(triggerChange);
        try {
            // User calls our ref() etc. inside this function
            storeInstance = setupFunction();
        } finally {
            // Always clear the context
            clearActiveStoreTrigger();
        }
        // --- End Setup Store Logic --- //
    } else {
        // --- Options Store Logic --- //
        const options = optionsOrSetup as DefineZestStoreOptions<any, any>;
        const initialState = options.state();
        const reactiveState = reactive(initialState, triggerChange); // Link state to trigger
        // Actions need to be bound to the reactive state proxy
        const instance = reactiveState as StoreInstance<any, any>;

        if (options.actions) {
            for (const key in options.actions) {
                if (Object.prototype.hasOwnProperty.call(options.actions, key)) {
                    const actionFn = options.actions[key];
                    // Assign bound action to the instance object
                    (instance as any)[key] = actionFn.bind(instance);
                }
            }
        }
        storeInstance = instance; // The instance now includes state and bound actions
        // --- End Options Store Logic --- //
    }

    // 3. Create the hook function *before* creating the registry entry
    const newHook = (() => storeInstance) as ZestStoreHook<StoreInstanceType>;
    newHook.$id = id;
    newHook.$changeSignal = changeSignal;

    // 4. Create registry entry, storing the hook
    const registryEntry: StoreRegistryEntry<StoreInstanceType> = {
        hook: newHook, // Store the hook itself
        instance: storeInstance, // Keep instance for potential direct internal access
        changeSignal: changeSignal, // Keep signal for potential direct internal access
        id: id
    };

    // 5. Store the new entry
    storeRegistry.set(id, registryEntry);

    // 6. Return the newly created hook function
    return newHook;
} 
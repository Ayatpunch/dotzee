import { reactive } from '../reactivity/reactive';
import { ref, setActiveStoreTrigger, clearActiveStoreTrigger } from '../reactivity/ref';
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

// Implementation signature (using union type for the second argument)
export function defineZestStore<Id extends string>(
    id: Id,
    optionsOrSetup: DefineZestStoreOptions<any, any> | SetupStoreFunction
): ZestStoreHook<StoreInstanceType> { // Return type is the generic hook

    // 1. Check registry (logic remains similar)
    if (storeRegistry.has(id)) {
        const entry = storeRegistry.get(id)!;
        return () => entry.instance; // Return the stored instance
    }

    // 2. Create internal signal and trigger (common for both types)
    const changeSignal = ref(0);
    const triggerChange = () => { changeSignal.value++; };

    let storeInstance: StoreInstanceType;
    let isSetupStore = typeof optionsOrSetup === 'function';

    if (isSetupStore) {
        // --- Setup Store Logic --- //
        const setupFunction = optionsOrSetup as SetupStoreFunction;

        // Set the trigger context before calling the user's setup function
        setActiveStoreTrigger(triggerChange);
        try {
            // User calls our ref() etc. inside this function
            const setupResult = setupFunction();
            // The result of the setup function is the store instance
            storeInstance = setupResult; // Type: SetupStoreReturnType
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
        const instance = reactiveState as StoreInstance<any, any>; // Start building instance

        // Bind actions
        if (options.actions) {
            for (const key in options.actions) {
                if (Object.prototype.hasOwnProperty.call(options.actions, key)) {
                    const actionFn = options.actions[key];
                    (instance as any)[key] = actionFn.bind(instance);
                }
            }
        }
        storeInstance = instance; // Type: StoreInstance<S, A>
        // --- End Options Store Logic --- //
    }

    // 3. Create registry entry (common for both types)
    const registryEntry: StoreRegistryEntry<StoreInstanceType> = {
        instance: storeInstance,
        changeSignal: changeSignal
    };

    // 4. Store the new entry
    storeRegistry.set(id, registryEntry);

    // 5. Return the hook providing the correct instance type
    return () => storeInstance;
} 
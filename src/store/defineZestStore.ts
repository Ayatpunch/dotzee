import { reactive } from '../reactivity/reactive';
import type {
    DefineZestStoreOptions,
    StoreActions,
    StoreInstance,
    ZestStoreHook,
} from './types';

// The registry will store the actual store instances (state + actions)
const storeRegistry = new Map<string, StoreInstance<any, any>>();

export function defineZestStore<
    Id extends string,
    S extends object,
    A extends StoreActions<S> = {}
>(
    id: Id,
    options: DefineZestStoreOptions<S, A>
): ZestStoreHook<S, A> {
    // 1. Check if store already exists in registry
    if (storeRegistry.has(id)) {
        // If store exists, return a hook that provides the existing instance
        // We need to ensure the type is correct, though the underlying instance is shared.
        return () => storeRegistry.get(id) as StoreInstance<S, A>;
    }

    // 2. Create the initial state by calling the state factory function
    const initialState = options.state();
    // The reactiveStateAndActions is the core reactive object. It will become the storeInstance.
    const reactiveStateAndActions = reactive(initialState) as StoreInstance<S, A>;

    // 3. Prepare actions, binding them to the reactiveStateAndActions object itself
    if (options.actions) {
        for (const key in options.actions) {
            if (Object.prototype.hasOwnProperty.call(options.actions, key)) {
                const actionFn = options.actions[key];
                // Bind actions to the reactiveStateAndActions object itself.
                // Now `this` in actions will refer to the object that has both state and actions.
                (reactiveStateAndActions as any)[key] = actionFn.bind(reactiveStateAndActions);
            }
        }
    }

    // 4. Store the new instance (which is reactiveStateAndActions) in the registry
    storeRegistry.set(id, reactiveStateAndActions);

    // 5. Return a hook function that provides the store instance
    return () => reactiveStateAndActions;
} 
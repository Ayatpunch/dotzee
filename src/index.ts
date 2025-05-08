// Placeholder for the main library export
export const hello = () => 'Hello from Zest library!';

// Re-export store functionalities
export { defineZestStore } from './store';
export type {
    DefineZestStoreOptions,
    StoreActions,
    StoreInstance,
    ZestStoreHook,
} from './store';

// We can add exports from other modules like reactivity here as needed
// For example:
// export { reactive, subscribe } from './reactivity';

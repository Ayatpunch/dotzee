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

// Re-export the main React hook
export { useZestStore } from './react';

// Re-export core reactivity primitives (potentially useful for setup stores or advanced usage)
export { ref, isRef } from './reactivity/ref';
export { reactive } from './reactivity/reactive';
export { computed } from './reactivity/computed'; // Add when implemented

export * from './reactivity';
export * from './store';
export * from './react';
export * from './devtools'; // Export DevTools functions

// Re-export the internal registry for app-level DevTools setup
// It's marked internal but needed by the app
export { _internal_storeRegistry } from './store/defineZestStore';

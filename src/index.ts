// Placeholder for the main library export
export const hello = () => 'Hello from Dotzee library!';

// Re-export store functionalities
export { defineDotzeeStore } from './store';
// Export core types directly from the store module index
export type {
    StoreInstance,
    DefineDotzeeStoreOptions,
    StoreActions,
    StoreGetters,
    SetupStoreFunction,
    DotzeeStoreHook,
    MappedGetters
} from './store';

// We can add exports from other modules like reactivity here as needed
// For example:
// export { reactive, subscribe } from './reactivity';

// Re-export the main React hook
// export { useDotzeeStore } from './react';

// Re-export core reactivity primitives (potentially useful for setup stores or advanced usage)
export { ref, isRef } from './reactivity/ref';
export { reactive } from './reactivity/reactive';
export { computed, isComputed } from './reactivity/computed';
export type { Ref } from './reactivity/ref'; // Export Ref type
export type { ComputedRef } from './reactivity/computed'; // Export ComputedRef type

export * from './reactivity';
export * from './store';
// export * from './react';
export * from './devtools'; // Export DevTools functions

// Export SSR utilities
export * from './ssr';

// Export Plugin utilities
export * from './plugins';

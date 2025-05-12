import type { StoreRegistryEntry, StoreInstanceType } from './types';

export type ZestRegistry = Map<string, StoreRegistryEntry<StoreInstanceType>>;

// The global registry, used by default on the client or if no active one is set.
const globalRegistry: ZestRegistry = new Map();

// Variable to hold the currently active registry. Defaults to the global one.
let activeRegistry: ZestRegistry = globalRegistry;

/**
 * Creates a new, independent Zest registry instance.
 * Primarily used for SSR contexts.
 */
export function createZestRegistry(): ZestRegistry {
    return new Map();
}

/**
 * Sets the currently active Zest registry.
 * This should be called at the beginning of a server request
 * with a registry created by `createZestRegistry()`.
 * @param registry The registry instance to activate.
 */
export function setActiveZestRegistry(registry: ZestRegistry): void {
    activeRegistry = registry;
}

/**
 * Gets the currently active Zest registry.
 * @internal Used by defineZestStore and potentially DevTools/Plugins.
 * @returns The active ZestRegistry instance.
 */
export function getActiveZestRegistry(): ZestRegistry {
    return activeRegistry;
}

/**
 * Resets the active registry to the default global registry.
 * Should be called after a server request is processed.
 */
export function resetActiveZestRegistry(): void {
    activeRegistry = globalRegistry;
}

/**
 * Gets the default global registry.
 * @internal Useful for client-side setup or DevTools access.
 * @returns The global ZestRegistry instance.
 */
export function getGlobalZestRegistry(): ZestRegistry {
    return globalRegistry;
} 
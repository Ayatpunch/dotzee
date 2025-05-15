import type { StoreRegistryEntry, StoreInstanceType } from './types';

export type DotzeeRegistry = Map<string, StoreRegistryEntry<StoreInstanceType>>;

// The global registry, used by default on the client or if no active one is set.
const globalRegistry: DotzeeRegistry = new Map();

// Variable to hold the currently active registry. Defaults to the global one.
let activeRegistry: DotzeeRegistry = globalRegistry;

/**
 * Creates a new, independent Dotzee registry instance.
 * Primarily used for SSR contexts.
 */
export function createDotzeeRegistry(): DotzeeRegistry {
    return new Map();
}

/**
 * Sets the currently active Dotzee registry.
 * This should be called at the beginning of a server request
 * with a registry created by `createDotzeeRegistry()`.
 * @param registry The registry instance to activate.
 */
export function setActiveDotzeeRegistry(registry: DotzeeRegistry): void {
    activeRegistry = registry;
}

/**
 * Gets the currently active Dotzee registry.
 * @internal Used by defineDotzeeStore and potentially DevTools/Plugins.
 * @returns The active DotzeeRegistry instance.
 */
export function getActiveDotzeeRegistry(): DotzeeRegistry {
    return activeRegistry;
}

/**
 * Resets the active registry to the default global registry.
 * Should be called after a server request is processed.
 */
export function resetActiveDotzeeRegistry(): void {
    activeRegistry = globalRegistry;
}

/**
 * Gets the default global registry.
 * @internal Useful for client-side setup or DevTools access.
 * @returns The global DotzeeRegistry instance.
 */
export function getGlobalDotzeeRegistry(): DotzeeRegistry {
    return globalRegistry;
} 
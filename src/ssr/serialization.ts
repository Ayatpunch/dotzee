import type { ZestRegistry } from '../store/types';
// Import the core snapshot function from the DevTools module
import { getGlobalZestStateSnapshot } from '../devtools/connector';

/**
 * Serializes the state of all stores within a given registry into a plain JavaScript object.
 * This function is intended for use on the server side during Server-Side Rendering (SSR)
 * to capture the state that needs to be sent to the client for hydration.
 *
 * It internally calls `getGlobalZestStateSnapshot`.
 *
 * @param registry The ZestRegistry instance (typically request-specific on the server) to serialize.
 * @returns A serializable object representing the state of all stores in the registry.
 */
export function serializeZestState(registry: ZestRegistry): Record<string, any> {
    // Directly use the existing snapshot function
    return getGlobalZestStateSnapshot(registry);
} 
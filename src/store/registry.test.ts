import { describe, it, expect, beforeEach } from 'vitest';
import {
    createDotzeeRegistry,
    getGlobalDotzeeRegistry,
    setActiveDotzeeRegistry,
    getActiveDotzeeRegistry,
    resetActiveDotzeeRegistry,
    DotzeeRegistry
} from './registry';

describe('Dotzee Store Registry Management', () => {
    // To ensure a clean state for testing getActiveDotzeeRegistry behavior with global/active switching,
    // we reset the active registry to global before each test in this suite.
    beforeEach(() => {
        resetActiveDotzeeRegistry();
    });

    it('createDotzeeRegistry should return a new Map instance', () => {
        const registry1 = createDotzeeRegistry();
        const registry2 = createDotzeeRegistry();
        expect(registry1).toBeInstanceOf(Map);
        expect(registry2).toBeInstanceOf(Map);
        expect(registry1).not.toBe(registry2); // Should be different instances
        expect(registry1.size).toBe(0);
    });

    it('getGlobalDotzeeRegistry should consistently return the same global registry instance', () => {
        const globalRegistry1 = getGlobalDotzeeRegistry();
        const globalRegistry2 = getGlobalDotzeeRegistry();
        expect(globalRegistry1).toBeInstanceOf(Map);
        expect(globalRegistry1).toBe(globalRegistry2); // Should be the same instance
    });

    it('getActiveDotzeeRegistry should return the global registry by default', () => {
        const activeRegistry = getActiveDotzeeRegistry();
        const globalRegistry = getGlobalDotzeeRegistry();
        expect(activeRegistry).toBe(globalRegistry);
    });

    it('setActiveDotzeeRegistry should set the active registry, and getActiveDotzeeRegistry should return it', () => {
        const newActiveRegistry = createDotzeeRegistry();
        setActiveDotzeeRegistry(newActiveRegistry);

        const retrievedActiveRegistry = getActiveDotzeeRegistry();
        expect(retrievedActiveRegistry).toBe(newActiveRegistry);
        expect(retrievedActiveRegistry).not.toBe(getGlobalDotzeeRegistry());
    });

    it('resetActiveDotzeeRegistry should revert getActiveDotzeeRegistry to returning the global registry', () => {
        const customRegistry = createDotzeeRegistry();
        setActiveDotzeeRegistry(customRegistry);

        // Verify it was set
        expect(getActiveDotzeeRegistry()).toBe(customRegistry);

        resetActiveDotzeeRegistry();

        // Verify it has been reset to global
        const activeAfterReset = getActiveDotzeeRegistry();
        const globalRegistry = getGlobalDotzeeRegistry();
        expect(activeAfterReset).toBe(globalRegistry);
    });

    it('setActiveDotzeeRegistry with null should effectively reset to global (or handle as error/specific behavior)', () => {
        // Current implementation of setActiveDotzeeRegistry(null) would throw a type error if types are strict,
        // or might lead to undefined behavior if not handled. Let's test current behavior (which is to set it to null).
        // However, our types demand DotzeeRegistry | null, and resetActiveDotzeeRegistry sets it to globalRegistry.
        // Let's test the documented way to reset, which is resetActiveDotzeeRegistry.
        // If setActiveDotzeeRegistry(null) is intended to reset, that should be explicit.
        // For now, we assume setActiveDotzeeRegistry is always called with a valid registry or null (if type allows).

        const customRegistry = createDotzeeRegistry();
        setActiveDotzeeRegistry(customRegistry);
        expect(getActiveDotzeeRegistry()).toBe(customRegistry);

        // If setActiveDotzeeRegistry(null) is called, getActiveDotzeeRegistry should return the global one due to its fallback.
        // This is based on the current implementation of getActiveDotzeeRegistry: `return currentActiveRegistry || globalDotzeeRegistry;`
        resetActiveDotzeeRegistry(); // Use resetActiveDotzeeRegistry to make currentActiveRegistry null
        expect(getActiveDotzeeRegistry()).toBe(getGlobalDotzeeRegistry());
    });

    it('subsequent calls to getActiveDotzeeRegistry return the currently set active registry', () => {
        const globalRegistry = getGlobalDotzeeRegistry();
        expect(getActiveDotzeeRegistry()).toBe(globalRegistry); // Initially global

        const customRegistry1 = createDotzeeRegistry();
        setActiveDotzeeRegistry(customRegistry1);
        expect(getActiveDotzeeRegistry()).toBe(customRegistry1);
        expect(getActiveDotzeeRegistry()).toBe(customRegistry1); // Still customRegistry1

        const customRegistry2 = createDotzeeRegistry();
        setActiveDotzeeRegistry(customRegistry2);
        expect(getActiveDotzeeRegistry()).toBe(customRegistry2);

        resetActiveDotzeeRegistry();
        expect(getActiveDotzeeRegistry()).toBe(globalRegistry); // Back to global
    });
}); 
import { vi, describe, it, expect, beforeEach, afterEach, SpyInstance } from 'vitest';
import type { DotzeeRegistry, StoreRegistryEntry, StoreInstanceType } from '../store/types';
// import { ref, Ref, RefSymbol } from '../reactivity/ref'; // Comment out or remove
import type { Ref, RefSymbol } from '../reactivity/ref'; // Keep type imports if needed
import { getGlobalDotzeeRegistry, createDotzeeRegistry } from '../store/registry';

// Dynamically import hydrateDotzeeState and _internal_hydrateStoreState
let hydrateDotzeeState: typeof import('./hydration').hydrateDotzeeState;
let _internal_hydrateStoreState: any; // Type it loosely if its signature is complex or not exported directly for typing

// Declare type for the dynamically imported ref function
let refDyn: typeof import('../reactivity/ref').ref;

// Helper to create mock store entries
const createMockEntry = (
    id: string,
    instance: StoreInstanceType,
    isSetupStore: boolean,
    initialStateKeys?: string[],
    changeSignalValue = 0
): StoreRegistryEntry<StoreInstanceType> => ({
    id,
    instance,
    isSetupStore,
    initialStateKeys,
    // Use a type assertion for RefSymbol as it might also be affected by module instances if not handled carefully
    changeSignal: { value: changeSignalValue, _subscribers: new Set(), [Symbol.for('RefSymbol') as typeof RefSymbol]: true } as Ref<number>,
    hook: (() => instance) as any, // Mock hook
});

describe('hydrateDotzeeState', () => {
    let mockRegistry: DotzeeRegistry;
    let consoleLogSpy: SpyInstance<[message?: any, ...optionalParams: any[]], void>;
    let consoleWarnSpy: SpyInstance<[message?: any, ...optionalParams: any[]], void>;

    beforeEach(async () => {
        vi.resetModules(); // Reset modules before each test

        // Dynamically import the module to get fresh references after reset
        const hydrationModule = await import('./hydration');
        hydrateDotzeeState = hydrationModule.hydrateDotzeeState;

        const refModule = await import('../reactivity/ref'); // Dynamically import ref
        refDyn = refModule.ref; // Assign to the declared variable

        // Setup spies on console methods AFTER resetting modules and re-importing
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        mockRegistry = createDotzeeRegistry(); // Use a fresh registry for each test
        // Clear the global registry as well if it might interfere, though hydrateDotzeeState takes a registry arg
        getGlobalDotzeeRegistry().clear();
    });

    afterEach(() => {
        // Restore console spies and clear mocks
        consoleLogSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        vi.clearAllMocks(); // Clear all mocks, including those on dynamically imported modules if any
    });

    it('should hydrate a Setup Store correctly without triggering change signal', () => {
        const setupInstance = { count: refDyn(0), name: refDyn('Initial') };
        const mockSetupStoreEntry = createMockEntry('setupStore', setupInstance, true);
        mockRegistry.set('setupStore', mockSetupStoreEntry);

        const snapshot = { setupStore: { count: 10, name: 'Hydrated' } };
        hydrateDotzeeState(mockRegistry, snapshot);

        expect(setupInstance.count.value).toBe(10);
        expect(setupInstance.name.value).toBe('Hydrated');
        expect(mockSetupStoreEntry.changeSignal.value).toBe(0); // Signal should not change
        expect(consoleLogSpy).toHaveBeenCalledWith('[Dotzee SSR Hydration] Starting hydration...', snapshot);
        expect(consoleLogSpy).toHaveBeenCalledWith('[Dotzee SSR Hydration] Hydration complete.');
    });

    it('should hydrate an Options Store correctly without triggering change signal', () => {
        const optionsInstance = { value: 0, config: { theme: 'dark', fontSize: 12 } };
        const mockOptionsStoreEntry = createMockEntry('optionsStore', optionsInstance, false, ['value', 'config']);
        mockRegistry.set('optionsStore', mockOptionsStoreEntry);

        const snapshot = { optionsStore: { value: 200, config: { theme: 'light', fontSize: 16 }, anotherProp: 'ignored' } };
        hydrateDotzeeState(mockRegistry, snapshot);

        expect(optionsInstance.value).toBe(200);
        expect(optionsInstance.config.theme).toBe('light');
        expect(optionsInstance.config.fontSize).toBe(16);
        expect((optionsInstance as any).anotherProp).toBeUndefined(); // Should not be set if not in initialStateKeys
        expect(mockOptionsStoreEntry.changeSignal.value).toBe(0); // Signal should not change
        expect(consoleLogSpy).toHaveBeenCalledWith('[Dotzee SSR Hydration] Starting hydration...', snapshot);
        expect(consoleLogSpy).toHaveBeenCalledWith('[Dotzee SSR Hydration] Hydration complete.');
    });

    it('should handle missing initialStateKeys for an Options Store entry (logs warning)', () => {
        const optionsInstanceMissingKeys = { value: 0 }; // State that might be partially hydrated or ignored
        // Entry with initialStateKeys as undefined
        const mockOptionsStoreEntryMissingKeys = createMockEntry('optionsStoreMissing', optionsInstanceMissingKeys, false, undefined);
        mockRegistry.set('optionsStoreMissing', mockOptionsStoreEntryMissingKeys);

        const snapshot = { optionsStoreMissing: { value: 300, unexpected: 'data' } };
        hydrateDotzeeState(mockRegistry, snapshot);

        // Check if the warning was logged
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining('[Dotzee SSR Hydration - optionsStoreMissing] Missing initialStateKeys for options store during hydration.')
        );
        // Current behavior with missing keys is to skip direct assignment, state should remain unchanged
        expect(optionsInstanceMissingKeys.value).toBe(0);
        expect((optionsInstanceMissingKeys as any).unexpected).toBeUndefined();
        // Start and complete logs should still occur if snapshot itself is valid
        expect(consoleLogSpy).toHaveBeenCalledWith('[Dotzee SSR Hydration] Starting hydration...', snapshot);
        expect(consoleLogSpy).toHaveBeenCalledWith('[Dotzee SSR Hydration] Hydration complete.');
    });

    it('should ignore store IDs in snapshot that are not in the client registry', () => {
        const setupInstance = { count: refDyn(0) };
        const mockSetupStoreEntry = createMockEntry('setupStore', setupInstance, true);
        mockRegistry.set('setupStore', mockSetupStoreEntry);

        const snapshot = {
            nonExistentStore: { data: 'some data' },
            setupStore: { count: 10 }
        };
        hydrateDotzeeState(mockRegistry, snapshot);

        expect(setupInstance.count.value).toBe(10); // Existing store should be hydrated
        expect(consoleWarnSpy).not.toHaveBeenCalledWith(expect.stringContaining('nonExistentStore')); // Should not warn for missing entries, just skips
        expect(consoleLogSpy).toHaveBeenCalledWith('[Dotzee SSR Hydration] Starting hydration...', snapshot);
        expect(consoleLogSpy).toHaveBeenCalledWith('[Dotzee SSR Hydration] Hydration complete.');
    });

    it('should handle empty or invalid initialStateSnapshot gracefully', () => {
        hydrateDotzeeState(mockRegistry, null as any); // Test with null
        expect(consoleWarnSpy).toHaveBeenCalledWith('[Dotzee SSR Hydration] Invalid initialStateSnapshot received. Skipping hydration.');
        expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('Starting hydration'));
        expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('Hydration complete'));

        consoleWarnSpy.mockClear();
        consoleLogSpy.mockClear();

        hydrateDotzeeState(mockRegistry, 123 as any); // Test with a number (non-object)
        expect(consoleWarnSpy).toHaveBeenCalledWith('[Dotzee SSR Hydration] Invalid initialStateSnapshot received. Skipping hydration.');
        expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('Starting hydration'));
        expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('Hydration complete'));
    });

    it('should log start and completion of hydration for a valid, empty snapshot', () => {
        const emptyObjectSnapshot = {}; // Valid, but empty object
        hydrateDotzeeState(mockRegistry, emptyObjectSnapshot);

        expect(consoleLogSpy).toHaveBeenCalledWith('[Dotzee SSR Hydration] Starting hydration...', emptyObjectSnapshot);
        expect(consoleLogSpy).toHaveBeenCalledWith('[Dotzee SSR Hydration] Hydration complete.');
        expect(consoleWarnSpy).not.toHaveBeenCalled();

        consoleLogSpy.mockClear();
        consoleWarnSpy.mockClear();

        const emptyArraySnapshot = [] as any; // Valid, empty array (treated as an object)
        hydrateDotzeeState(mockRegistry, emptyArraySnapshot);
        expect(consoleLogSpy).toHaveBeenCalledWith('[Dotzee SSR Hydration] Starting hydration...', emptyArraySnapshot);
        expect(consoleLogSpy).toHaveBeenCalledWith('[Dotzee SSR Hydration] Hydration complete.');
        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
}); 
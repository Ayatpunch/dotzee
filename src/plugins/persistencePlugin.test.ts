import { describe, it, expect, vi, beforeEach, afterEach, SpyInstance } from 'vitest';
import {
    useDotzeePlugin,
    _notifyStoreCreated,
    _notifyAfterAction,
    _clearDotzeePlugins,
} from './manager';
import { persistencePlugin } from './examples/persistencePlugin';
import type { StoreCreatedContext, AfterActionContext, PluginContextApi } from './types';
import type { StoreRegistryEntry, StoreInstanceType } from '../store/types';
import { ref, Ref } from '../reactivity/ref';
import { setActiveDotzeeRegistry, getGlobalDotzeeRegistry, createDotzeeRegistry } from '../store/registry';
import { defineDotzeeStore } from '../store/defineDotzeeStore';

// Default prefix from the plugin itself
const DEFAULT_KEY_PREFIX = 'dotzee_store_';

// Set up a store for localStorage data
let storageMockData: Record<string, string> = {};

// Create real storage spies that interact with our mock data
const storageSpy = {
    getItem: vi.fn((key: string) => storageMockData[key] || null),
    setItem: vi.fn((key: string, value: string) => { storageMockData[key] = value; }),
    removeItem: vi.fn((key: string) => { delete storageMockData[key]; }),
    clear: vi.fn(() => { storageMockData = {}; })
};

// Directly mock the localStorage methods
Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: storageSpy.getItem,
        setItem: storageSpy.setItem,
        removeItem: storageSpy.removeItem,
        clear: storageSpy.clear,
    },
    writable: true
});

// Helper to create mock store entries
const createMockStoreEntry = (
    id: string,
    instance: StoreInstanceType,
    isSetupStore: boolean,
    initialStateKeys?: string[],
    changeSignal?: Ref<number> // Optional changeSignal for completeness
): StoreRegistryEntry<StoreInstanceType> => ({
    id,
    instance,
    isSetupStore,
    initialStateKeys,
    hook: (() => instance) as any, // Mock hook
    changeSignal: changeSignal || ref(0) // Mock change signal
});

describe('Persistence Plugin', () => {
    beforeEach(() => {
        _clearDotzeePlugins(); // Clear any plugins registered in previous tests
        storageSpy.clear();  // Clear our mock localStorage data
        storageSpy.getItem.mockClear();
        storageSpy.setItem.mockClear();
        storageSpy.removeItem.mockClear();
        // vi.clearAllMocks(); // This might be too broad if other global mocks are intended to persist across describe blocks
    });

    afterEach(() => {
        _clearDotzeePlugins();
    });

    describe('Initialization and State Loading', () => {
        it('should load state from localStorage for a persisted options store on creation', async () => {
            const storeId = 'options1';
            const expectedKey = `${DEFAULT_KEY_PREFIX}${storeId}`;
            storageSpy.setItem(expectedKey, JSON.stringify({ count: 100, name: 'Loaded from Storage' }));

            const plugin = persistencePlugin({ stores: [storeId] });
            useDotzeePlugin(plugin); // Install the plugin

            const optionsInstance = { count: 0, name: 'Initial', _testId: storeId };
            const storeEntry = createMockStoreEntry(storeId, optionsInstance, false, ['count', 'name']);
            getGlobalDotzeeRegistry().set(storeId, storeEntry);

            await _notifyStoreCreated({ storeEntry }); // Simulate store creation notification

            expect(storageSpy.getItem).toHaveBeenCalledWith(expectedKey);
            expect(optionsInstance.count).toBe(100);
            expect(optionsInstance.name).toBe('Loaded from Storage');
        });

        it('should load state from localStorage for a persisted setup store on creation', async () => {
            const storeId = 'setup1';
            const expectedKey = `${DEFAULT_KEY_PREFIX}${storeId}`;
            storageSpy.setItem(expectedKey, JSON.stringify({ message: 'Loaded Message', value: 99 }));

            const plugin = persistencePlugin({ stores: [storeId] });
            useDotzeePlugin(plugin);

            const setupInstance = { message: ref('Initial'), value: ref(0), _testId: storeId };
            const storeEntry = createMockStoreEntry(storeId, setupInstance, true);
            getGlobalDotzeeRegistry().set(storeId, storeEntry);

            await _notifyStoreCreated({ storeEntry });

            expect(storageSpy.getItem).toHaveBeenCalledWith(expectedKey);
            expect(setupInstance.message.value).toBe('Loaded Message');
            expect(setupInstance.value.value).toBe(99);
        });

        it('should use custom key prefix if provided', async () => {
            const storeId = 'options2';
            const customPrefix = 'custom-prefix_';
            const expectedKey = `${customPrefix}${storeId}`;
            storageSpy.setItem(expectedKey, JSON.stringify({ data: 'custom key data' }));

            const plugin = persistencePlugin({ stores: [storeId], keyPrefix: customPrefix });
            useDotzeePlugin(plugin);

            const optionsInstance = { data: 'initial', _testId: storeId };
            const storeEntry = createMockStoreEntry(storeId, optionsInstance, false, ['data']);
            getGlobalDotzeeRegistry().set(storeId, storeEntry);

            await _notifyStoreCreated({ storeEntry });

            expect(storageSpy.getItem).toHaveBeenCalledWith(expectedKey);
            expect(optionsInstance.data).toBe('custom key data');
        });

        it('should handle JSON parsing errors gracefully during load', async () => {
            const storeId = 'options3';
            const expectedKey = `${DEFAULT_KEY_PREFIX}${storeId}`;
            storageSpy.setItem(expectedKey, 'invalid-json');

            const plugin = persistencePlugin({ stores: [storeId] });
            useDotzeePlugin(plugin);

            const optionsInstance = { data: 'initial', _testId: storeId };
            const storeEntry = createMockStoreEntry(storeId, optionsInstance, false, ['data']);
            getGlobalDotzeeRegistry().set(storeId, storeEntry);

            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            await _notifyStoreCreated({ storeEntry });
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('[DotzeePersistence] Error loading state'), expect.any(Error));
            consoleErrorSpy.mockRestore();

            expect(optionsInstance.data).toBe('initial');
        });
    });

    describe('State Persisting on Action', () => {
        it('should persist state to localStorage after an action for an options store', async () => {
            const storeId = 'optionsPersist';
            const expectedKey = `${DEFAULT_KEY_PREFIX}${storeId}`;
            const plugin = persistencePlugin({ stores: [storeId] });
            useDotzeePlugin(plugin);

            const optionsInstance = { count: 10, user: { name: 'Dotzee' }, _testId: storeId };
            const storeEntry = createMockStoreEntry(storeId, optionsInstance, false, ['count', 'user']);
            getGlobalDotzeeRegistry().set(storeId, storeEntry);

            optionsInstance.count = 20;
            optionsInstance.user.name = 'Dotzee Persisted';

            await _notifyAfterAction({ storeEntry, actionName: 'updateCount', args: [], result: undefined } as AfterActionContext);

            expect(storageSpy.setItem).toHaveBeenCalledWith(
                expectedKey,
                JSON.stringify({ count: 20, user: { name: 'Dotzee Persisted' } })
            );
        });

        it('should persist state for a setup store after an action', async () => {
            const storeId = 'setupPersist';
            const expectedKey = `${DEFAULT_KEY_PREFIX}${storeId}`;
            const plugin = persistencePlugin({ stores: [storeId] });
            useDotzeePlugin(plugin);

            const setupInstance = { item: ref('Pen'), quantity: ref(2), _testId: storeId };
            const storeEntry = createMockStoreEntry(storeId, setupInstance, true);
            getGlobalDotzeeRegistry().set(storeId, storeEntry);

            setupInstance.item.value = 'Book';
            setupInstance.quantity.value = 5;

            await _notifyAfterAction({ storeEntry, actionName: 'updateItem', args: [], result: undefined } as AfterActionContext);

            expect(storageSpy.setItem).toHaveBeenCalledWith(
                expectedKey,
                JSON.stringify({ item: 'Book', quantity: 5, _testId: storeId })
            );
        });

        it('should not persist if store is not in the persistence list', async () => {
            const storeId = 'nonPersistedOptions';
            const plugin = persistencePlugin({ stores: ['someOtherStore'] });
            useDotzeePlugin(plugin);

            const optionsInstance = { data: 'secret' };
            const storeEntry = createMockStoreEntry(storeId, optionsInstance, false, ['data']);

            await _notifyAfterAction({ storeEntry, actionName: 'someAction', args: [], result: undefined } as AfterActionContext);

            expect(storageSpy.setItem).not.toHaveBeenCalled();
        });

        it('should use custom storage if provided', async () => {
            const storeId = 'customStore';
            const customPrefix = 'my_app_';
            const expectedKey = `${customPrefix}${storeId}`;

            const customStorageMock = {
                getItem: vi.fn().mockResolvedValue(JSON.stringify({ value: 'from custom' })),
                setItem: vi.fn().mockResolvedValue(undefined),
                removeItem: vi.fn().mockResolvedValue(undefined)
            };

            const plugin = persistencePlugin({
                stores: [storeId],
                keyPrefix: customPrefix,
                storage: customStorageMock
            });
            useDotzeePlugin(plugin);

            const optionsInstance = { value: 'initial', _testId: storeId };
            const storeEntry = createMockStoreEntry(storeId, optionsInstance, false, ['value']);
            getGlobalDotzeeRegistry().set(storeId, storeEntry);

            await _notifyStoreCreated({ storeEntry });

            expect(customStorageMock.getItem).toHaveBeenCalledWith(expectedKey);
            expect(optionsInstance.value).toBe('from custom');

            optionsInstance.value = 'updated in custom';
            await _notifyAfterAction({ storeEntry, actionName: 'updateValue', args: [], result: undefined } as AfterActionContext);

            expect(customStorageMock.setItem).toHaveBeenCalledWith(
                expectedKey,
                JSON.stringify({ value: 'updated in custom' })
            );
        });

        it('should filter persisted state using paths for options store', async () => {
            const storeId = 'optionsPaths';
            const expectedKey = `${DEFAULT_KEY_PREFIX}${storeId}`;
            const plugin = persistencePlugin({ stores: [{ id: storeId, paths: ['partial', 'user.name'] }] });
            useDotzeePlugin(plugin);

            const optionsInstance = {
                partial: 'old partial',
                full: { data: 'some data' },
                user: { name: 'Old Name', age: 30 },
                _testId: storeId
            };
            const storeEntry = createMockStoreEntry(storeId, optionsInstance, false, ['partial', 'full', 'user']);
            getGlobalDotzeeRegistry().set(storeId, storeEntry);

            optionsInstance.partial = 'new partial';
            optionsInstance.full.data = 'changed data';
            optionsInstance.user.name = 'New Name';
            (optionsInstance.user as any).age = 31;

            await _notifyAfterAction({ storeEntry, actionName: 'updateData', args: [], result: undefined } as AfterActionContext);

            expect(storageSpy.setItem).toHaveBeenCalledWith(
                expectedKey,
                JSON.stringify({ partial: 'new partial', user: { name: 'New Name' } })
            );
        });

        it('paths option should be ignored for setup stores (whole snapshot is saved)', async () => {
            const storeId = 'setupPaths';
            const expectedKey = `${DEFAULT_KEY_PREFIX}${storeId}`;
            const plugin = persistencePlugin({ stores: [{ id: storeId, paths: ['a'] }] });
            useDotzeePlugin(plugin);

            const setupInstance = { a: ref('A'), b: ref('Old B'), _testId: storeId };
            const storeEntry = createMockStoreEntry(storeId, setupInstance, true);
            getGlobalDotzeeRegistry().set(storeId, storeEntry);

            setupInstance.b.value = 'New B';

            await _notifyAfterAction({ storeEntry, actionName: 'updateB', args: [], result: undefined } as AfterActionContext);

            expect(storageSpy.setItem).toHaveBeenCalledWith(
                expectedKey,
                JSON.stringify({ a: 'A', b: 'New B', _testId: storeId })
            );
        });
    });
}); 
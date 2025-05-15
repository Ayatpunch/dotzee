import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    useDotzeePlugin,
    _notifyStoreCreated,
    _notifyBeforeAction,
    _notifyAfterAction,
    _clearDotzeePlugins,
    _getPluginContextApi, // Assuming this is exported for testing or internal use
} from './manager';
import type { Plugin, StoreCreatedContext, ActionContext, AfterActionContext, PluginContextApi } from './types';
import type { StoreInstanceType, StoreRegistryEntry } from '../store/types';
import { ref, Ref } from '../reactivity/ref';
import { getGlobalDotzeeRegistry, setActiveDotzeeRegistry } from '../store/registry';

// Mock for getStoreStateSnapshotInternal as it's a dependency
vi.mock('../devtools/connector', async (importOriginal) => {
    // Import isRef dynamically ONLY for the mock
    const { isRef: actualIsRef } = await import('../reactivity/ref');
    return {
        getStoreStateSnapshotInternal: vi.fn((instance, isSetup, keys) => {
            // Simple mock: return a subset if keys are provided for options store, else basic object
            if (!isSetup && keys && instance) {
                const snapshot = {};
                for (const key of keys) {
                    if (Object.prototype.hasOwnProperty.call(instance, key)) {
                        snapshot[key] = instance[key];
                    }
                }
                return snapshot;
            }
            if (isSetup && instance) { // For setup stores, return properties that are refs unwrapped or plain values
                const snapshot = {};
                for (const key in instance) {
                    if (Object.prototype.hasOwnProperty.call(instance, key)) {
                        if (typeof instance[key] !== 'function') {
                            snapshot[key] = actualIsRef(instance[key]) ? instance[key].value : instance[key];
                        }
                    }
                }
                return snapshot;
            }
            return { ...instance }; // Fallback or for options stores without keys (might be too broad)
        }),
    };
});

describe('Plugin Manager', () => {
    beforeEach(() => {
        _clearDotzeePlugins();
        // Ensure a clean global registry for each test
        const globalRegistry = getGlobalDotzeeRegistry();
        globalRegistry.clear();
        setActiveDotzeeRegistry(globalRegistry);
    });

    afterEach(() => {
        _clearDotzeePlugins();
        vi.restoreAllMocks();
    });

    describe('useDotzeePlugin', () => {
        it('should register a plugin and call its install method once', () => {
            const installMock = vi.fn();
            const plugin: Plugin = { name: 'TestPlugin1', install: installMock };
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            useDotzeePlugin(plugin);
            expect(installMock).toHaveBeenCalledTimes(1);
            expect(installMock).toHaveBeenCalledWith(_getPluginContextApi());

            // Try registering again
            useDotzeePlugin(plugin);
            expect(installMock).toHaveBeenCalledTimes(1); // Still 1
            expect(consoleWarnSpy).toHaveBeenCalledWith('[Dotzee] Plugin "TestPlugin1" already installed.'); // Updated message
            consoleWarnSpy.mockRestore();
        });

        it('should handle errors during plugin installation', () => {
            const installMock = vi.fn(() => { throw new Error('Install failed'); });
            const plugin: Plugin = { name: 'BadPlugin', install: installMock };
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            useDotzeePlugin(plugin);
            expect(installMock).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith('[Dotzee] Error installing plugin "BadPlugin":', expect.any(Error));
            consoleErrorSpy.mockRestore();
        });
    });

    describe('Notification Dispatching', () => {
        const mockStoreInstance: StoreInstanceType = { data: 'test' };
        const mockSetupStoreInstance: StoreInstanceType = { count: ref(0) };

        const mockStoreEntry: StoreRegistryEntry<StoreInstanceType> = {
            id: 'testStore',
            instance: mockStoreInstance,
            isSetupStore: false,
            initialStateKeys: ['data'],
            hook: (() => mockStoreInstance) as any,
            changeSignal: ref(0),
        };
        const mockSetupStoreEntry: StoreRegistryEntry<StoreInstanceType> = {
            id: 'testSetupStore',
            instance: mockSetupStoreInstance,
            isSetupStore: true,
            hook: (() => mockSetupStoreInstance) as any,
            changeSignal: ref(0),
        };


        it('_notifyStoreCreated should call registered callbacks', async () => {
            const onStoreCreatedCb = vi.fn();
            const plugin: Plugin = {
                name: 'TestPlugin',
                install: (api) => api.onStoreCreated(onStoreCreatedCb),
            };
            useDotzeePlugin(plugin);
            await _notifyStoreCreated({ storeEntry: mockStoreEntry });
            expect(onStoreCreatedCb).toHaveBeenCalledWith({ storeEntry: mockStoreEntry });
        });

        it('_notifyBeforeAction should call registered callbacks', () => {
            const beforeActionCb = vi.fn();
            const plugin: Plugin = {
                name: 'TestPlugin',
                install: (api) => api.beforeAction(beforeActionCb),
            };
            useDotzeePlugin(plugin);
            const actionContext: ActionContext = { storeEntry: mockStoreEntry, actionName: 'testAction', args: [] };
            _notifyBeforeAction(actionContext);
            expect(beforeActionCb).toHaveBeenCalledWith(actionContext);
        });

        it('_notifyAfterAction should call registered callbacks with result', async () => {
            const afterActionCb = vi.fn();
            const plugin: Plugin = {
                name: 'TestPlugin',
                install: (api) => api.afterAction(afterActionCb),
            };
            useDotzeePlugin(plugin);
            const result = { success: true };
            const afterActionContext: AfterActionContext = { storeEntry: mockStoreEntry, actionName: 'testAction', args: [], result };
            await _notifyAfterAction(afterActionContext);
            expect(afterActionCb).toHaveBeenCalledWith(afterActionContext);
        });

        it('_notifyAfterAction should call registered callbacks with error', async () => {
            const afterActionCb = vi.fn();
            const plugin: Plugin = {
                name: 'TestPlugin',
                install: (api) => api.afterAction(afterActionCb),
            };
            useDotzeePlugin(plugin);
            const error = new Error('Action Failed');
            const afterActionContext: AfterActionContext = { storeEntry: mockStoreEntry, actionName: 'testAction', args: [], error };
            await _notifyAfterAction(afterActionContext);
            expect(afterActionCb).toHaveBeenCalledWith(afterActionContext);
        });

        it('should handle errors in plugin callbacks gracefully and call other plugins', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            const errorCb = vi.fn(() => { throw new Error('Plugin Error'); });
            const onStoreCreatedCb = vi.fn(); // This one should still be called

            const errorPlugin: Plugin = { name: 'ErrorPlugin', install: (api) => api.onStoreCreated(errorCb) };
            const goodPlugin: Plugin = { name: 'GoodPlugin', install: (api) => api.onStoreCreated(onStoreCreatedCb) };

            useDotzeePlugin(errorPlugin);
            useDotzeePlugin(goodPlugin);

            await _notifyStoreCreated({ storeEntry: mockStoreEntry });

            expect(errorCb).toHaveBeenCalledTimes(1);
            expect(onStoreCreatedCb).toHaveBeenCalledTimes(1); // Should still be called
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                `[Dotzee] Error in plugin (onStoreCreated) for store "${mockStoreEntry.id}":`,
                expect.any(Error)
            );
            consoleErrorSpy.mockRestore();
        });

        it('plugin extendStore should add properties to store instance', () => {
            let capturedApi: PluginContextApi | null = null;
            const plugin: Plugin = {
                name: 'ExtendPlugin',
                install: (api) => { capturedApi = api; },
            };
            useDotzeePlugin(plugin);

            const originalInstance = { originalProp: 'value' };
            const extension = { newProp: 'newValue', anotherProp: 123 };

            capturedApi!.extendStore(originalInstance, extension);

            expect(originalInstance).toHaveProperty('newProp', 'newValue');
            expect(originalInstance).toHaveProperty('anotherProp', 123);
            expect(originalInstance).toHaveProperty('originalProp', 'value');
        });

        it('plugin getStoreStateSnapshot is available on context', async () => {
            let capturedApi: PluginContextApi | null = null;
            const plugin: Plugin = {
                name: 'SnapshotPlugin',
                install: (api) => { capturedApi = api; },
            };
            useDotzeePlugin(plugin);

            // Mock store entry with defined initialStateKeys for options store to avoid warnings
            const optionsStoreInstance = { data: 'specific', other: 'ignored' };
            const optionsStoreEntry: StoreRegistryEntry<StoreInstanceType> = {
                id: 'optionsTestStore',
                instance: optionsStoreInstance,
                isSetupStore: false,
                initialStateKeys: ['data'], // Important for options store snapshot
                hook: (() => optionsStoreInstance) as any,
                changeSignal: ref(0),
            };
            // Add to global registry so getStoreStateSnapshot can find it
            getGlobalDotzeeRegistry().set(optionsStoreEntry.id, optionsStoreEntry);

            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            const snapshot = capturedApi!.getStoreStateSnapshot(optionsStoreInstance);

            // The mock of getStoreStateSnapshotInternal should be called
            const { getStoreStateSnapshotInternal } = await import('../devtools/connector');
            expect(getStoreStateSnapshotInternal).toHaveBeenCalledWith(optionsStoreInstance, false, ['data']);
            expect(snapshot).toEqual({ data: 'specific' }); // Based on the mock of getStoreStateSnapshotInternal
            expect(consoleWarnSpy).not.toHaveBeenCalled(); // No warning if initialStateKeys provided for options store

            consoleWarnSpy.mockRestore();
        });
    });
}); 
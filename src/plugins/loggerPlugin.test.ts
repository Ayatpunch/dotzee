import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDotzeePlugin, _notifyStoreCreated, _notifyBeforeAction, _notifyAfterAction, _clearDotzeePlugins } from './manager';
import { loggerPlugin } from './examples/loggerPlugin'; // Import the logger plugin
import type { StoreCreatedContext, ActionContext, AfterActionContext } from './types';
import type { StoreRegistryEntry, StoreInstanceType } from '../store/types';
import { ref } from '../reactivity/ref';

// Styles used in the logger plugin (must match the plugin's definitions)
const styleTitle = 'font-weight: bold; color: #4CAF50;';
const styleLabel = 'font-weight: bold; color: #2196F3;';
// const styleValue = 'color: #757575;'; // Not directly asserted in group titles
const styleError = 'font-weight: bold; color: #F44336;';

// Mock console methods
const consoleGroupCollapsedSpy = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => { });
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => { });

// Mock a basic store entry for context
const mockStoreEntry = {
    id: 'logTestStore',
    instance: { data: 'initialData', count: ref(0) },
    changeSignal: ref(0),
    isSetupStore: false,
    initialStateKeys: ['data'], // For snapshotting
    hook: (() => ({ data: 'initialData' })) as any,
} as StoreRegistryEntry<StoreInstanceType>;

const mockSetupStoreEntry = {
    id: 'logSetupStore',
    instance: { message: ref('hello'), action: () => { } },
    changeSignal: ref(0),
    isSetupStore: true,
    hook: (() => ({ message: ref('hello') })) as any,
} as StoreRegistryEntry<StoreInstanceType>;

describe('Logger Plugin', () => {
    beforeEach(() => {
        _clearDotzeePlugins();
        // Register the logger plugin before each test in this suite
        useDotzeePlugin(loggerPlugin);

        // Clear mock call counts before each test
        consoleGroupCollapsedSpy.mockClear();
        consoleLogSpy.mockClear();
        consoleWarnSpy.mockClear();
        consoleErrorSpy.mockClear();
        consoleGroupEndSpy.mockClear();
    });

    afterEach(() => {
        _clearDotzeePlugins(); // Clean up plugins
    });

    it('should log onStoreCreated event', () => {
        const context: StoreCreatedContext = { storeEntry: mockStoreEntry };
        _notifyStoreCreated(context);

        expect(consoleGroupCollapsedSpy).toHaveBeenCalledWith(`%c[DotzeeLogger] Store Created: ${mockStoreEntry.id}`, styleTitle);
        expect(consoleLogSpy).toHaveBeenCalledWith('%cStore Entry:', styleLabel, mockStoreEntry);
        expect(consoleLogSpy).toHaveBeenCalledWith('%cInitial State:', styleLabel, { data: 'initialData' });
        expect(consoleGroupEndSpy).toHaveBeenCalledTimes(1);
    });

    it('should log beforeAction event', () => {
        const context: ActionContext = {
            storeEntry: mockStoreEntry,
            actionName: 'doSomething',
            args: [1, 'arg2'],
        };
        _notifyBeforeAction(context);

        expect(consoleGroupCollapsedSpy).toHaveBeenCalledWith(`%c[DotzeeLogger] Action: ${mockStoreEntry.id}/doSomething (before)`, styleTitle);
        expect(consoleLogSpy).toHaveBeenCalledWith('%cStore ID:', styleLabel, mockStoreEntry.id);
        expect(consoleLogSpy).toHaveBeenCalledWith('%cAction:', styleLabel, 'doSomething');
        expect(consoleLogSpy).toHaveBeenCalledWith('%cArguments:', styleLabel, [1, 'arg2']);
        expect(consoleGroupEndSpy).toHaveBeenCalledTimes(1);
    });

    it('should log afterAction event with result', () => {
        const result = { success: true };
        const context: AfterActionContext = {
            storeEntry: mockStoreEntry,
            actionName: 'doSomething',
            args: [1, 'arg2'],
            result: result,
        };
        _notifyAfterAction(context);

        expect(consoleGroupCollapsedSpy).toHaveBeenCalledWith(`%c[DotzeeLogger] Action: ${mockStoreEntry.id}/doSomething (after)`, styleTitle);
        expect(consoleLogSpy).toHaveBeenCalledWith('%cStore ID:', styleLabel, mockStoreEntry.id);
        expect(consoleLogSpy).toHaveBeenCalledWith('%cAction:', styleLabel, 'doSomething');
        expect(consoleLogSpy).toHaveBeenCalledWith('%cArguments:', styleLabel, [1, 'arg2']);
        expect(consoleLogSpy).toHaveBeenCalledWith('%cResult:', styleLabel, result);
        expect(consoleLogSpy).toHaveBeenCalledWith('%cCurrent State:', styleLabel, { data: 'initialData' });
        expect(consoleGroupEndSpy).toHaveBeenCalledTimes(1);
    });

    it('should log afterAction event with error', () => {
        const error = new Error('Action failed');
        const context: AfterActionContext = {
            storeEntry: mockStoreEntry,
            actionName: 'doSomethingElse',
            args: [],
            error: error,
        };
        _notifyAfterAction(context);

        expect(consoleGroupCollapsedSpy).toHaveBeenCalledWith(`%c[DotzeeLogger] Action: ${mockStoreEntry.id}/doSomethingElse (after) - ERROR`, styleError);
        expect(consoleLogSpy).toHaveBeenCalledWith('%cStore ID:', styleLabel, mockStoreEntry.id);
        expect(consoleLogSpy).toHaveBeenCalledWith('%cAction:', styleLabel, 'doSomethingElse');
        expect(consoleLogSpy).toHaveBeenCalledWith('%cArguments:', styleLabel, []);
        expect(consoleErrorSpy).toHaveBeenCalledWith('%cError:', styleError, error);
        expect(consoleLogSpy).toHaveBeenCalledWith('%cCurrent State:', styleLabel, { data: 'initialData' });
        expect(consoleGroupEndSpy).toHaveBeenCalledTimes(1);
    });

    it('should correctly snapshot state for setup store in onStoreCreated', () => {
        const context: StoreCreatedContext = { storeEntry: mockSetupStoreEntry };
        _notifyStoreCreated(context);
        expect(consoleGroupCollapsedSpy).toHaveBeenCalledWith(`%c[DotzeeLogger] Store Created: ${mockSetupStoreEntry.id}`, styleTitle);
        // For setup store, snapshot should unwrap refs and exclude functions
        expect(consoleLogSpy).toHaveBeenCalledWith('%cInitial State:', styleLabel, { message: 'hello' });
        expect(consoleGroupEndSpy).toHaveBeenCalledTimes(1);
    });

    it('should correctly snapshot state for setup store in afterAction', () => {
        const context: AfterActionContext = {
            storeEntry: mockSetupStoreEntry,
            actionName: 'setupAction',
            args: [],
            result: 'ok'
        };
        _notifyAfterAction(context);
        expect(consoleGroupCollapsedSpy).toHaveBeenCalledWith(`%c[DotzeeLogger] Action: ${mockSetupStoreEntry.id}/setupAction (after)`, styleTitle);
        expect(consoleLogSpy).toHaveBeenCalledWith('%cCurrent State:', styleLabel, { message: 'hello' });
        expect(consoleGroupEndSpy).toHaveBeenCalledTimes(1);
    });
}); 
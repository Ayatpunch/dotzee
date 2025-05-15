import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as devtoolsConnector from './connector'; // Import the actual connector
import type { DotzeeRegistry, StoreRegistryEntry, StoreInstanceType } from '../store/types';
import { ref } from '../reactivity/ref';

describe('getGlobalDotzeeStateSnapshot', () => {
    beforeEach(() => {
        // Clear any global state or mocks if necessary, though not directly mocking internals here
        vi.clearAllMocks();
    });

    it('should correctly create a global snapshot from multiple store entries', () => {
        const mockRegistry: DotzeeRegistry = new Map();

        const storeInstance1 = { data: 's1', ignoredAction: () => { } } as StoreInstanceType;
        const storeEntry1: StoreRegistryEntry<StoreInstanceType> = {
            id: 'store1',
            instance: storeInstance1,
            isSetupStore: false,
            initialStateKeys: ['data'], // Only 'data' should be in the snapshot for this options store
            hook: (() => storeInstance1) as any,
            changeSignal: ref(0),
        };
        mockRegistry.set('store1', storeEntry1);

        const storeInstance2 = {
            valueRef: ref('s2'),
            anotherRef: ref({ nested: true }),
            plainProp: 'hello',
            actionFunc: () => { }
        } as StoreInstanceType;
        const storeEntry2: StoreRegistryEntry<StoreInstanceType> = {
            id: 'store2',
            instance: storeInstance2,
            isSetupStore: true,
            initialStateKeys: undefined, // Not used for setup stores by getStoreStateSnapshotInternal
            hook: (() => storeInstance2) as any,
            changeSignal: ref(0),
        };
        mockRegistry.set('store2', storeEntry2);

        // Call the actual function from the imported connector
        const globalSnapshot = devtoolsConnector.getGlobalDotzeeStateSnapshot(mockRegistry);

        // Assert the output based on the expected behavior of the real getStoreStateSnapshotInternal
        expect(globalSnapshot).toEqual({
            store1: { data: 's1' }, // Only 'data' key due to initialStateKeys
            store2: {
                valueRef: 's2', // ref unwrapped
                anotherRef: { nested: true }, // ref unwrapped
                plainProp: 'hello' // plain property included
                // actionFunc should be excluded by getStoreStateSnapshotInternal for setup stores
            },
        });
    });

    it('should return an empty object for an empty registry', () => {
        const mockRegistry: DotzeeRegistry = new Map();
        const globalSnapshot = devtoolsConnector.getGlobalDotzeeStateSnapshot(mockRegistry);
        expect(globalSnapshot).toEqual({});
    });
});

// Extended tests for _internal_initStoreState and _internal_sendAction would require
// a more complex setup to mock the Redux DevTools extension itself.
// For now, focusing on getGlobalDotzeeStateSnapshot which was the failing test.
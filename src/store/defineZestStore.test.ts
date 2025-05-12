import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineZestStore, _test_storeRegistry } from './defineZestStore'; // Import registry
import { ref, subscribeRef, isRef, Ref } from '../reactivity/ref';
import { reactive, subscribe } from '../reactivity/reactive';
import type { StoreInstance, StoreRegistryEntry, ZestStoreHook, StoreInstanceType } from './types';

// Helper to get the change signal ref for a store ID directly from registry (still useful for some tests)
const getStoreChangeSignalFromRegistry = (id: string): Ref<number> | undefined => {
    const entry = _test_storeRegistry.get(id);
    return entry?.changeSignal;
};

// Helper remains useful for checking if an entry exists
const getStoreRegistryEntry = (id: string): StoreRegistryEntry<StoreInstanceType> | undefined => {
    return _test_storeRegistry.get(id);
};

describe('defineZestStore', () => {

    // Clear registry before each test
    beforeEach(() => {
        _test_storeRegistry.clear();
    });

    // --- Common Hook Structure Tests --- //
    const testHookStructure = <T extends StoreInstanceType>(useStoreHook: ZestStoreHook<T>, expectedId: string) => {
        it('should return a hook function with $id and $changeSignal properties', () => {
            expect(typeof useStoreHook).toBe('function');
            expect(useStoreHook).toHaveProperty('$id');
            expect(useStoreHook.$id).toBe(expectedId);
            expect(useStoreHook).toHaveProperty('$changeSignal');
            expect(isRef(useStoreHook.$changeSignal)).toBe(true);
        });

        it('calling the hook function should return a defined store instance', () => {
            const instance1 = useStoreHook();
            expect(instance1).toBeDefined();
            // Optionally, check if calling it again returns the same instance (it should due to registry cache)
            const instance2 = useStoreHook();
            expect(instance2).toBe(instance1); // Check for instance stability from the hook call
        });
    };

    // --- Options Store Tests --- //
    describe('Options Store', () => {
        const storeIdOpt = 'counterOpt';
        const useCounterStoreOpt = defineZestStore(storeIdOpt, {
            state: () => ({ count: 0, name: 'TestStore' }),
            actions: {
                increment() { this.count++; },
                add(amount: number) { this.count += amount; },
            },
        });

        // Test the hook structure itself
        testHookStructure(useCounterStoreOpt, storeIdOpt);

        it('should define a store and initialize state correctly', () => {
            const counterStore = useCounterStoreOpt();
            expect(counterStore.count).toBe(0);
            expect(counterStore.name).toBe('TestStore');
        });

        it('should allow actions to mutate state and trigger change signal via the hook', () => {
            const counterStore = useCounterStoreOpt();
            const changeSignalRef = useCounterStoreOpt.$changeSignal; // Get signal from hook
            const signalCallback = vi.fn();
            const unsubscribeSignal = subscribeRef(changeSignalRef, signalCallback);

            expect(counterStore.count).toBe(0);
            counterStore.increment();
            expect(counterStore.count).toBe(1);
            expect(signalCallback).toHaveBeenCalledTimes(1);

            counterStore.add(5);
            expect(counterStore.count).toBe(6);
            expect(signalCallback).toHaveBeenCalledTimes(2);

            unsubscribeSignal();
        });

        it('should return the same augmented hook function for the same ID', () => {
            const useStore1 = defineZestStore('singletonOpt', { state: () => ({ value: 'initial' }) });
            const useStore2 = defineZestStore('singletonOpt', { state: () => ({ value: 'should not be used' }) });

            expect(useStore1).toBe(useStore2);
        });

        it('should return different store instances for different IDs', () => {
            const useStoreA = defineZestStore('storeA_Opt', { state: () => ({ id: 'A' }) });
            const useStoreB = defineZestStore('storeB_Opt', { state: () => ({ id: 'B' }) });
            const instanceA = useStoreA();
            const instanceB = useStoreB();

            expect(instanceA).not.toEqual(instanceB);
            expect(useStoreA).not.toBe(useStoreB);
            expect(useStoreA.$id).toBe('storeA_Opt');
            expect(useStoreB.$id).toBe('storeB_Opt');
            expect(useStoreA.$changeSignal).not.toBe(useStoreB.$changeSignal);
        });

        it('should allow defining a store with only state', () => {
            const useDataStore = defineZestStore('dataOnlyOpt', {
                state: () => ({ data: { key: 'value' }, version: 1 }),
            });
            const dataStore = useDataStore();
            expect(dataStore.data.key).toBe('value');
            expect(dataStore.version).toBe(1);
            // Check hook structure too
            expect(useDataStore.$id).toBe('dataOnlyOpt');
            expect(isRef(useDataStore.$changeSignal)).toBe(true);
        });

        it('actions should have `this` correctly bound to the store instance', () => {
            const storeId = 'thisCheckOpt';
            let thisContextInAction: any = null;
            const useThisCheckStore = defineZestStore(storeId, {
                state: () => ({ a: 1 }),
                actions: {
                    checkThis() { thisContextInAction = this; },
                },
            });
            const store = useThisCheckStore();
            store.checkThis();
            expect(thisContextInAction).toBe(store);
            expect(thisContextInAction.a).toBe(1);
        });

        it('should handle reactivity for nested objects and trigger signal via hook', () => {
            const storeId = 'nestedOpt';
            const useNestedStore = defineZestStore(storeId, {
                state: () => ({ user: { name: 'Anon', age: 30 } }),
                actions: {
                    setUserName(newName: string) { this.user.name = newName; },
                },
            });
            const store = useNestedStore();
            const changeSignalRef = useNestedStore.$changeSignal; // Get from hook
            const signalCallback = vi.fn();
            const unsubscribeSignal = subscribeRef(changeSignalRef, signalCallback);

            expect(store.user.name).toBe('Anon');
            store.setUserName('Zest');
            expect(store.user.name).toBe('Zest');
            expect(signalCallback).toHaveBeenCalledTimes(1);
            unsubscribeSignal();
        });
    });

    // --- Setup Store Tests --- //
    describe('Setup Store', () => {
        const storeIdSetup = 'counterSetup';
        const useCounterStoreSetup = defineZestStore(storeIdSetup, () => {
            const count = ref(0);
            const name = ref('SetupStore');
            const increment = () => { count.value++; };
            const add = (amount: number) => { count.value += amount; };
            return { count, name, increment, add };
        });

        // Test the hook structure itself
        testHookStructure(useCounterStoreSetup, storeIdSetup);

        it('should define a store using setup syntax and return refs/functions', () => {
            const counterStore = useCounterStoreSetup();
            expect(isRef(counterStore.count)).toBe(true);
            expect(counterStore.count.value).toBe(0);
            expect(isRef(counterStore.name)).toBe(true);
            expect(counterStore.name.value).toBe('SetupStore');
            expect(typeof counterStore.increment).toBe('function');
            expect(typeof counterStore.add).toBe('function');
        });

        it('should allow actions to mutate refs and trigger change signal via hook', () => {
            const counterStore = useCounterStoreSetup();
            const changeSignalRef = useCounterStoreSetup.$changeSignal;
            const signalCallback = vi.fn();
            const unsubscribeSignal = subscribeRef(changeSignalRef, signalCallback);

            expect(counterStore.count.value).toBe(0);
            counterStore.increment();
            expect(counterStore.count.value).toBe(1);
            expect(signalCallback).toHaveBeenCalledTimes(1);

            counterStore.add(8);
            expect(counterStore.count.value).toBe(9);
            expect(signalCallback).toHaveBeenCalledTimes(2);

            unsubscribeSignal();
        });

        it('should return the same augmented hook function for the same ID', () => {
            const useStore1 = defineZestStore('singletonSetup', () => ({ value: ref('initial') }));
            const useStore2 = defineZestStore('singletonSetup', () => ({ value: ref('should not be used') }));

            expect(useStore1).toBe(useStore2);
        });

        it('should trigger change signal when ref VALUE is assigned a new object via hook', () => {
            const storeId = 'reactivitySetupAssign';
            const useMyStore = defineZestStore(storeId, () => {
                const user = ref({ name: 'Alice' });
                const setUser = (newUser: { name: string }) => { user.value = newUser; };
                return { user, setUser };
            });
            const store = useMyStore();
            const changeSignalRef = useMyStore.$changeSignal; // Get from hook
            const signalCallback = vi.fn();
            const unsubscribeSignal = subscribeRef(changeSignalRef, signalCallback);

            store.setUser({ name: 'Bob' });
            expect(store.user.value.name).toBe('Bob');
            expect(signalCallback).toHaveBeenCalledTimes(1);
            unsubscribeSignal();
        });

        it('should NOT trigger change signal when mutating INSIDE an object within a ref', () => {
            const storeId = 'reactivitySetupMutate';
            const useMyStore = defineZestStore(storeId, () => {
                const user = ref({ name: 'Alice' });
                const setName = (newName: string) => { user.value.name = newName; };
                return { user, setName };
            });
            const store = useMyStore();
            const changeSignalRef = useMyStore.$changeSignal; // Get from hook
            const signalCallback = vi.fn();
            const unsubscribeSignal = subscribeRef(changeSignalRef, signalCallback);

            store.setName('Bob');
            expect(store.user.value.name).toBe('Bob');
            expect(signalCallback).not.toHaveBeenCalled(); // Signal should not fire
            unsubscribeSignal();
        });
    });

    // --- Mixed Store Type Tests --- //
    describe('Mixed Store Types', () => {
        it('should return the first registered store hook if IDs conflict', () => {
            const storeId = 'mixedId';
            const useOptionsFirst = defineZestStore(storeId, { state: () => ({ type: 'options' }) });
            const useSetupSecond = defineZestStore(storeId, () => ({ type: ref('setup') }));

            expect(useSetupSecond).toBe(useOptionsFirst); // Should return the exact same function object
            const instance = useSetupSecond();
            expect(instance.type).toBe('options');
        });
    });
}); 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineZestStore, _test_storeRegistry } from './defineZestStore'; // Import registry
import { ref, subscribeRef, isRef } from '../reactivity/ref';
import { reactive, subscribe } from '../reactivity/reactive';
import type { StoreInstance, StoreRegistryEntry } from './types';

// Helper to get the change signal ref for a store ID
const getStoreChangeSignalRef = (id: string): import('../reactivity/ref').Ref<number> | undefined => {
    const entry = _test_storeRegistry.get(id);
    return entry?.changeSignal;
};

describe('defineZestStore', () => {

    // Clear registry before each test
    beforeEach(() => {
        _test_storeRegistry.clear();
    });

    // --- Options Store Tests --- //
    describe('Options Store', () => {
        it('should define a store and initialize state correctly', () => {
            const storeId = 'counterOpt';
            const useCounterStore = defineZestStore(storeId, {
                state: () => ({ count: 0, name: 'TestStore' }),
            });
            const counterStore = useCounterStore();

            expect(counterStore.count).toBe(0);
            expect(counterStore.name).toBe('TestStore');
        });

        it('should allow actions to mutate state and trigger change signal', () => {
            const storeId = 'counterActionOpt';
            const useCounterStore = defineZestStore(storeId, {
                state: () => ({ count: 0 }),
                actions: {
                    increment() {
                        this.count++;
                    },
                    add(amount: number) {
                        this.count += amount;
                    },
                },
            });

            const counterStore = useCounterStore();
            const changeSignalRef = getStoreChangeSignalRef(storeId);
            expect(changeSignalRef).toBeDefined();
            const signalCallback = vi.fn();
            const unsubscribeSignal = subscribeRef(changeSignalRef!, signalCallback);

            expect(counterStore.count).toBe(0);

            counterStore.increment();
            expect(counterStore.count).toBe(1);
            expect(signalCallback).toHaveBeenCalledTimes(1);

            counterStore.add(5);
            expect(counterStore.count).toBe(6);
            expect(signalCallback).toHaveBeenCalledTimes(2);

            unsubscribeSignal();
        });

        it('should return the same store instance for the same ID', () => {
            const storeId = 'singletonOpt';
            const useStore1 = defineZestStore(storeId, {
                state: () => ({ value: 'initial' }),
            });
            const instance1 = useStore1();

            const useStore2 = defineZestStore(storeId, {
                state: () => ({ value: 'should not be used' }),
            });
            const instance2 = useStore2();

            expect(instance1).toBe(instance2);
            // Check signal ref is also the same
            expect(getStoreChangeSignalRef(storeId)).toBe(getStoreChangeSignalRef(storeId));
        });

        it('should return different store instances for different IDs', () => {
            const useStoreA = defineZestStore('storeA_Opt', {
                state: () => ({ id: 'A' }),
            });
            const instanceA = useStoreA();

            const useStoreB = defineZestStore('storeB_Opt', {
                state: () => ({ id: 'B' }),
            });
            const instanceB = useStoreB();

            expect(instanceA).not.toBe(instanceB);
            expect(instanceA.id).toBe('A');
            expect(instanceB.id).toBe('B');
        });

        // Test 4: Store with no actions
        it('should allow defining a store with only state', () => {
            const useDataStore = defineZestStore('dataOnlyOpt', {
                state: () => ({ data: { key: 'value' }, version: 1 }),
            });
            const dataStore = useDataStore();

            expect(dataStore.data.key).toBe('value');
            expect(dataStore.version).toBe(1);
        });

        // Test 5: Ensure actions `this` context is correct
        it('actions should have `this` correctly bound to the store instance', () => {
            const storeId = 'thisCheckOpt';
            let thisContextInAction: any = null;
            const useThisCheckStore = defineZestStore(storeId, {
                state: () => ({ a: 1 }),
                actions: {
                    checkThis() {
                        thisContextInAction = this;
                    },
                },
            });
            const store = useThisCheckStore();
            store.checkThis();
            expect(thisContextInAction).toBe(store);
            expect(thisContextInAction.a).toBe(1);
        });

        // Test 6: Test reactivity of nested objects (Modified to check signal indirectly)
        it('should handle reactivity for nested objects and trigger signal', () => {
            const storeId = 'nestedOpt';
            const useNestedStore = defineZestStore(storeId, {
                state: () => ({ user: { name: 'Anon', age: 30 } }),
                actions: {
                    setUserName(newName: string) {
                        this.user.name = newName;
                    },
                },
            });

            const store = useNestedStore();
            const changeSignalRef = getStoreChangeSignalRef(storeId);
            expect(changeSignalRef).toBeDefined();
            const signalCallback = vi.fn();
            const unsubscribeSignal = subscribeRef(changeSignalRef!, signalCallback);

            expect(store.user.name).toBe('Anon');

            store.setUserName('Zest');
            expect(store.user.name).toBe('Zest');
            expect(signalCallback).toHaveBeenCalledTimes(1);

            unsubscribeSignal();
        });
    });

    // --- Setup Store Tests --- //
    describe('Setup Store', () => {
        it('should define a store using setup syntax and return refs/functions', () => {
            const storeId = 'counterSetup';
            const useCounterStore = defineZestStore(storeId, () => {
                const count = ref(0);
                const name = ref('SetupStore');
                const increment = () => { count.value++; };
                return { count, name, increment };
            });

            const counterStore = useCounterStore();

            expect(isRef(counterStore.count)).toBe(true);
            expect(counterStore.count.value).toBe(0);
            expect(isRef(counterStore.name)).toBe(true);
            expect(counterStore.name.value).toBe('SetupStore');
            expect(typeof counterStore.increment).toBe('function');
        });

        it('should allow actions to mutate refs and trigger change signal', () => {
            const storeId = 'counterActionSetup';
            const useCounterStore = defineZestStore(storeId, () => {
                const count = ref(10);
                const increment = () => { count.value++; };
                const add = (amount: number) => { count.value += amount; };
                return { count, increment, add };
            });

            const counterStore = useCounterStore();
            const changeSignalRef = getStoreChangeSignalRef(storeId);
            expect(changeSignalRef).toBeDefined();
            const signalCallback = vi.fn();
            const unsubscribeSignal = subscribeRef(changeSignalRef!, signalCallback);

            expect(counterStore.count.value).toBe(10);

            counterStore.increment();
            expect(counterStore.count.value).toBe(11);
            expect(signalCallback).toHaveBeenCalledTimes(1);

            counterStore.add(8);
            expect(counterStore.count.value).toBe(19); // Corrected expected value
            expect(signalCallback).toHaveBeenCalledTimes(2);

            unsubscribeSignal();
        });

        it('should return the same setup store instance for the same ID', () => {
            const storeId = 'singletonSetup';
            const useStore1 = defineZestStore(storeId, () => {
                const value = ref('initial');
                return { value };
            });
            const instance1 = useStore1();

            const useStore2 = defineZestStore(storeId, () => {
                const value = ref('should not be used');
                return { value };
            });
            const instance2 = useStore2();

            expect(instance1).toBe(instance2);
            expect(instance1.value.value).toBe('initial');
            expect(getStoreChangeSignalRef(storeId)).toBe(getStoreChangeSignalRef(storeId));
        });

        it('should trigger change signal when ref VALUE is assigned a new object', () => {
            const storeId = 'reactivitySetupAssign';
            const useMyStore = defineZestStore(storeId, () => {
                const user = ref({ name: 'Alice' });
                const setUser = (newUser: { name: string }) => { user.value = newUser; };
                return { user, setUser };
            });

            const store = useMyStore();
            const changeSignalRef = getStoreChangeSignalRef(storeId);
            expect(changeSignalRef).toBeDefined();
            const signalCallback = vi.fn();
            const unsubscribeSignal = subscribeRef(changeSignalRef!, signalCallback);

            store.setUser({ name: 'Bob' });
            expect(store.user.value.name).toBe('Bob');
            expect(signalCallback).toHaveBeenCalledTimes(1);

            unsubscribeSignal();
        });

        it('should NOT trigger change signal when mutating INSIDE an object within a ref', () => {
            const storeId = 'reactivitySetupMutate';
            const useMyStore = defineZestStore(storeId, () => {
                const user = ref({ name: 'Alice' });
                // This action mutates the object *inside* the ref, not the ref itself
                const setName = (newName: string) => { user.value.name = newName; };
                return { user, setName };
            });

            const store = useMyStore();
            const changeSignalRef = getStoreChangeSignalRef(storeId);
            expect(changeSignalRef).toBeDefined();
            const signalCallback = vi.fn();
            const unsubscribeSignal = subscribeRef(changeSignalRef!, signalCallback);

            // We still expect the value to change...
            store.setName('Bob');
            expect(store.user.value.name).toBe('Bob');
            // ...but the store's change signal should NOT have been triggered by ref
            expect(signalCallback).not.toHaveBeenCalled();

            unsubscribeSignal();
        });
    });

    // --- Mixed Store Type Tests --- //
    describe('Mixed Store Types', () => {
        it('should return the first registered store type if IDs conflict', () => {
            const storeId = 'mixedId';
            const useOptionsFirst = defineZestStore(storeId, {
                state: () => ({ type: 'options' }),
            });
            const instance1 = useOptionsFirst();
            expect(instance1.type).toBe('options');

            const useSetupSecond = defineZestStore(storeId, () => {
                const type = ref('setup');
                return { type };
            });
            const instance2 = useSetupSecond();

            expect(instance2).toBe(instance1);
            expect(instance2.type).toBe('options');
        });
    });
}); 
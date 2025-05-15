import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGlobalDotzeeRegistry } from './registry';
import { defineDotzeeStore } from './defineDotzeeStore';
import { ref, subscribeRef, isRef, Ref } from '../reactivity/ref';
import { reactive, subscribe } from '../reactivity/reactive';
import { computed, isComputed, ComputedRef } from '../reactivity/computed'; // Make sure ComputedRef is imported if needed
import type { StoreInstance, StoreRegistryEntry, DotzeeStoreHook, StoreInstanceType } from './types';

// Helper function for async delays in tests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper types for Setup Store tests
interface CounterSetupStoreType {
    count: Ref<number>;
    name: Ref<string>;
    increment: () => void;
    add: (amount: number) => void;
}

interface MyStoreType {
    user: Ref<{ name: string }>;
    setUser: (newUser: { name: string }) => void;
}

interface MyStoreMutateType {
    user: Ref<{ name: string }>;
    setName: (newName: string) => void;
}

// Helper to get the change signal ref for a store ID directly from the global registry
const getStoreChangeSignalFromRegistry = (id: string): Ref<number> | undefined => {
    const entry = getGlobalDotzeeRegistry().get(id);
    return entry?.changeSignal;
};

// Helper to get an entry from the global registry
const getStoreRegistryEntry = (id: string): StoreRegistryEntry<StoreInstanceType> | undefined => {
    return getGlobalDotzeeRegistry().get(id);
};

describe('defineDotzeeStore', () => {

    // Clear the global registry before each test
    beforeEach(() => {
        getGlobalDotzeeRegistry().clear();
    });

    // --- Common Hook Structure Tests --- //
    const assertHookStructure = <T extends StoreInstanceType>(useStoreHook: DotzeeStoreHook<T>, expectedId: string) => {
        expect(typeof useStoreHook).toBe('function');
        expect(useStoreHook).toHaveProperty('$id');
        expect(useStoreHook.$id).toBe(expectedId);
        expect(useStoreHook).toHaveProperty('$changeSignal');
        expect(isRef(useStoreHook.$changeSignal)).toBe(true);

        // Check if the store is in the registry
        const registry = getGlobalDotzeeRegistry();
        const entry = registry.get(expectedId);
        expect(entry).toBeDefined();
        if (entry) {
            expect(entry.id).toBe(expectedId);
            expect(entry.hook).toBe(useStoreHook); // The hook stored should be the one returned
            expect(entry.instance).toBeDefined();
        }
    };

    // --- Options Store Tests --- //
    describe('Options Store', () => {
        it('should return a hook function with $id and $changeSignal properties and return a defined store instance when called', () => {
            const storeIdOpt = 'counterOptProps'; // Use unique ID per test block if needed
            const useCounterStoreOpt = defineDotzeeStore(storeIdOpt, {
                state: () => ({ count: 0 }), getters: {}, actions: {}
            });
            assertHookStructure(useCounterStoreOpt, storeIdOpt);
            // Check instance retrieval from registry
            const instanceFromRegistry = getGlobalDotzeeRegistry().get(storeIdOpt)?.instance;
            expect(instanceFromRegistry).toBeDefined();
        });

        it('should define a store and initialize state correctly', () => {
            const storeIdOpt = 'counterOptInit';
            const useCounterStoreOpt = defineDotzeeStore(storeIdOpt, {
                state: () => ({ count: 0, name: 'TestStore' })
            });
            // const counterStore = useCounterStoreOpt(); // INVALID: Do not call hook
            const counterStore = getGlobalDotzeeRegistry().get(storeIdOpt)?.instance as StoreInstance<{ count: number, name: string }, {}, {}>;
            expect(counterStore.count).toBe(0);
            expect(counterStore.name).toBe('TestStore');
        });

        it('should allow actions to mutate state and trigger change signal via the hook', () => {
            const storeIdOpt = 'counterOptAction';
            const useCounterStoreOpt = defineDotzeeStore(storeIdOpt, {
                state: () => ({ count: 0 }),
                actions: {
                    increment() { this.count++; },
                    add(amount: number) { this.count += amount; },
                }
            });
            // const counterStore = useCounterStoreOpt(); // INVALID: Do not call hook
            const counterStore = getGlobalDotzeeRegistry().get(storeIdOpt)?.instance as StoreInstance<{ count: number }, { increment: () => void; add: (amount: number) => void; }, {}>;
            const changeSignalRef = useCounterStoreOpt.$changeSignal;
            const signalCallback = vi.fn();
            const unsubscribeSignal = subscribeRef(changeSignalRef, signalCallback);
            counterStore.increment();
            expect(counterStore.count).toBe(1);
            expect(signalCallback).toHaveBeenCalledTimes(1);
            counterStore.add(5);
            expect(counterStore.count).toBe(6);
            expect(signalCallback).toHaveBeenCalledTimes(2);
            unsubscribeSignal();
        });

        it('should return the same augmented hook function for the same ID', () => {
            const useStore1 = defineDotzeeStore('singletonOpt', { state: () => ({ value: 'initial' }) });
            const useStore2 = defineDotzeeStore('singletonOpt', { state: () => ({ value: 'should not be used' }) });

            expect(useStore1).toBe(useStore2);
        });

        it('should return different store instances for different IDs', () => {
            const useStoreA = defineDotzeeStore('storeA_Opt', { state: () => ({ id: 'A' }) });
            const useStoreB = defineDotzeeStore('storeB_Opt', { state: () => ({ id: 'B' }) });
            // const instanceA = useStoreA(); // INVALID
            // const instanceB = useStoreB(); // INVALID
            const instanceA = getGlobalDotzeeRegistry().get('storeA_Opt')?.instance;
            const instanceB = getGlobalDotzeeRegistry().get('storeB_Opt')?.instance;

            expect(instanceA).not.toEqual(instanceB);
            expect(useStoreA).not.toBe(useStoreB);
            expect(useStoreA.$id).toBe('storeA_Opt');
            expect(useStoreB.$id).toBe('storeB_Opt');
            expect(useStoreA.$changeSignal).not.toBe(useStoreB.$changeSignal);
        });

        it('should allow defining a store with only state', () => {
            const useDataStore = defineDotzeeStore('dataOnlyOpt', {
                state: () => ({ data: { key: 'value' }, version: 1 }),
            });
            // const dataStore = useDataStore(); // INVALID
            const dataStore = getGlobalDotzeeRegistry().get('dataOnlyOpt')?.instance as StoreInstance<{ data: { key: string }, version: number }, {}, {}>;
            expect(dataStore.data.key).toBe('value');
            expect(dataStore.version).toBe(1);
            // Check hook structure too
            expect(useDataStore.$id).toBe('dataOnlyOpt');
            expect(isRef(useDataStore.$changeSignal)).toBe(true);
        });

        it('actions should have `this` correctly bound to the store instance', () => {
            const storeId = 'thisCheckOpt';
            let thisContextInAction: any = null;
            const useThisCheckStore = defineDotzeeStore(storeId, {
                state: () => ({ a: 1 }),
                actions: {
                    checkThis() { thisContextInAction = this; },
                },
            });
            // const store = useThisCheckStore(); // INVALID
            const store = getGlobalDotzeeRegistry().get(storeId)?.instance as StoreInstance<{ a: number }, { checkThis: () => void }, {}>;
            store.checkThis();
            expect(thisContextInAction).toBe(store);
            expect(thisContextInAction.a).toBe(1);
        });

        it('should handle reactivity for nested objects and trigger signal via hook', () => {
            const storeId = 'nestedOpt';
            const useNestedStore = defineDotzeeStore(storeId, {
                state: () => ({ user: { name: 'Anon', age: 30 } }),
                actions: {
                    setUserName(newName: string) { this.user.name = newName; },
                },
            });
            // const store = useNestedStore(); // INVALID
            const store = getGlobalDotzeeRegistry().get(storeId)?.instance as StoreInstance<{ user: { name: string, age: number } }, { setUserName: (newName: string) => void }, {}>;
            const changeSignalRef = useNestedStore.$changeSignal; // Get from hook
            const signalCallback = vi.fn();
            const unsubscribeSignal = subscribeRef(changeSignalRef, signalCallback);

            expect(store.user.name).toBe('Anon');
            store.setUserName('Dotzee');
            expect(store.user.name).toBe('Dotzee');
            expect(signalCallback).toHaveBeenCalledTimes(1);
            unsubscribeSignal();
        });

        it('should define getters and compute initial values correctly', () => {
            const storeIdOpt = 'counterOptGetterInit'; // Unique ID
            const useCounterStoreOpt = defineDotzeeStore(storeIdOpt, {
                state: () => ({ count: 0, name: 'TestStore' }),
                getters: {
                    doubleCount: (state) => state.count * 2,
                    nameAndCount: (state) => `${state.name}:${state.count}`,
                }
            });
            // const counterStore = useCounterStoreOpt(); // INVALID
            const counterStore = getGlobalDotzeeRegistry().get(storeIdOpt)?.instance as any; // Fresh instance, cast to any for test
            expect(counterStore).toHaveProperty('doubleCount');
            expect(counterStore).toHaveProperty('nameAndCount');
            expect(counterStore.doubleCount).toBe(0); // Should be 0 * 2 = 0
            expect(counterStore.nameAndCount).toBe('TestStore:0');
        });

        it('getters should be reactive to state changes', () => {
            const storeIdOpt = 'counterOptGetterReactive'; // Unique ID
            const useCounterStoreOpt = defineDotzeeStore(storeIdOpt, {
                state: () => ({ count: 0, name: 'TestStore' }),
                actions: {
                    increment() { this.count++; },
                    add(amount: number) { this.count += amount; },
                },
                getters: {
                    doubleCount: (state) => state.count * 2,
                    nameAndCount: (state) => `${state.name}:${state.count}`,
                }
            });
            // const counterStore = useCounterStoreOpt(); // INVALID
            const counterStore = getGlobalDotzeeRegistry().get(storeIdOpt)?.instance as any; // Fresh instance
            expect(counterStore.doubleCount).toBe(0); // Initial check (0*2=0)

            counterStore.increment(); // count becomes 1
            expect(counterStore.count).toBe(1);
            expect(counterStore.doubleCount).toBe(2); // Should update (1*2=2)
            expect(counterStore.nameAndCount).toBe('TestStore:1');

            counterStore.add(4); // count becomes 5
            expect(counterStore.count).toBe(5);
            expect(counterStore.doubleCount).toBe(10); // Should update (5*2=10)
            expect(counterStore.nameAndCount).toBe('TestStore:5');
        });

        it('getters should be cached and use computed reactivity', () => {
            const stateGetter = vi.fn(() => ({ count: 1 }));
            const getterFn = vi.fn((state) => state.count * 2);

            const useTestGetterStore = defineDotzeeStore('getterCacheOpt', {
                state: stateGetter,
                getters: { double: getterFn },
            });
            // const store = useTestGetterStore(); // INVALID
            const store = getGlobalDotzeeRegistry().get('getterCacheOpt')?.instance as any; // Cast to any for test

            // Getter fn should be called once by computed for initial value
            expect(getterFn).toHaveBeenCalledTimes(1);

            // Access the getter multiple times
            expect(store.double).toBe(2);
            expect(store.double).toBe(2);
            expect(store.double).toBe(2);

            // Getter fn should still only have been called once due to caching
            expect(getterFn).toHaveBeenCalledTimes(1);

            // Now, trigger a state change (though we don't have actions here, we can simulate)
            // This requires accessing the underlying reactive state, not ideal but works for test
            store.count = 5; // Directly modify the underlying state property
            expect(store.count).toBe(5);

            // Access the getter again, should recompute
            expect(store.double).toBe(10);
            expect(getterFn).toHaveBeenCalledTimes(2); // Called again

            // Access again, should be cached now
            expect(store.double).toBe(10);
            expect(getterFn).toHaveBeenCalledTimes(2);
        });

        it('actions should have `this` correctly bound and can access getters', () => {
            const storeId = 'thisCheckGetterOpt';
            let thisContextInAction: any = null;
            let doubleCountInAction: number | undefined;

            const useThisCheckStore = defineDotzeeStore(storeId, {
                state: () => ({ a: 1 }),
                getters: {
                    doubleA: (state) => state.a * 2,
                },
                actions: {
                    checkThis() {
                        thisContextInAction = this;
                        doubleCountInAction = this.doubleA; // Access getter via this
                    },
                },
            });
            // const store = useThisCheckStore(); // INVALID
            const store = getGlobalDotzeeRegistry().get(storeId)?.instance as any;
            store.checkThis();

            expect(thisContextInAction).toBe(store);
            expect(thisContextInAction.a).toBe(1);
            expect(thisContextInAction.doubleA).toBe(2);
            expect(doubleCountInAction).toBe(2); // Check value accessed in action
        });

        it('getters should demonstrate fine-grained reactivity and not recompute unnecessarily', () => {
            const state = {
                count: 1,
                anotherValue: 'hello',
                nested: { deep: 100 }
            };

            // Mock getter functions to spy on their execution
            const getter1Spy = vi.fn((s) => s.count * 2); // Depends on count
            const getter2Spy = vi.fn((s) => s.anotherValue.toUpperCase()); // Depends on anotherValue
            const getter3Spy = vi.fn((s) => s.nested.deep + 10); // Depends on nested.deep

            const useFineGrainedStore = defineDotzeeStore('fineGrainedGettersOpt', {
                state: () => JSON.parse(JSON.stringify(state)), // Deep clone initial state
                actions: {
                    incrementCount() { this.count++; },
                    setAnotherValue(val: string) { this.anotherValue = val; },
                    setNestedDeep(val: number) { this.nested.deep = val; },
                    unrelatedChange() { /* Does nothing to tracked state */ }
                },
                getters: {
                    g1: getter1Spy,
                    g2: getter2Spy,
                    g3: getter3Spy,
                }
            });
            // const store = useFineGrainedStore(); // INVALID
            const store = getGlobalDotzeeRegistry().get('fineGrainedGettersOpt')?.instance as any;

            // Initial access - all getters should compute once
            expect(store.g1).toBe(2);   // 1*2
            expect(store.g2).toBe('HELLO');
            expect(store.g3).toBe(110); // 100 + 10
            expect(getter1Spy).toHaveBeenCalledTimes(1);
            expect(getter2Spy).toHaveBeenCalledTimes(1);
            expect(getter3Spy).toHaveBeenCalledTimes(1);

            // Access again - should use cache, no recomputation
            expect(store.g1).toBe(2);
            expect(store.g2).toBe('HELLO');
            expect(store.g3).toBe(110);
            expect(getter1Spy).toHaveBeenCalledTimes(1);
            expect(getter2Spy).toHaveBeenCalledTimes(1);
            expect(getter3Spy).toHaveBeenCalledTimes(1);

            // --- Test fine-grained reactivity --- //

            // 1. Change 'count', only getter1Spy should recompute
            store.incrementCount(); // count becomes 2
            expect(store.g1).toBe(4);   // New value 2*2
            expect(store.g2).toBe('HELLO'); // Should be cached
            expect(store.g3).toBe(110); // Should be cached

            expect(getter1Spy).toHaveBeenCalledTimes(2); // Recomputed
            expect(getter2Spy).toHaveBeenCalledTimes(1); // Still cached
            expect(getter3Spy).toHaveBeenCalledTimes(1); // Still cached

            // 2. Change 'anotherValue', only getter2Spy should recompute
            store.setAnotherValue('world'); // anotherValue becomes 'world'
            expect(store.g1).toBe(4);       // Should be cached
            expect(store.g2).toBe('WORLD');  // New value
            expect(store.g3).toBe(110);   // Should be cached

            expect(getter1Spy).toHaveBeenCalledTimes(2); // Still cached from previous
            expect(getter2Spy).toHaveBeenCalledTimes(2); // Recomputed
            expect(getter3Spy).toHaveBeenCalledTimes(1); // Still cached

            // 3. Change 'nested.deep', only getter3Spy should recompute
            store.setNestedDeep(200); // nested.deep becomes 200
            expect(store.g1).toBe(4);
            expect(store.g2).toBe('WORLD');
            expect(store.g3).toBe(210); // 200 + 10

            expect(getter1Spy).toHaveBeenCalledTimes(2);
            expect(getter2Spy).toHaveBeenCalledTimes(2);
            expect(getter3Spy).toHaveBeenCalledTimes(2); // Recomputed

            // 4. Call an action that doesn't change any tracked state - no getters should recompute
            store.unrelatedChange();
            expect(store.g1).toBe(4);
            expect(store.g2).toBe('WORLD');
            expect(store.g3).toBe(210);

            expect(getter1Spy).toHaveBeenCalledTimes(2);
            expect(getter2Spy).toHaveBeenCalledTimes(2);
            expect(getter3Spy).toHaveBeenCalledTimes(2);
        });

        it('Options Store: should throw if state is not a function', () => {
            const storeId = 'errorStateNotFunctionOpt';
            expect(() => {
                defineDotzeeStore(storeId, {
                    state: { count: 0 } as any, // Cast to any to bypass TS check for test
                });
            }).toThrow(TypeError);
        });
    });

    // --- Setup Store Tests --- //
    describe('Setup Store', () => {
        const storeIdSetup = 'counterSetup';
        let useCounterStoreSetup: DotzeeStoreHook<CounterSetupStoreType>;

        beforeEach(() => {
            useCounterStoreSetup = defineDotzeeStore(storeIdSetup, () => {
                const count = ref(0);
                const name = ref('SetupStore');
                const increment = () => { count.value++; };
                const add = (amount: number) => { count.value += amount; };
                return { count, name, increment, add };
            }) as DotzeeStoreHook<CounterSetupStoreType>;
        });

        it('should return a hook function with $id and $changeSignal properties and return a defined store instance when called', () => {
            assertHookStructure(useCounterStoreSetup, storeIdSetup);
            const instanceFromRegistry = getGlobalDotzeeRegistry().get(storeIdSetup)?.instance;
            expect(instanceFromRegistry).toBeDefined();
        });

        it('should define a store using setup syntax and return refs/functions', () => {
            const counterStoreFromRegistry = getGlobalDotzeeRegistry().get(storeIdSetup)?.instance;
            expect(counterStoreFromRegistry).toBeDefined();
            if (!counterStoreFromRegistry) return;
            const counterStore = counterStoreFromRegistry as CounterSetupStoreType;
            expect(isRef(counterStore.count)).toBe(true);
            expect(counterStore.count.value).toBe(0);
            expect(isRef(counterStore.name)).toBe(true);
            expect(counterStore.name.value).toBe('SetupStore');
            expect(typeof counterStore.increment).toBe('function');
            expect(typeof counterStore.add).toBe('function');
        });

        it('should allow actions to mutate refs and trigger change signal via hook', () => {
            const counterStoreFromRegistry = getGlobalDotzeeRegistry().get(storeIdSetup)?.instance;
            expect(counterStoreFromRegistry).toBeDefined();
            if (!counterStoreFromRegistry) return;
            const counterStore = counterStoreFromRegistry as CounterSetupStoreType;

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
            const useStore1 = defineDotzeeStore('singletonSetupSpecific', () => ({ value: ref('initial') }));
            const useStore2 = defineDotzeeStore('singletonSetupSpecific', () => ({ value: ref('should not be used') }));
            expect(useStore1).toBe(useStore2);
        });

        it('should trigger change signal when ref VALUE is assigned via hook', () => {
            const storeId = 'reactivitySetupAssign';
            const useMyStore = defineDotzeeStore(storeId, () => {
                const user = ref({ name: 'Alice' });
                const setUser = (newUser: { name: string }) => { user.value = newUser; };
                return { user, setUser };
            });
            const store = getGlobalDotzeeRegistry().get(storeId)?.instance as MyStoreType;
            expect(store).toBeDefined();
            if (!store) return;
            const changeSignalRef = useMyStore.$changeSignal;
            const signalCallback = vi.fn();
            const unsubscribeSignal = subscribeRef(changeSignalRef, signalCallback);

            store.setUser({ name: 'Bob' });
            expect(store.user.value.name).toBe('Bob');
            expect(signalCallback).toHaveBeenCalledTimes(1);
            unsubscribeSignal();
        });

        it('should NOT trigger change signal when mutating INSIDE an object within a ref', () => {
            const storeId = 'reactivitySetupMutate';
            const useMyStore = defineDotzeeStore(storeId, () => {
                const user = ref({ name: 'Alice' });
                const setName = (newName: string) => { user.value.name = newName; };
                return { user, setName };
            });
            const store = getGlobalDotzeeRegistry().get(storeId)?.instance as MyStoreMutateType;
            expect(store).toBeDefined();
            if (!store) return;
            const changeSignalRef = useMyStore.$changeSignal;
            const signalCallback = vi.fn();
            const unsubscribeSignal = subscribeRef(changeSignalRef, signalCallback);

            store.setName('Bob');
            expect(store.user.value.name).toBe('Bob');
            expect(signalCallback).not.toHaveBeenCalled();
            unsubscribeSignal();
        });
    });

    // --- Mixed Store Type Tests --- //
    describe('Mixed Store Types', () => {
        it('should return the first registered store hook if IDs conflict', () => {
            const storeId = 'mixedId';
            const useOptionsFirst = defineDotzeeStore(storeId, { state: () => ({ type: 'options' }) });
            const useSetupSecond = defineDotzeeStore(storeId, () => ({ type: ref('setup') }));

            expect(useSetupSecond).toBe(useOptionsFirst);
            const entry = getGlobalDotzeeRegistry().get(storeId);
            expect(entry).toBeDefined();
            if (!entry) return;
            const instance = entry.instance;
            expect((instance as any).type).toBe('options');
        });
    });

    // --- Asynchronous Actions Tests --- //
    describe('Asynchronous Actions', () => {
        it('Options Store: should handle async actions, update state, and trigger signal after await', async () => {
            const storeId = 'asyncOptions';
            const useAsyncStore = defineDotzeeStore(storeId, {
                state: () => ({ status: 'idle', data: null as string | null }),
                actions: {
                    async fetchData(simulatedData: string) {
                        this.status = 'loading';
                        await delay(10);
                        this.data = simulatedData;
                        this.status = 'success';
                    },
                },
            });

            const store = getGlobalDotzeeRegistry().get(storeId)?.instance as any;
            expect(store).toBeDefined();
            if (!store) return;
            const changeSignalRef = useAsyncStore.$changeSignal;
            const signalCallback = vi.fn();
            const unsubscribe = subscribeRef(changeSignalRef, signalCallback);

            expect(store.status).toBe('idle');
            expect(store.data).toBeNull();
            expect(signalCallback).not.toHaveBeenCalled();

            const fetchDataPromise = store.fetchData('Fetched Data!');

            expect(store.status).toBe('loading');
            expect(signalCallback).toHaveBeenCalledTimes(1);

            await fetchDataPromise;

            expect(store.status).toBe('success');
            expect(store.data).toBe('Fetched Data!');
            expect(signalCallback).toHaveBeenCalledTimes(3);

            unsubscribe();
        });

        it('Setup Store: should handle async actions, update refs, and trigger signal after await', async () => {
            const storeId = 'asyncSetup';
            const useAsyncStore = defineDotzeeStore(storeId, () => {
                const status = ref<'idle' | 'loading' | 'success'>('idle');
                const data = ref<string | null>(null);

                async function fetchData(simulatedData: string) {
                    status.value = 'loading';
                    await delay(10);
                    data.value = simulatedData;
                    status.value = 'success';
                }
                return { status, data, fetchData };
            });

            const store = getGlobalDotzeeRegistry().get(storeId)?.instance as any;
            expect(store).toBeDefined();
            if (!store) return;
            const changeSignalRef = useAsyncStore.$changeSignal;
            const signalCallback = vi.fn();
            const unsubscribe = subscribeRef(changeSignalRef, signalCallback);

            expect(store.status.value).toBe('idle');
            expect(store.data.value).toBeNull();
            expect(signalCallback).not.toHaveBeenCalled();

            const fetchDataPromise = store.fetchData('Fetched Setup Data!');

            expect(store.status.value).toBe('loading');
            expect(signalCallback).toHaveBeenCalledTimes(1);

            await fetchDataPromise;

            expect(store.status.value).toBe('success');
            expect(store.data.value).toBe('Fetched Setup Data!');
            expect(signalCallback).toHaveBeenCalledTimes(3);

            unsubscribe();
        });

        it('Options Store: getters should update reactively after async action completes', async () => {
            const storeId = 'asyncGetterOptions';
            const useAsyncGetterStore = defineDotzeeStore(storeId, {
                state: () => ({ value: 0 }),
                actions: {
                    async incrementAfterDelay(amount: number) {
                        await delay(10);
                        this.value += amount;
                    }
                },
                getters: {
                    doubled: (state) => state.value * 2
                }
            });

            const store = getGlobalDotzeeRegistry().get(storeId)?.instance as any;
            expect(store).toBeDefined();
            if (!store) return;
            expect(store.value).toBe(0);
            expect(store.doubled).toBe(0);

            const actionPromise = store.incrementAfterDelay(5);

            expect(store.doubled).toBe(0);

            await actionPromise;

            expect(store.value).toBe(5);
            expect(store.doubled).toBe(10);
        });
    });

    describe('Advanced TypeScript Typing', () => {
        it('Options Store: `this` should be correctly typed in actions', async () => {
            const storeId = 'typingOptionsThis';
            const useTypingStore = defineDotzeeStore(storeId, {
                state: () => ({ count: 0, name: 'Test' }),
                getters: {
                    isZero: (state) => state.count === 0,
                    nameLength: (state) => state.name.length,
                },
                actions: {
                    increment() {
                        this.count++;
                    },
                    async complexAction(prefix: string): Promise<string> {
                        this.increment();
                        const isCurrentlyZero = this.isZero;
                        await delay(5);
                        const finalName = `${prefix}-${this.name}:${this.nameLength}`;
                        return finalName;
                    },
                },
            });

            const store = getGlobalDotzeeRegistry().get(storeId)?.instance as any;
            expect(store).toBeDefined();
            if (!store) return;
            expect(useTypingStore.$id).toBe(storeId);

            const result: string = await store.complexAction('PREFIX');
            expect(typeof result).toBe('string');
        });

        it('Setup Store: Async action return type should be inferred correctly', async () => {
            const storeId = 'typingSetupAsync';
            const useTypingStore = defineDotzeeStore(storeId, () => {
                const count = ref(0);
                async function loadData(id: number): Promise<{ id: number; data: string }> {
                    await delay(5);
                    return { id, data: `Data for ${id}` };
                }
                return { count, loadData };
            });

            const store = getGlobalDotzeeRegistry().get(storeId)?.instance as any;
            expect(store).toBeDefined();
            if (!store) return;
            expect(useTypingStore.$id).toBe(storeId);

            const result = await store.loadData(123);
            const expectedResult: { id: number; data: string } = result;
            expect(expectedResult.id).toBe(123);
            expect(expectedResult.data).toContain('123');
        });

        it('useDotzeeStore should return a fully typed store instance', () => {
            const useComplexStore = defineDotzeeStore('complexTypeCheck', {
                state: () => ({ user: { name: 'Alice', age: 30 }, items: ['a', 'b'] }),
                getters: {
                    userName: (state) => state.user.name,
                    itemCount: (state) => state.items.length,
                },
                actions: {
                    setAge(newAge: number) {
                        this.user.age = newAge;
                    },
                },
            });

            const store = getGlobalDotzeeRegistry().get('complexTypeCheck')?.instance as any;
            expect(store).toBeDefined();
            if (!store) return;

            const age: number = store.user.age;
            const firstItem: string = store.items[0];

            const name: string = store.userName;
            const count: number = store.itemCount;

            store.setAge(31);

            expect(age).toBe(30); // age variable captured before mutation
            expect(store.user.age).toBe(31); // store state after mutation
            expect(name).toBe('Alice');
            expect(firstItem).toBe('a');
            expect(count).toBe(2);
        });
    });

    // --- Error Handling Tests --- //
    describe('Error Handling', () => {
        it('Options Store: should throw if state is not a function', () => {
            const storeId = 'errorStateNotFunctionOpt';
            expect(() => {
                defineDotzeeStore(storeId, {
                    state: { count: 0 } as any, // Cast to any to bypass TS check for test
                });
            }).toThrow(TypeError);
        });

        it('Setup Store: should propagate errors thrown during setup function execution', () => {
            const storeId = 'errorInSetup';
            const setupError = new Error('Setup failed!');
            expect(() => {
                defineDotzeeStore(storeId, () => {
                    throw setupError;
                });
            }).toThrow(setupError);
        });

        it('Options Store: should handle errors in action execution gracefully and allow DevTools reporting', async () => {
            const storeId = 'errorInActionOpt';
            const actionError = new Error('Action failed!');
            const useErrorStore = defineDotzeeStore(storeId, {
                state: () => ({ log: [] as string[] }),
                actions: {
                    async failingAction() {
                        (this.log as string[]).push('Action started');
                        await delay(1);
                        throw actionError;
                    },
                },
            });

            const store = getGlobalDotzeeRegistry().get(storeId)?.instance as any;
            expect(store).toBeDefined();

            // Simulate DevTools being enabled for action reporting
            const connectorModule = await import('../devtools/connector');
            const sendActionSpy = vi.spyOn(connectorModule, '_internal_sendAction').mockImplementation(vi.fn());
            const isEnabledSpy = vi.spyOn(connectorModule, 'isDotzeeDevToolsEnabled').mockReturnValue(true);

            await expect(store.failingAction()).rejects.toThrow(actionError);
            expect(store.log).toEqual(['Action started']);
            expect(sendActionSpy).toHaveBeenCalledWith(
                storeId,
                'failingAction',
                undefined, // No specific payload for this action
                expect.anything() // Registry
            );

            // Restore original DevTools functions
            sendActionSpy.mockRestore();
            isEnabledSpy.mockRestore();
        });

        it('Setup Store: should propagate errors from actions and allow DevTools reporting', async () => {
            const storeId = 'errorInActionSetup';
            const actionError = new Error('Setup action failed!');

            const useErrorStore = defineDotzeeStore(storeId, () => {
                const log = ref<string[]>([]);
                async function failingAction() {
                    log.value.push('Setup action started');
                    await delay(1);
                    throw actionError;
                }
                return { log, failingAction };
            });

            const store = getGlobalDotzeeRegistry().get(storeId)?.instance as any;
            expect(store).toBeDefined();

            // Simulate DevTools being enabled for action reporting
            const connectorModule = await import('../devtools/connector');
            const sendActionSpy = vi.spyOn(connectorModule, '_internal_sendAction').mockImplementation(vi.fn());
            const isEnabledSpy = vi.spyOn(connectorModule, 'isDotzeeDevToolsEnabled').mockReturnValue(true);

            await expect(store.failingAction()).rejects.toThrow(actionError);
            expect(store.log.value).toEqual(['Setup action started']); // Note: log is a ref
            expect(sendActionSpy).toHaveBeenCalledWith(
                storeId,
                'failingAction',
                undefined, // No specific payload
                expect.anything() // Registry
            );

            // Restore original DevTools functions
            sendActionSpy.mockRestore();
            isEnabledSpy.mockRestore();
        });
    });
}); 
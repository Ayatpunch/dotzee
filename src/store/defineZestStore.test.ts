import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineZestStore, _test_storeRegistry } from './defineZestStore'; // Import registry
import { ref, subscribeRef, isRef, Ref } from '../reactivity/ref';
import { reactive, subscribe } from '../reactivity/reactive';
import { computed, isComputed, ComputedRef } from '../reactivity/computed'; // Make sure ComputedRef is imported if needed
import type { StoreInstance, StoreRegistryEntry, ZestStoreHook, StoreInstanceType } from './types';

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
    const assertHookStructure = <T extends StoreInstanceType>(useStoreHook: ZestStoreHook<T>, expectedId: string) => {
        expect(typeof useStoreHook).toBe('function');
        expect(useStoreHook).toHaveProperty('$id');
        expect(useStoreHook.$id).toBe(expectedId);
        expect(useStoreHook).toHaveProperty('$changeSignal');
        expect(isRef(useStoreHook.$changeSignal)).toBe(true);

        const instance1 = useStoreHook();
        expect(instance1).toBeDefined();
        // Optionally, check if calling it again returns the same instance (it should due to registry cache)
        const instance2 = useStoreHook();
        expect(instance2).toBe(instance1); // Check for instance stability from the hook call
    };

    // --- Options Store Tests --- //
    describe('Options Store', () => {
        it('should return a hook function with $id and $changeSignal properties and return a defined store instance when called', () => {
            const storeIdOpt = 'counterOptProps'; // Use unique ID per test block if needed
            const useCounterStoreOpt = defineZestStore(storeIdOpt, {
                state: () => ({ count: 0 }), getters: {}, actions: {}
            });
            assertHookStructure(useCounterStoreOpt, storeIdOpt);
        });

        it('should define a store and initialize state correctly', () => {
            const storeIdOpt = 'counterOptInit';
            const useCounterStoreOpt = defineZestStore(storeIdOpt, {
                state: () => ({ count: 0, name: 'TestStore' })
            });
            const counterStore = useCounterStoreOpt();
            expect(counterStore.count).toBe(0);
            expect(counterStore.name).toBe('TestStore');
        });

        it('should allow actions to mutate state and trigger change signal via the hook', () => {
            const storeIdOpt = 'counterOptAction';
            const useCounterStoreOpt = defineZestStore(storeIdOpt, {
                state: () => ({ count: 0 }),
                actions: {
                    increment() { this.count++; },
                    add(amount: number) { this.count += amount; },
                }
            });
            const counterStore = useCounterStoreOpt();
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

        it('should define getters and compute initial values correctly', () => {
            const storeIdOpt = 'counterOptGetterInit'; // Unique ID
            const useCounterStoreOpt = defineZestStore(storeIdOpt, {
                state: () => ({ count: 0, name: 'TestStore' }),
                getters: {
                    doubleCount: (state) => state.count * 2,
                    nameAndCount: (state) => `${state.name}:${state.count}`,
                }
            });
            const counterStore = useCounterStoreOpt(); // Fresh instance
            expect(counterStore).toHaveProperty('doubleCount');
            expect(counterStore).toHaveProperty('nameAndCount');
            expect(counterStore.doubleCount).toBe(0); // Should be 0 * 2 = 0
            expect(counterStore.nameAndCount).toBe('TestStore:0');
        });

        it('getters should be reactive to state changes', () => {
            const storeIdOpt = 'counterOptGetterReactive'; // Unique ID
            const useCounterStoreOpt = defineZestStore(storeIdOpt, {
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
            const counterStore = useCounterStoreOpt(); // Fresh instance
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

            const useTestGetterStore = defineZestStore('getterCacheOpt', {
                state: stateGetter,
                getters: { double: getterFn },
            });
            const store = useTestGetterStore();

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

            const useThisCheckStore = defineZestStore(storeId, {
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
            const store = useThisCheckStore();
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

            const useFineGrainedStore = defineZestStore('fineGrainedGettersOpt', {
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

            const store = useFineGrainedStore();

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
    });

    // --- Setup Store Tests --- //
    describe('Setup Store', () => {
        const storeIdSetup = 'counterSetup';
        // Define the specific setup store for counter tests
        const useCounterStoreSetup = defineZestStore(storeIdSetup, () => {
            const count = ref(0);
            const name = ref('SetupStore');
            const increment = () => { count.value++; };
            const add = (amount: number) => { count.value += amount; };
            return { count, name, increment, add };
        });

        // Test the hook structure itself
        it('should return a hook function with $id and $changeSignal properties and return a defined store instance when called', () => {
            assertHookStructure(useCounterStoreSetup, storeIdSetup);
        });

        it('should define a store using setup syntax and return refs/functions', () => {
            // Assert type via unknown
            const counterStore = useCounterStoreSetup() as unknown as CounterSetupStoreType;
            expect(isRef(counterStore.count)).toBe(true);
            expect(counterStore.count.value).toBe(0);
            expect(isRef(counterStore.name)).toBe(true);
            expect(counterStore.name.value).toBe('SetupStore');
            expect(typeof counterStore.increment).toBe('function');
            expect(typeof counterStore.add).toBe('function');
        });

        it('should allow actions to mutate refs and trigger change signal via hook', () => {
            // Assert type via unknown
            const counterStore = useCounterStoreSetup() as unknown as CounterSetupStoreType;
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

        it('should trigger change signal when ref VALUE is assigned via hook', () => {
            const storeId = 'reactivitySetupAssign';
            const useMyStore = defineZestStore(storeId, () => {
                const user = ref({ name: 'Alice' });
                const setUser = (newUser: { name: string }) => { user.value = newUser; };
                return { user, setUser };
            });
            const store = useMyStore() as unknown as MyStoreType; // Apply specific type
            const changeSignalRef = useMyStore.$changeSignal;
            const signalCallback = vi.fn();
            const unsubscribeSignal = subscribeRef(changeSignalRef, signalCallback);

            store.setUser({ name: 'Bob' }); // No assertion needed
            expect(store.user.value.name).toBe('Bob'); // No assertion needed
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
            const store = useMyStore() as unknown as MyStoreMutateType; // Apply specific type
            const changeSignalRef = useMyStore.$changeSignal;
            const signalCallback = vi.fn();
            const unsubscribeSignal = subscribeRef(changeSignalRef, signalCallback);

            store.setName('Bob'); // No assertion needed
            expect(store.user.value.name).toBe('Bob'); // No assertion needed
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

    // --- Asynchronous Actions Tests --- //
    describe('Asynchronous Actions', () => {
        // Options Store Async Action Test
        it('Options Store: should handle async actions, update state, and trigger signal after await', async () => {
            const storeId = 'asyncOptions';
            const useAsyncStore = defineZestStore(storeId, {
                state: () => ({ status: 'idle', data: null as string | null }),
                actions: {
                    async fetchData(simulatedData: string) {
                        this.status = 'loading';
                        await delay(10); // Simulate network delay
                        this.data = simulatedData;
                        this.status = 'success';
                    },
                },
            });

            const store = useAsyncStore();
            const changeSignalRef = useAsyncStore.$changeSignal;
            const signalCallback = vi.fn();
            const unsubscribe = subscribeRef(changeSignalRef, signalCallback);

            expect(store.status).toBe('idle');
            expect(store.data).toBeNull();
            expect(signalCallback).not.toHaveBeenCalled();

            const fetchDataPromise = store.fetchData('Fetched Data!');

            // Status should change immediately
            expect(store.status).toBe('loading');
            expect(signalCallback).toHaveBeenCalledTimes(1); // Triggered by status change

            // Wait for the async action to complete
            await fetchDataPromise;

            // Check final state and signal calls
            expect(store.status).toBe('success');
            expect(store.data).toBe('Fetched Data!');
            // Two more calls expected: one for data, one for status
            expect(signalCallback).toHaveBeenCalledTimes(3);

            unsubscribe();
        });

        // Setup Store Async Action Test
        it('Setup Store: should handle async actions, update refs, and trigger signal after await', async () => {
            const storeId = 'asyncSetup';
            const useAsyncStore = defineZestStore(storeId, () => {
                const status = ref<'idle' | 'loading' | 'success'>('idle');
                const data = ref<string | null>(null);

                async function fetchData(simulatedData: string) {
                    status.value = 'loading';
                    await delay(10); // Simulate network delay
                    data.value = simulatedData;
                    status.value = 'success';
                }
                return { status, data, fetchData };
            });

            const store = useAsyncStore();
            const changeSignalRef = useAsyncStore.$changeSignal;
            const signalCallback = vi.fn();
            const unsubscribe = subscribeRef(changeSignalRef, signalCallback);

            expect(store.status.value).toBe('idle');
            expect(store.data.value).toBeNull();
            expect(signalCallback).not.toHaveBeenCalled();

            const fetchDataPromise = store.fetchData('Fetched Setup Data!');

            // Status ref should change immediately
            expect(store.status.value).toBe('loading');
            expect(signalCallback).toHaveBeenCalledTimes(1); // Triggered by status ref change

            // Wait for the async action to complete
            await fetchDataPromise;

            // Check final state and signal calls
            expect(store.status.value).toBe('success');
            expect(store.data.value).toBe('Fetched Setup Data!');
            // Two more calls expected: one for data ref, one for status ref
            expect(signalCallback).toHaveBeenCalledTimes(3);

            unsubscribe();
        });

        // Test getter reactivity with async action (Options Store)
        it('Options Store: getters should update reactively after async action completes', async () => {
            const storeId = 'asyncGetterOptions';
            const useAsyncGetterStore = defineZestStore(storeId, {
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

            const store = useAsyncGetterStore();
            expect(store.value).toBe(0);
            expect(store.doubled).toBe(0);

            const actionPromise = store.incrementAfterDelay(5);

            // Getter should still be 0 before await completes
            expect(store.doubled).toBe(0);

            await actionPromise;

            // Getter should update after action completion
            expect(store.value).toBe(5);
            expect(store.doubled).toBe(10);
        });
    });

    // --- Advanced TypeScript Typing Tests --- //
    // Note: These tests primarily rely on TypeScript compilation success.
    // Runtime assertions are minimal as the goal is static type verification.
    describe('Advanced TypeScript Typing', () => {
        it('Options Store: `this` should be correctly typed in actions', () => {
            const storeId = 'typingOptionsThis';
            const useTypingStore = defineZestStore(storeId, {
                state: () => ({ count: 0, name: 'Test' }),
                getters: {
                    // Ensure G is inferred correctly
                    isZero: (state) => state.count === 0,
                    nameLength: (state) => state.name.length,
                },
                actions: {
                    increment() {
                        this.count++; // Access state
                    },
                    async complexAction(prefix: string): Promise<string> {
                        this.increment(); // Access other action
                        const isCurrentlyZero = this.isZero; // Access getter
                        await delay(5);
                        const finalName = `${prefix}-${this.name}:${this.nameLength}`;
                        return finalName; // Return Promise<string>
                    },
                },
            });

            const store = useTypingStore();
            // Minimal runtime check, primary validation is TS compilation
            expect(useTypingStore.$id).toBe(storeId); // Check $id on the hook object

            // Verify async action return type inference
            const testAsyncReturnType = async () => {
                const result: string = await store.complexAction('PREFIX');
                expect(typeof result).toBe('string'); // Runtime check for return type
            };
            void testAsyncReturnType(); // Call async test function
        });

        it('Setup Store: Async action return type should be inferred correctly', () => {
            const storeId = 'typingSetupAsync';
            const useTypingStore = defineZestStore(storeId, () => {
                const count = ref(0);
                async function loadData(id: number): Promise<{ id: number; data: string }> {
                    await delay(5);
                    return { id, data: `Data for ${id}` };
                }
                return { count, loadData }; // R is inferred here
            });

            const store = useTypingStore();
            expect(useTypingStore.$id).toBe(storeId);

            // Verify async action return type inference
            const testAsyncReturnType = async () => {
                const result = await store.loadData(123);
                // Check if result is assignable to the expected type
                const expectedResult: { id: number; data: string } = result;
                expect(expectedResult.id).toBe(123);
                expect(expectedResult.data).toContain('123');
            };
            void testAsyncReturnType(); // Call async test function
        });

        it('useZestStore should return a fully typed store instance', () => {
            // Define a store with known complex types
            const useComplexStore = defineZestStore('complexTypeCheck', {
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

            // Use the main hook (which internally uses useSyncExternalStore)
            // No need for actual React component context here, just checking types.
            const store = useComplexStore(); // Direct call to the hook function

            // Perform checks that rely on correct typing:

            // State properties
            const age: number = store.user.age;
            const firstItem: string = store.items[0];

            // Getters
            const name: string = store.userName;
            const count: number = store.itemCount;

            // Actions (check parameter type and existence)
            store.setAge(31);

            // Minimal runtime assertion
            expect(age).toBe(30);
            expect(name).toBe('Alice');
            expect(firstItem).toBe('a');
            expect(count).toBe(2);
        });
    });
}); 
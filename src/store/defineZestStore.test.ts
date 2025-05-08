import { describe, it, expect, vi } from 'vitest';
import { defineZestStore } from './defineZestStore';
import { subscribe } from '../reactivity/reactive'; // To test reactivity
import type { StoreInstance } from './types';

describe('defineZestStore', () => {
    // Test 1: Store creation and initial state
    it('should define a store and initialize state correctly', () => {
        const useCounterStore = defineZestStore('counter', {
            state: () => ({ count: 0, name: 'TestStore' }),
        });
        const counterStore = useCounterStore();

        expect(counterStore.count).toBe(0);
        expect(counterStore.name).toBe('TestStore');
    });

    // Test 2: Actions and state mutation
    it('should allow actions to mutate state and be reactive', () => {
        const useCounterStore = defineZestStore('counterAction', {
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
        const reactiveFn = vi.fn();

        // Subscribe to the reactive state object directly for testing
        // Note: In a real app, React components would use useSyncExternalStore
        const stateObject = counterStore as any as { count: number }; // Get the underlying state
        subscribe(stateObject, reactiveFn);

        expect(counterStore.count).toBe(0);
        expect(reactiveFn).toHaveBeenCalledTimes(0);

        counterStore.increment();
        expect(counterStore.count).toBe(1);
        expect(reactiveFn).toHaveBeenCalledTimes(1);

        counterStore.add(5);
        expect(counterStore.count).toBe(6);
        expect(reactiveFn).toHaveBeenCalledTimes(2); // Called again due to second mutation
    });

    // Test 3: Singleton behavior
    it('should return the same store instance for the same ID', () => {
        const useStore1 = defineZestStore('singleton', {
            state: () => ({ value: 'initial' }),
        });
        const instance1 = useStore1();

        const useStore2 = defineZestStore('singleton', {
            state: () => ({ value: 'should not be used' }), // Different state factory
        });
        const instance2 = useStore2();

        expect(instance1).toBe(instance2);
        expect(instance1.value).toBe('initial');
        instance1.value = 'modified';
        expect(instance2.value).toBe('modified'); // Change reflects in both as they are the same instance
    });

    it('should return different store instances for different IDs', () => {
        const useStoreA = defineZestStore('storeA', {
            state: () => ({ id: 'A' }),
        });
        const instanceA = useStoreA();

        const useStoreB = defineZestStore('storeB', {
            state: () => ({ id: 'B' }),
        });
        const instanceB = useStoreB();

        expect(instanceA).not.toBe(instanceB);
        expect(instanceA.id).toBe('A');
        expect(instanceB.id).toBe('B');
    });

    // Test 4: Store with no actions
    it('should allow defining a store with only state and no actions', () => {
        const useDataStore = defineZestStore('dataOnly', {
            state: () => ({ data: { key: 'value' }, version: 1 }),
        });
        const dataStore = useDataStore();

        expect(dataStore.data.key).toBe('value');
        expect(dataStore.version).toBe(1);
        // Check that there are no action properties beyond state
        // For an object S & A where A is {}, keys of store should be keys of S
        const stateKeys = Object.keys(dataStore);
        const expectedKeys = Object.keys({ data: { key: 'value' }, version: 1 });
        expect(stateKeys.sort()).toEqual(expectedKeys.sort());
    });

    // Test 5: Ensure actions `this` context is correct
    it('actions should have `this` correctly bound to the state proxy', () => {
        let thisContextInAction: any = null;
        const useThisCheckStore = defineZestStore('thisCheck', {
            state: () => ({ a: 1 }),
            actions: {
                checkThis() {
                    thisContextInAction = this;
                },
            },
        });

        const store = useThisCheckStore();
        store.checkThis();

        expect(thisContextInAction).toBeDefined();
        // `thisContextInAction` should be the reactive state object,
        // which also includes the actions because our StoreInstance is S & A.
        // So, it should have state property `a` and action `checkThis`.
        expect(thisContextInAction.a).toBe(1);
        expect(typeof thisContextInAction.checkThis).toBe('function');
    });

    // Test 6: Test reactivity of nested objects within state (basic check)
    it('should handle basic reactivity for nested objects', () => {
        const useNestedStore = defineZestStore('nested', {
            state: () => ({ user: { name: 'Anon', age: 30 } }),
            actions: {
                setUserName(newName: string) {
                    this.user.name = newName;
                },
            },
        });

        const store = useNestedStore();
        const reactiveFn = vi.fn();

        // Subscribe to the nested user object
        subscribe(store.user, reactiveFn);

        expect(store.user.name).toBe('Anon');
        store.setUserName('Zest');
        expect(store.user.name).toBe('Zest');
        expect(reactiveFn).toHaveBeenCalledTimes(1);
    });

}); 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reactive, subscribe } from './reactive';
import { computed } from '../reactivity/computed';

describe('reactive', () => {
    it('should return a proxy object', () => {
        const original = { count: 0 };
        const observed = reactive(original);
        expect(observed).not.toBe(original);
    });

    it('should proxy property access', () => {
        const original = { count: 10, name: 'test' };
        const observed = reactive(original);
        expect(observed.count).toBe(10);
        expect(observed.name).toBe('test');
    });

    it('should proxy property assignment', () => {
        const original = { count: 0 };
        const observed = reactive(original);

        observed.count = 5;
        expect(observed.count).toBe(5);
        // Original object should also be mutated
        expect(original.count).toBe(5);
    });

    it('should handle nested objects and make them reactive', () => {
        const original = { nested: { value: 1 }, arr: [{ id: 1 }] };
        const observed = reactive(original);

        // Check initial nested value
        expect(observed.nested.value).toBe(1);

        // Modify nested value
        observed.nested.value = 2;
        expect(observed.nested.value).toBe(2);
        expect(original.nested.value).toBe(2); // Original should also reflect this

        // Check that the nested object itself is a proxy
        expect(observed.nested).not.toBe(original.nested);

        // Test with arrays (arrays are objects)
        expect(observed.arr[0].id).toBe(1);
        observed.arr[0].id = 100;
        expect(observed.arr[0].id).toBe(100);
        expect(original.arr[0].id).toBe(100);
    });

    it('should return the same proxy for the same target object', () => {
        const original = { count: 0 };
        const observed1 = reactive(original);
        const observed2 = reactive(original);
        expect(observed1).toBe(observed2);
    });

    it('should handle circular dependencies', () => {
        const original: any = { name: 'parent' };
        original.self = original; // Circular reference
        const observed = reactive(original);

        expect(observed.name).toBe('parent');
        expect(observed.self).toBe(observed); // The proxied self should be the proxy itself
        expect(observed.self.name).toBe('parent');

        observed.self.name = 'still parent';
        expect(observed.name).toBe('still parent');
    });

    describe('subscribe', () => {
        it('should call subscriber when a property changes', () => {
            const original = { count: 0 };
            const observed = reactive(original);
            const mockCallback = vi.fn();

            subscribe(original, mockCallback);

            observed.count = 1;
            expect(mockCallback).toHaveBeenCalledTimes(1);

            observed.count = 2;
            expect(mockCallback).toHaveBeenCalledTimes(2);
        });

        it('should not call subscriber if property value does not change', () => {
            const original = { count: 0 };
            const observed = reactive(original);
            const mockCallback = vi.fn();

            subscribe(original, mockCallback);

            observed.count = 0; // Set to the same value
            expect(mockCallback).not.toHaveBeenCalled();
        });

        it('should allow unsubscribing', () => {
            const original = { count: 0 };
            const observed = reactive(original);
            const mockCallback = vi.fn();

            const unsubscribe = subscribe(original, mockCallback);

            observed.count = 1;
            expect(mockCallback).toHaveBeenCalledTimes(1);

            unsubscribe();

            observed.count = 2;
            expect(mockCallback).toHaveBeenCalledTimes(1); // Should not be called again
        });

        it('should call multiple subscribers for the same object', () => {
            const original = { count: 0 };
            const observed = reactive(original);
            const mockCallback1 = vi.fn();
            const mockCallback2 = vi.fn();

            subscribe(original, mockCallback1);
            subscribe(original, mockCallback2);

            observed.count = 1;
            expect(mockCallback1).toHaveBeenCalledTimes(1);
            expect(mockCallback2).toHaveBeenCalledTimes(1);
        });

        it('should call subscriber for changes in nested reactive objects', () => {
            const original: { nested: { value: number }; count?: number } = { nested: { value: 10 } };
            const observed = reactive(original);
            const mockCallbackNested = vi.fn();

            subscribe(original.nested, mockCallbackNested);

            observed.nested.value = 20;
            expect(mockCallbackNested).toHaveBeenCalledTimes(1);

            const mockCallbackParent = vi.fn();
            subscribe(original, mockCallbackParent);
            observed.count = 1; // Now valid due to optional property
            expect(mockCallbackNested).toHaveBeenCalledTimes(1);
            expect(mockCallbackParent).toHaveBeenCalledTimes(1);
        });

        it('unsubscribe should not affect other subscribers', () => {
            const original = { count: 0 };
            const observed = reactive(original);
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            const unsubscribe1 = subscribe(original, callback1);
            subscribe(original, callback2);

            observed.count = 1;
            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(1);

            unsubscribe1();

            observed.count = 2;
            expect(callback1).toHaveBeenCalledTimes(1); // Not called again
            expect(callback2).toHaveBeenCalledTimes(2); // Called again
        });
    });

    // --- Tests for triggerStoreChange --- //
    describe('triggerStoreChange integration', () => {
        it('should call triggerStoreChange when a property changes', () => {
            const triggerFn = vi.fn();
            const original = { count: 0 };
            const observed = reactive(original, triggerFn);

            observed.count = 1;
            expect(triggerFn).toHaveBeenCalledTimes(1);

            observed.count = 2;
            expect(triggerFn).toHaveBeenCalledTimes(2);
        });

        it('should not call triggerStoreChange if property value does not change', () => {
            const triggerFn = vi.fn();
            const original = { count: 0 };
            const observed = reactive(original, triggerFn);

            observed.count = 0; // Set to the same value
            expect(triggerFn).not.toHaveBeenCalled();
        });

        it('should call triggerStoreChange for changes in nested reactive objects', () => {
            const triggerFn = vi.fn();
            const original = { nested: { value: 10 } };
            const observed = reactive(original, triggerFn);

            observed.nested.value = 20;
            expect(triggerFn).toHaveBeenCalledTimes(1);
        });

        it('should call triggerStoreChange only once for a single top-level change', () => {
            const triggerFn = vi.fn();
            const original = { count: 0, name: 'test' };
            const observed = reactive(original, triggerFn);

            observed.count = 1;
            expect(triggerFn).toHaveBeenCalledTimes(1);
        });

        it('should call triggerStoreChange only once for a single nested change', () => {
            const triggerFn = vi.fn();
            const original = { nested: { value: 10, other: 5 }, level: 1 };
            const observed = reactive(original, triggerFn);

            observed.nested.value = 20;
            expect(triggerFn).toHaveBeenCalledTimes(1);
        });
    });

    // TODO: Add tests for subscriptions once implemented
});

describe('Reactive Map', () => {
    let originalMap: Map<any, any>;
    let reactiveMap: Map<any, any>;
    let triggerStoreChangeCallback: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        originalMap = new Map();
        triggerStoreChangeCallback = vi.fn();
        reactiveMap = reactive(originalMap, triggerStoreChangeCallback);
    });

    it('should make a Map reactive', () => {
        expect(reactiveMap).not.toBe(originalMap);
        expect(reactiveMap instanceof Map).toBe(true);
    });

    it('size property should be reactive', () => {
        const cSize = computed(() => reactiveMap.size);
        expect(cSize.value).toBe(0);
        expect(triggerStoreChangeCallback).not.toHaveBeenCalled();

        reactiveMap.set('a', 1);
        expect(reactiveMap.size).toBe(1);
        expect(cSize.value).toBe(1); // Accessing computed will trigger its re-evaluation
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
    });

    it('set() should add new element and trigger effects', () => {
        const key = 'a';
        const value = 1;
        reactiveMap.set(key, value);

        expect(originalMap.get(key)).toBe(value);
        expect(reactiveMap.get(key)).toBe(value);
        expect(reactiveMap.size).toBe(1);
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
    });

    it('set() should update existing element and trigger effects if value changed', () => {
        reactiveMap.set('a', 1);
        triggerStoreChangeCallback.mockClear();

        reactiveMap.set('a', 2);
        expect(originalMap.get('a')).toBe(2);
        expect(reactiveMap.get('a')).toBe(2);
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
    });

    it('set() should not trigger effects if value is the same', () => {
        reactiveMap.set('a', 1);
        triggerStoreChangeCallback.mockClear();

        reactiveMap.set('a', 1); // Same value
        expect(triggerStoreChangeCallback).not.toHaveBeenCalled();
    });

    it('get() should retrieve value and track dependency', () => {
        reactiveMap.set('a', 10);
        const cVal = computed(() => reactiveMap.get('a'));

        expect(cVal.value).toBe(10);

        reactiveMap.set('a', 20);
        expect(cVal.value).toBe(20);
    });

    it('get() should return reactive objects if value is an object', () => {
        const objValue = { detail: 'some detail' };
        reactiveMap.set('obj', objValue);

        const retrieved = reactiveMap.get('obj');
        expect(retrieved).not.toBe(objValue); // Should be a proxy
        expect(retrieved.detail).toBe('some detail');

        // Test if the retrieved object is reactive
        let newDetail = '';
        const cDetail = computed(() => newDetail = retrieved.detail);
        expect(cDetail.value).toBe('some detail');

        retrieved.detail = 'new detail';
        expect(cDetail.value).toBe('new detail');
        expect(triggerStoreChangeCallback).toHaveBeenCalled(); // Setting nested property should trigger main Map change
    });

    it('has() should check for key presence and track dependency', () => {
        const cHasA = computed(() => reactiveMap.has('a'));
        expect(cHasA.value).toBe(false);

        reactiveMap.set('a', 1);
        expect(cHasA.value).toBe(true);
    });

    it('delete() should remove element and trigger effects', () => {
        reactiveMap.set('a', 1);
        reactiveMap.set('b', 2);
        triggerStoreChangeCallback.mockClear();

        const cHasA = computed(() => reactiveMap.has('a'));
        const cSize = computed(() => reactiveMap.size);
        expect(cHasA.value).toBe(true); // Track before delete
        expect(cSize.value).toBe(2);  // Track before delete

        const result = reactiveMap.delete('a');
        expect(result).toBe(true);
        expect(reactiveMap.has('a')).toBe(false);
        expect(originalMap.has('a')).toBe(false);
        expect(reactiveMap.size).toBe(1);
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
        expect(cHasA.value).toBe(false); // Computed should update
        expect(cSize.value).toBe(1);   // Computed should update
    });

    it('delete() should not trigger effects if key does not exist', () => {
        reactiveMap.set('a', 1);
        triggerStoreChangeCallback.mockClear();

        const result = reactiveMap.delete('b');
        expect(result).toBe(false);
        expect(triggerStoreChangeCallback).not.toHaveBeenCalled();
    });

    it('clear() should remove all elements and trigger effects if map was not empty', () => {
        reactiveMap.set('a', 1);
        reactiveMap.set('b', 2);
        triggerStoreChangeCallback.mockClear();

        const cSize = computed(() => reactiveMap.size);
        expect(cSize.value).toBe(2); // Track before clear

        reactiveMap.clear();
        expect(reactiveMap.size).toBe(0);
        expect(originalMap.size).toBe(0);
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
        expect(cSize.value).toBe(0); // Computed should update
    });

    it('clear() should not trigger effects if map was already empty', () => {
        expect(reactiveMap.size).toBe(0);
        triggerStoreChangeCallback.mockClear();

        reactiveMap.clear();
        expect(triggerStoreChangeCallback).not.toHaveBeenCalled();
    });

    it('forEach() should iterate over elements and track dependency', () => {
        reactiveMap.set('a', 10);
        reactiveMap.set('b', { val: 20 });

        const processed: any[] = [];
        const cSum = computed(() => {
            let sum = 0;
            processed.length = 0; // Clear for re-computation
            reactiveMap.forEach((value, key) => {
                processed.push({ key, value });
                if (typeof value === 'number') sum += value;
                if (typeof value === 'object') sum += value.val;
            });
            return sum;
        });

        expect(cSum.value).toBe(30);
        expect(processed).toEqual([{ key: 'a', value: 10 }, { key: 'b', value: reactiveMap.get('b') }]);

        triggerStoreChangeCallback.mockClear();
        reactiveMap.set('c', 30);
        expect(cSum.value).toBe(60); // Should recompute
        expect(processed.length).toBe(3);
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);

        const bVal = reactiveMap.get('b');
        bVal.val = 200; // Mutate nested reactive object
        expect(cSum.value).toBe(240); // Corrected: 10 (a) + 200 (b.val) + 30 (c) = 240
    });

    it('keys() iterator should be reactive to additions/deletions', () => {
        const cKeys = computed(() => Array.from(reactiveMap.keys()));
        expect(cKeys.value).toEqual([]);

        reactiveMap.set('a', 1);
        expect(cKeys.value).toEqual(['a']);

        reactiveMap.set('b', 2);
        expect(cKeys.value).toEqual(['a', 'b']); // Order might vary, sort for stable test
        expect(cKeys.value.slice().sort()).toEqual(['a', 'b'].slice().sort());


        reactiveMap.delete('a');
        expect(cKeys.value).toEqual(['b']);

        reactiveMap.set('a', 3); // Add 'a' back
        expect(cKeys.value.slice().sort()).toEqual(['a', 'b'].slice().sort());
    });

    it('values() iterator should be reactive to additions/value changes', () => {
        const objVal = { nested: 10 };
        reactiveMap.set('a', 1);
        reactiveMap.set('obj', objVal);

        const cValues = computed(() => Array.from(reactiveMap.values()));

        expect(cValues.value.length).toBe(2);
        expect(cValues.value).toContain(1);
        const reactiveObj = cValues.value.find(v => typeof v === 'object');
        expect(reactiveObj).not.toBe(objVal);
        expect(reactiveObj.nested).toBe(10);

        reactiveMap.set('b', 2);
        expect(cValues.value.length).toBe(3);
        expect(cValues.value).toContain(2);

        reactiveMap.set('a', 100); // Change existing value
        expect(cValues.value).toContain(100);
        expect(cValues.value).not.toContain(1);

        reactiveObj.nested = 20; // Mutate object value
        // Re-access cValues.value to get the latest snapshot from the computed
        const updatedReactiveObj = cValues.value.find(v => typeof v === 'object' && v.nested === 20);
        expect(updatedReactiveObj.nested).toBe(20);
    });

    it('entries() iterator should be reactive to additions/deletions/value changes', () => {
        const cEntries = computed(() => Array.from(reactiveMap.entries()));
        expect(cEntries.value).toEqual([]);

        reactiveMap.set('a', 1);
        // Use .map to handle potential object proxies in values for comparison
        expect(cEntries.value.map(([k, v]) => [k, v.val !== undefined ? { val: v.val } : v])).toEqual([['a', 1]]);

        reactiveMap.set('b', { val: 2 });
        let currentEntries = cEntries.value;
        expect(currentEntries.length).toBe(2);
        expect(currentEntries.find(([k]) => k === 'a')![1]).toBe(1);
        expect(currentEntries.find(([k]) => k === 'b')![1].val).toBe(2);

        reactiveMap.delete('a');
        currentEntries = cEntries.value;
        expect(currentEntries.length).toBe(1);
        expect(currentEntries.find(([k]) => k === 'b')![1].val).toBe(2);

        reactiveMap.set('b', { val: 20 }); // Update value of 'b'
        currentEntries = cEntries.value;
        expect(currentEntries.find(([k]) => k === 'b')![1].val).toBe(20);
    });

    it('should handle objects as keys in Map', () => {
        const keyObj1 = { id: 1 };
        const keyObj2 = { id: 2 }; // Different object reference
        const reactiveKeyObj1 = reactive(keyObj1, triggerStoreChangeCallback); // Pass trigger for the key itself if it mutates

        reactiveMap.set(keyObj1, 'value for keyObj1');
        reactiveMap.set(keyObj2, 'value for keyObj2');
        reactiveMap.set(reactiveKeyObj1, 'value for reactiveKeyObj1'); // This is a new key

        triggerStoreChangeCallback.mockClear(); // Clear after setup

        expect(reactiveMap.has(keyObj1)).toBe(true);
        expect(reactiveMap.get(keyObj1)).toBe('value for keyObj1');
        expect(reactiveMap.has(reactiveKeyObj1)).toBe(true);
        expect(reactiveMap.get(reactiveKeyObj1)).toBe('value for reactiveKeyObj1');
        expect(reactiveMap.has(keyObj2)).toBe(true);
        expect(reactiveMap.get(keyObj2)).toBe('value for keyObj2');
        expect(reactiveMap.size).toBe(3); // keyObj1, keyObj2, reactiveKeyObj1 (proxy) are distinct keys

        // Computed property depending on an object key
        const cValForKeyObj1 = computed(() => reactiveMap.get(keyObj1));
        const cValForReactiveKeyObj1 = computed(() => reactiveMap.get(reactiveKeyObj1));
        expect(cValForKeyObj1.value).toBe('value for keyObj1');
        expect(cValForReactiveKeyObj1.value).toBe('value for reactiveKeyObj1');

        // Deleting by original key
        reactiveMap.delete(keyObj1);
        expect(reactiveMap.has(keyObj1)).toBe(false);
        expect(cValForKeyObj1.value).toBeUndefined();
        expect(reactiveMap.size).toBe(2);
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1); // For the delete operation

        triggerStoreChangeCallback.mockClear();
        // Deleting by the proxy key
        reactiveMap.delete(reactiveKeyObj1);
        expect(reactiveMap.has(reactiveKeyObj1)).toBe(false);
        expect(cValForReactiveKeyObj1.value).toBeUndefined();
        expect(reactiveMap.size).toBe(1);
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);

        // If the reactive key object itself mutates, it does not change its identity as a key in the map
        // and does not affect values associated with other keys.
        triggerStoreChangeCallback.mockClear();
        reactiveKeyObj1.id = 100; // Mutate the object that was used as a key
        // This mutation WILL trigger the triggerStoreChangeCallback passed to reactiveKeyObj1
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
        // However, it does NOT affect the map structure or values associated with other keys like keyObj2
        expect(reactiveMap.get(keyObj2)).toBe('value for keyObj2');
        // And reactiveMap.get(reactiveKeyObj1) would still be undefined as it was deleted.
    });

    // More tests for delete, clear, forEach, iterators, object keys etc. will follow
});

describe('Reactive Set', () => {
    let originalSet: Set<any>;
    let reactiveSet: Set<any>;
    let triggerStoreChangeCallback: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        originalSet = new Set();
        triggerStoreChangeCallback = vi.fn();
        reactiveSet = reactive(originalSet, triggerStoreChangeCallback);
    });

    it('should make a Set reactive', () => {
        expect(reactiveSet).not.toBe(originalSet);
        expect(reactiveSet instanceof Set).toBe(true);
    });

    it('size property should be reactive', () => {
        const cSize = computed(() => reactiveSet.size);
        expect(cSize.value).toBe(0);

        reactiveSet.add(1);
        expect(reactiveSet.size).toBe(1);
        expect(cSize.value).toBe(1);
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
    });

    it('add() should add new element and trigger effects', () => {
        reactiveSet.add(1);
        expect(originalSet.has(1)).toBe(true);
        expect(reactiveSet.has(1)).toBe(true);
        expect(reactiveSet.size).toBe(1);
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
    });

    it('add() should not trigger effects if value already exists', () => {
        reactiveSet.add(1);
        triggerStoreChangeCallback.mockClear();

        reactiveSet.add(1); // Same value
        expect(triggerStoreChangeCallback).not.toHaveBeenCalled();
        expect(reactiveSet.size).toBe(1);
    });

    it('has() should check for value presence and track dependency', () => {
        const cHas1 = computed(() => reactiveSet.has(1));
        expect(cHas1.value).toBe(false);

        reactiveSet.add(1);
        expect(cHas1.value).toBe(true);
    });

    it('add() should make objects reactive when added', () => {
        const objValue = { detail: 'info' };
        reactiveSet.add(objValue);

        const setValues = Array.from(reactiveSet.values());
        const retrieved = setValues[0];

        expect(retrieved).not.toBe(objValue); // Should be a proxy
        expect(retrieved.detail).toBe('info');

        // Test if the retrieved object is reactive
        let newDetail = '';
        const cDetail = computed(() => newDetail = retrieved.detail);
        expect(cDetail.value).toBe('info');

        retrieved.detail = 'new info';
        expect(cDetail.value).toBe('new info');
        expect(triggerStoreChangeCallback).toHaveBeenCalled(); // Setting nested should trigger main Set change
    });

    it('delete() should remove element and trigger effects', () => {
        reactiveSet.add(1);
        reactiveSet.add(2);
        triggerStoreChangeCallback.mockClear();

        const cHas1 = computed(() => reactiveSet.has(1));
        const cSize = computed(() => reactiveSet.size);
        expect(cHas1.value).toBe(true);
        expect(cSize.value).toBe(2);

        const result = reactiveSet.delete(1);
        expect(result).toBe(true);
        expect(reactiveSet.has(1)).toBe(false);
        expect(originalSet.has(1)).toBe(false);
        expect(reactiveSet.size).toBe(1);
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
        expect(cHas1.value).toBe(false);
        expect(cSize.value).toBe(1);
    });

    it('delete() should not trigger effects if value does not exist', () => {
        reactiveSet.add(1);
        triggerStoreChangeCallback.mockClear();

        const result = reactiveSet.delete(2); // Value 2 does not exist
        expect(result).toBe(false);
        expect(triggerStoreChangeCallback).not.toHaveBeenCalled();
    });

    it('clear() should remove all elements and trigger effects if set was not empty', () => {
        reactiveSet.add(1);
        reactiveSet.add({ id: 2 });
        triggerStoreChangeCallback.mockClear();

        const cSize = computed(() => reactiveSet.size);
        expect(cSize.value).toBe(2);

        reactiveSet.clear();
        expect(reactiveSet.size).toBe(0);
        expect(originalSet.size).toBe(0);
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
        expect(cSize.value).toBe(0);
    });

    it('clear() should not trigger effects if set was already empty', () => {
        expect(reactiveSet.size).toBe(0);
        triggerStoreChangeCallback.mockClear();

        reactiveSet.clear();
        expect(triggerStoreChangeCallback).not.toHaveBeenCalled();
    });

    it('forEach() should iterate over elements and track dependency', () => {
        const obj1 = { id: 1 };
        reactiveSet.add(10);
        reactiveSet.add(obj1);

        const processed: any[] = [];
        const cCount = computed(() => {
            let count = 0;
            processed.length = 0;
            reactiveSet.forEach((value) => {
                processed.push(value);
                if (typeof value === 'number') count++;
                if (typeof value === 'object') count += value.id;
            });
            return count;
        });

        expect(cCount.value).toBe(2); // Corrected: 1 (for 10) + 1 (for obj1.id) = 2
        // Order in Set iteration is insertion order
        expect(processed[0]).toBe(10);
        expect(processed[1]).not.toBe(obj1); // Should be the proxy of obj1
        expect(processed[1].id).toBe(1);

        triggerStoreChangeCallback.mockClear();
        reactiveSet.add(30);
        expect(cCount.value).toBe(3); // Corrected: 1 (for 10) + 1 (for obj1.id) + 1 (for 30) = 3
        expect(processed.length).toBe(3);
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);

        // Mutate the reactive object retrieved via iteration (implicitly)
        const reactiveObj1 = Array.from(reactiveSet.values()).find(v => typeof v === 'object');
        reactiveObj1.id = 100;
        expect(cCount.value).toBe(102); // Corrected: 1 (for 10) + 100 (for obj1.id) + 1 (for 30) = 102
    });

    it('keys() iterator should be reactive for Set (iterates values)', () => {
        const cKeys = computed(() => Array.from(reactiveSet.keys()));
        expect(cKeys.value).toEqual([]);

        reactiveSet.add(1);
        expect(cKeys.value).toEqual([1]);

        reactiveSet.add(2);
        expect(cKeys.value).toEqual([1, 2]);

        reactiveSet.delete(1);
        expect(cKeys.value).toEqual([2]);
    });

    it('values() iterator should be reactive for Set', () => {
        const objVal = { nested: 5 };
        reactiveSet.add(1);
        reactiveSet.add(objVal);

        const cValues = computed(() => Array.from(reactiveSet.values()));
        expect(cValues.value.length).toBe(2);
        expect(cValues.value).toContain(1);
        const reactiveObj = cValues.value.find(v => typeof v === 'object');
        expect(reactiveObj).not.toBe(objVal);
        expect(reactiveObj.nested).toBe(5);

        reactiveSet.add(100); // Add another value
        expect(cValues.value.length).toBe(3);
        expect(cValues.value).toContain(100);

        reactiveObj.nested = 50; // Mutate object value
        const updatedReactiveObj = cValues.value.find(v => typeof v === 'object' && v.nested === 50);
        expect(updatedReactiveObj.nested).toBe(50);
    });

    it('entries() iterator should be reactive for Set (yields [value, value])', () => {
        const objVal = { id: 's1' };
        reactiveSet.add(1);
        reactiveSet.add(objVal);

        const cEntries = computed(() => Array.from(reactiveSet.entries()));
        expect(cEntries.value.length).toBe(2);

        const entryFor1 = cEntries.value.find(entry => entry[0] === 1);
        expect(entryFor1).toEqual([1, 1]);

        const entryForObj = cEntries.value.find(entry => typeof entry[0] === 'object');
        expect(entryForObj![0]).not.toBe(objVal);
        expect(entryForObj![0].id).toBe('s1');
        expect(entryForObj![1]).toBe(entryForObj![0]); // Both parts of entry are the same reactive proxy

        reactiveSet.delete(1);
        expect(cEntries.value.length).toBe(1);
        expect(cEntries.value[0][0].id).toBe('s1');

        entryForObj![0].id = 's2'; // Mutate object
        const currentEntries = cEntries.value; // Re-evaluate computed
        expect(currentEntries[0][0].id).toBe('s2');
    });

    // More tests for delete, clear, forEach, iterators etc. will follow
});

describe('Reactive Array Methods', () => {
    let originalArray: any[];
    let reactiveArray: any[];
    let triggerStoreChangeCallback: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        originalArray = []; // Default starting point, can be overridden in specific tests
        triggerStoreChangeCallback = vi.fn();
        reactiveArray = reactive(originalArray, triggerStoreChangeCallback);
    });

    describe('push()', () => {
        it('should add element to the end and return new length', () => {
            const newLength = reactiveArray.push(1);
            expect(newLength).toBe(1);
            expect(reactiveArray.length).toBe(1);
            expect(reactiveArray[0]).toBe(1);
            expect(originalArray).toEqual([1]); // Original should also be mutated

            const newLength2 = reactiveArray.push(2, 3);
            expect(newLength2).toBe(3);
            expect(reactiveArray.length).toBe(3);
            expect(reactiveArray).toEqual([1, 2, 3]);
            expect(originalArray).toEqual([1, 2, 3]);
        });

        it('should trigger length, ITERATE_KEY, new indices, and storeChange', () => {
            const cLength = computed(() => reactiveArray.length);
            const cIterate = computed(() => [...reactiveArray]); // Simple iteration dependency
            const cIndex0 = computed(() => reactiveArray[0]);
            const cIndex1 = computed(() => reactiveArray[1]);

            // Initial reads to establish dependencies
            expect(cLength.value).toBe(0);
            expect(cIterate.value).toEqual([]);
            expect(cIndex0.value).toBeUndefined();

            triggerStoreChangeCallback.mockClear(); // Clear after initial setup

            reactiveArray.push(10);

            expect(cLength.value).toBe(1); // length should update
            expect(cIterate.value).toEqual([10]); // iteration result should update
            expect(cIndex0.value).toBe(10); // specific index should update
            expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);

            reactiveArray.push(20);
            expect(cLength.value).toBe(2);
            expect(cIterate.value).toEqual([10, 20]);
            expect(cIndex0.value).toBe(10); // Should still be 10
            expect(cIndex1.value).toBe(20); // New index dependency
            expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(2);
        });
    });

    describe('pop()', () => {
        it('should remove and return the last element, undefined if empty', () => {
            reactiveArray.push(1, 2, 3);
            expect(reactiveArray.pop()).toBe(3);
            expect(reactiveArray.length).toBe(2);
            expect(reactiveArray).toEqual([1, 2]);
            expect(originalArray).toEqual([1, 2]);

            expect(reactiveArray.pop()).toBe(2);
            expect(reactiveArray.pop()).toBe(1);
            expect(reactiveArray.length).toBe(0);
            expect(reactiveArray.pop()).toBeUndefined(); // Pop on empty array
            expect(originalArray).toEqual([]);
        });

        it('should trigger length, ITERATE_KEY, removed index, and storeChange if not empty', () => {
            reactiveArray.push(10, 20); // Start with [10, 20]
            const cLength = computed(() => reactiveArray.length);
            const cIterate = computed(() => [...reactiveArray]);
            const cIndex0 = computed(() => reactiveArray[0]);
            const cIndex1 = computed(() => reactiveArray[1]); // Will be removed

            // Initial reads
            expect(cLength.value).toBe(2);
            expect(cIterate.value).toEqual([10, 20]);
            expect(cIndex0.value).toBe(10);
            expect(cIndex1.value).toBe(20);

            triggerStoreChangeCallback.mockClear();

            reactiveArray.pop(); // Removes 20

            expect(cLength.value).toBe(1);
            expect(cIterate.value).toEqual([10]);
            expect(cIndex0.value).toBe(10);
            expect(cIndex1.value).toBeUndefined(); // Value at old index 1 is now undefined
            expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
        });

        it('should not trigger if array is empty', () => {
            const cLength = computed(() => reactiveArray.length);
            expect(cLength.value).toBe(0); // Ensure it's empty
            triggerStoreChangeCallback.mockClear();

            reactiveArray.pop();

            expect(cLength.value).toBe(0);
            expect(triggerStoreChangeCallback).not.toHaveBeenCalled();
        });
    });

    describe('shift()', () => {
        it('should remove and return the first element, undefined if empty', () => {
            reactiveArray.push(1, 2, 3);
            expect(reactiveArray.shift()).toBe(1);
            expect(reactiveArray.length).toBe(2);
            expect(reactiveArray).toEqual([2, 3]);
            expect(originalArray).toEqual([2, 3]);

            expect(reactiveArray.shift()).toBe(2);
            expect(reactiveArray.shift()).toBe(3);
            expect(reactiveArray.length).toBe(0);
            expect(reactiveArray.shift()).toBeUndefined();
            expect(originalArray).toEqual([]);
        });

        it('should trigger length, ITERATE_KEY, affected indices, and storeChange if not empty', () => {
            reactiveArray.push(10, 20, 30); // Start with [10, 20, 30]
            const cLength = computed(() => reactiveArray.length);
            const cIterate = computed(() => [...reactiveArray]);
            const cIndex0 = computed(() => reactiveArray[0]);
            const cIndex1 = computed(() => reactiveArray[1]);

            // Initial reads
            expect(cLength.value).toBe(3);
            expect(cIterate.value).toEqual([10, 20, 30]);
            expect(cIndex0.value).toBe(10);
            expect(cIndex1.value).toBe(20);
            triggerStoreChangeCallback.mockClear();

            reactiveArray.shift(); // Removes 10, array becomes [20, 30]

            expect(cLength.value).toBe(2);
            expect(cIterate.value).toEqual([20, 30]);
            expect(cIndex0.value).toBe(20); // Old index 0 changed
            expect(cIndex1.value).toBe(30); // Old index 1 changed
            expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
        });

        it('should not trigger if array is empty', () => {
            expect(reactiveArray.length).toBe(0);
            triggerStoreChangeCallback.mockClear();
            reactiveArray.shift();
            expect(triggerStoreChangeCallback).not.toHaveBeenCalled();
        });
    });

    describe('unshift()', () => {
        it('should add elements to the beginning and return new length', () => {
            let newLength = reactiveArray.unshift(1);
            expect(newLength).toBe(1);
            expect(reactiveArray).toEqual([1]);
            expect(originalArray).toEqual([1]);

            newLength = reactiveArray.unshift(-1, 0);
            expect(newLength).toBe(3);
            expect(reactiveArray).toEqual([-1, 0, 1]);
            expect(originalArray).toEqual([-1, 0, 1]);
        });

        it('should trigger length, ITERATE_KEY, affected indices, and storeChange if elements are added', () => {
            const cLength = computed(() => reactiveArray.length);
            const cIterate = computed(() => [...reactiveArray]);
            const cIndex0 = computed(() => reactiveArray[0]);
            const cIndex1 = computed(() => reactiveArray[1]);

            reactiveArray.push(100); // Start with [100]
            expect(cLength.value).toBe(1);
            expect(cIndex0.value).toBe(100);
            triggerStoreChangeCallback.mockClear();

            reactiveArray.unshift(10, 20); // Array becomes [10, 20, 100]

            expect(cLength.value).toBe(3);
            expect(cIterate.value).toEqual([10, 20, 100]);
            expect(cIndex0.value).toBe(10); // New value at index 0
            expect(cIndex1.value).toBe(20); // New value at index 1
            expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
        });

        it('should not trigger if no elements are added (unshift() called with no args)', () => {
            reactiveArray.push(1);
            triggerStoreChangeCallback.mockClear();
            const currentLength = reactiveArray.length;
            const newLength = reactiveArray.unshift(); // No arguments
            expect(newLength).toBe(currentLength);
            expect(triggerStoreChangeCallback).not.toHaveBeenCalled();
        });
    });

    describe('splice()', () => {
        it('should delete elements correctly and return deleted elements', () => {
            reactiveArray.push(1, 2, 3, 4, 5);
            const deleted = reactiveArray.splice(1, 2); // Remove 2, 3
            expect(deleted).toEqual([2, 3]);
            expect(reactiveArray).toEqual([1, 4, 5]);
            expect(originalArray).toEqual([1, 4, 5]);
        });

        it('should insert elements correctly', () => {
            reactiveArray.push(1, 5);
            const deleted = reactiveArray.splice(1, 0, 2, 3, 4); // Insert 2,3,4 at index 1
            expect(deleted).toEqual([]);
            expect(reactiveArray).toEqual([1, 2, 3, 4, 5]);
            expect(originalArray).toEqual([1, 2, 3, 4, 5]);
        });

        it('should delete and insert elements correctly', () => {
            reactiveArray.push(1, 'a', 'b', 5);
            const deleted = reactiveArray.splice(1, 2, 2, 3, 4); // Remove 'a','b', insert 2,3,4
            expect(deleted).toEqual(['a', 'b']);
            expect(reactiveArray).toEqual([1, 2, 3, 4, 5]);
        });

        it('should handle negative start index', () => {
            reactiveArray.push(1, 2, 3, 4, 5);
            const deleted = reactiveArray.splice(-2, 1); // Remove element at index 3 (value 4)
            expect(deleted).toEqual([4]);
            expect(reactiveArray).toEqual([1, 2, 3, 5]);
        });

        it('should handle omitting deleteCount (deletes to end if no items added)', () => {
            reactiveArray.push(1, 2, 3, 4, 5);
            const deleted = reactiveArray.splice(2); // Call with only 'start'
            expect(deleted).toEqual([3, 4, 5]);
            expect(reactiveArray).toEqual([1, 2]);
        });

        it('should handle deleteCount as 0 if undefined AND items are added (testing shim behavior)', () => {
            reactiveArray.push(1, 2, 3, 4, 5);
            // This call relies on our shim's logic for undefined deleteCount when items are added
            const deleted = reactiveArray.splice(2, undefined as any, 98, 99);
            expect(deleted).toEqual([]);
            expect(reactiveArray).toEqual([1, 2, 98, 99, 3, 4, 5]);
        });

        it('should trigger length, ITERATE_KEY, affected indices, and storeChange on deletion', () => {
            reactiveArray.push(10, 20, 30, 40);
            const cLength = computed(() => reactiveArray.length);
            const cIterate = computed(() => [...reactiveArray]);
            const cIndex1 = computed(() => reactiveArray[1]);

            expect(cIndex1.value).toBe(20);
            triggerStoreChangeCallback.mockClear();

            reactiveArray.splice(1, 2); // Removes 20, 30. Array becomes [10, 40]

            expect(cLength.value).toBe(2);
            expect(cIterate.value).toEqual([10, 40]);
            expect(cIndex1.value).toBe(40); // Value at index 1 is now 40
            expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
        });

        it('should trigger length, ITERATE_KEY, affected indices, and storeChange on insertion', () => {
            reactiveArray.push(10, 40);
            const cLength = computed(() => reactiveArray.length);
            const cIterate = computed(() => [...reactiveArray]);
            const cIndex1 = computed(() => reactiveArray[1]);

            expect(cIndex1.value).toBe(40);
            triggerStoreChangeCallback.mockClear();

            reactiveArray.splice(1, 0, 20, 30); // Inserts 20, 30. Array becomes [10, 20, 30, 40]

            expect(cLength.value).toBe(4);
            expect(cIterate.value).toEqual([10, 20, 30, 40]);
            expect(cIndex1.value).toBe(20); // Value at index 1 is now 20
            expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
        });

        it('should not trigger if splice is a no-op (e.g., deleteCount is 0 and no items added)', () => {
            reactiveArray.push(1, 2, 3);
            triggerStoreChangeCallback.mockClear();
            reactiveArray.splice(1, 0); // No deletion, no insertion
            expect(triggerStoreChangeCallback).not.toHaveBeenCalled();
        });
    });

    describe('sort()', () => {
        it('should sort the array in place and return the array', () => {
            reactiveArray.push(3, 1, 4, 1, 5, 9, 2, 6);
            const sortedArray = reactiveArray.sort((a, b) => a - b);
            expect(sortedArray).toBe(reactiveArray); // Should return the proxy itself
            expect(reactiveArray).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
            expect(originalArray).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
        });

        it('should trigger ITERATE_KEY, all indices, and storeChange if array order changes', () => {
            reactiveArray.push(5, 1, 3);
            const cIterate = computed(() => [...reactiveArray]);
            const cIndex0 = computed(() => reactiveArray[0]);
            const cIndex1 = computed(() => reactiveArray[1]);

            expect(cIndex0.value).toBe(5);
            triggerStoreChangeCallback.mockClear();

            reactiveArray.sort(); // Default sort: [1, 3, 5]

            expect(cIterate.value).toEqual([1, 3, 5]);
            expect(cIndex0.value).toBe(1);
            expect(cIndex1.value).toBe(3);
            expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
        });

        it('should trigger storeChange if sort is called on an array with length > 0 (even if order does not change)', () => {
            // Test with an already sorted array
            reactiveArray.push(1, 2, 3);
            triggerStoreChangeCallback.mockClear();
            reactiveArray.sort((a, b) => a - b);
            // Current instrumentation for sort triggers if arr.length > 0
            expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
        });

        it('should not trigger storeChange if sort is called on an empty array', () => {
            triggerStoreChangeCallback.mockClear();
            reactiveArray.sort();
            expect(triggerStoreChangeCallback).not.toHaveBeenCalled();
        });
    });

    describe('reverse()', () => {
        it('should reverse the array in place and return the array', () => {
            reactiveArray.push(1, 2, 3, 4);
            const reversedArray = reactiveArray.reverse();
            expect(reversedArray).toBe(reactiveArray);
            expect(reactiveArray).toEqual([4, 3, 2, 1]);
            expect(originalArray).toEqual([4, 3, 2, 1]);
        });

        it('should trigger ITERATE_KEY, all indices, and storeChange if array order changes (length > 1)', () => {
            reactiveArray.push(1, 2, 3);
            const cIterate = computed(() => [...reactiveArray]);
            const cIndex0 = computed(() => reactiveArray[0]);

            expect(cIndex0.value).toBe(1);
            triggerStoreChangeCallback.mockClear();

            reactiveArray.reverse(); // Becomes [3, 2, 1]

            expect(cIterate.value).toEqual([3, 2, 1]);
            expect(cIndex0.value).toBe(3);
            expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
        });

        it('should not trigger if reverse has no effect (length <= 1)', () => {
            // Empty array
            triggerStoreChangeCallback.mockClear();
            reactiveArray.reverse();
            expect(triggerStoreChangeCallback).not.toHaveBeenCalled();

            // Single element array
            reactiveArray.push(10);
            triggerStoreChangeCallback.mockClear();
            reactiveArray.reverse();
            expect(triggerStoreChangeCallback).not.toHaveBeenCalled();
        });
    });

});

describe('Reactive Date', () => {
    let originalDate: Date;
    let reactiveDate: Date;
    let triggerStoreChangeCallback: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        originalDate = new Date('2024-01-15T12:00:00.000Z');
        triggerStoreChangeCallback = vi.fn();
        reactiveDate = reactive(originalDate, triggerStoreChangeCallback);
    });

    it('should make a Date reactive', () => {
        expect(reactiveDate).not.toBe(originalDate);
        expect(reactiveDate instanceof Date).toBe(true);
        expect(reactiveDate.toISOString()).toBe(originalDate.toISOString());
    });

    it('mutating methods should trigger effects and storeChange', () => {
        const cFullYear = computed(() => reactiveDate.getFullYear());
        const cTime = computed(() => reactiveDate.getTime());

        expect(cFullYear.value).toBe(2024);
        expect(cTime.value).toBe(new Date('2024-01-15T12:00:00.000Z').getTime());
        triggerStoreChangeCallback.mockClear();

        reactiveDate.setFullYear(2025);
        expect(reactiveDate.getFullYear()).toBe(2025);
        expect(originalDate.getFullYear()).toBe(2025);
        expect(cFullYear.value).toBe(2025); // Computed should update
        const newTime = new Date('2025-01-15T12:00:00.000Z').getTime();
        expect(cTime.value).toBe(newTime); // Time should also update
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);

        reactiveDate.setMonth(5); // June (0-indexed)
        expect(reactiveDate.getMonth()).toBe(5);
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(2);

        reactiveDate.setDate(20);
        expect(reactiveDate.getDate()).toBe(20);
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(3);

        // Test a method that doesn't change the time if already at that value
        const currentTime = reactiveDate.getTime();
        reactiveDate.setTime(currentTime); // Set to current time
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(3); // Should NOT increment
    });

    it('getter methods should track dependencies', () => {
        const cDateString = computed(() => reactiveDate.toDateString());
        const initialDateString = reactiveDate.toDateString();
        expect(cDateString.value).toBe(initialDateString);

        triggerStoreChangeCallback.mockClear();
        reactiveDate.setDate(reactiveDate.getDate() + 1); // Increment day

        const newDateString = reactiveDate.toDateString();
        expect(newDateString).not.toBe(initialDateString);
        expect(cDateString.value).toBe(newDateString); // Computed should update
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
    });

    it('Symbol.toPrimitive should track dependency', () => {
        // Using + operator which calls Symbol.toPrimitive with 'number' hint
        const cTimestamp = computed(() => +reactiveDate);
        const initialTimestamp = +originalDate;
        expect(cTimestamp.value).toBe(initialTimestamp);

        triggerStoreChangeCallback.mockClear();
        reactiveDate.setHours(reactiveDate.getHours() + 1);

        const newTimestamp = +reactiveDate;
        expect(newTimestamp).not.toBe(initialTimestamp);
        expect(cTimestamp.value).toBe(newTimestamp);
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
    });

    it('valueOf should track dependency', () => {
        const cValueOf = computed(() => reactiveDate.valueOf());
        const initialValueOf = originalDate.valueOf();
        expect(cValueOf.value).toBe(initialValueOf);

        triggerStoreChangeCallback.mockClear();
        reactiveDate.setMilliseconds(reactiveDate.getMilliseconds() + 100);

        const newValueOf = reactiveDate.valueOf();
        expect(newValueOf).not.toBe(initialValueOf);
        expect(cValueOf.value).toBe(newValueOf);
        expect(triggerStoreChangeCallback).toHaveBeenCalledTimes(1);
    });

    it('should return the same proxy for the same Date object', () => {
        const date = new Date();
        const proxy1 = reactive(date);
        const proxy2 = reactive(date);
        expect(proxy1).toBe(proxy2);
    });

    it('non-mutating getter methods should not trigger storeChange', () => {
        triggerStoreChangeCallback.mockClear();
        reactiveDate.getFullYear();
        reactiveDate.getMonth();
        reactiveDate.getDate();
        reactiveDate.getHours();
        reactiveDate.getMinutes();
        reactiveDate.getSeconds();
        reactiveDate.getMilliseconds();
        reactiveDate.getTime();
        reactiveDate.getDay();
        reactiveDate.toISOString();
        reactiveDate.toDateString();
        reactiveDate.toTimeString();
        reactiveDate.toLocaleDateString();
        reactiveDate.toLocaleString();
        reactiveDate.toLocaleTimeString();
        reactiveDate.toUTCString();
        reactiveDate.toJSON();
        expect(triggerStoreChangeCallback).not.toHaveBeenCalled();
    });
});
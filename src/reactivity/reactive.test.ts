import { describe, it, expect, vi } from 'vitest';
import { reactive, subscribe } from './reactive';

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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    ref,
    isRef,
    subscribeRef,
    setActiveStoreTrigger,
    clearActiveStoreTrigger
} from './ref';

describe('ref', () => {

    // Ensure context is clear before each test
    beforeEach(() => {
        clearActiveStoreTrigger();
    });

    it('should create a ref object with initial value', () => {
        const r = ref(0);
        expect(r.value).toBe(0);
    });

    it('should allow setting and getting the value', () => {
        const r = ref('hello');
        expect(r.value).toBe('hello');
        r.value = 'world';
        expect(r.value).toBe('world');
    });

    it('should handle object values', () => {
        const obj = { a: 1 };
        const r = ref(obj);
        expect(r.value).toBe(obj); // Should be the same object initially
        expect(r.value.a).toBe(1);

        r.value = { a: 2 };
        expect(r.value.a).toBe(2);
    });

    it('should not trigger subscribers or triggers if value is set to the same value (Object.is)', () => {
        const initialValue = 0;
        const triggerFn = vi.fn();
        const subscribeCb = vi.fn();
        const r = ref(initialValue, triggerFn);
        subscribeRef(r, subscribeCb);

        r.value = 0;
        r.value = initialValue;
        const nanRef = ref(NaN);
        nanRef.value = NaN; // Object.is(NaN, NaN) is true

        expect(triggerFn).not.toHaveBeenCalled();
        expect(subscribeCb).not.toHaveBeenCalled();
    });

    describe('isRef', () => {
        it('should return true for refs created by the ref function', () => {
            const r = ref(123);
            expect(isRef(r)).toBe(true);
        });

        it('should return false for non-ref values', () => {
            expect(isRef(null)).toBe(false);
            expect(isRef(undefined)).toBe(false);
            expect(isRef(123)).toBe(false);
            expect(isRef('hello')).toBe(false);
            expect(isRef({})).toBe(false);
            expect(isRef([])).toBe(false);
            expect(isRef({ value: 1 })).toBe(false); // Plain object with value prop
        });
    });

    describe('subscribeRef', () => {
        it('should call subscriber when ref value changes', () => {
            const r = ref(0);
            const mockCallback = vi.fn();
            subscribeRef(r, mockCallback);

            r.value = 1;
            expect(mockCallback).toHaveBeenCalledTimes(1);
            r.value = 2;
            expect(mockCallback).toHaveBeenCalledTimes(2);
        });

        it('should allow unsubscribing', () => {
            const r = ref(0);
            const mockCallback = vi.fn();
            const unsubscribe = subscribeRef(r, mockCallback);

            r.value = 1;
            expect(mockCallback).toHaveBeenCalledTimes(1);

            unsubscribe();

            r.value = 2;
            expect(mockCallback).toHaveBeenCalledTimes(1); // Should not be called again
        });

        it('should return a no-op unsubscribe function if target is not a ref', () => {
            const mockCallback = vi.fn();
            const unsubscribe = subscribeRef({ value: 1 } as any, mockCallback);
            expect(typeof unsubscribe).toBe('function');
            // Calling it should not throw
            expect(() => unsubscribe()).not.toThrow();
        });
    });

    describe('Explicit Trigger (triggerStoreChange argument)', () => {
        it('should call the explicit trigger function when value changes', () => {
            const triggerFn = vi.fn();
            const r = ref(0, triggerFn);

            r.value = 1;
            expect(triggerFn).toHaveBeenCalledTimes(1);
            r.value = 2;
            expect(triggerFn).toHaveBeenCalledTimes(2);
        });
    });

    describe('Contextual Trigger (setActiveStoreTrigger)', () => {
        it('should call the active trigger when value changes if no explicit trigger is provided', () => {
            const contextTrigger = vi.fn();
            setActiveStoreTrigger(contextTrigger);

            const r = ref(0); // No explicit trigger
            r.value = 1;
            expect(contextTrigger).toHaveBeenCalledTimes(1);

            clearActiveStoreTrigger(); // Clear context
            r.value = 2;
            // It SHOULD be called again because the trigger was captured at creation
            expect(contextTrigger).toHaveBeenCalledTimes(2);
        });

        it('should prioritize explicit trigger over active context trigger', () => {
            const explicitTrigger = vi.fn();
            const contextTrigger = vi.fn();
            setActiveStoreTrigger(contextTrigger);

            const r = ref(0, explicitTrigger); // Provide explicit trigger
            r.value = 1;

            expect(explicitTrigger).toHaveBeenCalledTimes(1);
            expect(contextTrigger).not.toHaveBeenCalled();
        });

        it('should not call any trigger if context is cleared', () => {
            const contextTrigger = vi.fn();
            setActiveStoreTrigger(contextTrigger);
            clearActiveStoreTrigger(); // Clear immediately

            const r = ref(0);
            r.value = 1;

            expect(contextTrigger).not.toHaveBeenCalled();
        });
    });
}); 
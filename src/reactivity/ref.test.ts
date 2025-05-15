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

describe('subscribeRef', () => {
    it('should call subscriber when ref value changes', () => {
        const count = ref(0);
        const mockCallback = vi.fn();
        subscribeRef(count, mockCallback);

        const oldValue0 = count.value;
        count.value = 1;
        expect(mockCallback).toHaveBeenCalledTimes(1);
        // expect(mockCallback).toHaveBeenCalledWith(1, oldValue0); // oldValue0 is 0

        const oldValue1 = count.value;
        count.value = 2;
        expect(mockCallback).toHaveBeenCalledTimes(2);
        // expect(mockCallback).toHaveBeenCalledWith(2, oldValue1); // oldValue1 is 1
    });

    it('should not call subscriber if value does not change', () => {
        const count = ref(0);
        const mockCallback = vi.fn();
        subscribeRef(count, mockCallback);

        count.value = 0; // Set to the same value
        expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should return an unsubscribe function that works', () => {
        const count = ref(0);
        const mockCallback = vi.fn();
        const unsubscribe = subscribeRef(count, mockCallback);

        count.value = 1;
        expect(mockCallback).toHaveBeenCalledTimes(1);

        unsubscribe();

        count.value = 2;
        expect(mockCallback).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it('should allow multiple subscribers for the same ref', () => {
        const count = ref(0);
        const callback1 = vi.fn();
        const callback2 = vi.fn();

        subscribeRef(count, callback1);
        subscribeRef(count, callback2);

        count.value = 1;
        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('unsubscribe should not affect other subscribers for the same ref', () => {
        const count = ref(0);
        const callback1 = vi.fn();
        const callback2 = vi.fn();

        const unsubscribe1 = subscribeRef(count, callback1);
        subscribeRef(count, callback2);

        count.value = 1;
        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);

        unsubscribe1();

        count.value = 2;
        expect(callback1).toHaveBeenCalledTimes(1); // Not called again
        expect(callback2).toHaveBeenCalledTimes(2); // Called again
    });
});

describe('setActiveStoreTrigger and clearActiveStoreTrigger', () => {
    it('should call active store trigger when ref value changes', () => {
        const mockStoreTrigger = vi.fn();
        setActiveStoreTrigger(mockStoreTrigger);

        const count = ref(0); // Create ref AFTER setting active trigger

        count.value = 1;
        expect(mockStoreTrigger).toHaveBeenCalledTimes(1);
        // The store trigger does not receive newValue/oldValue, it's a simple signal
        expect(mockStoreTrigger).toHaveBeenCalledWith();


        count.value = 2;
        expect(mockStoreTrigger).toHaveBeenCalledTimes(2);

        clearActiveStoreTrigger(); // Clear before next assertion
    });

    it('should not call store trigger if value does not change', () => {
        const mockStoreTrigger = vi.fn();
        setActiveStoreTrigger(mockStoreTrigger);
        const count = ref(0); // Create ref AFTER setting active trigger

        count.value = 0; // Set to the same value
        expect(mockStoreTrigger).not.toHaveBeenCalled();

        clearActiveStoreTrigger();
    });

    it('should not call store trigger after it has been cleared IF ref created after clear', () => {
        const mockStoreTrigger = vi.fn();
        setActiveStoreTrigger(mockStoreTrigger);
        // Ref created while trigger is active will capture it
        const countWithTrigger = ref(0);

        countWithTrigger.value = 1;
        expect(mockStoreTrigger).toHaveBeenCalledTimes(1); // Called due to captured trigger

        clearActiveStoreTrigger();
        //This ref is created when no trigger is active
        const countWithoutTrigger = ref(10);

        countWithoutTrigger.value = 11;
        expect(mockStoreTrigger).toHaveBeenCalledTimes(1); // Should still be 1, not called for countWithoutTrigger

        // To further test captured trigger:
        countWithTrigger.value = 2; // This should still call the originally captured mockStoreTrigger
        expect(mockStoreTrigger).toHaveBeenCalledTimes(2);
    });

    it('should only have one active store trigger at a time, affecting subsequent ref creations', () => {
        const trigger1 = vi.fn();
        const trigger2 = vi.fn();

        setActiveStoreTrigger(trigger1);
        const r1 = ref(0);
        r1.value = 1;
        expect(trigger1).toHaveBeenCalledTimes(1);
        expect(trigger2).not.toHaveBeenCalled();

        setActiveStoreTrigger(trigger2); // Replaces trigger1 for NEW refs
        const r2 = ref(10);
        r2.value = 11;
        expect(trigger1).toHaveBeenCalledTimes(1); // Not called again for r2
        expect(trigger2).toHaveBeenCalledTimes(1); // Called for r2

        // r1 should still use trigger1
        r1.value = 2;
        expect(trigger1).toHaveBeenCalledTimes(2);
        expect(trigger2).toHaveBeenCalledTimes(1);

        clearActiveStoreTrigger();
    });

    it('calling clearActiveStoreTrigger when no trigger is active should not throw', () => {
        expect(() => clearActiveStoreTrigger()).not.toThrow();
        const count = ref(0);
        // Ensure no trigger is active from previous tests by explicitly clearing
        clearActiveStoreTrigger();
        count.value = 1; // Should not throw if no trigger was set
    });
}); 
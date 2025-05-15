import { describe, it, expect, vi, beforeEach } from 'vitest';
import { computed, isComputed } from './computed';
import { ref, isRef } from './ref';
import { reactive } from './reactive';

describe('computed', () => {
    it('should return a computed ref object', () => {
        const c = computed(() => 1);
        expect(isRef(c)).toBe(false); // Should not be a plain ref
        expect(isComputed(c)).toBe(true);
        expect(c).toHaveProperty('value');
    });

    it('should compute the value based on the getter', () => {
        const c = computed(() => 1 + 2);
        expect(c.value).toBe(3);
    });

    it('should cache the computed value', () => {
        const getter = vi.fn(() => 'test');
        const c = computed(getter);

        expect(getter).toHaveBeenCalledTimes(1); // Initial computation
        expect(c.value).toBe('test');
        expect(getter).toHaveBeenCalledTimes(1); // Should still be 1 after first access

        // Access again
        expect(c.value).toBe('test');
        expect(getter).toHaveBeenCalledTimes(1); // Should not have recomputed
    });

    it('should recompute when a dependency ref changes', () => {
        const count = ref(0);
        const getter = vi.fn(() => `Count: ${count.value}`);
        const double = computed(getter);

        expect(getter).toHaveBeenCalledTimes(1);
        expect(double.value).toBe('Count: 0');
        expect(getter).toHaveBeenCalledTimes(1);

        count.value = 1;
        expect(getter).toHaveBeenCalledTimes(1); // Should not recompute yet (lazy)
        expect(double.value).toBe('Count: 1');
        expect(getter).toHaveBeenCalledTimes(2); // Recomputed on access

        // Access again without change
        expect(double.value).toBe('Count: 1');
        expect(getter).toHaveBeenCalledTimes(2); // Should use cache
    });

    it('should track dependencies correctly', () => {
        const num1 = ref(1);
        const num2 = ref(10);
        const num3 = ref(100); // Not used initially

        const sum = computed(() => num1.value + num2.value);

        expect(sum.value).toBe(11);

        const deps = sum._getDependencies();
        expect(deps.size).toBe(2);

        // Check if the set contains the expected dependency objects
        const depArray = Array.from(deps);
        expect(depArray).toEqual(expect.arrayContaining([
            expect.objectContaining({ target: num1, key: 'value' }),
            expect.objectContaining({ target: num2, key: 'value' })
        ]));

        // Ensure num3 dependency is not present
        expect(depArray.some(dep => dep.target === num3 && dep.key === 'value')).toBe(false);
    });

    it('should handle chained computed properties', () => {
        const count = ref(1);
        const double = computed(() => count.value * 2);
        const quadruple = computed(() => double.value * 2);

        expect(quadruple.value).toBe(4);

        count.value = 2;
        expect(double.value).toBe(4);
        expect(quadruple.value).toBe(8);
    });

    it('should only trigger recomputation once for multiple dependency changes before access', () => {
        const num1 = ref(1);
        const num2 = ref(10);
        const getter = vi.fn(() => num1.value + num2.value);
        const sum = computed(getter);

        // Initial access
        expect(sum.value).toBe(11);
        expect(getter).toHaveBeenCalledTimes(1);

        // Change dependencies without accessing computed
        num1.value = 2;
        num2.value = 20;

        // Access computed - should only recompute once now
        expect(sum.value).toBe(22);
        expect(getter).toHaveBeenCalledTimes(2);

        // Access again
        expect(sum.value).toBe(22);
        expect(getter).toHaveBeenCalledTimes(2); // Should use cache
    });

    it('should work with computed depending on computed', () => {
        const base = ref(1);
        const computed1Getter = vi.fn(() => base.value * 10);
        const computed1 = computed(computed1Getter);
        const computed2Getter = vi.fn(() => computed1.value + 5);
        const computed2 = computed(computed2Getter);

        // Initial access sequence
        expect(computed2.value).toBe(15);
        expect(computed1Getter).toHaveBeenCalledTimes(1); // computed1 calculated
        expect(computed2Getter).toHaveBeenCalledTimes(1); // computed2 calculated

        // Access again, should be cached
        expect(computed2.value).toBe(15);
        expect(computed1Getter).toHaveBeenCalledTimes(1);
        expect(computed2Getter).toHaveBeenCalledTimes(1);

        // Change base ref
        base.value = 2;

        // Access computed2, triggering recalculation cascade
        expect(computed2.value).toBe(25);
        expect(computed1Getter).toHaveBeenCalledTimes(2); // computed1 recalculated
        expect(computed2Getter).toHaveBeenCalledTimes(2); // computed2 recalculated

        // Access again, should be cached now
        expect(computed2.value).toBe(25);
        expect(computed1Getter).toHaveBeenCalledTimes(2);
        expect(computed2Getter).toHaveBeenCalledTimes(2);
    });

    describe('Computed with Reactive Dependencies', () => {
        let storeChangeTrigger: ReturnType<typeof vi.fn>;

        beforeEach(() => {
            storeChangeTrigger = vi.fn();
        });

        it('should recompute when a reactive object property changes', () => {
            const state = reactive({ count: 0, name: 'test' }, storeChangeTrigger);
            const getter = vi.fn(() => `Count: ${state.count}, Name: ${state.name}`);
            const c = computed(getter);

            expect(c.value).toBe('Count: 0, Name: test');
            expect(getter).toHaveBeenCalledTimes(1);

            state.count = 1;
            expect(c.value).toBe('Count: 1, Name: test');
            expect(getter).toHaveBeenCalledTimes(2);

            state.name = 'updated';
            expect(c.value).toBe('Count: 1, Name: updated');
            expect(getter).toHaveBeenCalledTimes(3);
        });

        it('should recompute when a reactive Map property (e.g., size) changes', () => {
            const rMap = reactive(new Map<string, number>(), storeChangeTrigger);
            const cSize = computed(() => rMap.size);
            const cValueA = computed(() => rMap.get('a'));

            expect(cSize.value).toBe(0);
            expect(cValueA.value).toBeUndefined();

            rMap.set('a', 10);
            expect(cSize.value).toBe(1);
            expect(cValueA.value).toBe(10);

            rMap.set('b', 20);
            expect(cSize.value).toBe(2);

            rMap.delete('a');
            expect(cSize.value).toBe(1);
            expect(cValueA.value).toBeUndefined();

            rMap.clear();
            expect(cSize.value).toBe(0);
        });

        it('should recompute when a reactive Set property (e.g., size) changes', () => {
            const rSet = reactive(new Set<number>(), storeChangeTrigger);
            const cSize = computed(() => rSet.size);
            const cHas1 = computed(() => rSet.has(1));

            expect(cSize.value).toBe(0);
            expect(cHas1.value).toBe(false);

            rSet.add(1);
            expect(cSize.value).toBe(1);
            expect(cHas1.value).toBe(true);

            rSet.add(2);
            expect(cSize.value).toBe(2);

            rSet.delete(1);
            expect(cSize.value).toBe(1);
            expect(cHas1.value).toBe(false);

            rSet.clear();
            expect(cSize.value).toBe(0);
        });

        it('should recompute when a reactive Array property (e.g., length) changes', () => {
            const rArray = reactive<number[]>([], storeChangeTrigger);
            const cLength = computed(() => rArray.length);
            const cFirst = computed(() => rArray[0]);

            expect(cLength.value).toBe(0);
            expect(cFirst.value).toBeUndefined();

            rArray.push(10);
            expect(cLength.value).toBe(1);
            expect(cFirst.value).toBe(10);

            rArray.push(20);
            expect(cLength.value).toBe(2);
            expect(cFirst.value).toBe(10); // First element doesn't change here

            rArray.shift();
            expect(cLength.value).toBe(1);
            expect(cFirst.value).toBe(20);

            rArray.length = 0; // Direct length manipulation
            expect(cLength.value).toBe(0);
            expect(cFirst.value).toBeUndefined();
        });

        it('should recompute when a reactive Date property changes', () => {
            const rDate = reactive(new Date('2024-01-01T00:00:00.000Z'), storeChangeTrigger);
            const cYear = computed(() => rDate.getFullYear());
            const cISO = computed(() => rDate.toISOString());

            const initialYear = 2024;
            const initialISO = '2024-01-01T00:00:00.000Z';

            expect(cYear.value).toBe(initialYear);
            expect(cISO.value).toBe(initialISO);

            rDate.setFullYear(2025);
            expect(cYear.value).toBe(2025);
            expect(cISO.value).toBe('2025-01-01T00:00:00.000Z');

            rDate.setMonth(5); // June
            expect(cISO.value).toBe('2025-06-01T00:00:00.000Z');
        });
    });

    describe('Error Handling in Getter', () => {
        it('should throw error from getter on first access and re-throw on subsequent accesses if still dirty', () => {
            const error = new Error('Getter failed!');
            const failingComputed = computed(() => {
                throw error;
            });

            // Access 1
            expect(() => failingComputed.value).toThrowError(error.message);

            // Access 2: should re-throw because it will try to recompute (and fail again)
            // The computed remains dirty after an error, so it re-runs the getter.
            expect(() => failingComputed.value).toThrowError(error.message);
        });

        it('should re-evaluate and succeed if dependency changes after a failed computation', () => {
            const source = ref(true);
            const error = new Error('Conditional fail');
            let evaluationCount = 0;

            const conditionalComputed = computed(() => {
                evaluationCount++;
                if (source.value) {
                    throw error;
                }
                return 'Success!';
            });

            // Initial computation happens at construction. evaluationCount is 1.
            // First access to .value when dirty re-runs the getter.
            // Access 1: should throw
            expect(() => conditionalComputed.value).toThrowError(error.message);
            expect(evaluationCount).toBe(2); // Evaluated at construction (1) + first access (1) = 2

            // Change dependency so getter should succeed
            source.value = false;

            // Access 2: should now succeed and re-evaluate
            expect(conditionalComputed.value).toBe('Success!');
            expect(evaluationCount).toBe(3); // Previous (2) + successful re-evaluation (1) = 3

            // Access 3: should be cached and still succeed
            expect(conditionalComputed.value).toBe('Success!');
            expect(evaluationCount).toBe(3); // Should not re-evaluate, use cached value
        });
    });

    it('computed with no reactive dependencies should compute once and cache', () => {
        let callCount = 0;
        const staticComputed = computed(() => {
            callCount++;
            return Date.now(); // Or Math.random(), or any non-reactive source
        });

        const firstValue = staticComputed.value;
        expect(callCount).toBe(1);

        // Wait a bit to ensure Date.now() would be different if recomputed
        return new Promise(resolve => setTimeout(() => {
            const secondValue = staticComputed.value;
            expect(callCount).toBe(1); // Should not have recomputed
            expect(secondValue).toBe(firstValue); // Should return cached value
            resolve(undefined);
        }, 20));
    });
}); 
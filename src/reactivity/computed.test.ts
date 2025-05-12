import { describe, it, expect, vi } from 'vitest';
import { computed, isComputed } from './computed';
import { ref, isRef } from './ref';

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

}); 
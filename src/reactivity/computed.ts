import { Ref, isRef, RefSymbol } from './ref';
import { reactive } from './reactive';

// We might need a dedicated symbol for computed refs too, or reuse RefSymbol if compatible
export const ComputedRefSymbol = Symbol('ComputedRef');

// Interface remains the same for external consumers
export interface ComputedRef<T = any> {
    readonly value: T;
    /** @internal */
    readonly [ComputedRefSymbol]: true;
    /** @internal */
    _getDependencies: () => Set<{ target: object; key: PropertyKey }>; // Updated dep type
}

// --- Centralized Effect Tracking ---

let activeEffect: (() => void) | null = null;

// Map: Target Object -> Property Key -> Set of Effects
const targetMap = new WeakMap<object, Map<PropertyKey, Set<() => void>>>();

// Map: Effect Function -> Set of Dep Keys ({ target, key })
const effectDependencies = new WeakMap<() => void, Set<{ target: object; key: PropertyKey }>>();

/**
 * Tracks a dependency on a specific target object's property key.
 */
export function track(target: object, key: PropertyKey) {
    if (!activeEffect) {
        return; // Do nothing if no effect is active
    }

    // Get map for target
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }

    // Get effects set for key
    let depEffects = depsMap.get(key);
    if (!depEffects) {
        depEffects = new Set();
        depsMap.set(key, depEffects);
    }

    // Add current effect to the set for this target[key]
    if (!depEffects.has(activeEffect)) { // Avoid redundant additions
        depEffects.add(activeEffect);

        // Also record that this effect depends on this target[key]
        let effectDeps = effectDependencies.get(activeEffect);
        if (!effectDeps) {
            effectDeps = new Set();
            effectDependencies.set(activeEffect, effectDeps);
        }
        effectDeps.add({ target, key });
    }
    // console.log(`TRACK: Effect ${activeEffect.name || 'anon'} depends on ${target.constructor.name || 'obj'}[${String(key)}]`);
}

/**
 * Triggers all effects that depend on a specific target object's property key.
 */
export function trigger(target: object, key: PropertyKey) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        return; // No effects registered for this target
    }

    const depEffects = depsMap.get(key);
    if (depEffects) {
        // console.log(`TRIGGER: Target ${target.constructor.name || 'obj'}[${String(key)}] changed, triggering ${depEffects.size} effects.`);
        // Avoid infinite loops by triggering effects from a copy
        const effectsToRun = new Set(depEffects);
        effectsToRun.forEach(effect => {
            // Check if effect has a scheduler? (Advanced feature)
            runEffect(effect); // For now, just run it
        });
    }
}

/**
 * Executes an effect function, setting it as the activeEffect during execution.
 */
function runEffect(effect: () => void) {
    const previousEffect = activeEffect;
    activeEffect = effect;
    try {
        // Here we might want to clean up previous dependencies before running? (Advanced)
        effect(); // Run the effect function (e.g., computed getter)
    } finally {
        activeEffect = previousEffect;
    }
}

// --- Computed Implementation (Updated) ---

export function computed<T>(getter: () => T): ComputedRef<T> {
    let cachedValue: T;
    let dirty = true;
    // Define computedRef object structure early using Object.create for symbol
    const computedRef = Object.create(null, {
        [ComputedRefSymbol]: { value: true, enumerable: false }
    }) as ComputedRef<T>; // Use assertion after creation

    const effect = () => { // This is the effect that depends on other refs/reactives
        if (!dirty) {
            dirty = true;
            // When a dependency changes, this effect runs.
            // It marks the computed as dirty and triggers effects that depend on *this computed's value*.
            trigger(computedRef, 'value'); // Trigger effects depending on computedRef.value
        }
    };

    const runGetterAndTrackDeps = () => {
        const previousEffect = activeEffect;
        activeEffect = effect; // Set this computed's *re-run* effect as active
        try {
            cachedValue = getter(); // Run the user's getter
            dirty = false;
        } finally {
            activeEffect = previousEffect;
        }
    };

    // Assign the value getter logic to the object properly
    Object.defineProperty(computedRef, 'value', {
        get() {
            // Track effects that depend on *this computed's value*
            track(computedRef, 'value');
            if (dirty) {
                runGetterAndTrackDeps();
            }
            return cachedValue;
        },
        enumerable: true,
        configurable: true,
    });

    Object.defineProperty(computedRef, '_getDependencies', {
        value: () => effectDependencies.get(effect) || new Set(),
        enumerable: false, // Internal property
    });

    // Initial calculation and dependency tracking
    runGetterAndTrackDeps();

    return computedRef;
}

export function isComputed<T>(r: any): r is ComputedRef<T> {
    return !!(r && r[ComputedRefSymbol]);
} 
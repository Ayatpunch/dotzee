import { isRef, Ref } from './ref'; // Import ref utilities
import { track, trigger } from './computed'; // Import central track/trigger

/**
 * A WeakMap to store original objects that have already been made reactive.
 * Keys are original objects, values are their reactive proxies.
 * This helps avoid re-creating proxies for the same object and handles circular dependencies.
 */
const reactiveProxyMap = new WeakMap<object, any>();

/**
 * A WeakMap to store the original object for a given proxy.
 * Keys are proxies, values are their original underlying objects.
 */
const proxyToOriginalMap = new WeakMap<any, object>();

/**
 * A WeakMap to store subscribers for each reactive object (for coarse-grained subscription).
 * Keys are original objects, values are a Set of callback functions (subscribers).
 */
const subscribersMap = new WeakMap<object, Set<() => void>>();

// Symbols for tracking iteration and specific Map key iteration
export const ITERATE_KEY = Symbol('iterate');
export const MAP_KEY_ITERATE_KEY = Symbol('map_key_iterate');
export const DATE_VALUE_KEY = Symbol('date_value'); // Symbol for date value changes

/**
 * Checks if a value is a plain object.
 * @param val - The value to check.
 * @returns True if the value is a plain object, false otherwise.
 */
function isObject(val: unknown): val is Record<any, any> {
    return val !== null && typeof val === 'object';
}

/**
 * Triggers all subscriber callbacks associated with a given target object (coarse-grained).
 * Also triggers an optional store-level change callback if provided.
 *
 * @param target - The original object whose subscribers should be notified.
 * @param triggerStoreChange - Optional callback to signal a higher-level change (e.g., for store updates).
 */
function triggerStoreSubscribers(target: object, triggerStoreChange?: () => void): void {
    const subscribers = subscribersMap.get(target);
    if (subscribers) {
        // console.log(`Triggering ${subscribers.size} effects for target:`, target);
        new Set(subscribers).forEach(callback => callback());
    }
    // Also trigger the store-level change if provided
    if (triggerStoreChange) {
        // console.log('Triggering store change from reactive set');
        triggerStoreChange();
    }
}

function createReactiveObject<T extends object>(target: T, triggerStoreChange?: () => void): T {
    const baseHandlers: ProxyHandler<T> = {
        get(targetObj, key, receiver) {
            // Array method specific handling
            if (Array.isArray(targetObj)) {
                const arrayInstrumentations: Record<string, Function> = {
                    push: function (this: T, ...args: any[]) {
                        // `this` is the proxy ('receiver')
                        // originalTarget is targetObj from the outer scope.
                        const originalMethod = Array.prototype.push;
                        const res = originalMethod.apply(targetObj, args);

                        trigger(targetObj, 'length');
                        trigger(targetObj, ITERATE_KEY);

                        // Trigger for new indices
                        for (let i = (targetObj as any[]).length - args.length; i < (targetObj as any[]).length; i++) {
                            trigger(targetObj, i.toString());
                        }

                        triggerStoreSubscribers(targetObj, triggerStoreChange);
                        return res;
                    },
                    pop: function (this: T) { // `this` is the proxy
                        const originalMethod = Array.prototype.pop;
                        const oldLength = (targetObj as any[]).length;
                        const res = originalMethod.apply(targetObj); // Call on raw target

                        if (oldLength > 0) {
                            trigger(targetObj, 'length');
                            trigger(targetObj, ITERATE_KEY);
                            trigger(targetObj, (oldLength - 1).toString()); // Trigger for the removed index
                            triggerStoreSubscribers(targetObj, triggerStoreChange);
                        }
                        return res;
                    },
                    shift: function (this: T) {
                        const originalMethod = Array.prototype.shift;
                        const oldLength = (targetObj as any[]).length;
                        const res = originalMethod.apply(targetObj);

                        if (oldLength > 0) {
                            trigger(targetObj, 'length');
                            trigger(targetObj, ITERATE_KEY);
                            // Trigger for all potentially changed indices up to the new length
                            for (let i = 0; i < (targetObj as any[]).length; i++) {
                                trigger(targetObj, i.toString());
                            }
                            // If the array became empty, the old index 0 was the one removed.
                            // If items remain, all old indices effectively had their values changed.
                            // ITERATE_KEY and length handle broad cases. Specific index triggers ensure fine-grained updates.
                            // Triggering index '0' specifically if it was removed and was the only element:
                            if ((targetObj as any[]).length === 0 && oldLength === 1) {
                                trigger(targetObj, '0');
                            } else if (oldLength > 0) {
                                // For a non-empty array that shifted, index 0 changed, and other indices shifted.
                                // The loop above covers existing indices. The removed element was at old index 0.
                                // We could also trigger for all old indices that are no longer valid if more precision is needed,
                                // but ITERATE_KEY and length are often sufficient.
                                // Consider if `trigger(targetObj, '0');` is always needed if oldLength > 0
                                // Yes, the value at index 0 is always affected by a successful shift.
                                trigger(targetObj, '0');
                            }

                            triggerStoreSubscribers(targetObj, triggerStoreChange);
                        }
                        return res;
                    },
                    unshift: function (this: T, ...args: any[]) {
                        const originalMethod = Array.prototype.unshift;
                        // Call the original method first to get the new length and mutate the array.
                        const newLength = originalMethod.apply(targetObj, args);

                        // Only trigger if elements were actually added (args.length > 0).
                        // The original unshift returns the new length. If args.length is 0, it does nothing
                        // and returns the current length. So, if newLength changed from what it was, or if args were added.
                        // A simpler check: if args.length > 0, a change definitely occurred.
                        if (args.length > 0) {
                            trigger(targetObj, 'length');
                            trigger(targetObj, ITERATE_KEY);
                            // All elements have shifted, and new elements are at the beginning.
                            // Trigger for all indices up to the new length, as their values are new or shifted.
                            for (let i = 0; i < (targetObj as any[]).length; i++) {
                                trigger(targetObj, i.toString());
                            }
                            triggerStoreSubscribers(targetObj, triggerStoreChange);
                        }
                        return newLength; // Return the new length, as per original unshift
                    },
                    splice: function (this: T, start: number, deleteCount?: number, ...itemsToAdd: any[]) {
                        // const originalMethod = Array.prototype.splice; // Not strictly needed if calling on targetObj
                        const arr = targetObj as any[];
                        const oldLength = arr.length;

                        let actualDeleteCount: number;
                        if (deleteCount === undefined) {
                            // If deleteCount is not provided, it deletes from start to the end of the array.
                            // However, if itemsToAdd are provided, it should delete 0 elements at start, then insert.
                            // This depends on how many arguments are passed to splice.
                            // If itemsToAdd is empty and deleteCount undefined, it means remove all from start.
                            if (itemsToAdd.length === 0) {
                                actualDeleteCount = oldLength - start;
                            } else {
                                actualDeleteCount = 0; // Default to 0 if items are being added and no deleteCount specified
                            }
                        } else {
                            actualDeleteCount = deleteCount;
                        }

                        // Call original splice method directly on the target object (raw array).
                        const res = arr.splice(start, actualDeleteCount, ...itemsToAdd);

                        // Determine if a change actually occurred that requires triggering
                        const lengthChanged = arr.length !== oldLength;

                        // If splice returned deleted items, or if items were added, or if length changed.
                        if (res.length > 0 || itemsToAdd.length > 0 || lengthChanged) {
                            trigger(targetObj, 'length');
                            trigger(targetObj, ITERATE_KEY);

                            const newLength = arr.length;
                            const affectedRangeEnd = Math.max(oldLength, newLength);

                            // Normalize start for loop if it was negative
                            const normalizedStart = start < 0 ? Math.max(0, oldLength + start) : start;

                            // Trigger indices in the affected range
                            for (let i = normalizedStart; i < affectedRangeEnd; i++) {
                                trigger(targetObj, i.toString());
                            }
                            // Also trigger for indices where new items were specifically added,
                            // especially if they are beyond normalizedStart + itemsToAdd.length due to deleteCount.
                            // The loop above to affectedRangeEnd should generally cover this if items are inserted.
                            // Explicitly triggering for newly added items' final positions:
                            for (let i = 0; i < itemsToAdd.length; i++) {
                                trigger(targetObj, (normalizedStart + i).toString());
                            }


                            triggerStoreSubscribers(targetObj, triggerStoreChange);
                        }
                        return res; // Returns array of deleted elements
                    },
                    sort: function (this: T, compareFn?: (a: any, b: any) => number) {
                        const originalMethod = Array.prototype.sort;
                        const arr = targetObj as any[];

                        // Call sort on the raw array. `this` in originalMethod needs to be the array.
                        originalMethod.call(arr, compareFn);

                        // Assume sort changes the array order if it has elements.
                        // A more precise check would involve comparing before/after, but is complex.
                        if (arr.length > 0) {
                            trigger(targetObj, ITERATE_KEY);
                            for (let i = 0; i < arr.length; i++) {
                                trigger(targetObj, i.toString());
                            }
                            triggerStoreSubscribers(targetObj, triggerStoreChange);
                        }
                        return this; // sort returns the array itself (the proxy in this case)
                    },
                    reverse: function (this: T) {
                        const originalMethod = Array.prototype.reverse;
                        const arr = targetObj as any[];

                        const hadEffect = arr.length > 1; // Reverse only has effect if length > 1

                        originalMethod.call(arr); // Call reverse on the raw array

                        if (hadEffect) {
                            trigger(targetObj, ITERATE_KEY);
                            for (let i = 0; i < arr.length; i++) {
                                trigger(targetObj, i.toString());
                            }
                            triggerStoreSubscribers(targetObj, triggerStoreChange);
                        }
                        return this; // reverse returns the array itself (the proxy)
                    },
                };

                if (key in arrayInstrumentations) {
                    // Bind the instrumented method to the proxy (receiver)
                    return arrayInstrumentations[key as string].bind(receiver);
                }
            }

            const value = Reflect.get(targetObj, key, receiver);
            track(targetObj, key);
            if (isObject(value)) {
                return reactive(value, triggerStoreChange);
            }
            return value;
        },
        set(targetObj, key, newValue, receiver) {
            const oldValue = Reflect.get(targetObj, key, receiver);
            const hadKey = Array.isArray(targetObj) ?
                Number(key) < (targetObj as any[]).length : // For arrays, check if index is within current length
                Reflect.has(targetObj, key); // For objects, use Reflect.has to correctly handle symbol keys

            const result = Reflect.set(targetObj, key, newValue, receiver);

            // Ensure we only trigger if the set was successful (Reflect.set returns true)
            // and if the value actually changed or a new key was added.
            if (result) {
                if (!hadKey) {
                    trigger(targetObj, key);
                    trigger(targetObj, ITERATE_KEY); // New key means iteration changes
                    if (Array.isArray(targetObj)) {
                        trigger(targetObj, 'length'); // Setting a new index past current length affects length
                    }
                    triggerStoreSubscribers(targetObj, triggerStoreChange);
                } else if (oldValue !== newValue) {
                    trigger(targetObj, key);
                    // ITERATE_KEY might be needed if computed properties iterate over values
                    // and the new value changes the iteration result.
                    // For arrays, changing an element's value doesn't change 'length' or key set.
                    // For objects, changing a value doesn't change key set.
                    // Let's trigger ITERATE_KEY for now for safety, can be optimized if becomes a bottleneck.
                    trigger(targetObj, ITERATE_KEY);
                    triggerStoreSubscribers(targetObj, triggerStoreChange);
                }
                // Explicitly handle direct 'length' modification for arrays
                // This case is actually covered if oldValue (old length) !== newValue (new length)
                // No specific separate handling for `key === 'length'` needed here if the above conditions are met.
            }
            return result;
        },
        deleteProperty(targetObj, key) {
            const hadKey = Reflect.has(targetObj, key); // Use Reflect.has for objects and arrays (works for indices too)
            const result = Reflect.deleteProperty(targetObj, key);
            if (hadKey && result) { // If key existed and deletion was successful
                trigger(targetObj, key);
                trigger(targetObj, ITERATE_KEY);
                if (Array.isArray(targetObj)) {
                    trigger(targetObj, 'length');
                }
                triggerStoreSubscribers(targetObj, triggerStoreChange);
            }
            return result;
        }
    };
    return new Proxy(target, baseHandlers);
}

function createReactiveMap<K, V>(target: Map<K, V>, triggerStoreChange?: () => void): Map<K, V> {
    const instrumentations = {
        get(key: K) {
            if (typeof key !== 'object' && key !== null) { // Key is primitive
                track(target, key as PropertyKey);
            } else {
                track(target, ITERATE_KEY); // A broad track for object key access
            }
            const value = target.get(key);
            return isObject(value) ? reactive(value as object, triggerStoreChange) : value;
        },
        set(key: K, value: V) {
            const M = target as Map<any, any>; // Raw map for actual storage
            const proxy = this as Map<K, V>;    // The proxy instance

            const oldValue = M.get(key);
            const hadKey = M.has(key);
            const reactiveValue = isObject(value) ? reactive(value as object, triggerStoreChange) : value;

            // Only proceed if the new value is different or the key is new
            if (!hadKey || oldValue !== reactiveValue) {
                M.set(key, reactiveValue);

                if (!hadKey) {
                    if (typeof key !== 'object' && key !== null) {
                        trigger(target, key as PropertyKey);
                    }
                    trigger(target, ITERATE_KEY);
                    trigger(target, MAP_KEY_ITERATE_KEY);
                    trigger(target, 'size');
                } else { // Key existed, value changed
                    trigger(target, ITERATE_KEY); // Value change can affect iteration over entries/values
                    if (typeof key !== 'object' && key !== null) {
                        trigger(target, key as PropertyKey);
                    }
                }
                triggerStoreSubscribers(target, triggerStoreChange);
            }
            return proxy;
        },
        has(key: K): boolean {
            if (typeof key !== 'object' && key !== null) { // Key is primitive
                track(target, key as PropertyKey);
            } else {
                track(target, ITERATE_KEY); // Broad track for object key 'has' check
            }
            return target.has(key);
        },
        delete(key: K): boolean {
            const M = target as Map<any, any>;
            const proxy = this as Map<K, V>; // Added missing proxy variable for consistency
            const hadKey = M.has(key);
            const result = M.delete(key);
            if (hadKey) {
                if (typeof key !== 'object' && key !== null) { // Key is primitive
                    trigger(target, key as PropertyKey);
                }
                trigger(target, ITERATE_KEY);
                trigger(target, MAP_KEY_ITERATE_KEY);
                trigger(target, 'size');
                triggerStoreSubscribers(target, triggerStoreChange);
            }
            return result;
        },
        clear(): void {
            const M = target as Map<any, any>; // Alias
            const hadItems = M.size > 0;
            M.clear();
            if (hadItems) {
                trigger(target, ITERATE_KEY);
                trigger(target, MAP_KEY_ITERATE_KEY);
                trigger(target, 'size');
                triggerStoreSubscribers(target, triggerStoreChange);
            }
        },
        // forEach, keys, values, entries - to be implemented with iteration tracking
        forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
            track(target, ITERATE_KEY);
            track(target, MAP_KEY_ITERATE_KEY);
            // Ensure values passed to callback are reactive if they are objects
            target.forEach((value, key) => {
                // const reactiveValue = isObject(value) ? reactive(value as object, triggerStoreChange) : value;
                // const reactiveKey = isObject(key) ? reactive(key as object, triggerStoreChange) : key; // Key for Map can be an object
                // callbackfn.call(thisArg, reactiveValue, reactiveKey as K, this as Map<K,V>);
                // value and key are already potentially reactive as stored in the original map if they were objects
                callbackfn.call(thisArg, value, key, this as Map<K, V>);
            });
        },
        keys(): IterableIterator<K> {
            track(target, MAP_KEY_ITERATE_KEY);
            return target.keys();
        },
        values(): IterableIterator<V> {
            track(target, ITERATE_KEY);
            // Potentially wrap iterator to ensure yielded values are reactive if objects
            // For now, return original iterator; values fetched via map.get(key) would be reactive.
            return target.values();
        },
        entries(): IterableIterator<[K, V]> {
            track(target, ITERATE_KEY);
            track(target, MAP_KEY_ITERATE_KEY);
            // Similar to values(), consider iterator wrapping later if needed.
            return target.entries();
        }
    };

    return new Proxy(target, {
        get(targetObj, key, receiver) {
            if (key === 'size') {
                track(targetObj, 'size');
                return Reflect.get(targetObj, key, targetObj); // Use targetObj for 'size'
            }
            if (Object.prototype.hasOwnProperty.call(instrumentations, key)) {
                const method = (instrumentations as any)[key];
                return method.bind(receiver); // Bind the instrumented method to the proxy (receiver)
            }
            // Fallback for non-instrumented methods (e.g. Symbol.iterator, toString)
            const originalMethod = Reflect.get(targetObj, key, receiver);
            if (typeof originalMethod === 'function') {
                return originalMethod.bind(receiver);
            }
            return originalMethod;
        }
    }) as Map<K, V>;
}

function createReactiveSet<T>(target: Set<T>, triggerStoreChange?: () => void): Set<T> {
    const instrumentations = {
        add(value: T): Set<T> {
            const S = target as Set<any>; // Raw set
            const proxy = this as Set<T>;   // Proxy instance

            const hadValue = S.has(value);
            const reactiveValue = isObject(value) ? reactive(value as object, triggerStoreChange) : value;

            if (!hadValue) {
                S.add(reactiveValue);
                if (typeof value !== 'object' && value !== null) {
                    trigger(target, value as PropertyKey);
                }
                trigger(target, ITERATE_KEY);
                trigger(target, 'size');
                triggerStoreSubscribers(target, triggerStoreChange);
            }
            return proxy;
        },
        has(value: T): boolean {
            if (typeof value !== 'object' && value !== null) { // Value is primitive
                track(target, value as PropertyKey);
            } else {
                track(target, ITERATE_KEY);
            }
            return target.has(value);
        },
        delete(value: T): boolean {
            const S = target as Set<any>;
            const proxy = this as Set<T>; // Added missing proxy variable for consistency
            const hadValue = S.has(value);
            const result = S.delete(value);
            if (hadValue) {
                if (typeof value !== 'object' && value !== null) { // Value is primitive
                    trigger(target, value as PropertyKey);
                }
                trigger(target, ITERATE_KEY);
                trigger(target, 'size');
                triggerStoreSubscribers(target, triggerStoreChange);
            }
            return result;
        },
        clear(): void {
            const S = target as Set<any>; // Alias
            const hadItems = S.size > 0;
            S.clear();
            if (hadItems) {
                trigger(target, ITERATE_KEY);
                trigger(target, 'size');
                triggerStoreSubscribers(target, triggerStoreChange);
            }
        },
        // forEach, keys, values, entries - to be implemented with iteration tracking
        forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void {
            track(target, ITERATE_KEY);
            target.forEach((value) => {
                // const reactiveValue = isObject(value) ? reactive(value as object, triggerStoreChange) : value;
                // callbackfn.call(thisArg, reactiveValue, reactiveValue, this as Set<T>);
                // value is already potentially reactive as stored in the original set if it was an object
                callbackfn.call(thisArg, value, value, this as Set<T>);
            });
        },
        keys(): IterableIterator<T> { // Same as values for Set
            track(target, ITERATE_KEY);
            return target.keys();
        },
        values(): IterableIterator<T> {
            track(target, ITERATE_KEY);
            return target.values();
        },
        entries(): IterableIterator<[T, T]> {
            track(target, ITERATE_KEY);
            return target.entries();
        }
    };

    return new Proxy(target, {
        get(targetObj, key, receiver) {
            if (key === 'size') {
                track(targetObj, 'size');
                return Reflect.get(targetObj, key, targetObj);
            }
            if (Object.prototype.hasOwnProperty.call(instrumentations, key)) {
                const method = (instrumentations as any)[key];
                return method.bind(receiver); // Bind the instrumented method to the proxy (receiver)
            }
            // Fallback for non-instrumented methods (e.g. Symbol.iterator, toString)
            const originalMethod = Reflect.get(targetObj, key, receiver);
            if (typeof originalMethod === 'function') {
                return originalMethod.bind(receiver);
            }
            return originalMethod;
        }
    }) as Set<T>;
}

function createReactiveDate(target: Date, triggerStoreChange?: () => void): Date {
    const instrumentations: Record<string, Function> = {};
    const mutationMethods = [
        'setDate', 'setFullYear', 'setHours', 'setMilliseconds',
        'setMinutes', 'setMonth', 'setSeconds', 'setTime',
        'setUTCDate', 'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds',
        'setUTCMinutes', 'setUTCMonth', 'setUTCSeconds', 'setYear' // setYear is deprecated but might be used
    ];

    mutationMethods.forEach(methodName => {
        instrumentations[methodName] = function (this: Date, ...args: any[]) {
            // `this` is the proxy ('receiver')
            // `target` is the original Date object from the outer scope.
            const originalMethod = (Date.prototype as any)[methodName];
            const oldTime = target.getTime(); // Get time before mutation
            const res = originalMethod.apply(target, args); // Call on raw target
            const newTime = target.getTime(); // Get time after mutation

            if (oldTime !== newTime) { // Trigger only if the underlying time value changed
                trigger(target, DATE_VALUE_KEY); // Signal that the date's core value changed
                trigger(target, ITERATE_KEY); // General iteration might be affected
                triggerStoreSubscribers(target, triggerStoreChange);
            }
            return res;
        };
    });

    // Common getter methods that should track DATE_VALUE_KEY
    // Other getters like getDay, getUTCDay etc. also depend on the internal time value
    // So tracking DATE_VALUE_KEY for any 'get*' method is a safe bet.
    // Symbol.toPrimitive also depends on the date's value.

    return new Proxy(target, {
        get(targetObj, key, receiver) {
            if (typeof key === 'string' && instrumentations.hasOwnProperty(key)) {
                return instrumentations[key].bind(receiver);
            }

            // For any 'get*' method or 'to*' method (like toString, toISOString) or 'valueOf', track DATE_VALUE_KEY
            if ((typeof key === 'string' && (key.startsWith('get') || key.startsWith('to'))) || key === 'valueOf' || key === Symbol.toPrimitive) {
                track(targetObj, DATE_VALUE_KEY);
            }
            // Fallback for other properties or methods
            const value = Reflect.get(targetObj, key, receiver);
            if (typeof value === 'function') {
                return value.bind(targetObj); // Bind to original target for native Date methods
            }
            return value;
        },
        // No 'set' trap needed as Date properties are not typically set directly like date.year = 2023;
        // All modifications go through methods like setFullYear().
    });
}

/**
 * Creates a reactive version of an object using JavaScript Proxies.
 * This function wraps the target object in a Proxy to intercept property access (get)
 * and property modification (set).
 *
 * @template T Extends object
 * @param {T} target - The object to make reactive.
 * @param {() => void} [triggerStoreChange] - Optional callback to notify on any change.
 * @returns {T} A reactive proxy of the target object.
 */
export function reactive<T extends object>(target: T, triggerStoreChange?: () => void): T {
    if (reactiveProxyMap.has(target)) {
        return reactiveProxyMap.get(target);
    }

    // Handle known collections
    if (target instanceof Date) { // Add Date check before Map/Set
        const proxy = createReactiveDate(target, triggerStoreChange);
        reactiveProxyMap.set(target, proxy);
        proxyToOriginalMap.set(proxy, target);
        return proxy as T;
    }
    if (target instanceof Map) {
        const proxy = createReactiveMap(target, triggerStoreChange);
        reactiveProxyMap.set(target, proxy);
        proxyToOriginalMap.set(proxy, target);
        return proxy as T;
    }
    if (target instanceof Set) {
        const proxy = createReactiveSet(target, triggerStoreChange);
        reactiveProxyMap.set(target, proxy);
        proxyToOriginalMap.set(proxy, target);
        return proxy as T;
    }

    // Fallback for plain objects and arrays
    const proxy = createReactiveObject(target, triggerStoreChange);
    reactiveProxyMap.set(target, proxy);
    proxyToOriginalMap.set(proxy, target);
    return proxy;
}

/**
 * Subscribes a callback function to coarse-grained changes in a reactive object or its proxy.
 * This is primarily used internally for the store's overall change signal.
 *
 * @internal
 * @template T Extends object
 * @param {T} targetOrProxy - The object or its proxy to subscribe to.
 * @param {() => void} callback - The function to call when the object changes.
 * @returns {() => void} A function to unsubscribe the callback.
 */
export function subscribe<T extends object>(targetOrProxy: T, callback: () => void): () => void {
    // Resolve the target to its original object if it's a known proxy
    const originalTarget = proxyToOriginalMap.get(targetOrProxy) || targetOrProxy;

    let subscribers = subscribersMap.get(originalTarget);
    if (!subscribers) {
        subscribers = new Set();
        subscribersMap.set(originalTarget, subscribers);
    }
    subscribers.add(callback);
    // console.log(`Subscribed to target:`, originalTarget, `Callback: ${callback.name || 'anonymous'}`);

    return () => {
        // console.log(`Unsubscribing from target:`, originalTarget, `Callback: ${callback.name || 'anonymous'}`);
        const currentSubscribers = subscribersMap.get(originalTarget);
        currentSubscribers?.delete(callback);
        if (currentSubscribers?.size === 0) {
            subscribersMap.delete(originalTarget);
        }
    };
} 
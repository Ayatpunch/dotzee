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
 * A WeakMap to store subscribers for each reactive object.
 * Keys are original objects, values are a Set of callback functions (subscribers).
 */
const subscribersMap = new WeakMap<object, Set<() => void>>();

/**
 * Checks if a value is a plain object.
 * @param val - The value to check.
 * @returns True if the value is a plain object, false otherwise.
 */
function isObject(val: unknown): val is Record<any, any> {
    return val !== null && typeof val === 'object';
}

/**
 * Triggers all subscriber callbacks associated with a given target object.
 * @param target - The original object whose subscribers should be notified.
 */
function triggerEffects(target: object): void {
    const subscribers = subscribersMap.get(target);
    if (subscribers) {
        // console.log(`Triggering ${subscribers.size} effects for target:`, target);
        subscribers.forEach(callback => callback());
    }
}

/**
 * Creates a reactive version of an object using JavaScript Proxies.
 * This function wraps the target object in a Proxy to intercept property access (get)
 * and property modification (set).
 *
 * @template T Extends object
 * @param {T} target - The object to make reactive.
 * @returns {T} A reactive proxy of the target object.
 */
export function reactive<T extends object>(target: T): T {
    if (reactiveProxyMap.has(target)) {
        return reactiveProxyMap.get(target);
    }

    const proxy = new Proxy(target, {
        get(targetObj, key, receiver) {
            const value = Reflect.get(targetObj, key, receiver);
            // console.log(`GET: key "${String(key)}" on target:`, targetObj, '=> value', value);

            if (isObject(value)) {
                return reactive(value); // Recursive call for nested objects
            }
            return value;
        },

        set(targetObj, key, newValue, receiver) {
            const oldValue = Reflect.get(targetObj, key, receiver);
            const result = Reflect.set(targetObj, key, newValue, receiver);

            if (oldValue !== newValue) {
                // console.log(`SET: key "${String(key)}" on target:`, targetObj, 'from', oldValue, 'to', newValue);
                triggerEffects(targetObj); // Trigger effects when a property changes
            }
            return result;
        },
    });

    reactiveProxyMap.set(target, proxy);
    proxyToOriginalMap.set(proxy, target);
    return proxy;
}

/**
 * Subscribes a callback function to changes in a reactive object or its proxy.
 *
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
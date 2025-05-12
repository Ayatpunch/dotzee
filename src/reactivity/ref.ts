/**
 * Basic Ref type. Stores a value and allows subscribing to its changes.
 * It can also be linked to a store-level change trigger.
 */
export interface Ref<T = any> {
    value: T;
    /** @internal */
    _subscribers?: Set<() => void>;
    /** @internal */
    _triggerStoreChange?: (() => void); // Captured trigger (explicit or context)
}

/**
 * WeakMap to track if an object is a ref instance created by our library.
 * Avoids prototype checks and potential conflicts.
 */
const refMap = new WeakMap<Ref<any>, boolean>();

/**
 * Type guard to check if a value is a Ref created by this library.
 * @param r - The value to check.
 * @returns True if the value is a Ref, false otherwise.
 */
export function isRef<T>(r: any): r is Ref<T> {
    // Check if the object exists as a key in our WeakMap
    return refMap.has(r) && refMap.get(r) === true;
}

// --- Store Trigger Context --- //
let activeStoreTrigger: (() => void) | undefined = undefined;

/** @internal */
export function setActiveStoreTrigger(trigger: (() => void) | undefined): void {
    activeStoreTrigger = trigger;
}
/** @internal - Resets trigger, should be called in finally block */
export function clearActiveStoreTrigger(): void {
    activeStoreTrigger = undefined;
}
// --- //

/**
 * Creates a reactive reference (Ref) that holds a value.
 * Changes to the `.value` property trigger subscribers and optionally a store-level change signal.
 *
 * @template T The type of the value held by the ref.
 * @param initialValue The initial value for the ref.
 * @param triggerStoreChange An optional explicit callback function to execute when the ref's value changes.
 *                           If not provided, it captures the active store trigger context at creation time.
 * @returns A Ref object.
 */
export function ref<T>(initialValue: T, triggerStoreChange?: (() => void)): Ref<T> {
    const subscribers = new Set<() => void>();
    let _value = initialValue;

    // Capture the effective trigger (explicit or context) at creation time
    const effectiveTrigger = triggerStoreChange ?? activeStoreTrigger;

    const refObject = {
        _subscribers: subscribers,
        _triggerStoreChange: effectiveTrigger, // Store the captured trigger

        get value(): T {
            return _value;
        },
        set value(newValue: T) {
            if (!Object.is(_value, newValue)) {
                _value = newValue;

                // Notify direct subscribers
                new Set(subscribers).forEach(cb => cb());

                // Call the captured trigger if it exists
                if (refObject._triggerStoreChange) {
                    // console.log('Triggering store change from ref set');
                    refObject._triggerStoreChange();
                }
            }
        }
    };

    refMap.set(refObject, true);
    return refObject as Ref<T>;
}

/**
 * Subscribes a callback function directly to changes in a specific Ref's value.
 * Note: For React components, use the main store hook (`useStore`) instead, which relies
 * on the store-level change signal triggered by `_triggerStoreChange`. This function
 * is more for internal use or advanced scenarios like custom watchers.
 *
 * @template T
 * @param {Ref<T>} refInstance - The Ref object to subscribe to.
 * @param {() => void} callback - The function to call when the ref's value changes.
 * @returns {() => void} A function to unsubscribe the callback.
 */
export function subscribeRef<T>(refInstance: Ref<T>, callback: () => void): () => void {
    if (!isRef(refInstance) || !refInstance._subscribers) {
        // console.warn('Target is not a valid ref or is missing internal subscriber set.');
        return () => { }; // Return a no-op unsubscribe function
    }
    refInstance._subscribers.add(callback);
    // console.log(`Subscribed directly to ref:`, refInstance);

    return () => {
        // console.log(`Unsubscribing directly from ref:`, refInstance);
        refInstance._subscribers?.delete(callback);
    };
} 
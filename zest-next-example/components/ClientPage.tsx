'use client'; // Mark this as a Client Component

import React, { useState, useEffect } from 'react';
import {
    hydrateZestState,
    getGlobalZestRegistry,
    enableZestDevTools,
    useZestStore // Import useZestStore
} from 'zest-state-library';
import { useCounterOptionsStore } from '../stores/counterOptionsStore'; // Adjust path

interface ClientPageProps {
    initialZestState: Record<string, any>;
}

let isHydrated = false; // Prevent re-hydration on HMR

export default function ClientPage({ initialZestState }: ClientPageProps) {
    // Hydrate ONCE on initial client mount
    useEffect(() => {
        if (!isHydrated) {
            const clientRegistry = getGlobalZestRegistry();
            hydrateZestState(clientRegistry, initialZestState);
            // Enable DevTools on client
            if (process.env.NODE_ENV === 'development') {
                enableZestDevTools({
                    name: 'Zest Next.js Example',
                    trace: true,
                });
            }
            isHydrated = true; // Mark as hydrated
            console.log('[Zest Hydration] Client hydrated.');
        }
    }, [initialZestState]); // Dependency array might need adjustment if initialZestState could change

    // Use the store in the client component
    const counter = useZestStore(useCounterOptionsStore);

    // Animation state for count changes
    const [isChanging, setIsChanging] = useState(false);
    const [prevCount, setPrevCount] = useState(counter.count);

    // Detect when count changes and trigger animation
    useEffect(() => {
        if (prevCount !== counter.count) {
            setPrevCount(counter.count);
            setIsChanging(true);

            // Reset animation class after animation completes
            const timeout = setTimeout(() => {
                setIsChanging(false);
            }, 300);

            return () => clearTimeout(timeout);
        }
    }, [counter.count, prevCount]);

    return (
        <div className="counter-container options-counter">
            <span className="store-type-badge">Options API</span>
            <h2>{counter.name}</h2>
            <p className={`count-display ${isChanging ? 'changing' : ''}`}>
                {counter.count}
            </p>

            {/* Display getters */}
            <div className="getters-section">
                <p>
                    <strong>Doubled:</strong>
                    <span>{counter.doubled}</span>
                </p>
                <p>
                    <strong>Status:</strong>
                    <span>{counter.countStatus}</span>
                </p>
            </div>

            <div className="button-group">
                <button onClick={() => counter.decrement()}>Decrement</button>
                <button onClick={() => counter.increment()}>Increment</button>
                <button
                    onClick={() => counter.incrementAsync(800)}
                    className={counter.loading ? 'loading' : ''}
                    disabled={counter.loading}
                >
                    {counter.loading ? 'Loading...' : 'Async +1'}
                </button>
            </div>
        </div>
    );
} 
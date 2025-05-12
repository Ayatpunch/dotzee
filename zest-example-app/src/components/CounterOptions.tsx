import React, { useState, useEffect } from 'react';
import { useCounterOptionsStore } from '../stores/counterOptionsStore';
import { useZestStore } from 'zest-state-library'; // Import the main hook

const CounterOptions: React.FC = () => {
    // Use the useZestStore hook to get the reactive store instance
    const counter = useZestStore(useCounterOptionsStore);
    const [isChanging, setIsChanging] = useState(false);

    // Track previous count to detect changes
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

    const handleIncrement = () => {
        counter.increment();
    };

    const handleDecrement = () => {
        counter.decrement();
    };

    const handleIncrementAsync = () => {
        counter.incrementAsync(800); // Use a shorter delay for better UX
    };

    return (
        <div className="counter-container options-counter">
            <span className="store-type-badge">Options API</span>
            <h2>{counter.name}</h2>
            <p className={`count-display ${isChanging ? 'changing' : ''}`}>
                {counter.count}
            </p>

            {/* Display getters */}
            <div className="getters-section">
                <p><strong>Doubled:</strong> <span>{counter.doubledCount}</span></p>
                <p><strong>Status:</strong> <span>{counter.countStatus}</span></p>
            </div>

            <div className="button-group">
                <button onClick={handleDecrement}>Decrement</button>
                <button onClick={handleIncrement}>Increment</button>
                <button
                    onClick={handleIncrementAsync}
                    disabled={counter.loading}
                    className={counter.loading ? 'loading' : ''}
                >
                    {counter.loading ? 'Loading...' : 'Async +1'}
                </button>
            </div>
        </div>
    );
};

export default CounterOptions; 
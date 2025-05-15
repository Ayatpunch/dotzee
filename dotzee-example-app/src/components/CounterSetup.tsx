import React, { useState, useEffect } from 'react';
import { useCounterSetupStore } from '../stores/counterSetupStore';

const CounterSetup: React.FC = () => {
    // Use the useDotzeeStore hook to get the reactive store instance
    const counter = useCounterSetupStore();
    const [isChanging, setIsChanging] = useState(false);

    // Track previous count to detect changes
    const [prevCount, setPrevCount] = useState(counter.count.value);

    // Detect when count changes and trigger animation
    useEffect(() => {
        if (prevCount !== counter.count.value) {
            setPrevCount(counter.count.value);
            setIsChanging(true);

            // Reset animation class after animation completes
            const timeout = setTimeout(() => {
                setIsChanging(false);
            }, 300);

            return () => clearTimeout(timeout);
        }
    }, [counter.count.value, prevCount]);

    const handleIncrement = () => {
        counter.increment(); // Call action directly
    };

    const handleDecrement = () => {
        counter.decrement(); // Call action directly
    };

    const handleIncrementAsync = () => {
        counter.incrementAsync(800); // Use a shorter delay for better UX
    };

    return (
        <div className="counter-container setup-counter">
            <span className="store-type-badge">Setup API</span>
            <h2>{counter.name.value}</h2> {/* Read name ref value */}
            <p className={`count-display ${isChanging ? 'changing' : ''}`}>
                {counter.count.value}
            </p> {/* Read count ref value */}

            {/* Display computed properties */}
            <div className="getters-section">
                <p><strong>Doubled:</strong> <span>{counter.doubledCount.value}</span></p>
                <p><strong>Status:</strong> <span>{counter.countStatus.value}</span></p>
            </div>

            <div className="button-group">
                <button onClick={handleDecrement}>Decrement</button>
                <button onClick={handleIncrement}>Increment</button>
                <button
                    onClick={handleIncrementAsync}
                    disabled={counter.loading.value}
                    className={counter.loading.value ? 'loading' : ''}
                >
                    {counter.loading.value ? 'Loading...' : 'Async +1'}
                </button>
            </div>
        </div>
    );
};

export default CounterSetup; 
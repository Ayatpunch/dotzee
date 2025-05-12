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
        // console.log("Incremented Options Store"); // Can remove console logs now
    };

    const handleDecrement = () => {
        counter.decrement();
        // console.log("Decremented Options Store"); // Can remove console logs now
    };

    return (
        <div className="counter-container options-counter">
            <span className="store-type-badge">Options API</span>
            <h2>{counter.name}</h2>
            <p className={`count-display ${isChanging ? 'changing' : ''}`}>
                {counter.count}
            </p>
            <div className="button-group">
                <button onClick={handleDecrement}>Decrement</button>
                <button onClick={handleIncrement}>Increment</button>
            </div>
            {/* <p>Options Store Signal: {useCounterOptionsStore.$changeSignal.value}</p> */} {/* Can remove signal display */}
        </div>
    );
};

export default CounterOptions; 
import React, { useState, useEffect } from 'react';
import { useCounterSetupStore } from '../stores/counterSetupStore';
import { useZestStore } from 'zest-state-library'; // Import the main hook

const CounterSetup: React.FC = () => {
    // Use the useZestStore hook to get the reactive store instance
    const counter = useZestStore(useCounterSetupStore);
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
        // console.log("Incremented Setup Store"); // Can remove console logs
    };

    const handleDecrement = () => {
        counter.decrement(); // Call action directly
        // console.log("Decremented Setup Store"); // Can remove console logs
    };

    return (
        <div className="counter-container setup-counter">
            <span className="store-type-badge">Setup API</span>
            <h2>{counter.name.value}</h2> {/* Read name ref value */}
            <p className={`count-display ${isChanging ? 'changing' : ''}`}>
                {counter.count.value}
            </p> {/* Read count ref value */}
            <div className="button-group">
                <button onClick={handleDecrement}>Decrement</button>
                <button onClick={handleIncrement}>Increment</button>
            </div>
            {/* <p>Setup Store Signal: {useCounterSetupStore.$changeSignal.value}</p> */} {/* Can remove signal display */}
        </div>
    );
};

export default CounterSetup; 
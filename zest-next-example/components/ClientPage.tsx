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
    }, [initialZestState]);

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
        <div className="counter-component">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-md bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
                        <span className="text-white font-bold">{counter.count}</span>
                    </div>
                    <h3 className="ml-3 text-xl font-semibold text-gray-800 dark:text-white">
                        {counter.name}
                    </h3>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                    Options API
                </span>
            </div>

            {/* Counter Display */}
            <div className="mt-6 flex flex-col items-center">
                <div className={`relative text-6xl font-bold text-gray-800 dark:text-white transition-all duration-300 ${isChanging ? 'scale-110 text-indigo-600 dark:text-indigo-400' : ''}`}>
                    {counter.count}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-6 w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Doubled</div>
                        <div className="mt-1 text-2xl font-semibold text-indigo-600 dark:text-indigo-400">{counter.doubled}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                        <div className="mt-1">
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${counter.countStatus === 'Positive' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                                        counter.countStatus === 'Negative' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                            >
                                {counter.countStatus}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="mt-8 grid grid-cols-3 gap-3">
                <button
                    onClick={() => counter.decrement()}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-800/40 transition-colors duration-150"
                >
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    Decrement
                </button>
                <button
                    onClick={() => counter.increment()}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-150"
                >
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Increment
                </button>
                <button
                    onClick={() => counter.incrementAsync(800)}
                    disabled={counter.loading}
                    className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors duration-150
                        ${counter.loading ?
                            'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed' :
                            'text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600'}`}
                >
                    {counter.loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                        </>
                    ) : (
                        <>
                            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            Async +1
                        </>
                    )}
                </button>
            </div>
        </div>
    );
} 
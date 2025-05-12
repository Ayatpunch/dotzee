'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the main ClientPage component with SSR turned off
const ClientPage = dynamic(() => import('./ClientPage'), {
    ssr: false,
    // Add a loading component with the same styling as the counter
    loading: () => (
        <div className="counter-container">
            <div className="h-8 w-32 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mb-4"></div>
            <div className="h-24 w-24 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mb-6"></div>
            <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4"></div>
            <div className="button-group opacity-70">
                <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
            </div>
        </div>
    ),
});

interface ClientContainerProps {
    initialZestState: Record<string, any>;
}

// This component acts as the bridge between Server and Client boundaries
// for the dynamic import
export default function ClientContainer({ initialZestState }: ClientContainerProps) {
    // Render the dynamically loaded component, passing the initial state
    return (
        <div className="counters-container">
            <ClientPage initialZestState={initialZestState} />
        </div>
    );
} 
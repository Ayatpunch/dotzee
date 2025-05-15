'use client';

import React, { Suspense, lazy } from 'react';

// Dynamically import the FeatureComponent
const FeatureComponent = lazy(() => import('./FeatureComponent'));

const LazyLoaderDisplay: React.FC = () => {
    return (
        <Suspense fallback={<FeatureLoadingSkeleton />}>
            <FeatureComponent />
        </Suspense>
    );
};

// Loading skeleton that matches the actual component's structure
const FeatureLoadingSkeleton = () => {
    return (
        <div className="counter-component animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                    <div className="ml-3 h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>

            {/* Counter display skeleton */}
            <div className="mt-6 flex flex-col items-center">
                <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="mt-6 grid grid-cols-2 gap-6 w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-center">
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2"></div>
                        <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                    </div>
                    <div className="text-center">
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2"></div>
                        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
                    </div>
                </div>
            </div>

            {/* Button skeleton */}
            <div className="mt-8">
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
        </div>
    );
};

export default LazyLoaderDisplay; 
'use client';

import React, { useEffect, useState } from 'react';
import { useFeatureStore } from '../stores/featureStore';

const FeatureComponent: React.FC = () => {
    const feature = useFeatureStore();

    // Animation state for count changes
    const [isChanging, setIsChanging] = useState(false);
    const [prevCount, setPrevCount] = useState(feature.count.value);

    // Set the message once the component has mounted
    useEffect(() => {
        feature.setMessage('Lazy Feature Initialized & Mounted!');
    }, [feature]);

    // Detect count changes for animation
    useEffect(() => {
        if (prevCount !== feature.count.value) {
            setPrevCount(feature.count.value);
            setIsChanging(true);

            // Reset animation after it completes
            const timeout = setTimeout(() => {
                setIsChanging(false);
            }, 300);

            return () => clearTimeout(timeout);
        }
    }, [feature.count.value, prevCount]);

    return (
        <div className="counter-component">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-md bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
                        <span className="text-white font-bold">{feature.count.value}</span>
                    </div>
                    <h3 className="ml-3 text-xl font-semibold text-gray-800 dark:text-white">
                        Dynamic Feature
                    </h3>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200">
                    Setup API
                </span>
            </div>

            {/* Message display */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status Message</div>
                <div className="font-mono text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded text-gray-800 dark:text-gray-200 overflow-auto">
                    {feature.message.value}
                </div>
            </div>

            {/* Counter Display */}
            <div className="flex flex-col items-center">
                <div className={`relative text-6xl font-bold text-gray-800 dark:text-white transition-all duration-300 ${isChanging ? 'scale-110 text-teal-600 dark:text-teal-400' : ''}`}>
                    {feature.count.value}
                </div>
            </div>

            {/* Button */}
            <div className="mt-8">
                <button
                    onClick={feature.increment}
                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 transition-colors duration-150"
                >
                    <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Increment Feature Count
                </button>
            </div>
        </div>
    );
};

export default FeatureComponent; 
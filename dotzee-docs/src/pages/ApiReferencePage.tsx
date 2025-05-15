import React from 'react';
import { Link } from 'react-router-dom';

const ApiReferencePage: React.FC = () => {
    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">API Reference</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Welcome to the Dotzee API reference documentation. This section provides detailed information about all the
                public APIs, functions, and utilities that Dotzee offers for state management in your React applications.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Core API</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        The core functions for creating and using Dotzee stores in your application.
                    </p>
                    <ul className="space-y-2">
                        <li>
                            <Link to="/api-reference/defineDotzeeStore" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                                defineDotzeeStore
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </li>
                        <li>
                            <Link to="/api-reference/useDotzeeStore" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                                useDotzeeStore
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Reactivity Primitives</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Fundamental building blocks for creating reactive state in Dotzee.
                    </p>
                    <ul className="space-y-2">
                        <li>
                            <Link to="/api-reference/ref" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                                ref
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </li>
                        <li>
                            <Link to="/api-reference/computed" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                                computed
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Development & Debugging</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Tools for debugging and optimizing your Dotzee stores.
                    </p>
                    <ul className="space-y-2">
                        <li>
                            <Link to="/api-reference/devtools" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                                DevTools
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Server-Side Rendering</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Utilities for using Dotzee in server-rendered applications.
                    </p>
                    <ul className="space-y-2">
                        <li>
                            <Link to="/api-reference/ssr" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                                SSR Utilities
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Extending Dotzee</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    APIs for extending and customizing Dotzee functionality.
                </p>
                <ul className="space-y-2">
                    <li>
                        <Link to="/api-reference/plugins" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                            Plugin API
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </li>
                </ul>
            </div>

            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-4">Types</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Dotzee is built with TypeScript and provides comprehensive type definitions for all its APIs.
                    Each API reference page includes detailed type information for parameters and return values.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                    For the most up-to-date and detailed type definitions, refer to the TypeScript declarations
                    in the Dotzee package.
                </p>
            </div>
        </div>
    );
};

export default ApiReferencePage; 
import React from 'react';
import { Link } from 'react-router-dom';

const CoreConceptsPage: React.FC = () => {
    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Core Concepts Overview</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Dotzee is built upon a set of core concepts designed to provide a powerful yet intuitive state
                management solution for React applications. Understanding these concepts is key to leveraging
                Dotzee effectively.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {/* Reactivity Card */}
                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        <Link to="/core-concepts/reactivity" className="hover:text-purple-600 dark:hover:text-purple-400">Reactivity</Link>
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Dotzee's reactivity system, powered by Proxies, automatically tracks changes to your state
                        and updates your components efficiently. Learn about <code>reactive</code>, <code>ref</code>, and <code>computed</code>.
                    </p>
                    <Link to="/core-concepts/reactivity" className="text-purple-600 dark:text-purple-400 hover:underline">
                        Learn more &rarr;
                    </Link>
                </div>

                {/* Stores Card */}
                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        <Link to="/core-concepts/stores" className="hover:text-purple-600 dark:hover:text-purple-400">Defining Stores</Link>
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Stores are the heart of Dotzee. Use <code>defineDotzeeStore</code> to create centralized state containers
                        with either an Options API or a Setup Function API.
                    </p>
                    <Link to="/core-concepts/stores" className="text-purple-600 dark:text-purple-400 hover:underline">
                        Learn more &rarr;
                    </Link>
                </div>

                {/* State Card */}
                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        <Link to="/core-concepts/state" className="hover:text-purple-600 dark:hover:text-purple-400">State</Link>
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Manage your application's data within Dotzee stores. Understand how to define, access,
                        and mutate state directly and reactively.
                    </p>
                    <Link to="/core-concepts/state" className="text-purple-600 dark:text-purple-400 hover:underline">
                        Learn more &rarr;
                    </Link>
                </div>

                {/* Getters Card */}
                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        <Link to="/core-concepts/getters" className="hover:text-purple-600 dark:hover:text-purple-400">Getters</Link>
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Compute derived state from your store's state using getters. They are cached and update
                        automatically when their dependencies change.
                    </p>
                    <Link to="/core-concepts/getters" className="text-purple-600 dark:text-purple-400 hover:underline">
                        Learn more &rarr;
                    </Link>
                </div>

                {/* Actions Card */}
                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        <Link to="/core-concepts/actions" className="hover:text-purple-600 dark:hover:text-purple-400">Actions</Link>
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Encapsulate business logic and asynchronous operations within actions. Actions are methods
                        that mutate state and can be called from your components.
                    </p>
                    <Link to="/core-concepts/actions" className="text-purple-600 dark:text-purple-400 hover:underline">
                        Learn more &rarr;
                    </Link>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg my-8">
                <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-3">Why these concepts matter:</h3>
                <p className="text-gray-700 dark:text-gray-300">
                    Together, these core concepts provide a cohesive and scalable way to manage state.
                    The separation of concerns (state, getters, actions) within stores leads to more maintainable code,
                    while the reactivity system ensures your UI stays in sync with your data effortlessly.
                    Whether you prefer the Options API for its structure or the Setup API for its flexibility,
                    Dotzee aims to make state management a pleasant experience.
                </p>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/quick-start" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Quick Start
                </Link>
                <Link to="/core-concepts/reactivity" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    Next: Reactivity
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default CoreConceptsPage; 
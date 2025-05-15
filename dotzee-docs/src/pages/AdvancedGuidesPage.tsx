import React from 'react';
import { Link } from 'react-router-dom';

const AdvancedGuidesPage: React.FC = () => {
    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Advanced Guides Overview</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Once you're comfortable with the core concepts of Dotzee, these advanced guides will help you
                tackle more complex scenarios, optimize your application, and extend Dotzee's functionality.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {/* SSR Card */}
                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        <Link to="/advanced-guides/ssr" className="hover:text-purple-600 dark:hover:text-purple-400">Server-Side Rendering</Link>
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Learn how to integrate Dotzee with server-side rendering (SSR) frameworks for improved
                        performance and SEO.
                    </p>
                    <Link to="/advanced-guides/ssr" className="text-purple-600 dark:text-purple-400 hover:underline">
                        Learn more &rarr;
                    </Link>
                </div>

                {/* DevTools Card */}
                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        <Link to="/advanced-guides/devtools" className="hover:text-purple-600 dark:hover:text-purple-400">DevTools Integration</Link>
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Master Dotzee's DevTools integration for effective debugging, state inspection, and
                        time-travel debugging.
                    </p>
                    <Link to="/advanced-guides/devtools" className="text-purple-600 dark:text-purple-400 hover:underline">
                        Learn more &rarr;
                    </Link>
                </div>

                {/* Plugins Card */}
                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        <Link to="/advanced-guides/plugins" className="hover:text-purple-600 dark:hover:text-purple-400">Plugins</Link>
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Extend Dotzee's capabilities by creating or using plugins for features like persistence,
                        logging, or custom DevTools.
                    </p>
                    <Link to="/advanced-guides/plugins" className="text-purple-600 dark:text-purple-400 hover:underline">
                        Learn more &rarr;
                    </Link>
                </div>

                {/* TypeScript Card */}
                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        <Link to="/advanced-guides/typescript" className="hover:text-purple-600 dark:hover:text-purple-400">TypeScript Usage</Link>
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Dive deeper into using Dotzee with TypeScript for robust type safety, advanced patterns,
                        and better maintainability in large projects.
                    </p>
                    <Link to="/advanced-guides/typescript" className="text-purple-600 dark:text-purple-400 hover:underline">
                        Learn more &rarr;
                    </Link>
                </div>

                {/* Code Splitting Card */}
                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        <Link to="/advanced-guides/code-splitting" className="hover:text-purple-600 dark:hover:text-purple-400">Code Splitting</Link>
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Optimize your application's loading performance by code-splitting your Dotzee stores
                        and loading them on demand.
                    </p>
                    <Link to="/advanced-guides/code-splitting" className="text-purple-600 dark:text-purple-400 hover:underline">
                        Learn more &rarr;
                    </Link>
                </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg my-8">
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-3">Unlock Dotzee's Full Potential:</h3>
                <p className="text-gray-700 dark:text-gray-300">
                    These advanced guides are designed to empower you to build sophisticated, performant, and
                    maintainable applications with Dotzee. Each guide provides in-depth explanations, practical examples,
                    and best practices to help you make the most of Dotzee's advanced features.
                </p>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/core-concepts/actions" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Actions
                </Link>
                <Link to="/advanced-guides/ssr" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    Next: Server-Side Rendering
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default AdvancedGuidesPage;

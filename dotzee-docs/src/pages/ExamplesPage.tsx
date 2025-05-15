import React from 'react';
import { Link } from 'react-router-dom';

interface ExampleItemProps {
    to: string;
    title: string;
    description: string;
}

const ExampleItem: React.FC<ExampleItemProps> = ({ to, title, description }) => (
    <Link to={to} className="block p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
        <h3 className="mb-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">{title}</h3>
        <p className="font-normal text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
);

const ExamplesPage: React.FC = () => {
    const examples = [
        {
            to: '/examples/counter',
            title: 'Counter Example',
            description: 'A basic counter to demonstrate fundamental state management, actions, and reactivity.'
        },
        {
            to: '/examples/todo',
            title: 'Todo App',
            description: 'A classic Todo application showcasing list management, item manipulation, and computed properties for filtering.'
        },
        {
            to: '/examples/async',
            title: 'Async Actions',
            description: 'Demonstrates handling asynchronous operations like API calls within store actions, including loading and error states.'
        },
        {
            to: '/examples/ssr',
            title: 'SSR Example',
            description: 'Illustrates how to set up and use Dotzee for Server-Side Rendering, including state serialization and hydration.'
        }
    ];

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Dotzee Examples</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Welcome to the Dotzee examples section! Here you'll find practical demonstrations of various features
                and use cases of the Dotzee state management library. Each example is designed to be a hands-on guide
                to help you understand how to effectively use Dotzee in your React applications.
            </p>

            <div className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-5">Available Examples</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {examples.map((example) => (
                        <ExampleItem key={example.to} {...example} />
                    ))}
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-8">
                <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Explore and Learn:</h4>
                <p className="text-gray-700 dark:text-gray-300">
                    We encourage you to explore these examples to see Dotzee in action. You can view the source code,
                    understand the store setup, and see how components interact with the state. These examples will cover
                    everything from basic reactivity to advanced concepts like asynchronous operations and server-side rendering.
                </p>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/api-reference/plugins" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Plugin API
                </Link>
                <Link to="/examples/counter" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    Counter Example
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default ExamplesPage; 
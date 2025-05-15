import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';

// Define the structure for our sidebar navigation
const navigationItems = [
    {
        section: 'Introduction',
        items: [
            { path: '/getting-started', title: 'Getting Started' },
            { path: '/installation', title: 'Installation' },
            { path: '/quick-start', title: 'Quick Start' },
        ]
    },
    {
        section: 'Core Concepts',
        items: [
            { path: '/core-concepts', title: 'Overview' },
            { path: '/core-concepts/reactivity', title: 'Reactivity' },
            { path: '/core-concepts/stores', title: 'Defining Stores' },
            { path: '/core-concepts/state', title: 'State' },
            { path: '/core-concepts/getters', title: 'Getters' },
            { path: '/core-concepts/actions', title: 'Actions' },
        ]
    },
    {
        section: 'Advanced Guides',
        items: [
            { path: '/advanced-guides', title: 'Overview' },
            { path: '/advanced-guides/ssr', title: 'Server-Side Rendering' },
            { path: '/advanced-guides/devtools', title: 'DevTools Integration' },
            { path: '/advanced-guides/plugins', title: 'Plugins' },
            { path: '/advanced-guides/typescript', title: 'TypeScript Usage' },
            { path: '/advanced-guides/code-splitting', title: 'Code Splitting' },
        ]
    },
    {
        section: 'API Reference',
        items: [
            { path: '/api-reference', title: 'Overview' },
            { path: '/api-reference/defineDotzeeStore', title: 'defineDotzeeStore' },
            { path: '/api-reference/useDotzeeStore', title: 'useDotzeeStore' },
            { path: '/api-reference/ref', title: 'ref' },
            { path: '/api-reference/computed', title: 'computed' },
            { path: '/api-reference/devtools', title: 'DevTools' },
            { path: '/api-reference/ssr', title: 'SSR Utilities' },
            { path: '/api-reference/plugins', title: 'Plugin API' },
        ]
    },
    {
        section: 'Examples',
        items: [
            { path: '/examples', title: 'Overview' },
            { path: '/examples/counter', title: 'Counter' },
            { path: '/examples/todo', title: 'Todo App' },
            { path: '/examples/async', title: 'Async Actions' },
            { path: '/examples/ssr', title: 'SSR Example' },
        ]
    }
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
    const location = useLocation();

    // Function to determine if a section should be expanded
    const isSectionActive = (items: { path: string }[]) => {
        return items.some(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));
    };

    // Different styling for mobile vs desktop
    const sidebarClasses = `
        h-full
        bg-white border-r border-gray-100
        dark:bg-gray-900 dark:border-gray-800
        flex flex-col
        ${onClose // If onClose is provided, it's a mobile sidebar
            ? `fixed left-0 top-0 z-50 w-72 h-screen
               transform transition-transform duration-300 ease-in-out
               ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'w-full h-full'
        }
    `;

    return (
        <aside className={sidebarClasses}>
            {/* Logo section - fixed height to match header */}
            <div className="flex-shrink-0 flex items-center h-[65px] px-6 space-x-3 border-b border-gray-100 dark:border-gray-800">
                <div className="h-10 w-10 rounded-md bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">Z</span>
                </div>
                <Link to="/" className="text-xl font-semibold text-gray-800 dark:text-white">
                    Dotzee
                    <span className="ml-2 text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                        docs
                    </span>
                </Link>
            </div>

            {/* Scrollable navigation */}
            <div className="flex-grow overflow-y-auto sidebar-scroll">
                <nav className="p-4 px-6">
                    {navigationItems.map((section, index) => (
                        <div key={index} className="mb-6">
                            <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3 px-3 dark:text-gray-400">
                                {section.section}
                            </h3>
                            <ul className="space-y-1">
                                {section.items.map((item, itemIndex) => (
                                    <li key={itemIndex}>
                                        <NavLink
                                            to={item.path}
                                            className={({ isActive }) => `
                                                block px-3 py-2 rounded-md text-sm font-medium
                                                ${isActive
                                                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'}
                                                transition-colors duration-200
                                            `}
                                        >
                                            {item.title}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Mobile close button */}
            {isOpen && onClose && (
                <button
                    onClick={onClose}
                    className="fixed top-4 right-4 p-2 rounded-full bg-white shadow-md text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    aria-label="Close sidebar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </aside>
    );
};

export default Sidebar; 
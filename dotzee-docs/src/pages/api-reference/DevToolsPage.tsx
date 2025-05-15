import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const DevToolsPage: React.FC = () => {
    const basicExample = `import { enableDotzeeDevTools } from 'dotzee';

// Enable DevTools in your application's entry point
enableDotzeeDevTools();

// Optionally provide configuration options
enableDotzeeDevTools({
  logStoreCreation: true,
  logActions: true,
  logStateChanges: true,
  maxAge: 50 // Limit history to last 50 actions
});`;

    const setupExampleWithNextJs = `// In a Next.js app, you might want to load DevTools only in client-side code
// app/components/DevToolsProvider.tsx
'use client';

import { useEffect } from 'react';

export function DevToolsProvider({ children }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Dynamically import to avoid SSR issues
      import('dotzee').then(({ enableDotzeeDevTools }) => {
        enableDotzeeDevTools();
      });
    }
  }, []);
  
  return children;
}`;

    const setupExampleWithVite = `// In a Vite app, you can use environment variables to control DevTools loading
// main.tsx or main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { enableDotzeeDevTools } from 'dotzee';

// Only enable in development mode
if (import.meta.env.DEV) {
  enableDotzeeDevTools();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

    const extensionInstallExample = `// DevTools requires the Redux DevTools browser extension
// Without it, the enableDotzeeDevTools() call will have no effect

// The extension can be installed from:
// Chrome: https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd
// Firefox: https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/`;

    const advancedConfigExample = `// Advanced configuration for DevTools
import { enableDotzeeDevTools } from 'dotzee';

enableDotzeeDevTools({
  // Core settings
  enabled: process.env.NODE_ENV === 'development',
  logStoreCreation: true,
  logActions: true,
  logStateChanges: true,
  
  // Redux DevTools specific settings
  trace: true, // Capture call stack traces when actions are dispatched
  traceLimit: 10, // Max number of stack frames to capture
  maxAge: 50, // Max number of actions to keep in history
  
  // Custom formatters
  actionSanitizer: (action) => {
    // Sanitize sensitive data from actions before sending to DevTools
    if (action.type === 'user/login' && action.payload?.password) {
      return {
        ...action,
        payload: { ...action.payload, password: '***' }
      };
    }
    return action;
  },
  
  stateSanitizer: (state) => {
    // Sanitize sensitive data from state before sending to DevTools
    if (state.user?.token) {
      return {
        ...state,
        user: { ...state.user, token: '***' }
      };
    }
    return state;
  }
});`;

    const typeSignature = `function enableDotzeeDevTools(options?: DevToolsOptions): void

interface DevToolsOptions {
  enabled?: boolean;
  logStoreCreation?: boolean;
  logActions?: boolean;
  logStateChanges?: boolean;
  maxAge?: number;
  trace?: boolean;
  traceLimit?: number;
  actionSanitizer?: (action: any) => any;
  stateSanitizer?: (state: any) => any;
}`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">DevTools</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Dotzee's DevTools integration provides powerful debugging capabilities by connecting to the
                Redux DevTools Extension. This allows you to inspect your store's state, track actions,
                and even time-travel debug your application.
            </p>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Type Signature</h2>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto mb-6">
                    <CodeBlock
                        code={typeSignature}
                        language="typescript"
                        filename="dotzee.d.ts"
                    />
                </div>

                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Parameters</h3>

                <div className="overflow-x-auto mb-6">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Parameter</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Default</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">options</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">DevToolsOptions</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{ }</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    An optional configuration object with settings for the DevTools integration.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">options.enabled</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">boolean</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">true</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Whether DevTools integration is enabled.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">options.logStoreCreation</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">boolean</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">true</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Whether to log when stores are created.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">options.logActions</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">boolean</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">true</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Whether to log when actions are dispatched.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">options.logStateChanges</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">boolean</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">true</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Whether to log state changes.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Return Value</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    This function doesn't return a value. It sets up the connection to Redux DevTools Extension and
                    configures how Dotzee stores interact with it.
                </p>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Basic Usage</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    To enable DevTools integration, simply call <code>enableDotzeeDevTools()</code> in your application's entry point:
                </p>

                <CodeBlock
                    code={basicExample}
                    language="typescript"
                    filename="main.ts"
                />

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Prerequisites:</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                        You need to have the Redux DevTools extension installed in your browser for this to work.
                        The extension is available for Chrome, Firefox, and other browsers.
                    </p>
                    <CodeBlock
                        code={extensionInstallExample}
                        language="typescript"
                    />
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Framework-Specific Setup</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Here are examples of setting up DevTools in different React frameworks:
                </p>

                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Next.js (App Router)</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    In Next.js with the App Router, you need to be careful with SSR/CSR:
                </p>
                <CodeBlock
                    code={setupExampleWithNextJs}
                    language="typescript"
                    filename="app/components/DevToolsProvider.tsx"
                />

                <h3 className="text-xl font-medium text-gray-900 dark:text-white mt-6 mb-3">Vite</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    In a Vite application, you can use environment variables:
                </p>
                <CodeBlock
                    code={setupExampleWithVite}
                    language="typescript"
                    filename="main.tsx"
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Best Practices:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Only enable DevTools in development mode to keep production builds lean.</li>
                        <li className="mb-2">In SSR frameworks, ensure DevTools are only initialized on the client side.</li>
                        <li className="mb-2">Consider using environment variables to conditionally enable DevTools.</li>
                        <li className="mb-2">Initialize DevTools as early as possible in your application lifecycle.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Advanced Configuration</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    You can customize the DevTools behavior with additional options:
                </p>

                <CodeBlock
                    code={advancedConfigExample}
                    language="typescript"
                    filename="devtools-config.ts"
                />

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">Advanced Options:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2"><strong>trace:</strong> Capture call stack traces for actions (useful for debugging).</li>
                        <li className="mb-2"><strong>traceLimit:</strong> Limit the number of stack frames captured.</li>
                        <li className="mb-2"><strong>maxAge:</strong> Limit the number of actions kept in history (helps with memory usage).</li>
                        <li className="mb-2"><strong>actionSanitizer:</strong> Function to sanitize sensitive data from actions before sending to DevTools.</li>
                        <li className="mb-2"><strong>stateSanitizer:</strong> Function to sanitize sensitive data from state before sending to DevTools.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">DevTools Features</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Once connected, Redux DevTools provides several powerful debugging features:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-green-600 dark:text-green-400 mb-3">State Inspection</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>View the current state of all stores</li>
                            <li>Inspect nested state structures</li>
                            <li>See state changes highlighted</li>
                            <li>Search and filter state values</li>
                            <li>Copy state values to clipboard</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400 mb-3">Action Tracking</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>See all dispatched actions</li>
                            <li>View action payloads</li>
                            <li>Track when actions occurred</li>
                            <li>Filter actions by type</li>
                            <li>View stack traces (if enabled)</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-purple-600 dark:text-purple-400 mb-3">Time Travel</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>"Jump" to any previous state</li>
                            <li>Step backward and forward through actions</li>
                            <li>Replay sequences of actions</li>
                            <li>Reset to initial state</li>
                            <li>Visualize state changes over time</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-orange-600 dark:text-orange-400 mb-3">Additional Tools</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Import/export actions and state</li>
                            <li>Generate tests from action sequences</li>
                            <li>Persist debugging sessions</li>
                            <li>Chart state changes</li>
                            <li>Custom action formatters</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Best Practices</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-green-600 dark:text-green-400 mb-3">Do</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Enable DevTools only in development builds</li>
                            <li>Use sanitizers to protect sensitive data</li>
                            <li>Set a reasonable maxAge to prevent memory issues</li>
                            <li>Organize your stores with clear naming conventions</li>
                            <li>Use action names that clearly describe their purpose</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-red-600 dark:text-red-400 mb-3">Avoid</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Enabling DevTools in production builds</li>
                            <li>Storing sensitive information in state without sanitization</li>
                            <li>Excessive action dispatching that floods the DevTools</li>
                            <li>Storing non-serializable values in state (they won't be properly displayed)</li>
                            <li>Relying solely on DevTools for debugging complex issues</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">See Also</h2>

                <ul className="space-y-2">
                    <li>
                        <Link to="/advanced-guides/devtools" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            DevTools Integration - Detailed guide on working with DevTools
                        </Link>
                    </li>
                    <li>
                        <Link to="/api-reference/defineDotzeeStore" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            defineDotzeeStore - Creating store definitions
                        </Link>
                    </li>
                    <li>
                        <Link to="/advanced-guides/plugins" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            Plugins - Extending Dotzee's functionality
                        </Link>
                    </li>
                    <li>
                        <Link to="/advanced-guides/ssr" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            Server-Side Rendering - Using Dotzee with SSR
                        </Link>
                    </li>
                </ul>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/api-reference/computed" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    computed
                </Link>
                <Link to="/api-reference/ssr" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    SSR Utilities
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default DevToolsPage; 
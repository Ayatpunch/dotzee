import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const PluginsPage: React.FC = () => {
    const pluginExample = `import { defineDotzeePlugin } from 'dotzee';

// Create a simple logger plugin
const loggerPlugin = defineDotzeePlugin({
  name: 'logger',
  
  // Called when the plugin is installed
  setup(context) {
    console.log('Logger plugin installed');
    
    // Subscribe to all store changes
    context.onStoreCreated(({ store, storeId }) => {
      console.log(\`Store created: \${storeId}\`);
      
      // Add hooks for all actions
      context.onAction(({ storeId, actionName, args }) => {
        console.log(\`Action \${storeId}/\${actionName} called with args:\`, args);
});

context.afterAction(({ storeId, actionName, result }) => {
    console.log(\`Action \${storeId}/\${actionName} completed with result:\`, result);
});
    });
  }
});

// Usage in your application
import { useDotzeePlugin } from 'dotzee';

// Install the plugin
useDotzeePlugin(loggerPlugin); `;

    const persistencePluginExample = `import { defineDotzeePlugin } from 'dotzee';

// Create a localStorage persistence plugin
export const persistencePlugin = defineDotzeePlugin({
    name: 'persistence',

    // Plugin options with defaults
    options: {
        key: 'dotzee-state',
        storage: localStorage, // could be sessionStorage or a custom implementation
        blacklist: [] as string[], // store IDs to exclude
        whitelist: [] as string[], // if not empty, only these store IDs will be persisted
        debounce: 200, // ms to wait before saving
    },

    // Plugin setup
    setup(context) {
        const { options } = context;
        let debounceTimer: number | null = null;

        // Load stored state during initialization
        try {
            const savedState = options.storage.getItem(options.key);
            if (savedState) {
                const parsedState = JSON.parse(savedState);

                // Apply saved state to stores
                for (const storeId in parsedState) {
                    if (
                        (options.whitelist.length === 0 || options.whitelist.includes(storeId)) &&
                        !options.blacklist.includes(storeId)
                    ) {
                        const store = context.getStore(storeId);
                        if (store) {
                            Object.assign(store, parsedState[storeId]);
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Error loading persisted state:', err);
        }

        // Subscribe to store changes to save state
        const saveState = () => {
            // Get all stores from registry
            const stores = context.getStores();
            const state: Record<string, any> = {};

            // Only persist stores that match our whitelist/blacklist rules
            for (const [storeId, store] of Object.entries(stores)) {
                if (
                    (options.whitelist.length === 0 || options.whitelist.includes(storeId)) &&
                    !options.blacklist.includes(storeId)
                ) {
                    // Just get raw state without getters/actions/computeds
                    state[storeId] = context.getStateSnapshot(storeId);
                }
            }

            // Save to storage
            options.storage.setItem(options.key, JSON.stringify(state));
        };

        // Debounced save to avoid too many writes
        const debouncedSave = () => {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(saveState, options.debounce);
        };

        // Subscribe to all stores
        context.onStoreCreated(({ store, storeId }) => {
            if (
                (options.whitelist.length === 0 || options.whitelist.includes(storeId)) &&
                !options.blacklist.includes(storeId)
            ) {
                // Subscribe to all store changes
                const unsubscribe = context.subscribeToStore(storeId, debouncedSave);

                // Clean up on plugin uninstall
                context.onPluginCleanup(() => {
                    unsubscribe();
                    if (debounceTimer) clearTimeout(debounceTimer);
                });
            }
        });
    }
});

// Usage in your application
import { useDotzeePlugin } from 'dotzee';
import { persistencePlugin } from './plugins/persistence';

// Install the plugin with custom options
useDotzeePlugin(persistencePlugin, {
    key: 'my-app-state',
    whitelist: ['user', 'preferences'],
    debounce: 500
}); `;

    const definePluginSignature = `function defineDotzeePlugin<Options = {}>(
    plugin: {
        name: string;
        options?: Options;
        setup: (context: PluginContext<Options>) => void;
    }
): DotzeePlugin<Options>; `;

    const usePluginSignature = `function useDotzeePlugin<Options>(
    plugin: DotzeePlugin<Options>,
    options?: Partial<Options>
): void; `;

    const pluginContextSignature = `interface PluginContext<Options = {}> {
    // Plugin info
    name: string;
    options: Options;

    // Store registry access
    getStore(storeId: string): any;
    getStores(): Record<string, any>;
    getStateSnapshot(storeId: string): Record<string, any>;

    // Event hooks
    onStoreCreated(callback: (payload: {
        store: any;
        storeId: string;
        options?: any;
    }) => void): void;

    onAction(callback: (payload: {
        storeId: string;
        actionName: string;
        args: any[];
    }) => void): void;

    afterAction(callback: (payload: {
        storeId: string;
        actionName: string;
        args: any[];
        result: any;
    }) => void): void;

    // Subscriptions
    subscribeToStore(storeId: string, callback: () => void): () => void;

    // Cleanup
    onPluginCleanup(callback: () => void): void;
}`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Plugin API</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Dotzee provides a flexible plugin system that lets you extend the core functionality
                of the library. Plugins can subscribe to store lifecycle events, add new functionality
                to stores, and provide global features like persistence, logging, or DevTools integration.
            </p>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Overview</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    The Dotzee plugin system is built around three main concepts:
                </p>

                <div className="grid md:grid-cols-3 gap-5 mb-6">
                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="text-purple-600 dark:text-purple-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3a1 1 0 00-1-1H1a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H1a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4a1 1 0 011-1h3a1 1 0 011 1v1a2 2 0 104 0V4z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Plugin Definition</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Define plugins with <code>defineDotzeePlugin</code>, including setup logic and options
                        </p>
                    </div>

                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="text-blue-600 dark:text-blue-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Plugin Context</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            An API passed to the plugin's setup function providing hooks and store access
                        </p>
                    </div>

                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="text-green-600 dark:text-green-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Plugin Installation</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Install plugins with <code>useDotzeePlugin</code>, optionally passing custom options
                        </p>
                    </div>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Defining a Plugin</h2>

                <h3 className="text-xl font-medium text-gray-900 dark:text-white my-3">defineDotzeePlugin</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto mb-6">
                    <CodeBlock
                        code={definePluginSignature}
                        language="typescript"
                    />
                </div>

                <div className="overflow-x-auto mb-6">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Parameter</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">plugin</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">object</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    An object defining the plugin structure with <code>name</code>, optional <code>options</code>, and a <code>setup</code> function.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">plugin.name</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">string</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    A unique identifier for the plugin.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">plugin.options</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Options (generic)</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    An optional default options object for the plugin.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">plugin.setup</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">function</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    A function that receives the PluginContext and contains the plugin's logic.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Return Value</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    Returns a plugin object that can be passed to <code>useDotzeePlugin</code>.
                </p>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Here's a simple example of defining a logger plugin:
                </p>

                <CodeBlock
                    code={pluginExample}
                    language="typescript"
                    filename="loggerPlugin.ts"
                />
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Plugin Context</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    The plugin context is an object passed to your plugin's <code>setup</code> function. It provides
                    methods for interacting with stores, accessing the registry, and hooking into lifecycle events.
                </p>

                <h3 className="text-xl font-medium text-gray-900 dark:text-white my-3">PluginContext Interface</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto mb-6">
                    <CodeBlock
                        code={pluginContextSignature}
                        language="typescript"
                    />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Key Context Methods:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2"><strong>onStoreCreated:</strong> Called when a store is created, providing access to the store instance</li>
                        <li className="mb-2"><strong>onAction:</strong> Called before an action is executed</li>
                        <li className="mb-2"><strong>afterAction:</strong> Called after an action completes, with access to the result</li>
                        <li className="mb-2"><strong>subscribeToStore:</strong> Subscribe to any store's changes</li>
                        <li className="mb-2"><strong>getStore/getStores:</strong> Access store instances directly</li>
                        <li className="mb-2"><strong>getStateSnapshot:</strong> Get a serializable snapshot of a store's raw state</li>
                        <li className="mb-2"><strong>onPluginCleanup:</strong> Register cleanup functions to be called when the plugin is uninstalled</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Installing Plugins</h2>

                <h3 className="text-xl font-medium text-gray-900 dark:text-white my-3">useDotzeePlugin</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto mb-6">
                    <CodeBlock
                        code={usePluginSignature}
                        language="typescript"
                    />
                </div>

                <div className="overflow-x-auto mb-6">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Parameter</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">plugin</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">DotzeePlugin&lt;Options&gt;</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    A plugin created with <code>defineDotzeePlugin</code>.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">options</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Partial&lt;Options&gt;</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Optional custom options to override the plugin's default options.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">When to Install Plugins:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Install plugins as early as possible in your application, before any store usage.</li>
                        <li className="mb-2">For client-side applications, this is usually in your main entry file.</li>
                        <li className="mb-2">For SSR applications, install plugins after hydration on the client-side.</li>
                        <li className="mb-2">You can conditionally install plugins (e.g., only in development or production).</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Example: Persistence Plugin</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Here's a more complex example of a plugin that persists store state to localStorage:
                </p>

                <CodeBlock
                    code={persistencePluginExample}
                    language="typescript"
                    filename="persistencePlugin.ts"
                />

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">Key Features of the Persistence Plugin:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Customizable options for storage mechanism, key, whitelist/blacklist</li>
                        <li className="mb-2">Loads persisted state during plugin initialization</li>
                        <li className="mb-2">Debounced saving to avoid excessive storage operations</li>
                        <li className="mb-2">Subscribes only to stores matching the whitelist/blacklist rules</li>
                        <li className="mb-2">Properly cleans up on plugin uninstallation</li>
                        <li className="mb-2">Handles error cases when loading from storage</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Creating Common Plugin Types</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">State Persistence</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                            Plugins that save and restore state:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>localStorage/sessionStorage persistence</li>
                            <li>IndexedDB for larger state</li>
                            <li>Remote state synchronization</li>
                            <li>State migration between versions</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Debugging & Monitoring</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                            Plugins for development and monitoring:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Action loggers</li>
                            <li>Performance monitoring</li>
                            <li>State snapshots</li>
                            <li>Custom DevTools panels</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Feature Extensions</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                            Plugins that add new capabilities:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Undo/redo functionality</li>
                            <li>Form state management</li>
                            <li>Router integration</li>
                            <li>State encryption</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Store Lifecycles</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                            Plugins for store management:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Hot module replacement</li>
                            <li>Store reset utilities</li>
                            <li>State initialization</li>
                            <li>Lazy-loaded store coordination</li>
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
                            <li>Give plugins descriptive, unique names</li>
                            <li>Provide clear default options</li>
                            <li>Register cleanup functions with onPluginCleanup</li>
                            <li>Document plugin options and behavior</li>
                            <li>Design plugins to handle store lazy-loading</li>
                            <li>Make plugins composable with each other</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-red-600 dark:text-red-400 mb-3">Avoid</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Modifying store structure (adding methods/properties) without clear naming</li>
                            <li>Making assumptions about store implementation details</li>
                            <li>Keeping large amounts of state in the plugin itself</li>
                            <li>Creating tight dependencies between plugins</li>
                            <li>Using side effects that can't be cleaned up</li>
                            <li>Performance-intensive operations in action hooks</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">See Also</h2>

                <ul className="space-y-2">
                    <li>
                        <Link to="/advanced-guides/plugins" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            Plugins Guide - In-depth walkthrough of creating and using plugins
                        </Link>
                    </li>
                    <li>
                        <Link to="/api-reference/devtools" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            DevTools - Built using the plugin system
                        </Link>
                    </li>
                    <li>
                        <Link to="/api-reference/defineDotzeeStore" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            defineDotzeeStore - Creating store definitions for plugins to hook into
                        </Link>
                    </li>
                    <li>
                        <Link to="/examples" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            Examples - See plugins in action in example applications
                        </Link>
                    </li>
                </ul>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/api-reference/ssr" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    SSR Utilities
                </Link>
                <Link to="/examples" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    Examples
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default PluginsPage; 
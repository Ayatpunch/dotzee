import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const PluginsPage: React.FC = () => {
    const createPluginExample = `// src/plugins/myLoggerPlugin.ts
import { DotzeePlugin } from 'dotzee';

export const myLoggerPlugin: DotzeePlugin = {
  // Plugin name (required)
  name: 'myLoggerPlugin',
  
  // Called when a plugin is installed
  onInstall({ stores, addGlobalHook }: any) { // Added : any to suppress implicit any for demo
    console.log('MyLogger plugin installed');
    
    // Add hooks to run before/after every action globally
    addGlobalHook({
      beforeAction({ storeId, actionName, args }: any) { // Added : any
        console.log(\\\`[Store: \${storeId}] Action \${actionName} called with:\\\`, args);
      },
      afterAction({ storeId, actionName, args, result }: any) { // Added : any
        console.log(\\\`[Store: \${storeId}] Action \${actionName} completed with result:\\\`, result);
      }
    });
  },
  
  // Called when a new store is created
  onStoreCreated({ storeId, storeInstance }: any) { // Added : any
    console.log(\\\`Store created: \${storeId}\\\`);
    // You can extend the store instance here if needed
  }
};`;

    const usePluginExample = `// In your main entry file (e.g. main.tsx)
import { useDotzeePlugin } from 'dotzee';
import { myLoggerPlugin } from './plugins/myLoggerPlugin';
import { persistencePlugin } from './plugins/persistencePlugin';

// Install plugins
useDotzeePlugin(myLoggerPlugin);
useDotzeePlugin(persistencePlugin, { storage: localStorage, key: 'app-state' });

// Now continue with your app initialization
// ...`;

    const persistencePluginExample = `// src/plugins/persistencePlugin.ts
import { DotzeePlugin } from 'dotzee';

type PersistenceOptions = {
  // Storage to use (localStorage, sessionStorage, or custom)
  storage: Storage;
  // Key prefix for storage
  key: string;
  // Optional: Stores to persist (if not specified, all stores are persisted)
  stores?: string[];
  // Optional: Debounce duration in ms (default: 100)
  debounce?: number;
};

export function createPersistencePlugin(options: PersistenceOptions): DotzeePlugin {
  const { storage, key, stores, debounce = 100 } = options;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  
  const shouldPersistStore = (storeId: string) => {
    return !stores || stores.includes(storeId);
  };
  
  return {
    name: 'persistencePlugin',
    
    onInstall({ getGlobalSnapshot }: any) { // Added : any
      // Attempt to hydrate state from storage
      try {
        const savedState = storage.getItem(\\\`\${key}-dotzee\\\`);
        if (savedState) {
          const state = JSON.parse(savedState);
          // Apply saved state to stores
          // Your code to hydrate state would go here
          console.log('Hydrated state from storage');
        }
      } catch (err) {
        console.error('Failed to hydrate state from storage', err);
      }
      
      // Set up event listener for beforeunload to ensure state is saved
      window.addEventListener('beforeunload', () => {
        const state = getGlobalSnapshot();
        storage.setItem(\\\`\${key}-dotzee\\\`, JSON.stringify(state));
      });
    },
    
    onStoreCreated({ storeId, subscribe }: any) { // Added : any
      // Skip if this store shouldn't be persisted
      if (!shouldPersistStore(storeId)) return;
      
      // Subscribe to store changes
      subscribe(() => {
        // Debounce to avoid excessive writes
        if (debounceTimer) clearTimeout(debounceTimer);
        
        debounceTimer = setTimeout(() => {
          // Save only this store's state
          try {
            const storeKey = \\\`\${key}-\${storeId}\\\`;
            storage.setItem(storeKey, JSON.stringify({ /* store state */ }));
          } catch (err) {
            console.error(\\\`Failed to persist store \${storeId}\\\`, err);
          }
        }, debounce);
      });
    }
  };
}

// Export a pre-configured plugin with localStorage
export const persistencePlugin = (options: Omit<PersistenceOptions, 'storage'>) => 
  createPersistencePlugin({ ...options, storage: localStorage });`;

    const extendStoreExample = `// Custom plugin that extends store instances with new properties
import { DotzeePlugin } from 'dotzee';

export const analyticsPlugin: DotzeePlugin = {
  name: 'analyticsPlugin',
  
  onStoreCreated({ storeId, storeInstance }: any) { // Added : any
    // Add new methods to the store instance
    Object.assign(storeInstance, {
      // Track an action with analytics
      trackEvent(eventName: string, eventData: any) {
        console.log(\\\`[Analytics] \${eventName}\\\`, eventData);
        // In a real implementation, you'd send this to your analytics service
        // analytics.track(eventName, eventData);
      }
    });
  }
};

// Usage in a component:
function UserProfile() {
  const userStore = useUserStore();
  
  const handleLogin = async () => {
    await userStore.login(username, password);
    
    // Access the extended method added by the plugin
    userStore.trackEvent('user_login', { username });
  };
}`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Plugins</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Dotzee\'s plugin system allows you to extend its functionality, add cross-cutting concerns, and
                integrate with external services without modifying the core state management logic of your application.
            </p>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Plugin System Overview</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Plugins in Dotzee are objects that hook into various lifecycle events of stores and actions.
                    They can:
                </p>

                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li>Execute code when they\'re installed</li>
                    <li>React to store creation</li>
                    <li>Intercept and modify actions before/after they run</li>
                    <li>Extend store instances with additional properties and methods</li>
                    <li>Subscribe to state changes</li>
                    <li>Access the global state</li>
                </ul>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">Common Use Cases for Plugins:</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-1">State Persistence</h5>
                            <p className="text-gray-700 dark:text-gray-300">Save and restore state to/from localStorage, IndexedDB, or remote storage</p>
                        </div>
                        <div>
                            <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-1">Logging</h5>
                            <p className="text-gray-700 dark:text-gray-300">Log actions and state changes for debugging</p>
                        </div>
                        <div>
                            <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-1">Analytics</h5>
                            <p className="text-gray-700 dark:text-gray-300">Track user actions and state changes for analytics purposes</p>
                        </div>
                        <div>
                            <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-1">Error Handling</h5>
                            <p className="text-gray-700 dark:text-gray-300">Centralized error tracking and reporting</p>
                        </div>
                        <div>
                            <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-1">Undo/Redo</h5>
                            <p className="text-gray-700 dark:text-gray-300">Implement history and undo/redo functionality</p>
                        </div>
                        <div>
                            <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-1">Middleware</h5>
                            <p className="text-gray-700 dark:text-gray-300">Add custom middleware for validation, throttling, etc.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Creating a Plugin</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    A Dotzee plugin is an object that conforms to the <code>DotzeePlugin</code> interface. At minimum,
                    it must have a unique <code>name</code> property and implement at least one of the lifecycle hooks.
                </p>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Here\'s an example of a simple logger plugin:
                </p>

                <CodeBlock
                    code={createPluginExample}
                    language="typescript"
                    filename="src/plugins/myLoggerPlugin.ts"
                />

                <div className="space-y-4 mt-6">
                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Plugin Lifecycle Hooks</h3>
                        <dl className="space-y-3">
                            <div>
                                <dt className="font-semibold text-gray-800 dark:text-gray-200">onInstall(context)</dt>
                                <dd className="text-gray-700 dark:text-gray-300">
                                    Called when the plugin is installed via <code>useDotzeePlugin</code>. Receives a context with
                                    global utilities and access to existing stores.
                                </dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-gray-800 dark:text-gray-200">onStoreCreated(context)</dt>
                                <dd className="text-gray-700 dark:text-gray-300">
                                    Called whenever a new store is created. Receives context with the store ID, instance, and
                                    a <code>subscribe</code> function to listen for store changes.
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Global Hooks API</h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                            You can add global hooks that run for all stores and actions using the <code>addGlobalHook</code> function:
                        </p>
                        <dl className="space-y-3">
                            <div>
                                <dt className="font-semibold text-gray-800 dark:text-gray-200">beforeAction({'{'} storeId, actionName, args {'}'})</dt>
                                <dd className="text-gray-700 dark:text-gray-300">
                                    Called before an action runs. You can access the store ID, action name, and arguments.
                                </dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-gray-800 dark:text-gray-200">afterAction({'{'} storeId, actionName, args, result {'}'})</dt>
                                <dd className="text-gray-700 dark:text-gray-300">
                                    Called after an action completes. Includes the action\'s result (if any).
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Using Plugins</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    To use a plugin in your Dotzee application, call <code>useDotzeePlugin</code> during your app\'s initialization:
                </p>

                <CodeBlock
                    code={usePluginExample}
                    language="typescript"
                    filename="main.tsx"
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Important Notes:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Install plugins <strong>before</strong> creating any stores for the plugins to work properly with all stores.</li>
                        <li className="mb-2">You can pass configuration options as a second parameter to <code>useDotzeePlugin</code>.</li>
                        <li className="mb-2">Plugins are applied in the order they are installed, which can matter for plugins that might interact.</li>
                        <li className="mb-2">Consider conditionally applying plugins based on environment (e.g., development vs. production).</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Example: Persistence Plugin</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Here\'s a more complex example of a persistence plugin that saves store state to storage (e.g., localStorage):
                </p>

                <CodeBlock
                    code={persistencePluginExample}
                    language="typescript"
                    filename="src/plugins/persistencePlugin.ts"
                />

                <p className="mt-4 text-gray-700 dark:text-gray-300">
                    This plugin demonstrates how to:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 mb-6">
                    <li>Create a configurable plugin with options</li>
                    <li>Hydrate state from storage on plugin installation</li>
                    <li>Subscribe to store changes for real-time persistence</li>
                    <li>Implement debouncing to avoid excessive writes</li>
                    <li>Handle errors gracefully</li>
                </ul>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Extending Store Functionality</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Plugins can extend store instances with additional properties and methods, effectively adding new capabilities
                    to your stores without modifying their original definitions:
                </p>

                <CodeBlock
                    code={extendStoreExample}
                    language="typescript"
                    filename="src/plugins/analyticsPlugin.ts"
                />

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Extending Stores vs. Using Global Hooks:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2"><strong>Extending stores</strong> is useful when you want to add methods that components can directly call (like <code>userStore.trackEvent()</code>).</li>
                        <li className="mb-2"><strong>Global hooks</strong> are better for automatically running code in response to actions without requiring component changes (like logging all actions).</li>
                        <li className="mb-2">Consider using TypeScript to add proper types for your store extensions, ensuring good IDE support.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Best Practices</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-green-600 dark:text-green-400 mb-3">Do</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Give plugins unique, descriptive names</li>
                            <li>Make plugins configurable when appropriate</li>
                            <li>Handle errors gracefully within plugins</li>
                            <li>Consider performance impacts (e.g., debounce store subscriptions)</li>
                            <li>Document the purpose and usage of your plugins</li>
                            <li>Use TypeScript for better type safety</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-red-600 dark:text-red-400 mb-3">Avoid</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Modifying core Dotzee behavior in unexpected ways</li>
                            <li>Creating plugins with side effects that could interfere with each other</li>
                            <li>Adding too many plugins that could impact performance</li>
                            <li>Storing sensitive information in persistent state</li>
                            <li>Overwriting existing store methods (extend instead)</li>
                            <li>Complex logic in plugin hooks (extract to helper functions)</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/advanced-guides/devtools" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    DevTools Integration
                </Link>
                <Link to="/advanced-guides/typescript" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    TypeScript Usage
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default PluginsPage;

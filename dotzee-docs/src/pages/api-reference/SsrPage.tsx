import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const SsrPage: React.FC = () => {
    const serializeExample = `import { serializeDotzeeState, getGlobalDotzeeRegistry } from 'dotzee';

// Server-side code
export async function getServerSideProps() {
  // Create and populate your stores on the server
  
  // Get the global registry (or a request-scoped registry)
  const registry = getGlobalDotzeeRegistry();
  
  // Serialize the state from all stores in the registry
  const serializedState = serializeDotzeeState(registry);
  
  return {
    props: {
      initialDotzeeState: serializedState
    }
  };
}`;

    const hydrateExample = `import { hydrateDotzeeState, getGlobalDotzeeRegistry } from 'dotzee';
import { useEffect } from 'react';

// Client-side component
export default function App({ initialDotzeeState }) {
  useEffect(() => {
    // Only run once on mount
    if (initialDotzeeState) {
      const registry = getGlobalDotzeeRegistry();
      
      // Hydrate the client-side stores with server state
      hydrateDotzeeState(registry, initialDotzeeState);
      
      // After hydration, you can enable DevTools
      // enableDotzeeDevTools(registry);
    }
  }, [initialDotzeeState]);
  
  return <YourApp />;
}`;

    const registryExample = `import { 
  createDotzeeRegistry, 
  setActiveDotzeeRegistry, 
  resetActiveDotzeeRegistry 
} from 'dotzee';

// In a server environment (e.g., Next.js App Router)
export async function generateMetadata() {
  // Create a new registry for this request
  const registry = createDotzeeRegistry();
  
  // Make it the active registry for store definitions
  setActiveDotzeeRegistry(registry);
  
  // Import and use your stores to populate initial state
  // This ensures store definitions run in the registry context
  const { useUserStore } = await import('../stores/userStore');
  
  // Access the store instance directly from the registry if needed
  const userStore = registry.get('user');
  
  // Get serialized state for client
  const serializedState = serializeDotzeeState(registry);
  
  // Reset the registry to avoid state leaks between requests
  resetActiveDotzeeRegistry();
  
  return {
    // Pass serialized state to the page
    props: { initialDotzeeState: serializedState }
  };
}`;

    const nextJsExample = `// app/page.tsx (Server Component in Next.js App Router)
import { 
  createDotzeeRegistry, 
  setActiveDotzeeRegistry, 
  resetActiveDotzeeRegistry, 
  serializeDotzeeState 
} from 'dotzee';
import ClientPage from '../components/ClientPage';
import { useCounterStore } from '../stores/counterStore';

export default async function Page() {
  // Create a new registry for this request
  const registry = createDotzeeRegistry();
  
  // Set it as active for store definitions
  setActiveDotzeeRegistry(registry);
  
  // This runs the store definition in the server context
  // and registers it with our request-scoped registry
  useCounterStore;
  
  // Serialize state for client hydration
  const initialState = serializeDotzeeState(registry);
  
  // Reset the active registry
  resetActiveDotzeeRegistry();
  
  return (
    <main>
      <h1>Server-Side Rendering Example</h1>
      <ClientPage initialDotzeeState={initialState} />
    </main>
  );
}

// components/ClientPage.tsx (Client Component)
'use client';

import { useEffect } from 'react';
import { 
  hydrateDotzeeState, 
  getGlobalDotzeeRegistry, 
  enableDotzeeDevTools 
} from 'dotzee';
import { useCounterStore } from '../stores/counterStore';

export default function ClientPage({ initialDotzeeState }) {
  const counterStore = useCounterStore();
  
  useEffect(() => {
    // Run once on mount
    const registry = getGlobalDotzeeRegistry();
    
    // Hydrate client stores with server state
    hydrateDotzeeState(registry, initialDotzeeState);
    
    // Enable DevTools after hydration
    enableDotzeeDevTools(registry);
  }, [initialDotzeeState]);
  
  return (
    <div>
      <p>Count: {counterStore.count}</p>
      <button onClick={counterStore.increment}>Increment</button>
    </div>
  );
}`;

    const registrySignature = `function createDotzeeRegistry(): DotzeeRegistry

function setActiveDotzeeRegistry(registry: DotzeeRegistry): void

function resetActiveDotzeeRegistry(): void

function getActiveDotzeeRegistry(): DotzeeRegistry

function getGlobalDotzeeRegistry(): DotzeeRegistry`;

    const serializeSignature = `function serializeDotzeeState(registry: DotzeeRegistry): Record<string, any>`;

    const hydrateSignature = `function hydrateDotzeeState(
  registry: DotzeeRegistry, 
  state: Record<string, any>
): void`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">SSR Utilities</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Dotzee provides a suite of utilities to support Server-Side Rendering (SSR), ensuring your stores
                work correctly in server environments while avoiding state leakage between requests and enabling
                seamless client-side hydration.
            </p>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Overview</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    The Dotzee SSR utilities handle three key aspects of server-side rendering:
                </p>

                <div className="grid md:grid-cols-3 gap-5 mb-6">
                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="text-purple-600 dark:text-purple-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Registry Management</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Request-scoped registries prevent state leakage between server requests
                        </p>
                    </div>

                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="text-blue-600 dark:text-blue-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">State Serialization</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Capture store state on the server to send to the client
                        </p>
                    </div>

                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="text-green-600 dark:text-green-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Client Hydration</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Apply server state to client stores without triggering reactivity
                        </p>
                    </div>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Registry Management</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    On a server, you need to ensure that state for one user's request doesn't leak into another user's request.
                    Dotzee solves this with request-scoped registries.
                </p>

                <h3 className="text-xl font-medium text-gray-900 dark:text-white my-3">Registry API</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto mb-6">
                    <CodeBlock
                        code={registrySignature}
                        language="typescript"
                    />
                </div>

                <div className="overflow-x-auto mb-6">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Function</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">createDotzeeRegistry()</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Creates a new registry instance that can hold store instances separate from the global registry.
                                    Use this to create request-scoped registries on the server.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">setActiveDotzeeRegistry(registry)</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Sets the provided registry as the active registry. Any store definitions that run after this
                                    will register their stores in this registry.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">resetActiveDotzeeRegistry()</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Resets the active registry back to the global registry. Call this at the end of a request
                                    to prevent state leakage.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">getActiveDotzeeRegistry()</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Returns the currently active registry (which could be the global registry or a custom one).
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">getGlobalDotzeeRegistry()</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    Returns the global registry, regardless of which registry is currently active.
                                    Primarily used on the client side for hydration.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Example of registry management in a server context:
                </p>

                <CodeBlock
                    code={registryExample}
                    language="typescript"
                    filename="example-server.ts"
                />
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">State Serialization</h2>

                <h3 className="text-xl font-medium text-gray-900 dark:text-white my-3">serializeDotzeeState</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto mb-6">
                    <CodeBlock
                        code={serializeSignature}
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">registry</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">DotzeeRegistry</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    The registry containing the stores to serialize. Usually a request-scoped registry on the server.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Return Value</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    Returns a plain JavaScript object containing the serialized state of all stores in the registry.
                    This object is safe to serialize as JSON and pass to the client.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">How Serialization Works:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Takes a snapshot of the raw state from each store in the registry</li>
                        <li className="mb-2">Converts reactive objects and refs to plain JavaScript objects</li>
                        <li className="mb-2">Excludes getters, computed properties, and functions (only raw state is serialized)</li>
                        <li className="mb-2">Creates an object keyed by store ID, ready for hydration on the client</li>
                    </ul>
                </div>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Example of state serialization:
                </p>

                <CodeBlock
                    code={serializeExample}
                    language="typescript"
                    filename="serverSideProps.ts"
                />
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Client Hydration</h2>

                <h3 className="text-xl font-medium text-gray-900 dark:text-white my-3">hydrateDotzeeState</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto mb-6">
                    <CodeBlock
                        code={hydrateSignature}
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">registry</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">DotzeeRegistry</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    The registry containing the stores to hydrate, typically the global registry on the client.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">state</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Record&lt;string, any&gt;</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    The serialized state object created by <code>serializeDotzeeState</code> on the server.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">How Hydration Works:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Applies the serialized state to the matching stores in the client registry</li>
                        <li className="mb-2">Updates both reactive objects and ref values</li>
                        <li className="mb-2">Performs hydration without triggering reactivity/re-renders</li>
                        <li className="mb-2">Skips stores that don't exist in the client registry yet (helpful for lazy-loaded stores)</li>
                        <li className="mb-2">Should be called once, typically in a useEffect on initial mount</li>
                    </ul>
                </div>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Example of hydration on the client:
                </p>

                <CodeBlock
                    code={hydrateExample}
                    language="typescript"
                    filename="App.tsx"
                />
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Complete SSR Example with Next.js</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Here's a complete example using Next.js App Router showing the full SSR workflow:
                </p>

                <CodeBlock
                    code={nextJsExample}
                    language="typescript"
                    filename="app/page.tsx & components/ClientPage.tsx"
                />

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Important Notes:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">In the server component, we create a fresh registry for each request.</li>
                        <li className="mb-2">We import store hooks but don't call them with <code>()</code> on the server, just reference the hook to ensure the store definition runs.</li>
                        <li className="mb-2">For direct store access on the server, use <code>registry.get('storeId')</code>.</li>
                        <li className="mb-2">We serialize the state and pass it to a client component as a prop.</li>
                        <li className="mb-2">In the client component, we use <code>useEffect</code> to perform one-time hydration when the component mounts.</li>
                        <li className="mb-2">We enable DevTools only on the client side and after hydration.</li>
                        <li className="mb-2">The client component can then use the regular <code>useCounterStore()</code> hook pattern.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Best Practices</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-green-600 dark:text-green-400 mb-3">Do</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Create a fresh registry for each server request</li>
                            <li>Reset the active registry at the end of each request</li>
                            <li>Hydrate on the client only once, in a useEffect hook</li>
                            <li>Enable DevTools after hydration</li>
                            <li>Use store IDs consistently between server and client</li>
                            <li>Consider what data needs to be available during SSR</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-red-600 dark:text-red-400 mb-3">Avoid</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Calling useDotzeeStore hooks in Server Components (React will throw errors)</li>
                            <li>Forgetting to reset the active registry after a request</li>
                            <li>Multiple hydration calls that could overwrite each other</li>
                            <li>Trying to hydrate before store definitions have run on the client</li>
                            <li>Serializing non-serializable data (functions, complex objects, circular references)</li>
                            <li>Relying on browser-only APIs in store setup functions</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">See Also</h2>

                <ul className="space-y-2">
                    <li>
                        <Link to="/advanced-guides/ssr" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            Server-Side Rendering Guide - In-depth walkthrough of SSR patterns
                        </Link>
                    </li>
                    <li>
                        <Link to="/api-reference/defineDotzeeStore" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            defineDotzeeStore - Creating store definitions
                        </Link>
                    </li>
                    <li>
                        <Link to="/api-reference/devtools" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            DevTools - Integrating DevTools after hydration
                        </Link>
                    </li>
                    <li>
                        <Link to="/examples/ssr" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            SSR Example - Complete example application with SSR
                        </Link>
                    </li>
                </ul>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/api-reference/devtools" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    DevTools
                </Link>
                <Link to="/api-reference/plugins" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    Plugin API
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default SsrPage; 
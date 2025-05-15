import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const SsrExamplePage: React.FC = () => {
    const serverSideCode = `// server-side (e.g., Next.js getServerSideProps or a route handler)
import { 
    createDotzeeRegistry, 
    setActiveDotzeeRegistry, 
    serializeDotzeeState, 
    resetActiveDotzeeRegistry 
} from 'dotzee';
import { useCounterStore } from '../stores/counterStore'; // Your store definition

export async function getServerSideProps() {
  // 1. Create a new registry for this request
  const registry = createDotzeeRegistry();
  
  // 2. Activate this registry for the current scope
  setActiveDotzeeRegistry(registry);

  try {
    // 3. Ensure your store is defined and potentially initialize its state
    // This call will register the store with the 'registry' we just activated.
    const counterStore = useCounterStore(); 
    counterStore.incrementBy(5); // Example: Initializing state on the server

    // 4. Serialize the state from the request-specific registry
    const initialDotzeeState = serializeDotzeeState(registry);

    return {
      props: {
        initialDotzeeState,
      },
    };
  } finally {
    // 5. Important: Reset the active registry after the request is handled
    resetActiveDotzeeRegistry();
  }
}`;

    const clientSideCode = `// client-side (e.g., in your _app.tsx, root layout, or specific page component)
import { useEffect } from 'react';
import { 
    getGlobalDotzeeRegistry, 
    hydrateDotzeeState, 
    enableDotzeeDevTools 
} from 'dotzee';
// Make sure your store definitions run on the client as well
import '../stores/counterStore'; 

interface PageProps {
  initialDotzeeState?: string;
}

function MyApp({ Component, pageProps }: AppProps<PageProps>) {
  const { initialDotzeeState } = pageProps;

  useEffect(() => {
    // 1. Get the global client-side registry
    const clientRegistry = getGlobalDotzeeRegistry();

    // 2. Hydrate the state if it was provided by the server
    if (initialDotzeeState) {
      hydrateDotzeeState(clientRegistry, initialDotzeeState);
    }
    
    // 3. (Optional) Enable DevTools after hydration
    if (process.env.NODE_ENV === 'development') {
        enableDotzeeDevTools(clientRegistry);
    }
  }, [initialDotzeeState]);

  return <Component {...pageProps} />;
}

export default MyApp;

// --- Using the store in a client component ---
// src/components/HydratedCounter.tsx
import React from 'react';
import { useCounterStore } from '../stores/counterStore';

const HydratedCounter: React.FC = () => {
  const counterStore = useCounterStore();
  
  return (
    <div>
      <h2>Counter (Hydrated from Server)</h2>
      <p>Current Count: {counterStore.count}</p>
      <button onClick={() => counterStore.increment()}>Increment on Client</button>
    </div>
  );
};`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">SSR Example with Dotzee</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Server-Side Rendering (SSR) is crucial for performance and SEO in modern web applications. Dotzee provides utilities
                to help you manage state in an SSR environment, ensuring that state initialized on the server can be seamlessly transferred
                and hydrated on the client.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                This example provides a conceptual overview and code snippets for implementing SSR with Dotzee, typically within frameworks
                like Next.js or Remix. A full, runnable SSR setup is beyond the scope of this simple documentation page but these patterns are based on tested implementations.
            </p>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Server-Side Logic</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    On the server, for each request, you need to create a fresh Dotzee registry to avoid sharing state between different users.
                    You'll then define your stores (which registers them to this new registry), potentially initialize their state, and serialize the entire registry's state to pass to the client.
                </p>
                <CodeBlock
                    code={serverSideCode}
                    language="typescript"
                    filename="pages/some-page.server.tsx (conceptual)"
                />
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Key Server-Side Steps:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-1"><strong><code>createDotzeeRegistry()</code></strong>: Creates a new, isolated store registry for the current request.</li>
                        <li className="mb-1"><strong><code>setActiveDotzeeRegistry(registry)</code></strong>: Sets the newly created registry as the active one for the scope of the current request. Any store defined after this will use this registry.</li>
                        <li className="mb-1"><strong>Store Definition & Initialization</strong>: Ensure your store definition code (e.g., <code>useCounterStore()</code>) runs. This registers the store with the active (request-scoped) registry. You can then access the store instance directly from the registry or via its hook to set initial state (e.g., <code>counterStore.incrementBy(5)</code>).</li>
                        <li className="mb-1"><strong><code>serializeDotzeeState(registry)</code></strong>: Captures the state of all stores within the provided registry into a JSON string. This string is then passed to the client (e.g., as a prop).</li>
                        <li className="mb-1"><strong><code>resetActiveDotzeeRegistry()</code></strong>: Crucially, resets the active registry to prevent it from being inadvertently used by subsequent requests. This should typically be in a <code>finally</code> block.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Client-Side Hydration</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    On the client, you take the serialized state string (received from the server) and use it to hydrate the global Dotzee registry. This should happen before your main React application renders or very early in its lifecycle.
                </p>
                <CodeBlock
                    code={clientSideCode}
                    language="tsx"
                    filename="pages/_app.tsx or client-entry.tsx (conceptual)"
                />
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Key Client-Side Steps:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-1"><strong>Ensure Store Definitions Run</strong>: Just like on the server, the JavaScript files defining your stores (e.g., <code>import '../stores/counterStore';</code>) must be imported and run on the client so the stores are known to the global registry.</li>
                        <li className="mb-1"><strong><code>getGlobalDotzeeRegistry()</code></strong>: Retrieves the default client-side global registry.</li>
                        <li className="mb-1"><strong><code>hydrateDotzeeState(registry, serializedState)</code></strong>: Parses the serialized state string and applies it to the stores in the client registry. This populates your client-side stores with the server-rendered state without triggering initial change signals that could cause hydration mismatches.</li>
                        <li className="mb-1"><strong>Timing of Hydration</strong>: Hydration should typically occur in a <code>useEffect</code> hook that runs once on mount, or at a similar early stage in your application setup, using the state string passed as props.</li>
                        <li className="mb-1"><strong>DevTools</strong>: DevTools can be enabled after hydration, usually conditionally for development environments.</li>
                        <li className="mb-1"><strong>Component Usage</strong>: Client components then use the store hooks (e.g., <code>useCounterStore()</code>) as usual. The store will already have the hydrated state.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Important Considerations for SSR</h2>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                        <li>
                            <strong>Request-Scoped Registries</strong>: Always use <code>createDotzeeRegistry</code>, <code>setActiveDotzeeRegistry</code>, and <code>resetActiveDotzeeRegistry</code> on the server to ensure state isolation between requests.
                        </li>
                        <li>
                            <strong>Matching Store Definitions</strong>: The exact same store definitions (store IDs, state structure, actions, getters) must exist on both the server and the client for hydration to work correctly.
                        </li>
                        <li>
                            <strong>Serialization Limits</strong>: Ensure the state you are serializing is JSON-compatible (e.g., no functions, Maps, Sets, or complex class instances without custom serialization handling if not using Dotzee's built-in for common types).
                        </li>
                        <li>
                            <strong>Lazy Loaded Stores</strong>: For stores that are lazy-loaded on the client, if they need server-initialized state, you might need a pattern where their initial state is passed as props specifically to the lazy component, which then uses an action to initialize its store. Global hydration primarily targets eagerly known stores.
                        </li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Key Dotzee SSR Utilities</h2>
                <div className="overflow-x-auto mb-6">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Utility</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purpose</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"><code>createDotzeeRegistry()</code></td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Creates a new, empty store registry. Essential for request isolation on the server.</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"><code>setActiveDotzeeRegistry(registry)</code></td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Sets a given registry as the active one. Stores defined subsequently will use this registry.</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"><code>resetActiveDotzeeRegistry()</code></td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Resets the active registry to the default global one. Use after a server request is handled.</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"><code>getGlobalDotzeeRegistry()</code></td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Returns the default global registry, typically used on the client-side.</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"><code>serializeDotzeeState(registry)</code></td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Serializes the state of all stores in the given registry to a JSON string.</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"><code>hydrateDotzeeState(registry, serializedState)</code></td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Applies a serialized state string to the stores in the given client-side registry.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Refer to the <Link to="/api-reference/ssr" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">SSR Utilities API Reference</Link> for more details on these functions.
                </p>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/examples/async" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Async Actions Example
                </Link>
                <Link to="/examples" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    Back to Examples Overview
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default SsrExamplePage; 
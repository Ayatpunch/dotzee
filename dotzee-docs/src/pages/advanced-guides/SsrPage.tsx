import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const SsrPage: React.FC = () => {
    const serverSetupExample = `// server.ts (or your server entry point)
import { createDotzeeRegistry, setActiveDotzeeRegistry, serializeDotzeeState, getActiveDotzeeRegistry } from 'dotzee';
import { useUserStore } from './stores/userStore'; // Your Dotzee store

// Example for an Express-like server
app.get('*', async (req, res) => {
  // 1. Create a new registry for each request
  const registry = createDotzeeRegistry();
  // 2. Activate this registry
  setActiveDotzeeRegistry(registry);

  // 3. Initialize or use stores as needed for the request
  // This ensures they are registered within the request-specific registry
  const userStore = useUserStore(); // Call the hook to ensure store definition runs
  // Optionally, pre-populate store state based on request (e.g., user session)
  // userStore.setUserData({ id: '123', name: 'Server User' });

  // ... render your React app to string ...
  // const appHtml = renderToString(<App />);

  // 4. Serialize the state from the active (request-specific) registry
  const initialState = serializeDotzeeState(getActiveDotzeeRegistry());

  // 5. Reset the active registry (important for cleanup)
  // setActiveDotzeeRegistry(null); // Or reset to global/default if you have one

  res.send(\`
    <html>
      <head>
        {/* ... */}
      </head>
      <body>
        <div id="root">\${appHtml}</div>
        <script>
          window.__INITIAL_DOTZEE_STATE__ = \${JSON.stringify(initialState)};
        </script>
        {/* ... your client bundle ... */}
      </body>
    </html>
  \`);
});`;

    const clientSetupExample = `// client.ts (or your client entry point)
import { getGlobalDotzeeRegistry, hydrateDotzeeState, enableDotzeeDevTools } from 'dotzee';
import ReactDOM from 'react-dom/client';
import App from './App';

// 1. Get the initial state passed from the server
const initialState = window.__INITIAL_DOTZEE_STATE__;

// 2. Get the global client-side registry
const clientRegistry = getGlobalDotzeeRegistry(); // Or createDotzeeRegistry() if you prefer a new one

// 3. Hydrate the state into the client registry
// This should be done BEFORE your app mounts to avoid mismatches
if (initialState) {
  hydrateDotzeeState(clientRegistry, initialState);
}

// Optional: Enable DevTools on the client
if (process.env.NODE_ENV === 'development') {
  enableDotzeeDevTools(); // Uses the global registry by default
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Server-Side Rendering (SSR)</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Dotzee supports Server-Side Rendering (SSR), allowing you to render your React application on the
                server and send fully-rendered HTML to the client. This can improve perceived performance, SEO,
                and user experience.
            </p>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Why SSR with Dotzee?</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li><strong>Improved SEO:</strong> Search engines can crawl your site more effectively with pre-rendered content.</li>
                    <li><strong>Faster Time-to-Content:</strong> Users see meaningful content sooner as HTML is rendered on the server.</li>
                    <li><strong>Better User Experience:</strong> Especially on slower networks or devices.</li>
                    <li><strong>Consistent State:</strong> Dotzee provides utilities to ensure state consistency between server and client.</li>
                </ul>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Key Concepts for SSR</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Successfully implementing SSR with Dotzee involves a few key steps and concepts:
                </p>
                <div className="space-y-4">
                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">1. Request-Scoped Registries</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            On the server, it's crucial to avoid sharing state between different user requests. Dotzee handles this
                            by allowing you to create a new store registry for each incoming request using <code>createDotzeeRegistry()</code>.
                            You then activate this request-specific registry with <code>setActiveDotzeeRegistry()</code> before
                            rendering your application.
                        </p>
                    </div>
                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">2. State Serialization</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            After your application is rendered on the server, you need to capture the state of your Dotzee stores.
                            The <code>serializeDotzeeState(registry)</code> function takes the active (request-specific) registry
                            and returns a serializable snapshot of all store states. This snapshot is then typically embedded
                            into the HTML response (e.g., in a <code>&lt;script&gt;</code> tag).
                        </p>
                    </div>
                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">3. Client-Side Hydration</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            On the client, before your React application mounts, you need to "hydrate" the client-side Dotzee stores
                            with the state received from the server. The <code>hydrateDotzeeState(registry, initialState)</code> function
                            is used for this. It takes the client-side registry (usually the global one obtained via <code>getGlobalDotzeeRegistry()</code>)
                            and the initial state snapshot to initialize the stores.
                        </p>
                    </div>
                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">4. Store Initialization</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            Ensure that any store you intend to use during SSR is defined and, if necessary, its hook is called within the server-side rendering lifecycle
                            for the active request-scoped registry. This guarantees the store is registered and its initial state is part of the serialization.
                            Actions that populate initial server-side state should also be dispatched within this lifecycle.
                        </p>
                    </div>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Server-Side Setup Example</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Here's a simplified example of how you might set up Dotzee on the server, for instance, with an Express.js application.
                    Actual implementation will vary based on your SSR framework (e.g., Next.js, Remix).
                </p>
                <CodeBlock
                    code={serverSetupExample}
                    language="typescript"
                    filename="server.ts"
                />
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Important Notes for Server Setup:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Always create a new registry per request.</li>
                        <li className="mb-2">Activate the request-specific registry before any store usage or app rendering.</li>
                        <li className="mb-2">Ensure your store definitions run within the server rendering pass by calling their hooks (e.g., <code>useUserStore()</code>).</li>
                        <li className="mb-2">Serialize state from the correct (active) registry.</li>
                        <li className="mb-2">Consider resetting the active registry after the request to prevent accidental cross-request pollution if your server environment reuses contexts.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Client-Side Setup Example</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    On the client, you'll need to hydrate the state before your React app mounts:
                </p>
                <CodeBlock
                    code={clientSetupExample}
                    language="typescript"
                    filename="client.ts"
                />
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Important Notes for Client Setup:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Retrieve the initial state (e.g., from <code>window.__INITIAL_DOTZEE_STATE__</code>).</li>
                        <li className="mb-2">Use <code>hydrateDotzeeState</code> with the client-side global registry (or a new client-side registry).</li>
                        <li className="mb-2">Perform hydration *before* rendering your main React application (<code>ReactDOM.createRoot().render(...)</code>).</li>
                        <li className="mb-2">Ensure your store definitions are available on the client as well.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Framework-Specific Considerations</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Modern React frameworks like Next.js or Remix often have built-in mechanisms or idiomatic ways to handle SSR state management.
                    While the core Dotzee principles (request-scoped registries, serialization, hydration) remain the same, you should consult your
                    framework's documentation for the best integration patterns. For example:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                    <li><strong>Next.js:</strong> You might perform store initialization and serialization in <code>getServerSideProps</code> or within Server Components, passing initial state as props to your page components, and then hydrate on the client.</li>
                    <li><strong>Remix:</strong> You could use loaders to prepare store state on the server and provide it to your route components for rendering and client-side hydration.</li>
                </ul>
                <p className="mt-4 text-gray-700 dark:text-gray-300">
                    The key is to adapt Dotzee's SSR utilities to fit naturally within your chosen framework's data fetching and rendering lifecycle.
                </p>
            </div>


            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/advanced-guides" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Advanced Guides
                </Link>
                <Link to="/advanced-guides/devtools" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    DevTools Integration
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default SsrPage; 
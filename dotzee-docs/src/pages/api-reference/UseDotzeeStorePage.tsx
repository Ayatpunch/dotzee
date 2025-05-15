import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const UseDotzeeStorePage: React.FC = () => {
    const basicUsageExample = `import { useDotzeeStore } from 'dotzee';
import { useCounterStore } from './stores/counterStore';

function Counter() {
  // This is the recommended way to access a store
  const counterStore = useCounterStore();
  
  // But under the hood, useCounterStore is just a wrapped useDotzeeStore
  // const counterStore = useDotzeeStore(useCounterStore);
  
  return (
    <div>
      <p>Count: {counterStore.count}</p>
      <button onClick={() => counterStore.increment()}>Increment</button>
    </div>
  );
}`;

    const optionsAPIUsageExample = `// Using a store defined with Options API
import { useCounterStore } from './stores/counterStore';

function Counter() {
  const store = useCounterStore();
  
  // Access state directly
  console.log(store.count);
  
  // Access getters directly
  console.log(store.doubleCount);
  
  // Call actions
  store.increment();
  
  return (
    <div>
      <p>Count: {store.count}</p>
      <p>Double: {store.doubleCount}</p>
      <button onClick={store.increment}>Increment</button>
    </div>
  );
}`;

    const setupAPIUsageExample = `// Using a store defined with Setup API
import { useCounterSetupStore } from './stores/counterSetupStore';

function Counter() {
  const store = useCounterSetupStore();
  
  // Access refs with .value
  console.log(store.count.value);
  
  // Access computed values with .value
  console.log(store.doubleCount.value);
  
  // Call functions directly
  store.increment();
  
  return (
    <div>
      <p>Count: {store.count.value}</p>
      <p>Double: {store.doubleCount.value}</p>
      <button onClick={store.increment}>Increment</button>
    </div>
  );
}`;

    const multipleStoresExample = `// Using multiple stores together
import { useUserStore } from './stores/userStore';
import { useCartStore } from './stores/cartStore';

function CheckoutPage() {
  const userStore = useUserStore();
  const cartStore = useCartStore();
  
  return (
    <div>
      <h2>Checkout</h2>
      <p>User: {userStore.username}</p>
      <p>Items in cart: {cartStore.items.length}</p>
      <p>Total: \${cartStore.total}</p>
      
      <button onClick={() => cartStore.checkout(userStore.id)}>
        Complete Purchase
      </button>
    </div>
  );
}`;

    const typeSignature = `function useDotzeeStore<T>(
  storeHook: () => T & { $id: string, $changeSignal: { value: number } }
): T`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">useDotzeeStore</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                <code>useDotzeeStore</code> is the core React hook for consuming Dotzee stores in your components.
                It provides the connection between your React components and your Dotzee store state.
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
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">storeHook</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">function</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    A store hook created by <code>defineDotzeeStore</code>. This is the function that will fetch or create
                                    the store instance. The function must have <code>$id</code> and <code>$changeSignal</code> properties,
                                    which are automatically added by <code>defineDotzeeStore</code>.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Return Value</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    Returns the store instance, which contains all state, getters, and actions defined in the store.
                    The component will automatically re-render when any piece of state accessed by the component changes.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Under the Hood:</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                        <code>useDotzeeStore</code> uses React's <code>useSyncExternalStore</code> to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Subscribe to the store's changes</li>
                        <li className="mb-2">Trigger re-renders when the store's state changes</li>
                        <li className="mb-2">Handle concurrent rendering safely</li>
                        <li className="mb-2">Ensure consistent state during server-side rendering</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Basic Usage</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    While you can use <code>useDotzeeStore</code> directly, you typically use the hooks returned by <code>defineDotzeeStore</code>:
                </p>

                <CodeBlock
                    code={basicUsageExample}
                    language="jsx"
                    filename="components/Counter.jsx"
                />

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Direct vs Indirect Usage:</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                        In most cases, you'll use the hooks returned by <code>defineDotzeeStore</code> (like <code>useCounterStore()</code>).
                        These are just convenience wrappers around <code>useDotzeeStore</code>. The direct usage of <code>useDotzeeStore(useCounterStore)</code>
                        is equivalent but more verbose.
                    </p>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Using Options API Stores</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    When using a store defined with the Options API, you access state and getters directly on the store object:
                </p>

                <CodeBlock
                    code={optionsAPIUsageExample}
                    language="jsx"
                    filename="components/OptionsAPICounter.jsx"
                />

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Options API Store Access:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">State properties are accessed directly: <code>store.count</code></li>
                        <li className="mb-2">Getters are accessed directly: <code>store.doubleCount</code></li>
                        <li className="mb-2">Actions are called as methods: <code>store.increment()</code></li>
                        <li className="mb-2">The component re-renders automatically when accessed state changes</li>
                        <li className="mb-2">Only components that actually use a piece of state will re-render when it changes</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Using Setup API Stores</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    When using a store defined with the Setup API, you access refs and computed values with <code>.value</code>:
                </p>

                <CodeBlock
                    code={setupAPIUsageExample}
                    language="jsx"
                    filename="components/SetupAPICounter.jsx"
                />

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">Setup API Store Access:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Refs are accessed with <code>.value</code>: <code>store.count.value</code></li>
                        <li className="mb-2">Computed values are accessed with <code>.value</code>: <code>store.doubleCount.value</code></li>
                        <li className="mb-2">Functions are called directly: <code>store.increment()</code></li>
                        <li className="mb-2">The component re-renders automatically when accessed refs or computed values change</li>
                        <li className="mb-2">Only components that actually use a reactive value will re-render when it changes</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Using Multiple Stores</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    You can use multiple stores together in a single component:
                </p>

                <CodeBlock
                    code={multipleStoresExample}
                    language="jsx"
                    filename="components/CheckoutPage.jsx"
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Multi-Store Usage:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Call multiple store hooks in the same component</li>
                        <li className="mb-2">Stores can interact with each other via actions</li>
                        <li className="mb-2">Each store is managed independently</li>
                        <li className="mb-2">The component will re-render if state from any used store changes</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Performance Considerations</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-green-600 dark:text-green-400 mb-3">Efficient Rendering</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                            <code>useDotzeeStore</code> is optimized for React's rendering behavior:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Memoized store access avoids unnecessary rerenders</li>
                            <li>Fine-grained reactivity only updates components that use changed state</li>
                            <li>Store instances are singletons, shared across all components</li>
                            <li>Compatible with React's concurrent mode and strict mode</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-red-600 dark:text-red-400 mb-3">Common Pitfalls</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                            Avoid these practices that could impact performance:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Destructuring stores (breaks reactivity)</li>
                            <li>Creating store instances inside components</li>
                            <li>Excessive rerenders by updating unrelated state</li>
                            <li>Large store states that could be split into multiple stores</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">See Also</h2>

                <ul className="space-y-2">
                    <li>
                        <Link to="/api-reference/defineDotzeeStore" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            defineDotzeeStore - Creating store definitions
                        </Link>
                    </li>
                    <li>
                        <Link to="/api-reference/ref" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            ref - Creating reactive values
                        </Link>
                    </li>
                    <li>
                        <Link to="/api-reference/computed" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            computed - Creating derived values
                        </Link>
                    </li>
                    <li>
                        <Link to="/advanced-guides/code-splitting" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            Code Splitting - Using stores with dynamic imports
                        </Link>
                    </li>
                </ul>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/api-reference/defineDotzeeStore" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    defineDotzeeStore
                </Link>
                <Link to="/api-reference/ref" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    ref
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default UseDotzeeStorePage; 
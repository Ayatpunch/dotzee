import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const DefineDotzeeStorePage: React.FC = () => {
    const optionsDefinitionExample = `// Define a store using Options API (object-based)
import { defineDotzeeStore } from 'dotzee';

export const useCounterStore = defineDotzeeStore('counter', {
  // State: function returning initial state object
  state: () => ({ 
    count: 0,
    lastUpdated: null
  }),
  
  // Getters: computed values derived from state
  getters: {
    doubleCount: (state) => state.count * 2,
    isPositive: (state) => state.count > 0
  },
  
  // Actions: methods to change state
  actions: {
    increment() {
      this.count++;
      this.lastUpdated = new Date();
    },
    
    setCount(newValue) {
      this.count = newValue;
      this.lastUpdated = new Date();
    },
    
    async fetchAndSetCount() {
      try {
        // Simulate API call
        const response = await fetch('/api/counter');
        const data = await response.json();
        
        this.count = data.value;
        this.lastUpdated = new Date();
      } catch (error) {
        console.error('Failed to fetch count:', error);
      }
    }
  }
});`;

    const setupDefinitionExample = `// Define a store using Setup API (function-based)
import { defineDotzeeStore, ref, computed } from 'dotzee';

export const useCounterStore = defineDotzeeStore('counter', () => {
  // Refs: reactive state
  const count = ref(0);
  const lastUpdated = ref(null);
  
  // Computed: derived values
  const doubleCount = computed(() => count.value * 2);
  const isPositive = computed(() => count.value > 0);
  
  // Functions: actions to change state
  function increment() {
    count.value++;
    lastUpdated.value = new Date();
  }
  
  function setCount(newValue) {
    count.value = newValue;
    lastUpdated.value = new Date();
  }
  
  async function fetchAndSetCount() {
    try {
      // Simulate API call
      const response = await fetch('/api/counter');
      const data = await response.json();
      
      count.value = data.value;
      lastUpdated.value = new Date();
    } catch (error) {
      console.error('Failed to fetch count:', error);
    }
  }
  
  // Return state and actions
  return {
    count,
    lastUpdated,
    doubleCount,
    isPositive,
    increment,
    setCount,
    fetchAndSetCount
  };
});`;

    const usageExample = `// Using the store in a component
import { useCounterStore } from './stores/counterStore';

function Counter() {
  // Get the store
  const counterStore = useCounterStore();
  
  // Options API: Access state and actions directly
  // counterStore.count, counterStore.increment()
  
  // Setup API: Access state via .value
  // counterStore.count.value, counterStore.increment()
  
  // Example component return
  return (
    <div>
      <p>Count: {counterStore.count}</p>
      <button onClick={() => counterStore.increment()}>Increment</button>
    </div>
  );
}`;

    const typescriptExample = `// TypeScript usage with Options API
import { defineDotzeeStore } from 'dotzee';

interface CounterState {
  count: number;
  lastUpdated: Date | null;
}

// Type inference works without explicit interface
export const useCounterStore = defineDotzeeStore('counter', {
  state: (): CounterState => ({ 
    count: 0,
    lastUpdated: null
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2,
    isPositive: (state) => state.count > 0
  },
  
  actions: {
    increment() {
      this.count++;
      this.lastUpdated = new Date();
    },
    
    setCount(newValue: number) {
      this.count = newValue;
      this.lastUpdated = new Date();
    }
  }
});

// TypeScript with Setup API
import { defineDotzeeStore, ref, computed } from 'dotzee';

export const useCounterSetupStore = defineDotzeeStore('counterSetup', () => {
  const count = ref<number>(0);
  const lastUpdated = ref<Date | null>(null);
  
  const doubleCount = computed(() => count.value * 2);
  
  function setCount(newValue: number) {
    count.value = newValue;
    lastUpdated.value = new Date();
  }
  
  return {
    count,
    lastUpdated,
    doubleCount,
    setCount
  };
});`;

    const typeSignature = `// Options API
function defineDotzeeStore<S, G, A>(
  id: string,
  options: {
    state: () => S,
    getters?: Record<string, (state: S) => any>,
    actions?: Record<string, (...args: any[]) => any>
  }
): () => S & { [K in keyof G]: ReturnType<G[K]> } & A

// Setup API
function defineDotzeeStore<T>(
  id: string,
  setup: () => T
): () => T
`

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">defineDotzeeStore</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                <code>defineDotzeeStore</code> is the core function used to create and define Dotzee stores. This function
                supports two API styles: the Options API (object-based) and the Setup API (function-based).
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">id</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">string</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    A unique identifier for the store. Must be unique across your application. Used for DevTools integration and SSR.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">options</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">object</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    For Options API: An object containing <code>state</code>, <code>getters</code> (optional), and <code>actions</code> (optional).
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">setup</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">function</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    For Setup API: A function that returns an object containing reactive state and methods.
                                    Inside this function, you can use <code>ref()</code> and <code>computed()</code>.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Return Value</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    The <code>defineDotzeeStore</code> function returns a React hook function that, when called, returns the store instance.
                    The returned hook is memoized so calling it multiple times in the same component won't cause performance issues.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Store Instance:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">For <strong>Options API</strong>, the returned store merges state, getters, and actions into a single object.</li>
                        <li className="mb-2">For <strong>Setup API</strong>, the returned store is exactly what was returned from the setup function.</li>
                        <li className="mb-2">The store instance is <strong>reactive</strong> - when its state changes, connected components re-render.</li>
                        <li className="mb-2">The store instance is a <strong>singleton</strong> unless you're using SSR, where each request has its own instance.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Options API</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    The Options API uses an object to define the store's state, getters, and actions.
                </p>

                <CodeBlock
                    code={optionsDefinitionExample}
                    language="typescript"
                    filename="stores/counterStore.ts"
                />

                <div className="grid md:grid-cols-3 gap-6 mt-6">
                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">state</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            A function that returns an object containing the store's initial state.
                            This state becomes reactive automatically.
                        </p>
                    </div>

                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">getters</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            An object of functions that derive computed values from state.
                            Each getter receives the state as its first argument.
                        </p>
                    </div>

                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">actions</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            An object of methods that can change state.
                            Inside these functions, <code>this</code> refers to the store instance.
                        </p>
                    </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Notes about Options API:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">State is automatically made reactive using <code>reactive()</code>.</li>
                        <li className="mb-2">Getters are implemented as <code>computed()</code> properties behind the scenes.</li>
                        <li className="mb-2">Actions can use <code>this</code> to access state, other actions, and getters.</li>
                        <li className="mb-2">Actions can be asynchronous (async/await).</li>
                        <li className="mb-2">This API is familiar to Vue/Pinia users and similar to class-based approaches.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Setup API</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    The Setup API uses a function that defines and returns reactive state, computed properties, and methods.
                </p>

                <CodeBlock
                    code={setupDefinitionExample}
                    language="typescript"
                    filename="stores/counterSetupStore.ts"
                />

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">Setup API Key Points:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">For primitive values, use <code>ref()</code> to create reactive references.</li>
                        <li className="mb-2">For calculated values, use <code>computed()</code> to create derived values.</li>
                        <li className="mb-2">Define functions directly for actions.</li>
                        <li className="mb-2">You must explicitly <code>return</code> what you want to expose from the store.</li>
                        <li className="mb-2">You must access and modify <code>ref</code> values using <code>.value</code>.</li>
                        <li className="mb-2">This API offers more flexibility for composing store logic and is similar to React hooks.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Usage</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Once defined, you can use the store in any component by calling the returned hook:
                </p>

                <CodeBlock
                    code={usageExample}
                    language="jsx"
                    filename="components/Counter.jsx"
                />

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Usage Notes:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">The store hook doesn't need any parameters and can be used in any component.</li>
                        <li className="mb-2">For Options API stores, access state, getters, and actions directly on the store object.</li>
                        <li className="mb-2">For Setup API stores, access refs and computed values with <code>.value</code>.</li>
                        <li className="mb-2">Components automatically re-render when used state changes.</li>
                        <li className="mb-2">The store instance is shared between all components.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">TypeScript Support</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Dotzee provides comprehensive TypeScript support for both API styles:
                </p>

                <CodeBlock
                    code={typescriptExample}
                    language="typescript"
                    filename="stores/typedStore.ts"
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">TypeScript Advantages:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Full type inference for state, getters, and actions</li>
                        <li className="mb-2">Autocompletion when using the store in components</li>
                        <li className="mb-2">Type checking for action parameters</li>
                        <li className="mb-2">Type checking for state mutations</li>
                        <li className="mb-2">Options API: <code>this</code> is properly typed to include state, getters, and actions</li>
                        <li className="mb-2">Setup API: Return value automatically becomes the store's public API type</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Store IDs and Registration</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Every store must have a unique <code>id</code> string. This ID serves several important purposes:
                </p>

                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
                    <li className="mb-2">It allows Dotzee to maintain a registry of singleton store instances</li>
                    <li className="mb-2">It provides meaningful labels in DevTools</li>
                    <li className="mb-2">It helps with server-side rendering state management</li>
                    <li className="mb-2">It enables certain plugin features that need to target specific stores</li>
                </ul>

                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Stores are automatically registered when they are first used (lazy registration).
                    This supports code splitting and dynamic imports.
                </p>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">See Also</h2>

                <ul className="space-y-2">
                    <li>
                        <Link to="/api-reference/useDotzeeStore" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            useDotzeeStore - Using store instances in components
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
                        <Link to="/api-reference/ssr" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            SSR Utilities - Server-side rendering with Dotzee
                        </Link>
                    </li>
                </ul>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/api-reference" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    API Reference
                </Link>
                <Link to="/api-reference/useDotzeeStore" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    useDotzeeStore
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default DefineDotzeeStorePage; 
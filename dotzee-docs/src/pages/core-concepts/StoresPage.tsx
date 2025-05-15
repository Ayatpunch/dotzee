import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const StoresPage: React.FC = () => {
    const optionsStoreExample = `// src/stores/counterStore.ts
import { defineDotzeeStore } from 'dotzee';

export const useCounterStore = defineDotzeeStore('counter', {
  // State - reactive data
  state: () => ({
    count: 0,
    name: 'Counter',
    loading: false
  }),
  
  // Getters - computed properties
  getters: {
    doubledCount: (state) => state.count * 2,
    countStatus: (state) => {
      if (state.count === 0) return 'Zero';
      return state.count > 0 ? 'Positive' : 'Negative';
    }
  },
  
  // Actions - methods to modify state
  actions: {
    increment() {
      this.count++;
    },
    decrement() {
      this.count--;
    },
    async incrementAsync(delay = 1000) {
      this.loading = true;
      await new Promise(resolve => setTimeout(resolve, delay));
      this.count++;
      this.loading = false;
    }
  }
});`;

    const setupStoreExample = `// src/stores/counterSetupStore.ts
import { defineDotzeeStore, ref, computed } from 'dotzee';

export const useCounterSetupStore = defineDotzeeStore('counterSetup', () => {
  // Reactive state with refs
  const count = ref(0);
  const name = ref('Counter');
  const loading = ref(false);
  
  // Computed properties
  const doubledCount = computed(() => count.value * 2);
  const countStatus = computed(() => {
    if (count.value === 0) return 'Zero';
    return count.value > 0 ? 'Positive' : 'Negative';
  });
  
  // Actions as regular functions
  function increment() {
    count.value++;
  }
  
  function decrement() {
    count.value--;
  }
  
  async function incrementAsync(delay = 1000) {
    loading.value = true;
    await new Promise(resolve => setTimeout(resolve, delay));
    count.value++;
    loading.value = false;
  }
  
  // Expose everything you want to be accessible from outside
  return {
    // State
    count,
    name,
    loading,
    // Computed
    doubledCount,
    countStatus,
    // Actions
    increment,
    decrement,
    incrementAsync
  };
});`;

    const optionsStoreUsageExample = `// src/components/Counter.tsx
import React from 'react';
import { useCounterStore } from '../stores/counterStore';

function Counter() {
  // Use the store in your component
  const counter = useCounterStore();
  
  return (
    <div>
      <h2>{counter.name}: {counter.count}</h2>
      <p>Doubled: {counter.doubledCount}</p>
      <p>Status: {counter.countStatus}</p>
      
      <div>
        <button onClick={() => counter.decrement()}>-</button>
        <button onClick={() => counter.increment()}>+</button>
        <button 
          onClick={() => counter.incrementAsync()}
          disabled={counter.loading}
        >
          {counter.loading ? 'Loading...' : 'Async +'}
        </button>
      </div>
    </div>
  );
}`;

    const setupStoreUsageExample = `// src/components/CounterSetup.tsx
import React from 'react';
import { useCounterSetupStore } from '../stores/counterSetupStore';

function CounterSetup() {
  // Use the setup store in your component
  const counter = useCounterSetupStore();
  
  return (
    <div>
      <h2>{counter.name.value}: {counter.count.value}</h2>
      <p>Doubled: {counter.doubledCount.value}</p>
      <p>Status: {counter.countStatus.value}</p>
      
      <div>
        <button onClick={counter.decrement}>-</button>
        <button onClick={counter.increment}>+</button>
        <button 
          onClick={() => counter.incrementAsync()}
          disabled={counter.loading.value}
        >
          {counter.loading.value ? 'Loading...' : 'Async +'}
        </button>
      </div>
    </div>
  );
}`;

    const typescriptExample = `// With TypeScript - Options API
interface CounterState {
  count: number;
  name: string;
  loading: boolean;
}

export const useCounterStore = defineDotzeeStore('counter', {
  state: (): CounterState => ({
    count: 0,
    name: 'Counter',
    loading: false
  }),
  getters: {
    doubledCount: (state: CounterState) => state.count * 2
  },
  actions: {
    setCount(newCount: number) {
      this.count = newCount;
    }
  }
});

// With TypeScript - Setup API
export const useCounterSetupStore = defineDotzeeStore('counterSetup', () => {
  const count = ref<number>(0);
  const items = ref<string[]>([]);
  
  function addItem(item: string): void {
    items.value.push(item);
  }
  
  return {
    count,
    items,
    addItem
  };
});`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Defining Stores</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Stores are the central piece of Dotzee. They contain your application state, logic to modify it,
                and derived state. This guide explains how to define and use stores effectively.
            </p>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Store Basics</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    A Dotzee store is created using the <code>defineDotzeeStore</code> function. Each store has:
                </p>

                <div className="grid md:grid-cols-3 gap-5 mb-6">
                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="text-blue-600 dark:text-blue-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">State</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            The reactive data of your store that drives your UI. When it changes, components re-render.
                        </p>
                    </div>

                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="text-green-600 dark:text-green-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Getters</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Computed values derived from your state. They update automatically when dependencies change.
                        </p>
                    </div>

                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="text-purple-600 dark:text-purple-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Actions</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Methods that modify your state. They can be synchronous or asynchronous and contain business logic.
                        </p>
                    </div>
                </div>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Each store is a <strong>singleton</strong> - there's only one instance per ID. The store is only created when first used,
                    allowing for efficient code splitting. Stores can be used in any component simply by importing and calling the store function.
                </p>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Two Ways to Define Stores</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Dotzee provides two API styles for defining stores:
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Options API</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Object-based syntax similar to Pinia/Vuex</li>
                            <li>Clear separation of state, getters, and actions</li>
                            <li>State is automatically reactive</li>
                            <li>Use <code>this</code> inside actions to access state/getters</li>
                            <li>Great for simpler stores and those familiar with Redux/Vuex</li>
                        </ul>
                    </div>

                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Setup API</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Function-based composition similar to React Hooks</li>
                            <li>Use <code>ref()</code> and <code>computed()</code> explicitly</li>
                            <li>More flexible for complex logic and composition</li>
                            <li>Direct function definitions for actions</li>
                            <li>Need to use <code>.value</code> to access/modify refs</li>
                        </ul>
                    </div>
                </div>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Both styles provide the same functionality, so choose the one that best fits your preferences and use case.
                    You can even mix and match different store styles in the same application.
                </p>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Options API (Object-based)</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    The Options API uses an object with <code>state</code>, <code>getters</code>, and <code>actions</code> properties.
                    This syntax will feel familiar if you've used Pinia, Vuex, or similar libraries.
                </p>

                <CodeBlock
                    code={optionsStoreExample}
                    language="typescript"
                    filename="src/stores/counterStore.ts"
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Key Features of Options API:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2"><strong>State</strong> - A function that returns the initial state object. This object is automatically made reactive.</li>
                        <li className="mb-2"><strong>Getters</strong> - Functions that take the state as first argument and return a derived value.</li>
                        <li className="mb-2"><strong>Actions</strong> - Methods where <code>this</code> refers to the store instance itself, giving you access to state and other actions.</li>
                        <li className="mb-2"><strong>Async Support</strong> - Actions can be <code>async</code> functions that update state after asynchronous operations.</li>
                    </ul>
                </div>

                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-3 mt-6">Using an Options Store in Components</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    To use an Options store in a component, simply import it and call it directly:
                </p>

                <CodeBlock
                    code={optionsStoreUsageExample}
                    language="jsx"
                    filename="src/components/Counter.tsx"
                />

                <p className="mt-4 text-gray-700 dark:text-gray-300">
                    Notice that state and getters are accessed as properties, and actions are called as methods.
                    The component will automatically re-render when any accessed state or getter changes.
                </p>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Setup API (Composition-based)</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    The Setup API uses a function that returns an object with everything you want to expose.
                    This approach is similar to React Hooks or Vue's Composition API, providing more flexibility.
                </p>

                <CodeBlock
                    code={setupStoreExample}
                    language="typescript"
                    filename="src/stores/counterSetupStore.ts"
                />

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">Key Features of Setup API:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2"><strong>Refs</strong> - Use <code>ref()</code> to create reactive state variables.</li>
                        <li className="mb-2"><strong>Computed</strong> - Use <code>computed()</code> to create derived values.</li>
                        <li className="mb-2"><strong>Functions</strong> - Define actions as regular functions that modify the refs.</li>
                        <li className="mb-2"><strong>Return Object</strong> - Only properties and methods returned in the object will be accessible outside.</li>
                        <li className="mb-2"><strong>Composition</strong> - Easy to compose and reuse logic between stores.</li>
                    </ul>
                </div>

                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-3 mt-6">Using a Setup Store in Components</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    The usage is similar to Options stores, but you need to use <code>.value</code> to access refs and computed properties:
                </p>

                <CodeBlock
                    code={setupStoreUsageExample}
                    language="jsx"
                    filename="src/components/CounterSetup.tsx"
                />

                <p className="mt-4 text-gray-700 dark:text-gray-300">
                    Notice that you need to use <code>.value</code> to access the reactive values from refs and computed properties.
                    Actions can be accessed directly as functions (without <code>.value</code>).
                </p>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Store IDs and Organization</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Each store requires a unique string ID, which is the first parameter to <code>defineDotzeeStore</code>.
                    These IDs are important for:
                </p>

                <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300">
                    <li className="mb-2">Ensuring store singleton behavior</li>
                    <li className="mb-2">DevTools integration (actions appear as <code>storeId/actionName</code>)</li>
                    <li className="mb-2">Server-side rendering state hydration</li>
                    <li className="mb-2">Plugin targeting of specific stores</li>
                </ul>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md mb-6">
                    <h4 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Store Organization Best Practices:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Create one store file per feature or domain entity</li>
                        <li className="mb-2">Use descriptive, namespaced IDs (e.g., <code>'auth'</code>, <code>'products'</code>, <code>'ui/theme'</code>)</li>
                        <li className="mb-2">Export store hooks with a consistent naming pattern (e.g., <code>useAuthStore</code>, <code>useProductsStore</code>)</li>
                        <li className="mb-2">Group related stores in directories (e.g., <code>stores/product/</code>, <code>stores/user/</code>)</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">TypeScript Support</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Dotzee provides excellent TypeScript support with type inference for state, getters, and actions.
                    You can explicitly type your state or let TypeScript infer the types.
                </p>

                <CodeBlock
                    code={typescriptExample}
                    language="typescript"
                    filename="src/stores/typedStores.ts"
                />

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">TypeScript Tips:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Define interfaces for your state to improve autocompletion and error checking</li>
                        <li className="mb-2">Type your action parameters and return types for better IDE support</li>
                        <li className="mb-2">For Setup stores, use generic types with <code>ref&lt;T&gt;(initialValue)</code></li>
                        <li className="mb-2">Return types are automatically inferred from your state, getters, and actions</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">When to Choose Which API Style</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400 mb-3">Choose Options API when:</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>You prefer clear, segregated code organization</li>
                            <li>You're familiar with Redux, Vuex, or Pinia</li>
                            <li>Your store logic is relatively straightforward</li>
                            <li>You want to avoid dealing with <code>.value</code></li>
                            <li>You prefer using <code>this</code> to access state and actions</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-purple-600 dark:text-purple-400 mb-3">Choose Setup API when:</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>You need more flexibility in composition</li>
                            <li>You want to reuse logic between stores</li>
                            <li>You're building complex stores with derived state</li>
                            <li>You're familiar with React Hooks or Vue Composition API</li>
                            <li>You need to conditionally expose different APIs</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/core-concepts/reactivity" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Reactivity
                </Link>
                <Link to="/core-concepts/state" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    State
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default StoresPage; 
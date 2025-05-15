import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../components/CodeBlock';

const QuickStartPage: React.FC = () => {
    const basicStoreCode = `// src/stores/counterStore.ts
import { defineDotzeeStore } from 'dotzee';

// Define a counter store using the Options API
export const useCounterStore = defineDotzeeStore('counter', {
  // State contains the reactive properties
  state: () => ({ 
    count: 0 
  }),
  
  // Getters are derived state (computed properties)
  getters: {
    doubled: (state) => state.count * 2,
    isPositive: (state) => state.count > 0
  },
  
  // Actions are methods to modify the state
  actions: {
    increment() {
      this.count++;
    },
    decrement() {
      this.count--;
    }
  }
});`;

    const setupStoreCode = `// src/stores/counterSetupStore.ts
import { defineDotzeeStore, ref, computed } from 'dotzee';

// Define a counter store using the Setup API
export const useCounterSetupStore = defineDotzeeStore('counterSetup', () => {
  // Reactive state
  const count = ref(0);
  
  // Computed properties (getters)
  const doubled = computed(() => count.value * 2);
  const isPositive = computed(() => count.value > 0);
  
  // Actions
  function increment() {
    count.value++;
  }
  
  function decrement() {
    count.value--;
  }
  
  // Return everything that should be available
  return { 
    count, 
    doubled, 
    isPositive, 
    increment, 
    decrement 
  };
});`;

    const componentCode = `// src/components/Counter.tsx
import React from 'react';
import { useCounterStore } from '../stores/counterStore';

function Counter() {
  // Use the store directly
  const counter = useCounterStore();
  
  return (
    <div>
      <h2>Count: {counter.count}</h2>
      <p>Doubled: {counter.doubled}</p>
      <p>Is Positive: {counter.isPositive ? 'Yes' : 'No'}</p>
      
      <button onClick={() => counter.decrement()}>Decrement</button>
      <button onClick={() => counter.increment()}>Increment</button>
    </div>
  );
}

export default Counter;`;

    const setupComponentCode = `// src/components/CounterSetup.tsx
import React from 'react';
import { useCounterSetupStore } from '../stores/counterSetupStore';

function CounterSetup() {
  // Use the setup store directly
  const counter = useCounterSetupStore();
  
  return (
    <div>
      <h2>Count: {counter.count.value}</h2>
      <p>Doubled: {counter.doubled.value}</p>
      <p>Is Positive: {counter.isPositive.value ? 'Yes' : 'No'}</p>
      
      <button onClick={counter.decrement}>Decrement</button>
      <button onClick={counter.increment}>Increment</button>
    </div>
  );
}

export default CounterSetup;`;

    const devToolsCode = `// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { enableDotzeeDevTools } from 'dotzee';

// Enable DevTools in development mode
if (process.env.NODE_ENV === 'development') {
  enableDotzeeDevTools({
    name: 'My Dotzee App'
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Quick Start</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                This guide will help you quickly set up and start using Dotzee in your React application.
                You'll learn how to create stores, connect them to components, and enable DevTools.
            </p>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Creating Your First Store</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Dotzee offers two ways to define stores: the <strong>Options API</strong> (similar to Pinia) and the <strong>Setup API</strong> (composition style).
                    Let's start with the Options API, which is more familiar if you're coming from Vue/Pinia:
                </p>

                <CodeBlock
                    code={basicStoreCode}
                    language="typescript"
                    filename="src/stores/counterStore.ts"
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Store Structure:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2"><strong>state</strong> - A function that returns the initial state object</li>
                        <li className="mb-2"><strong>getters</strong> - Computed properties derived from the state</li>
                        <li className="mb-2"><strong>actions</strong> - Methods to modify the state (where <code>this</code> refers to the store instance)</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Using the Store in Components</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Once your store is defined, you can use it in any component by calling the store function directly:
                </p>

                <CodeBlock
                    code={componentCode}
                    language="tsx"
                    filename="src/components/Counter.tsx"
                />

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Key Points:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Use the store directly with <code>useCounterStore()</code></li>
                        <li className="mb-2">Access state and getters as properties: <code>counter.count</code>, <code>counter.doubled</code></li>
                        <li className="mb-2">Call actions as methods: <code>counter.increment()</code></li>
                        <li className="mb-2">React components automatically re-render when the store's state changes</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Alternative: Setup API</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    If you prefer a more composition-based approach (similar to React hooks or Vue's Composition API),
                    you can use the Setup API instead:
                </p>

                <CodeBlock
                    code={setupStoreCode}
                    language="typescript"
                    filename="src/stores/counterSetupStore.ts"
                />

                <p className="mt-6 mb-4 text-gray-700 dark:text-gray-300">
                    Using a Setup store in components is similar, but you'll need to access <code>.value</code> on refs and computed properties:
                </p>

                <CodeBlock
                    code={setupComponentCode}
                    language="tsx"
                    filename="src/components/CounterSetup.tsx"
                />

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">Setup API vs Options API:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Setup API uses <code>ref()</code> and <code>computed()</code> for reactivity</li>
                        <li className="mb-2">Access state with <code>counter.count.value</code> instead of <code>counter.count</code></li>
                        <li className="mb-2">More flexible composition but requires managing <code>.value</code> access</li>
                        <li className="mb-2">Better for complex stores with shared logic</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Enabling DevTools</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Dotzee integrates with Redux DevTools to help you debug your application's state.
                    To enable it, add this to your app's entry point:
                </p>

                <CodeBlock
                    code={devToolsCode}
                    language="typescript"
                    filename="src/main.tsx"
                />

                <p className="mt-4 text-gray-700 dark:text-gray-300">
                    With DevTools enabled, you can track state changes, actions, and even use time-travel debugging.
                    You'll need to have the <a href="https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400">Redux DevTools extension</a> installed in your browser.
                </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-medium text-yellow-800 dark:text-yellow-300 mb-3">What's Next?</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Now that you've created your first Dotzee store, explore these topics to learn more:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <Link to="/core-concepts/reactivity" className="block p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Reactivity System</h3>
                        <p className="text-gray-600 dark:text-gray-400">Learn how Dotzee's fine-grained reactivity works</p>
                    </Link>

                    <Link to="/core-concepts/getters" className="block p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Getters & Computed</h3>
                        <p className="text-gray-600 dark:text-gray-400">Create derived state that updates automatically</p>
                    </Link>

                    <Link to="/advanced-guides/ssr" className="block p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Server-Side Rendering</h3>
                        <p className="text-gray-600 dark:text-gray-400">Use Dotzee with Next.js and other SSR frameworks</p>
                    </Link>

                    <Link to="/advanced-guides/plugins" className="block p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Plugins</h3>
                        <p className="text-gray-600 dark:text-gray-400">Extend Dotzee with persistence, logging, and more</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default QuickStartPage; 
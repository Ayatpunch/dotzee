import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../components/CodeBlock';

const HomePage: React.FC = () => {
  const optionsStoreExample = `import { defineDotzeeStore } from 'dotzee';

// Options API - similar to Pinia's Options store
export const useCounterStore = defineDotzeeStore('counter', {
  state: () => ({ 
    count: 0,
    name: 'Counter',
    loading: false 
  }),
  getters: {
    doubledCount: (state) => state.count * 2,
    countStatus: (state) => {
      if (state.count > 0) return 'Positive';
      if (state.count < 0) return 'Negative';
      return 'Zero';
    }
  },
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

  const setupStoreExample = `import { defineDotzeeStore, ref, computed } from 'dotzee';

// Setup API - similar to Vue Composition API
export const useCounterStore = defineDotzeeStore('counterSetup', () => {
  // Reactive state
  const count = ref(0);
  const name = ref('Counter');
  const loading = ref(false);
  
  // Computed values
  const doubledCount = computed(() => count.value * 2);
  const countStatus = computed(() => {
    if (count.value > 0) return 'Positive';
    if (count.value < 0) return 'Negative';
    return 'Zero';
  });
  
  // Actions
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
  
  // Expose public API
  return { 
    count, name, loading, 
    doubledCount, countStatus,
    increment, decrement, incrementAsync
  };
});`;

  const reactComponentExample = `import React from 'react';
import { useDotzeeStore } from 'dotzee';
import { useCounterStore } from './stores/counterStore';

function Counter() {
  // Access the store with the useDotzeeStore hook
  const counter = useDotzeeStore(useCounterStore);
  
  return (
    <div className="counter">
      <h2>{counter.name}: {counter.count}</h2>
      <p>Doubled: {counter.doubledCount}</p>
      <p>Status: {counter.countStatus}</p>
      
      <div className="buttons">
        <button onClick={counter.decrement}>-</button>
        <button onClick={counter.increment}>+</button>
        <button 
          onClick={counter.incrementAsync}
          disabled={counter.loading}
        >
          {counter.loading ? 'Loading...' : 'Async +'}
        </button>
      </div>
    </div>
  );
}`;

  return (
    <div className="prose max-w-none">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-400 mb-6">Dotzee Documentation</h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
          A Pinia-like reactive state management library for React, built with TypeScript.
          Combining the best of Vue's Pinia with React's hooks to provide a simple, intuitive and strongly-typed state management solution.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/getting-started" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200">
            Get Started
          </Link>
          <a href="https://github.com/yourusername/dotzee" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            GitHub
          </a>
        </div>
      </div>

      {/* Key Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Key Features</h2>
        <ul className="grid md:grid-cols-2 gap-4">
          {[
            { title: "Proxy-based Reactivity", description: "Fine-grained updates for optimal performance without unnecessary re-renders" },
            { title: "Dual Store Syntaxes", description: "Choose between Options and Setup API styles based on your preferences" },
            { title: "Strong TypeScript Support", description: "Full type inference for state, getters, and actions with minimal type declarations" },
            { title: "DevTools Integration", description: "Connect to Redux DevTools for state inspection and time-travel debugging" },
            { title: "SSR Compatible", description: "Server-side rendering support with request-scoped state" },
            { title: "Plugin System", description: "Extend functionality with a powerful plugin API" }
          ].map((feature, index) => (
            <li key={index} className="flex items-start p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-800">
              <div className="flex-shrink-0 h-6 w-6 mr-3 text-purple-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Code Example Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Quick Example</h2>

        {/* Options Store Example */}
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">Options Store</h3>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Define a store using the familiar Options API pattern:
          </p>
          <CodeBlock
            code={optionsStoreExample}
            language="typescript"
            filename="counterStore.ts"
          />
        </div>

        {/* Setup Store Example */}
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">Setup Store</h3>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Or use the more flexible Setup API pattern:
          </p>
          <CodeBlock
            code={setupStoreExample}
            language="typescript"
            filename="counterSetupStore.ts"
          />
        </div>

        {/* React Component Usage */}
        <div className="mb-8">
          <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">Using in React Components</h3>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Access your store with the <code>useDotzeeStore</code> hook:
          </p>
          <CodeBlock
            code={reactComponentExample}
            language="jsx"
            filename="Counter.jsx"
          />
        </div>
      </div>

      {/* Getting Started CTA */}
      <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
        <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-400 mb-4">Ready to try Dotzee?</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Get started with Dotzee today and experience a simpler, more intuitive approach to state management in React.
        </p>
        <Link to="/getting-started" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200">
          Get Started →
        </Link>
      </div>
    </div>
  );
};

export default HomePage; 
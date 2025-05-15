import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../components/CodeBlock';

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'options' | 'setup'>('options');

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
import { useCounterStore } from './stores/counterStore';

function Counter() {
  // Access the store directly
  const counter = useCounterStore();
  
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
    <div>
      {/* Hero Section with animated background and logo */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 text-white py-24 px-8 rounded-3xl mb-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/2 top-0 transform -translate-x-1/2 w-full h-full overflow-hidden">
            {/* Background code pattern */}
            <div className="absolute opacity-20 text-xs overflow-hidden leading-relaxed whitespace-pre font-mono rotate-12 text-white">
              {optionsStoreExample.repeat(10)}
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0 md:w-1/2">
              <div className="flex items-center mb-4">
                <img src="/logo.svg" alt="Dotzee Logo" className="h-12 w-12 mr-3" />
                <span className="text-xl font-bold tracking-tight">Dotzee</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                Reactive State Management for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">React</span>
              </h1>
              <p className="text-xl text-indigo-100 mb-8 max-w-lg">
                A Pinia-inspired state management solution combining Vue's reactivity system with React's component model for intuitive, type-safe state management.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/getting-started" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg text-purple-700 bg-white hover:bg-indigo-50 transition-colors duration-200">
                  Get Started
                </Link>
                <a href="https://github.com/Ayatpunch/dotzee" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg text-white border border-white/30 hover:bg-white/10 transition-colors duration-200">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </a>
              </div>
            </div>
            <div className="md:w-1/2 hidden md:block">
              <div className="relative bg-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-sm border border-white/20">
                <div className="absolute top-4 left-4 flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <pre className="text-indigo-100 text-sm font-mono mt-5 overflow-x-auto">
                  <code>{`import { defineDotzeeStore } from 'dotzee';

export const useStore = defineDotzeeStore('app', {
  state: () => ({ 
    counter: 0,
    user: { name: 'Guest' }
  }),
  actions: {
    increment() {
      this.counter++;
    }
  }
});

// In your component
function App() {
  const store = useStore();
  
  return (
    <button onClick={store.increment}>
      Count: {store.counter}
    </button>
  );
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What is Dotzee section */}
      <div className="max-w-6xl mx-auto px-8 mb-24">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <div className="relative">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 opacity-75 blur"></div>
              <div className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-900 p-8 shadow-xl">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Why Choose Dotzee?</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Dotzee combines the elegance of Vue's Pinia with the power of React's ecosystem to bring you a state management solution that feels natural and intuitive.
                  </p>
                  <div className="inline-flex items-center justify-center p-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                    <img src="/logo.svg" alt="Dotzee Logo" className="h-20 w-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">What is Dotzee?</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Dotzee is a state management library for React that brings the developer-friendly experience of Vue's Pinia to React applications. It leverages a fine-grained reactivity system for optimal performance without unnecessary re-renders.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Whether you prefer a more structured options-based API or a flexible composition-style approach, Dotzee accommodates both with full TypeScript support.
            </p>
            <Link to="/concepts" className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium">
              Learn more about the concepts
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="max-w-6xl mx-auto px-8 mb-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Proxy-based Reactivity",
              description: "Fine-grained updates for optimal performance without unnecessary re-renders",
              icon: (
                <svg className="w-10 h-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )
            },
            {
              title: "Dual Store Syntaxes",
              description: "Choose between Options and Setup API styles based on your preferences",
              icon: (
                <svg className="w-10 h-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              )
            },
            {
              title: "Strong TypeScript Support",
              description: "Full type inference for state, getters, and actions with minimal type declarations",
              icon: (
                <svg className="w-10 h-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )
            },
            {
              title: "DevTools Integration",
              description: "Connect to Redux DevTools for state inspection and time-travel debugging",
              icon: (
                <svg className="w-10 h-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              )
            },
            {
              title: "SSR Compatible",
              description: "Server-side rendering support with request-scoped state",
              icon: (
                <svg className="w-10 h-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              )
            },
            {
              title: "Plugin System",
              description: "Extend functionality with a powerful plugin API for persistence, logging, and more",
              icon: (
                <svg className="w-10 h-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              )
            }
          ].map((feature, index) => (
            <div key={index} className="group relative p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-lg transform origin-left transition-all duration-300 group-hover:scale-x-100"></div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Example Section */}
      <div className="bg-gray-50 dark:bg-gray-900/50 py-20 px-8 mb-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Quick Example</h2>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg p-1 bg-gray-200 dark:bg-gray-800">
              <button
                onClick={() => setActiveTab('options')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${activeTab === 'options'
                  ? 'bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-400 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
              >
                Options API
              </button>
              <button
                onClick={() => setActiveTab('setup')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${activeTab === 'setup'
                  ? 'bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-400 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
              >
                Setup API
              </button>
            </div>
          </div>

          {/* Code Examples */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    {activeTab === 'options' ? 'Options Store' : 'Setup Store'}
                  </h3>
                </div>
                <div className="p-5">
                  <CodeBlock
                    code={activeTab === 'options' ? optionsStoreExample : setupStoreExample}
                    language="typescript"
                    filename={activeTab === 'options' ? "counterStore.ts" : "counterSetupStore.ts"}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    Using in React Components
                  </h3>
                </div>
                <div className="p-5">
                  <CodeBlock
                    code={reactComponentExample}
                    language="jsx"
                    filename="Counter.jsx"
                  />
                </div>
              </div>
              <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">How it works</h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li className="flex">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Define your store with state, getters, and actions</span>
                  </li>
                  <li className="flex">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Import and use your store in any component</span>
                  </li>
                  <li className="flex">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Changes to state automatically trigger re-renders</span>
                  </li>
                  <li className="flex">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Debug with integrated DevTools</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials or social proof section could go here */}

      {/* Getting Started CTA */}
      <div className="max-w-6xl mx-auto px-8 mb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-600 p-12 text-center">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,transparent,white,transparent)] pointer-events-none"></div>
          <h2 className="text-4xl font-bold text-white mb-6">Ready to get started?</h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Experience a simpler, more intuitive approach to state management in React. Dotzee gives you the best developer experience without compromising on performance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/getting-started" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-purple-700 bg-white hover:bg-indigo-50 transition-colors duration-200">
              Get Started
            </Link>
            <Link to="/concepts" className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-lg text-white border border-white/30 hover:bg-white/10 transition-colors duration-200">
              Learn Concepts
            </Link>
          </div>
          <div className="mt-8 text-indigo-200 text-sm">
            No complicated setup. Start using in minutes.
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 
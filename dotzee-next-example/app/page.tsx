import ClientContainer from '../components/ClientContainer'; // IMPORT new container
// import ClientPage from '../components/ClientPage'; // REMOVED - now imported by ClientContainer
import LazyLoaderDisplay from '../components/LazyLoaderDisplay';

export default function Page() {
  // Simply hardcode the initial state without any Dotzee dependencies
  const initialDotzeeState = {
    'counterOptions': {
      count: 5,
      name: 'Options Counter',
      loading: false,
    },
  };

  // REMOVE registry reset
  // resetActiveDotzeeRegistry();

  return (
    <>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        </div>
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300">
                Reactive State Management
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
                Dotzee is a Pinia-like state management library for React, offering fine-grained reactivity,
                TypeScript support, and SSR compatibility.
              </p>
              <div className="mt-8 flex gap-4 justify-center">
                <a
                  href="#demos"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-150"
                >
                  View Demos
                </a>
                <a
                  href="https://github.com/yourusername/dotzee"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Preview Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Simple, Intuitive API
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                Define stores with a familiar API inspired by Vue's Pinia. Enjoy excellent TypeScript support
                and seamless integration with React components.
              </p>
              <div className="mt-6">
                <div className="flex flex-col space-y-2">
                  {[
                    { text: 'Fine-grained reactivity with Proxy-based state', icon: '⚡' },
                    { text: 'Type-safe with full TypeScript inference', icon: '🔒' },
                    { text: 'Server-Side Rendering support', icon: '🖥️' },
                    { text: 'Code splitting compatibility', icon: '📦' },
                    { text: 'DevTools integration', icon: '🛠️' }
                  ].map((feature) => (
                    <div key={feature.text} className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center mr-2">
                        <span>{feature.icon}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{feature.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="rounded-xl bg-gray-900 dark:bg-gray-800 overflow-hidden shadow-lg">
                <div className="px-4 py-2 bg-gray-800 dark:bg-gray-700 flex items-center">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="ml-4 text-gray-200 text-sm font-mono">
                    defineDotzeeStore.ts
                  </div>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-100 font-mono">
                    <code>
                      {`import { defineDotzeeStore } from 'dotzee';

// Define a store with the Options API
export const useCounterStore = defineDotzeeStore('counter', {
  state: () => ({ 
    count: 0,
    name: 'Counter'
  }),
  getters: {
    doubled: (state) => state.count * 2,
  },
  actions: {
    increment() {
      this.count++;
    },
    async fetchData() {
      // Async support built-in
      const data = await api.getData();
      this.count = data.count;
    }
  }
});

// Use in any React component
function Counter() {
  const counter = useDotzeeStore(useCounterStore);
  
  return (
    <div>
      <h1>{counter.name}: {counter.count}</h1>
      <p>Doubled: {counter.doubled}</p>
      <button onClick={counter.increment}>+1</button>
    </div>
  );
}`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demos Section */}
      <div id="demos" className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base font-semibold tracking-wide uppercase text-indigo-600 dark:text-indigo-400">
              Interactive Demos
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Explore Dotzee's Capabilities
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
              See Dotzee in action with these interactive demos showcasing key features.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Server-Side Rendering Demo */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden transform transition-all hover:scale-[1.01]">
              <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600">
                <h3 className="text-lg font-medium text-white">
                  Server-Side Rendering
                </h3>
                <p className="text-purple-100 text-sm">
                  Pre-rendered on the server, hydrated on the client
                </p>
              </div>
              <div className="p-4">
                <ClientContainer initialDotzeeState={initialDotzeeState} />
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This counter was rendered on the server with its initial state and hydrated on the client without losing reactivity.
                </p>
              </div>
            </div>

            {/* Code Splitting Demo */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden transform transition-all hover:scale-[1.01]">
              <div className="p-4 bg-gradient-to-r from-cyan-600 to-teal-600">
                <h3 className="text-lg font-medium text-white">
                  Code Splitting & Lazy Loading
                </h3>
                <p className="text-cyan-100 text-sm">
                  Dynamically imported component with its own store
                </p>
              </div>
              <div className="p-4">
                <LazyLoaderDisplay />
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This feature and its store are loaded on-demand using React.lazy and dynamic imports, demonstrating Dotzee's compatibility with code splitting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700 dark:bg-indigo-900">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to try Dotzee?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Get started with Dotzee today and experience a simpler, more intuitive approach to state management in React.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <a
                href="https://github.com/yourusername/dotzee"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
              >
                Get Started
              </a>
            </div>
            <div className="ml-3 inline-flex">
              <a
                href="#"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-800 hover:bg-indigo-900"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

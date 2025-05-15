import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const ReactivityPage: React.FC = () => {
    const proxyExample = `// Dotzee's reactivity system uses JavaScript Proxies under the hood
const state = reactive({
  count: 0,
  message: 'Hello'
});

// When you access or modify properties, the proxy traps these operations
state.count++; // Triggers reactivity system to update UI
console.log(state.message); // Tracked as a dependency`;

    const refExample = `import { ref } from 'dotzee';

// Create a standalone reactive value with ref
const count = ref(0);
const message = ref('Hello');

// Access and modify using .value
console.log(count.value); // 0
count.value++; // Updates to 1
message.value = 'Hello World'; // Changes value`;

    const computedExample = `import { ref, computed } from 'dotzee';

const count = ref(0);

// Create a computed property that depends on count
const doubled = computed(() => count.value * 2);
const isPositive = computed(() => count.value > 0);

console.log(doubled.value); // 0
count.value = 5;
console.log(doubled.value); // 10 (automatically updated)`;

    const reactivityInStoresExample = `// In Options Store (object-based)
const useCounterStore = defineDotzeeStore('counter', {
  state: () => ({ count: 0 }),
  getters: {
    doubled: (state) => state.count * 2 // Automatically reactive
  },
  actions: {
    increment() {
      this.count++; // Triggers UI updates
    }
  }
});

// In Setup Store (composition-based)
const useCounterStore = defineDotzeeStore('counter', () => {
  const count = ref(0);
  const doubled = computed(() => count.value * 2);
  
  function increment() {
    count.value++;
  }
  
  return { count, doubled, increment };
});`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Reactivity System</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Dotzee's reactivity system enables automatic UI updates when your state changes. This system is
                inspired by Vue 3's reactivity, providing fine-grained updates that only re-render components
                that actually depend on the changed data.
            </p>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Core Reactivity Mechanisms</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Dotzee uses three main reactivity primitives:
                </p>

                <div className="grid md:grid-cols-3 gap-5 mb-6">
                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="text-purple-600 dark:text-purple-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">reactive()</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Makes objects reactive using JavaScript Proxies. Ideal for complex state objects.
                        </p>
                    </div>

                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="text-blue-600 dark:text-blue-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">ref()</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Creates standalone reactive values. Used for primitive values or in the Setup API.
                        </p>
                    </div>

                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="text-green-600 dark:text-green-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">computed()</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Creates derived reactive values that update automatically when dependencies change.
                        </p>
                    </div>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Proxy-based Reactivity</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    At the core of Dotzee is a <strong>Proxy-based reactivity system</strong>. When you create
                    a reactive object using <code>reactive()</code>, Dotzee wraps it in a JavaScript Proxy
                    that intercepts property access and modifications.
                </p>

                <CodeBlock
                    code={proxyExample}
                    language="javascript"
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">How Proxy-based Reactivity Works:</h4>
                    <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2"><strong>Property Access (get trap):</strong> When a component reads a property, the reactivity system tracks this as a dependency.</li>
                        <li className="mb-2"><strong>Property Mutation (set trap):</strong> When a property changes, the system notifies all components that depend on it.</li>
                        <li className="mb-2"><strong>Collection Handling:</strong> Special handling for arrays, Maps, and Sets to make their methods reactive.</li>
                        <li className="mb-2"><strong>Deep Reactivity:</strong> Nested objects are automatically made reactive when accessed.</li>
                    </ol>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Refs: Standalone Reactive Values</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    While the proxy-based approach works well for objects, JavaScript doesn't allow proxying primitive values
                    like numbers or strings directly. For these cases, Dotzee provides <code>ref()</code>, which wraps the
                    value in a reactive object with a <code>.value</code> property.
                </p>

                <CodeBlock
                    code={refExample}
                    language="javascript"
                />

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">Ref Key Points:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Refs are objects with a <code>.value</code> property that holds the actual value.</li>
                        <li className="mb-2">Reading <code>ref.value</code> is tracked as a dependency.</li>
                        <li className="mb-2">Changing <code>ref.value</code> triggers reactive updates.</li>
                        <li className="mb-2">Refs can hold any value type (primitives, objects, arrays, etc.).</li>
                        <li className="mb-2">When using the Setup Store API, you'll work extensively with refs.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Computed Properties</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Computed properties are derived values that update automatically when their dependencies change.
                    They are essentially getters with dependency tracking and caching.
                </p>

                <CodeBlock
                    code={computedExample}
                    language="javascript"
                />

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Computed Key Points:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Computed properties are <strong>lazy</strong> — they only recalculate when accessed after dependencies change.</li>
                        <li className="mb-2">Computed values are <strong>cached</strong> — the calculation function only runs when dependencies change.</li>
                        <li className="mb-2">Like refs, computed properties expose their value via the <code>.value</code> property.</li>
                        <li className="mb-2">In the Options API, these are defined as <code>getters</code>.</li>
                        <li className="mb-2">Computed properties are read-only by default.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Reactivity in Stores</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Dotzee's store system leverages these reactivity primitives to create reactive state management.
                    The reactivity system works slightly differently depending on whether you use the Options or Setup API.
                </p>

                <CodeBlock
                    code={reactivityInStoresExample}
                    language="typescript"
                />

                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-3 mt-6">Options Store (Object-based)</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    In Options Stores, the state object is automatically made reactive using <code>reactive()</code>.
                    Getters are implemented as computed properties behind the scenes, and you can access state and
                    getters directly (without <code>.value</code>).
                </p>

                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-3 mt-6">Setup Store (Composition-based)</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    In Setup Stores, you explicitly use <code>ref()</code> and <code>computed()</code> for reactivity.
                    You need to access and modify values using <code>.value</code> for both refs and computed properties.
                </p>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">React Integration</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Dotzee integrates its reactivity system with React using <code>useSyncExternalStore</code>,
                    a React hook introduced in React 18 specifically for subscribing to external state sources.
                </p>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    When you use a Dotzee store in a React component, the component automatically subscribes to changes
                    and re-renders efficiently when the specific state it depends on changes.
                </p>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Benefits of this approach:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2"><strong>Fine-grained updates:</strong> Only components that actually use the changed state re-render.</li>
                        <li className="mb-2"><strong>Automatic dependency tracking:</strong> No need to specify which pieces of state a component depends on.</li>
                        <li className="mb-2"><strong>Concurrent mode compatible:</strong> Works seamlessly with React 18's concurrent features.</li>
                        <li className="mb-2"><strong>Server-side rendering support:</strong> Can be safely used in SSR environments.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Reactivity Best Practices</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-green-600 dark:text-green-400 mb-3">Do</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Access reactive properties directly in render functions to establish dependencies</li>
                            <li>Use computed properties for derived state to maintain cache efficiency</li>
                            <li>Remember to use <code>.value</code> with refs and computed properties in Setup stores</li>
                            <li>Group related state in logical objects when using <code>reactive()</code></li>
                            <li>Prefer the Options API for simpler stores and the Setup API for complex logic</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-red-600 dark:text-red-400 mb-3">Avoid</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Destructuring reactive objects, which loses reactivity</li>
                            <li>Unnecessary computed properties when simple expressions would work</li>
                            <li>Forgetting <code>.value</code> when working with refs or computed properties</li>
                            <li>Creating reactive data outside of store definitions</li>
                            <li>Mutating reactive state outside of actions for maintainability</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/core-concepts" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Core Concepts
                </Link>
                <Link to="/core-concepts/stores" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    Defining Stores
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default ReactivityPage; 
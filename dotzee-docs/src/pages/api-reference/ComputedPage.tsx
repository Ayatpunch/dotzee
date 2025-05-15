import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const ComputedPage: React.FC = () => {
    const basicExample = `import { ref, computed } from 'dotzee';

// Create refs for base values
const count = ref(0);
const multiplier = ref(2);

// Create a computed property that depends on both refs
const doubled = computed(() => count.value * multiplier.value);

// Access the computed value
console.log(doubled.value); // 0 (because count is 0)

// When dependencies change, the computed value updates automatically
count.value = 5;
console.log(doubled.value); // 10

multiplier.value = 3;
console.log(doubled.value); // 15`;

    const setupStoreExample = `import { defineDotzeeStore, ref, computed } from 'dotzee';

export const useProductStore = defineDotzeeStore('product', () => {
  // Base reactive state
  const price = ref(10);
  const quantity = ref(1);
  const taxRate = ref(0.1); // 10%
  
  // Computed properties
  const subtotal = computed(() => price.value * quantity.value);
  const tax = computed(() => subtotal.value * taxRate.value);
  const total = computed(() => subtotal.value + tax.value);
  
  // Actions
  function updateQuantity(newQuantity) {
    quantity.value = newQuantity;
  }
  
  function updatePrice(newPrice) {
    price.value = newPrice;
  }
  
  // Return state and methods
  return {
    price,
    quantity,
    taxRate,
    subtotal,
    tax,
    total,
    updateQuantity,
    updatePrice
  };
});`;

    const optionsAPIExample = `import { defineDotzeeStore } from 'dotzee';

export const useProductStore = defineDotzeeStore('product', {
  state: () => ({
    price: 10,
    quantity: 1,
    taxRate: 0.1 // 10%
  }),
  
  getters: {
    // Getters in Options API are equivalent to computed properties
    subtotal: (state) => state.price * state.quantity,
    tax: (state) => state.price * state.quantity * state.taxRate,
    total: (state) => state.price * state.quantity * (1 + state.taxRate)
  },
  
  actions: {
    updateQuantity(newQuantity) {
      this.quantity = newQuantity;
    },
    updatePrice(newPrice) {
      this.price = newPrice;
    }
  }
});`;

    const componentUsageExample = `import React from 'react';
import { useProductStore } from '../stores/productStore';

function ProductCalculator() {
  // Using a Setup API store with computed properties
  const store = useProductStore();
  
  return (
    <div className="product-calculator">
      <h2>Product Calculator</h2>
      
      <div className="form-group">
        <label>Price: $</label>
        <input 
          type="number" 
          value={store.price.value}
          onChange={(e) => store.updatePrice(Number(e.target.value))}
        />
      </div>
      
      <div className="form-group">
        <label>Quantity:</label>
        <input 
          type="number" 
          value={store.quantity.value}
          onChange={(e) => store.updateQuantity(Number(e.target.value))}
        />
      </div>
      
      <div className="results">
        <p>Subtotal: \${store.subtotal.value.toFixed(2)}</p>
        <p>Tax: \${store.tax.value.toFixed(2)}</p>
        <p>Total: \${store.total.value.toFixed(2)}</p>
      </div>
    </div>
  );
}`;

    const computedWithMethodExample = `import { ref, computed } from 'dotzee';

const items = ref([
  { id: 1, name: 'Apple', price: 1.2, quantity: 3 },
  { id: 2, name: 'Banana', price: 0.8, quantity: 6 },
  { id: 3, name: 'Cherry', price: 2.5, quantity: 1 }
]);

const searchTerm = ref('');

// Computed property with methods inside
const filteredItems = computed(() => {
  return items.value
    .filter(item => item.name.toLowerCase().includes(searchTerm.value.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));
});

// Computed that depends on another computed
const totalCost = computed(() => {
  return filteredItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

// Usage
searchTerm.value = 'a'; // Search for items containing 'a'
console.log(filteredItems.value); // Will show Apple and Banana items
console.log(totalCost.value); // Will calculate total of filtered items`;

    const typeSignature = `function computed<T>(getter: () => T): ComputedRef<T>

// The ComputedRef type interface
interface ComputedRef<T> {
  readonly value: T;
}`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">computed</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                The <code>computed</code> function creates a reactive computed value that automatically updates
                when its dependencies change. Computed values are a core part of Dotzee's reactivity system,
                allowing you to derive state based on other reactive state.
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">getter</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{'() => T'}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    A function that returns the computed value. Any reactive dependencies (refs or other computed values)
                                    accessed within this function will be tracked. When these dependencies change, the computed value
                                    will be recalculated.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Return Value</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    Returns a readonly reactive reference object that contains a single property <code>value</code> which
                    holds the computed result. The value is automatically updated when any of its dependencies change.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Key Characteristics:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2"><strong>Lazily evaluated:</strong> The getter function only runs when the computed value is accessed.</li>
                        <li className="mb-2"><strong>Cached:</strong> Results are cached until dependencies change, preventing unnecessary recalculations.</li>
                        <li className="mb-2"><strong>Readonly:</strong> Computed values are read-only by default; you cannot directly modify <code>computed.value</code>.</li>
                        <li className="mb-2"><strong>Dependency tracking:</strong> Automatically tracks other refs or computed values used in the getter.</li>
                        <li className="mb-2"><strong>Dependency chain:</strong> Can depend on other computed properties, creating reactive dependency chains.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Basic Usage</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Creating and using computed properties:
                </p>

                <CodeBlock
                    code={basicExample}
                    language="typescript"
                    filename="example.ts"
                />

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Important:</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                        Like refs, computed values must be accessed using the <code>.value</code> property. The computed value
                        will automatically update whenever any of its dependencies change, without you needing to call the getter
                        function again.
                    </p>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Using Computed in Setup Stores</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Computed properties are commonly used in Setup API store definitions to derive state:
                </p>

                <CodeBlock
                    code={setupStoreExample}
                    language="typescript"
                    filename="stores/productStore.ts"
                />

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">Setup Store Pattern:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Define base state as <code>ref</code> variables.</li>
                        <li className="mb-2">Create <code>computed</code> properties that derive values from these refs.</li>
                        <li className="mb-2">Create functions that modify the base refs (not the computed values).</li>
                        <li className="mb-2">Return both refs, computed values, and functions as part of the store's public API.</li>
                        <li className="mb-2">When any base ref changes, all dependent computed values automatically update.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Equivalent: Getters in Options API</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    In the Options API, getters serve the same purpose as computed properties:
                </p>

                <CodeBlock
                    code={optionsAPIExample}
                    language="typescript"
                    filename="stores/productStore.ts"
                />

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Getters vs Computed:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Getters in the Options API are defined in the <code>getters</code> object.</li>
                        <li className="mb-2">Each getter receives the <code>state</code> as its first parameter.</li>
                        <li className="mb-2">Getters are accessed directly without <code>.value</code> (e.g., <code>store.subtotal</code>).</li>
                        <li className="mb-2">Under the hood, getters use the same <code>computed</code> mechanism for reactivity.</li>
                        <li className="mb-2">Both approaches provide the same caching, dependency tracking, and automatic updates.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Using Computed Values in Components</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    When using computed values from a store in React components:
                </p>

                <CodeBlock
                    code={componentUsageExample}
                    language="jsx"
                    filename="components/ProductCalculator.jsx"
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Component Usage:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Access computed values with <code>.value</code> in component render functions (when using Setup API).</li>
                        <li className="mb-2">Components automatically re-render when computed values change.</li>
                        <li className="mb-2">Modify only the base refs (through actions), not the computed values directly.</li>
                        <li className="mb-2">Computed properties help keep components slim by moving derivation logic to the store.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Advanced Computed Examples</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Computed properties can contain complex logic, method calls, and even depend on other computed values:
                </p>

                <CodeBlock
                    code={computedWithMethodExample}
                    language="typescript"
                    filename="advancedComputed.ts"
                />

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Advanced Features:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Computed properties can use array methods like <code>filter</code>, <code>map</code>, <code>reduce</code>, etc.</li>
                        <li className="mb-2">You can chain multiple operations within a single computed getter.</li>
                        <li className="mb-2">Computed values can depend on other computed values, creating reactive dependency chains.</li>
                        <li className="mb-2">Reusing computed properties helps improve performance by reducing duplicate calculations.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Best Practices</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-green-600 dark:text-green-400 mb-3">Do</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Keep computed getters pure and free of side effects</li>
                            <li>Use computed properties for any value derived from reactive state</li>
                            <li>Break complex computations into smaller, reusable computed properties</li>
                            <li>Remember to access computed values with <code>.value</code> in Setup stores</li>
                            <li>Use TypeScript with computed for better type safety and autocompletion</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-red-600 dark:text-red-400 mb-3">Avoid</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Mutating state inside computed getters (they should be read-only)</li>
                            <li>Async operations inside computed getters</li>
                            <li>Computationally expensive operations without proper memoization</li>
                            <li>Trying to directly modify the <code>.value</code> of a computed property</li>
                            <li>Creating circular dependencies between computed properties</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Performance Considerations</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Computed properties are optimized for performance in several ways:
                </p>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">Performance Optimizations:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2"><strong>Lazy Evaluation:</strong> Computed properties only calculate when they're accessed, not when dependencies change.</li>
                        <li className="mb-2"><strong>Caching:</strong> The result is cached until dependencies change, preventing redundant recalculations.</li>
                        <li className="mb-2"><strong>Fine-grained Dependency Tracking:</strong> Only recomputes when dependencies actually change, not on any state change.</li>
                        <li className="mb-2"><strong>Smart Scheduling:</strong> Multiple updates to dependencies are batched before recalculation.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">See Also</h2>

                <ul className="space-y-2">
                    <li>
                        <Link to="/api-reference/ref" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            ref - Creating reactive values
                        </Link>
                    </li>
                    <li>
                        <Link to="/api-reference/defineDotzeeStore" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            defineDotzeeStore - Creating store definitions
                        </Link>
                    </li>
                    <li>
                        <Link to="/core-concepts/getters" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            Getters - Using computed values in the Options API
                        </Link>
                    </li>
                    <li>
                        <Link to="/core-concepts/reactivity" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            Reactivity System - Understanding how reactivity works in Dotzee
                        </Link>
                    </li>
                </ul>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/api-reference/ref" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    ref
                </Link>
                <Link to="/api-reference/devtools" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    DevTools
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default ComputedPage; 
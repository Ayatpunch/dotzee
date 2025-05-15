import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const GettersPage: React.FC = () => {
    const optionsGettersExample = `// src/stores/productStore.ts
import { defineDotzeeStore } from 'dotzee';

export const useProductStore = defineDotzeeStore('products', {
  state: () => ({
    products: [
      { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics' },
      { id: 2, name: 'Headphones', price: 199.99, category: 'Electronics' },
      { id: 3, name: 'Coffee Mug', price: 12.99, category: 'Kitchen' }
    ],
    taxRate: 0.08,
    discountRate: 0
  }),
  
  getters: {
    // Basic getter that returns a value derived from state
    productCount: (state) => state.products.length,
    
    // Getter that performs calculations on state
    totalPrice: (state) => {
      return state.products.reduce((sum, product) => sum + product.price, 0);
    },
    
    // Getter that includes tax calculation
    totalWithTax: (state) => {
      const subtotal = state.products.reduce((sum, product) => sum + product.price, 0);
      return subtotal * (1 + state.taxRate);
    },
    
    // Getter that returns a function to filter by category
    getProductsByCategory: (state) => (category) => {
      return state.products.filter(product => product.category === category);
    },
    
    // Getter that depends on another getter
    discountedTotal: (state, getters) => {
      return getters.totalWithTax * (1 - state.discountRate);
    },
    
    // Getter that formats a value for display
    formattedTotal: (state, getters) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(getters.discountedTotal);
    }
  }
});`;

    const setupGettersExample = `// src/stores/productSetupStore.ts
import { defineDotzeeStore, ref, computed } from 'dotzee';

export const useProductStore = defineDotzeeStore('products', () => {
  // State as refs
  const products = ref([
    { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics' },
    { id: 2, name: 'Headphones', price: 199.99, category: 'Electronics' },
    { id: 3, name: 'Coffee Mug', price: 12.99, category: 'Kitchen' }
  ]);
  const taxRate = ref(0.08);
  const discountRate = ref(0);
  
  // Computed properties (equivalent to getters)
  const productCount = computed(() => products.value.length);
  
  const totalPrice = computed(() => {
    return products.value.reduce((sum, product) => sum + product.price, 0);
  });
  
  const totalWithTax = computed(() => {
    return totalPrice.value * (1 + taxRate.value);
  });
  
  // Computed that returns a function
  const getProductsByCategory = computed(() => {
    // Returns a function that can be called with arguments
    return (category) => {
      return products.value.filter(product => product.category === category);
    };
  });
  
  // Computed that depends on other computed properties
  const discountedTotal = computed(() => {
    return totalWithTax.value * (1 - discountRate.value);
  });
  
  const formattedTotal = computed(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(discountedTotal.value);
  });
  
  return {
    products,
    taxRate,
    discountRate,
    productCount,
    totalPrice,
    totalWithTax,
    getProductsByCategory,
    discountedTotal,
    formattedTotal
  };
});`;

    const gettersUsageExample = `// Using getters from an Options Store\nimport { useProductStore } from '../stores/productStore';\n\nfunction ProductList() {\n  const store = useProductStore();\n  \n  return (\n    <div>\n      <h2>Products ({store.productCount})</h2>\n      \n      <p>Subtotal: \${store.totalPrice.toFixed(2)}</p>\n      <p>Total with Tax: \${store.totalWithTax.toFixed(2)}</p>\n      <p>Final Price: {store.formattedTotal}</p>\n      \n      <h3>Electronics:</h3>\n      <ul>\n        {store.getProductsByCategory('Electronics').map(product => (\n          <li key={product.id}>{product.name} - \${product.price}</li>\n        ))}\n      </ul>\n    </div>\n  );\n}\n\n// Using computed properties from a Setup Store\nimport { useProductStore } from '../stores/productSetupStore';\n\nfunction ProductList() {\n  const store = useProductStore();\n  \n  return (\n    <div>\n      <h2>Products ({store.productCount.value})</h2>\n      \n      <p>Subtotal: \${store.totalPrice.value.toFixed(2)}</p>\n      <p>Total with Tax: \${store.totalWithTax.value.toFixed(2)}</p>\n      <p>Final Price: {store.formattedTotal.value}</p>\n      \n      <h3>Electronics:</h3>\n      <ul>\n        {store.getProductsByCategory.value('Electronics').map(product => (\n          <li key={product.id}>{product.name} - \${product.price}</li>\n        ))}\n      </ul>\n    </div>\n  );\n}`;

    const gettersChainingExample = `// Composing getters - Options API
getters: {
  totalPrice: (state) => state.products.reduce((sum, p) => sum + p.price, 0),
  taxAmount: (state, getters) => getters.totalPrice * state.taxRate,
  shippingCost: (state, getters) => getters.totalPrice > 100 ? 0 : 10,
  grandTotal: (state, getters) => getters.totalPrice + getters.taxAmount + getters.shippingCost
}

// Composing computeds - Setup API
const totalPrice = computed(() => products.value.reduce((sum, p) => sum + p.price, 0));
const taxAmount = computed(() => totalPrice.value * taxRate.value);
const shippingCost = computed(() => totalPrice.value > 100 ? 0 : 10);
const grandTotal = computed(() => totalPrice.value + taxAmount.value + shippingCost.value);`;

    const gettersTipsExample = `// Using getter parameters - Options API
getters: {
  // ❌ Anti-pattern: Directly filtering in the getter
  expensiveProducts: (state) => {
    return state.products.filter(p => p.price > 100);
  },
  
  // ✅ Better: Parameterized getter using closure
  productsByPriceRange: (state) => (min, max) => {
    return state.products.filter(p => p.price >= min && p.price <= max);
  }
}

// Using getter parameters - Setup API
// ❌ Anti-pattern: Directly filtering in the computed
const expensiveProducts = computed(() => {
  return products.value.filter(p => p.price > 100);
});

// ✅ Better: Parameterized function via computed that returns a function
const productsByPriceRange = computed(() => {
  return (min, max) => {
    return products.value.filter(p => p.price >= min && p.price <= max);
  };
});`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Getters & Computed Properties</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Getters and computed properties allow you to derive new values from your store's state.
                They are powerful tools for encapsulating logic and improving performance through caching.
            </p>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">What are Getters?</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Getters are computed values derived from a store's state. They can be thought of as computed
                    properties for your stores. Dotzee provides getters in both API styles:
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Options API: Getters</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Defined in the <code>getters</code> object</li>
                            <li>Functions that receive <code>state</code> as first parameter</li>
                            <li>Can access other getters via second parameter</li>
                            <li>Results are cached based on dependencies</li>
                            <li>Accessed as properties (no need to call as functions)</li>
                        </ul>
                    </div>

                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Setup API: Computed</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Created using the <code>computed()</code> function</li>
                            <li>Take a getter function that returns the derived value</li>
                            <li>Can access other computed values</li>
                            <li>Results are cached based on dependencies</li>
                            <li>Accessed via <code>.value</code> property</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Key Benefits of Getters:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2"><strong>Performance:</strong> Results are cached and only recalculated when dependencies change</li>
                        <li className="mb-2"><strong>Encapsulation:</strong> Complex logic is kept in the store, not in components</li>
                        <li className="mb-2"><strong>Reusability:</strong> The same derived value can be used in multiple components</li>
                        <li className="mb-2"><strong>Reactivity:</strong> Automatically update when their dependencies change</li>
                        <li className="mb-2"><strong>Composability:</strong> Getters can use other getters in their calculations</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Defining Getters in Options API</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    In the Options API, getters are defined in the <code>getters</code> object of the store definition.
                    Each getter is a function that receives the state as its first parameter.
                </p>

                <CodeBlock
                    code={optionsGettersExample}
                    language="typescript"
                    filename="src/stores/productStore.ts"
                />

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Options API Getters:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Getters receive <code>state</code> as their first parameter</li>
                        <li className="mb-2">Getters can access other getters via the second <code>getters</code> parameter</li>
                        <li className="mb-2">Getters are accessed as properties (<code>store.getterName</code>), not methods</li>
                        <li className="mb-2">For parameterized getters, return a function from your getter</li>
                        <li className="mb-2">Getters are cached based on their dependencies and only recomputed when needed</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Defining Computed Properties in Setup API</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    In the Setup API, computed properties are created using the <code>computed()</code> function.
                    Each computed takes a getter function that computes and returns the derived value.
                </p>

                <CodeBlock
                    code={setupGettersExample}
                    language="typescript"
                    filename="src/stores/productSetupStore.ts"
                />

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">Setup API Computed Properties:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Created with <code>{`computed(() => { /* calculation */})`}</code></li>
                        <li className="mb-2">Access reactive data via <code>.value</code> inside the computed function</li>
                        <li className="mb-2">Can use other computed properties inside a computed</li>
                        <li className="mb-2">For parameterized computeds, return a function from your computed</li>
                        <li className="mb-2">Access the computed value via <code>.value</code> (<code>store.computedProp.value</code>)</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Using Getters in Components</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Using getters in components is straightforward. Remember to access them as properties in the Options API
                    and with <code>.value</code> in the Setup API.
                </p>

                <CodeBlock
                    code={gettersUsageExample}
                    language="jsx"
                />

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Key Differences:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Options API: Access as <code>store.getterName</code></li>
                        <li className="mb-2">Setup API: Access as <code>store.computedProp.value</code></li>
                        <li className="mb-2">For function getters, both APIs let you call them with arguments:
                            <ul className="list-disc pl-6 mt-2">
                                <li>Options API: <code>store.getterFunction('arg')</code></li>
                                <li>Setup API: <code>store.computedFunction.value('arg')</code></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Composing Getters</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Getters can access other getters, allowing you to compose and build more complex derived values:
                </p>

                <CodeBlock
                    code={gettersChainingExample}
                    language="javascript"
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Getter Composition:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Options API: Access other getters via the second parameter (<code>getters</code>)</li>
                        <li className="mb-2">Setup API: Directly use other computed properties in your calculations</li>
                        <li className="mb-2">This creates a dependency graph where changes propagate automatically</li>
                        <li className="mb-2">Dotzee optimizes this by only recalculating getters whose dependencies have changed</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Parameterized Getters</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Sometimes you need to pass arguments to getters. Since getters are accessed as properties (not functions),
                    you need to return a function from your getter:
                </p>

                <CodeBlock
                    code={gettersTipsExample}
                    language="javascript"
                />

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Parameterized Getters Tips:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Return a function from your getter/computed to accept parameters</li>
                        <li className="mb-2">This pattern is great for filtering, searching, or other data transformations that need parameters</li>
                        <li className="mb-2">Note that function getters don't cache results based on their arguments (only based on state changes)</li>
                        <li className="mb-2">If you need to memoize based on arguments, consider using a separate memoization utility</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Best Practices</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-green-600 dark:text-green-400 mb-3">Do</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Use getters for derived data that multiple components need</li>
                            <li>Keep getters focused and pure (no side effects)</li>
                            <li>Use getters to encapsulate complex logic</li>
                            <li>Use parameterized getters when you need arguments</li>
                            <li>Take advantage of getter composition for complex calculations</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-red-600 dark:text-red-400 mb-3">Avoid</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Using getters for simple property access</li>
                            <li>Modifying state within getters</li>
                            <li>Performing expensive calculations without caching</li>
                            <li>Creating circular dependencies between getters</li>
                            <li>Extremely complex getters (break them down)</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/core-concepts/state" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    State
                </Link>
                <Link to="/core-concepts/actions" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    Actions
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default GettersPage; 
import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const StatePage: React.FC = () => {
    const optionsStateExample = `// Define a store with state using the Options API
import { defineDotzeeStore } from 'dotzee';

export const useUserStore = defineDotzeeStore('user', {
  state: () => ({
    // Simple primitive values
    userId: null,
    username: 'Guest',
    isLoggedIn: false,
    
    // Complex data structures
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en'
    },
    
    // Arrays
    recentSearches: [],
    
    // Loading states
    loading: false,
    error: null
  }),
  
  // Actions and getters omitted for brevity
});`;

    const setupStateExample = `// Define a store with state using the Setup API
import { defineDotzeeStore, ref } from 'dotzee';

export const useUserStore = defineDotzeeStore('user', () => {
  // Simple primitive values as refs
  const userId = ref(null);
  const username = ref('Guest');
  const isLoggedIn = ref(false);
  
  // Object refs - note the whole object is reactive
  const preferences = ref({
    theme: 'light',
    notifications: true,
    language: 'en'
  });
  
  // Array refs
  const recentSearches = ref([]);
  
  // Loading states
  const loading = ref(false);
  const error = ref(null);
  
  // Functions and computeds omitted for brevity
  
  // Return everything that should be accessible
  return {
    userId,
    username,
    isLoggedIn,
    preferences,
    recentSearches,
    loading,
    error
  };
});`;

    const accessStateOptionsExample = `// Using state from an Options Store
import { useUserStore } from '../stores/userStore';

function UserProfile() {
  const user = useUserStore();
  
  return (
    <div>
      <h2>Hello, {user.username}!</h2>
      <p>Theme: {user.preferences.theme}</p>
      <p>Language: {user.preferences.language}</p>
      
      {user.isLoggedIn ? (
        <button onClick={() => user.logout()}>Log Out</button>
      ) : (
        <button onClick={() => user.login()}>Log In</button>
      )}
    </div>
  );
}`;

    const accessStateSetupExample = `// Using state from a Setup Store
import { useUserStore } from '../stores/userSetupStore';

function UserProfile() {
  const user = useUserStore();
  
  return (
    <div>
      <h2>Hello, {user.username.value}!</h2>
      <p>Theme: {user.preferences.value.theme}</p>
      <p>Language: {user.preferences.value.language}</p>
      
      {user.isLoggedIn.value ? (
        <button onClick={user.logout}>Log Out</button>
      ) : (
        <button onClick={user.login}>Log In</button>
      )}
    </div>
  );
}`;

    const mutateStateExample = `// In Options Store actions
actions: {
  updateUsername(newUsername) {
    this.username = newUsername; // Direct property access
  },
  updateTheme(theme) {
    this.preferences.theme = theme; // Nested property update
  },
  addSearchTerm(term) {
    this.recentSearches.push(term); // Array mutation
  },
  clearSearches() {
    this.recentSearches = []; // Replace array
  }
}

// In Setup Store actions
function updateUsername(newUsername) {
  username.value = newUsername; // Use .value for refs
}

function updateTheme(theme) {
  preferences.value.theme = theme; // Access nested properties via .value
}

function addSearchTerm(term) {
  recentSearches.value.push(term); // Modify arrays via .value
}

function clearSearches() {
  recentSearches.value = []; // Replace array via .value
}`;

    const nestedDataExample = `// Options API - Nested objects are automatically reactive
export const useProductStore = defineDotzeeStore('products', {
  state: () => ({
    products: [
      {
        id: 1,
        name: 'Product 1',
        details: {
          price: 19.99,
          inStock: true,
          specs: {
            weight: '2kg',
            dimensions: '10x20x5cm'
          }
        }
      }
    ]
  }),
  
  actions: {
    updatePrice(id, newPrice) {
      const product = this.products.find(p => p.id === id);
      if (product) {
        product.details.price = newPrice; // Deeply nested update works
      }
    }
  }
});

// Setup API - Nested objects also work with refs
export const useProductStore = defineDotzeeStore('products', () => {
  const products = ref([
    {
      id: 1,
      name: 'Product 1',
      details: {
        price: 19.99,
        inStock: true,
        specs: {
          weight: '2kg',
          dimensions: '10x20x5cm'
        }
      }
    }
  ]);
  
  function updatePrice(id, newPrice) {
    const product = products.value.find(p => p.id === id);
    if (product) {
      product.details.price = newPrice; // Deeply nested update works
    }
  }
  
  return { products, updatePrice };
});`;

    const resetStateExample = `// Resetting state in Options Store
export const useFormStore = defineDotzeeStore('form', {
  state: () => ({
    fields: {
      name: '',
      email: '',
      message: ''
    },
    submitted: false,
    errors: {}
  }),
  
  actions: {
    resetForm() {
      // Reset to initial state
      this.fields.name = '';
      this.fields.email = '';
      this.fields.message = '';
      this.submitted = false;
      this.errors = {};
    },
    
    // Alternative approach using $reset (if implemented)
    // resetForm() {
    //   this.$reset(); // Resets the entire store to its initial state
    // }
  }
});

// Resetting state in Setup Store
export const useFormStore = defineDotzeeStore('form', () => {
  const fields = ref({
    name: '',
    email: '',
    message: ''
  });
  const submitted = ref(false);
  const errors = ref({});
  
  function resetForm() {
    // Reset individual refs
    fields.value = {
      name: '',
      email: '',
      message: ''
    };
    submitted.value = false;
    errors.value = {};
  }
  
  return { fields, submitted, errors, resetForm };
});`;

    const reactivityLimitsExample = `// Anti-pattern: Destructuring breaks reactivity
const { count } = useCounterStore(); // ❌ Reactivity lost!
console.log(count); // This won't update when the store changes

// Correct way to access state
const counter = useCounterStore();
console.log(counter.count); // ✅ This updates when state changes

// Anti-pattern: Destructuring with Setup stores
const { count } = useCounterSetupStore(); // ❌ Destructuring refs retains reactivity but is confusing
console.log(count.value); // This works but is confusing - what is count?

// Correct way to access Setup store state
const counter = useCounterSetupStore();
console.log(counter.count.value); // ✅ Clear and maintains reactivity`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">State Management</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                State management is at the core of any application. This guide covers how to define, access,
                and modify state in Dotzee stores, with best practices for both API styles.
            </p>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Defining State</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Dotzee offers two ways to define state, depending on which API style you're using:
                </p>

                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-3 mt-6">Options API State</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    With the Options API, you define state as an object returned by a function. This entire object
                    becomes reactive, including all nested properties.
                </p>

                <CodeBlock
                    code={optionsStateExample}
                    language="typescript"
                    filename="src/stores/userStore.ts"
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Options API State Key Points:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">State is defined as a function that returns an object (to ensure each store instance gets a fresh state object).</li>
                        <li className="mb-2">The object is wrapped with <code>reactive()</code> internally, making the entire object reactive.</li>
                        <li className="mb-2">Properties can be primitives, objects, arrays, or any serializable data.</li>
                        <li className="mb-2">Nested objects and arrays are also reactive.</li>
                        <li className="mb-2">State can be accessed directly in components (e.g., <code>store.propertyName</code>).</li>
                    </ul>
                </div>

                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-3 mt-6">Setup API State</h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    With the Setup API, you define individual state properties using <code>ref()</code> for reactivity.
                </p>

                <CodeBlock
                    code={setupStateExample}
                    language="typescript"
                    filename="src/stores/userSetupStore.ts"
                />

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">Setup API State Key Points:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Each state property is defined as a <code>ref()</code> with an initial value.</li>
                        <li className="mb-2">Refs can contain primitives, objects, arrays, or any value type.</li>
                        <li className="mb-2">Objects and arrays inside refs are deeply reactive.</li>
                        <li className="mb-2">You must return each ref in the returned object to expose it.</li>
                        <li className="mb-2">State is accessed via <code>.value</code> in components (e.g., <code>store.propertyName.value</code>).</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Accessing State in Components</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Accessing state in components differs slightly between the two API styles:
                </p>

                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-3 mt-6">Accessing Options API State</h3>
                <CodeBlock
                    code={accessStateOptionsExample}
                    language="jsx"
                    filename="src/components/UserProfile.jsx"
                />

                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-3 mt-6">Accessing Setup API State</h3>
                <CodeBlock
                    code={accessStateSetupExample}
                    language="jsx"
                    filename="src/components/UserProfile.jsx"
                />

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Important Reactivity Note:</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                        For components to react to state changes, they must access the state directly from the store
                        instance in their render function. Don't destructure the store or assign store values to local
                        variables, as this breaks the reactivity connection.
                    </p>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Mutating State</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Unlike some state libraries, Dotzee allows direct mutations to state, making it more intuitive to use.
                    However, it's best practice to encapsulate mutations in store actions:
                </p>

                <CodeBlock
                    code={mutateStateExample}
                    language="javascript"
                />

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">State Mutation Best Practices:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Always mutate state through store actions, not directly in components.</li>
                        <li className="mb-2">For Options stores, use <code>this.propertyName</code> to access and modify state.</li>
                        <li className="mb-2">For Setup stores, use <code>ref.value</code> to access and modify state.</li>
                        <li className="mb-2">Both APIs support deep mutations of objects and arrays.</li>
                        <li className="mb-2">All JavaScript methods for modifying arrays (push, splice, etc.) work as expected.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Working with Nested Data</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Dotzee's reactivity system handles deeply nested objects and arrays:
                </p>

                <CodeBlock
                    code={nestedDataExample}
                    language="typescript"
                />

                <div className="note bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Deep Reactivity Notes:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Objects and arrays are made deeply reactive when they're added to the state.</li>
                        <li className="mb-2">You can access and modify nested properties with the standard dot notation.</li>
                        <li className="mb-2">New objects added to reactive objects also become reactive automatically.</li>
                        <li className="mb-2">This works for both the Options API and refs in the Setup API.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Resetting State</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Sometimes you need to reset a store's state back to its initial values:
                </p>

                <CodeBlock
                    code={resetStateExample}
                    language="typescript"
                />

                <div className="note bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">State Reset Patterns:</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                        There are a few approaches to resetting state:
                    </p>
                    <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Manually reset each property to its initial value (most explicit).</li>
                        <li className="mb-2">Create a utility reset function that resets specific parts of the state.</li>
                        <li className="mb-2">Create a "initial state" constant and use it to reset the state (more DRY).</li>
                        <li className="mb-2">If your application requires frequent state resets, consider implementing a <code>$reset()</code> utility method.</li>
                    </ol>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">State Reactivity Limitations</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    While Dotzee's reactivity system is powerful, there are some patterns that break reactivity:
                </p>

                <CodeBlock
                    code={reactivityLimitsExample}
                    language="javascript"
                />

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Common Pitfalls:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2"><strong>Destructuring store properties</strong> - This breaks the reactivity connection.</li>
                        <li className="mb-2"><strong>Copying state to local variables</strong> - Local variables won't update when the store changes.</li>
                        <li className="mb-2"><strong>Using non-reactive data structures</strong> - Maps, Sets, etc. must be handled with special care.</li>
                        <li className="mb-2"><strong>Replacing entire objects</strong> - If a component depends on a nested property, replacing the entire object can cause unnecessary re-renders.</li>
                        <li className="mb-2"><strong>Using destructured refs without understanding</strong> - Destructured refs still need <code>.value</code> access but lose context of where they came from.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">State Organization Tips</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-green-600 dark:text-green-400 mb-3">Do</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Group related data in nested objects</li>
                            <li>Include loading/error states in the same store as the data they relate to</li>
                            <li>Use appropriate data types (e.g., Date objects for dates)</li>
                            <li>Initialize all state properties with sensible defaults</li>
                            <li>Document complex state structures with comments or TypeScript interfaces</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-red-600 dark:text-red-400 mb-3">Avoid</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Storing unrelated data in the same store</li>
                            <li>Storing non-serializable data in state (like functions or complex class instances)</li>
                            <li>Creating circular references in your state tree</li>
                            <li>Deeply nesting objects more than necessary (flatter is often better)</li>
                            <li>Duplicating the same state across multiple stores</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/core-concepts/stores" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Defining Stores
                </Link>
                <Link to="/core-concepts/getters" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    Getters
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default StatePage; 
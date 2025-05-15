import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const RefPage: React.FC = () => {
    const basicExample = `import { ref } from 'dotzee';

// Create a reactive reference with an initial value
const count = ref(0);
const message = ref('Hello');
const isActive = ref(true);
const user = ref({ name: 'Alice', age: 30 });

// Access the value with .value
console.log(count.value); // 0
console.log(message.value); // 'Hello'

// Update the value
count.value++;
message.value = 'Hello World';
user.value.age = 31;`;

    const setupStoreExample = `import { defineDotzeeStore, ref } from 'dotzee';

export const useCounterStore = defineDotzeeStore('counter', () => {
  // Define reactive state with refs
  const count = ref(0);
  const lastUpdated = ref(null);
  
  // Define methods that update the reactive state
  function increment() {
    count.value++;
    lastUpdated.value = new Date();
  }
  
  function decrement() {
    count.value--;
    lastUpdated.value = new Date();
  }
  
  // Return refs and methods
  return {
    count,
    lastUpdated,
    increment,
    decrement
  };
});`;

    const typescriptExample = `import { ref } from 'dotzee';

// Explicit type annotation (recommended for complex types)
const user = ref<{ name: string; age: number; active?: boolean }>({ 
  name: 'Alice', 
  age: 30 
});

// Type is inferred from initial value (works for simple cases)
const count = ref(0); // inferred as Ref<number>
const active = ref(true); // inferred as Ref<boolean>
const message = ref('Hello'); // inferred as Ref<string>

// Nullable refs
const nullableValue = ref<string | null>(null);
nullableValue.value = 'Not null anymore';

// Array refs
const items = ref<string[]>([]);
items.value.push('New item');`;

    const componentUsageExample = `import React from 'react';
import { useCounterStore } from '../stores/counterStore';

function Counter() {
  const store = useCounterStore();
  
  // When using refs in components, always access with .value
  return (
    <div>
      <p>Count: {store.count.value}</p>
      <p>Last Updated: {store.lastUpdated.value?.toLocaleString() || 'Never'}</p>
      
      <button onClick={store.increment}>Increment</button>
      <button onClick={store.decrement}>Decrement</button>
    </div>
  );
}`;

    const typeSignature = `function ref<T>(initialValue: T): Ref<T>

// The Ref type interface
interface Ref<T> {
  value: T;
}`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">ref</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                The <code>ref</code> function creates a reactive reference to a value. This is one of the core reactivity
                primitives in Dotzee and is essential when using the Setup API for store definitions.
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">initialValue</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">T (any type)</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    The initial value to wrap in the reactive reference. Can be of any type: primitive values
                                    (numbers, strings, booleans) or objects (objects, arrays, etc.).
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Return Value</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    Returns a reactive reference object that contains a single property <code>value</code> which holds the
                    reactive state. Any access to or modification of the <code>value</code> property will trigger dependency
                    tracking or reactivity updates.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Key Characteristics:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Accessing <code>ref.value</code> tracks it as a dependency for reactivity.</li>
                        <li className="mb-2">Changing <code>ref.value</code> triggers updates in any component that depends on it.</li>
                        <li className="mb-2">When the initial value is an object, the object itself is also made reactive.</li>
                        <li className="mb-2">Refs are required because JavaScript cannot detect property access on primitive values.</li>
                        <li className="mb-2">The <code>.value</code> property is necessary to distinguish between the ref container and the referenced value.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Basic Usage</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Creating and using refs is straightforward:
                </p>

                <CodeBlock
                    code={basicExample}
                    language="typescript"
                    filename="example.ts"
                />

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Important:</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                        Always access and modify the value of a ref using the <code>.value</code> property. This is required for
                        reactivity to work correctly. If you access the ref object directly without <code>.value</code>,
                        you'll get the ref object itself, not the value it contains.
                    </p>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Using Refs in Setup Stores</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Refs are a fundamental part of the Setup API for store definitions:
                </p>

                <CodeBlock
                    code={setupStoreExample}
                    language="typescript"
                    filename="stores/counterStore.ts"
                />

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">Setup Store Pattern:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Define state as <code>ref</code> variables at the top of the setup function.</li>
                        <li className="mb-2">Create functions that modify these refs by changing their <code>.value</code> property.</li>
                        <li className="mb-2">Return both the refs and the functions as part of the store's public API.</li>
                        <li className="mb-2">When consumers access the store, they'll need to use <code>.value</code> to read or write the refs.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">TypeScript Support</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Refs have excellent TypeScript support:
                </p>

                <CodeBlock
                    code={typescriptExample}
                    language="typescript"
                    filename="typedRefs.ts"
                />

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">TypeScript Tips:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">For simple values, TypeScript can infer the type from the initial value.</li>
                        <li className="mb-2">For complex objects, nested types, or nullable values, it's best to explicitly specify the type parameter.</li>
                        <li className="mb-2">The type of <code>ref.value</code> will be exactly the type you specified or inferred.</li>
                        <li className="mb-2">TypeScript will warn you if you try to assign an incompatible value to <code>ref.value</code>.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Using Refs in React Components</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    When using refs from a store in React components:
                </p>

                <CodeBlock
                    code={componentUsageExample}
                    language="jsx"
                    filename="components/Counter.jsx"
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Component Usage:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Always access ref values with <code>.value</code> in component render functions.</li>
                        <li className="mb-2">React components will automatically re-render when a used ref's value changes.</li>
                        <li className="mb-2">Use optional chaining (<code>?.</code>) when the ref might contain <code>null</code> or <code>undefined</code>.</li>
                        <li className="mb-2">Functions that modify refs can be passed directly to event handlers.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Best Practices</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-green-600 dark:text-green-400 mb-3">Do</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Always use <code>.value</code> to access or modify ref values</li>
                            <li>Specify explicit types for complex objects or nullable values</li>
                            <li>Return refs directly from store setup functions</li>
                            <li>Use functions to encapsulate logic that modifies multiple refs</li>
                            <li>Use optional chaining with refs that might be null or undefined</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-red-600 dark:text-red-400 mb-3">Avoid</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Forgetting <code>.value</code> when accessing or updating refs</li>
                            <li>Destructuring refs (breaks reactivity)</li>
                            <li>Creating refs inside render functions</li>
                            <li>Assigning directly to a ref (use <code>ref.value = newValue</code> instead)</li>
                            <li>Using <code>ref(undefined)</code> without a type annotation</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">See Also</h2>

                <ul className="space-y-2">
                    <li>
                        <Link to="/api-reference/computed" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            computed - Creating computed (derived) values
                        </Link>
                    </li>
                    <li>
                        <Link to="/api-reference/defineDotzeeStore" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                            defineDotzeeStore - Creating store definitions (using refs with the Setup API)
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
                <Link to="/api-reference/useDotzeeStore" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    useDotzeeStore
                </Link>
                <Link to="/api-reference/computed" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    computed
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default RefPage; 
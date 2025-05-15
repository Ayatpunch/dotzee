import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const CounterPage: React.FC = () => {
    const storeDefinition = `// src/stores/counterStore.ts
import { defineDotzeeStore } from 'dotzee';

export const useCounterStore = defineDotzeeStore('counter', {
  // 1. Define State
  state: () => ({
    count: 0,
  }),

  // 2. Define Actions
  actions: {
    increment() {
      this.count++;
    },
    decrement() {
      this.count--;
    },
    reset() {
      this.count = 0;
    },
    incrementBy(amount: number) {
      this.count += amount;
    },
  },
});`;

    const componentUsage = `// src/components/Counter.tsx
import React from 'react';
import { useCounterStore } from '../stores/counterStore';

const Counter: React.FC = () => {
  // 3. Use the store hook in your component
  const counterStore = useCounterStore();

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ fontSize: '2em' }}>Counter Example</h2>
      {/* 4. Access state directly */}
      <p style={{ fontSize: '3em', margin: '20px 0', color: '#333' }}>
        Count: {counterStore.count}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        {/* 5. Call actions directly */}
        <button 
          onClick={() => counterStore.increment()} 
          style={{ padding: '10px 20px', fontSize: '1em' }}
        >
          Increment
        </button>
        <button 
          onClick={() => counterStore.decrement()} 
          style={{ padding: '10px 20px', fontSize: '1em' }}
        >
          Decrement
        </button>
        <button 
          onClick={() => counterStore.incrementBy(5)} 
          style={{ padding: '10px 20px', fontSize: '1em' }}
        >
          Increment by 5
        </button>
        <button 
          onClick={() => counterStore.reset()} 
          style={{ padding: '10px 20px', fontSize: '1em' }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Counter;`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Counter Example</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                This Counter example is a fundamental demonstration of Dotzee's core concepts. It shows how to define a simple store,
                create actions to modify its state, and use that store within a React component to display and update data.
            </p>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Defining the Store (Options API)</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    We start by defining our counter store using the Options API provided by <code>defineDotzeeStore</code>.
                    The state is a simple object with a <code>count</code> property, and we define actions to manipulate this count.
                </p>
                <CodeBlock
                    code={storeDefinition}
                    language="typescript"
                    filename="src/stores/counterStore.ts"
                />
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Key points:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-1"><code>defineDotzeeStore</code> takes a unique store ID ('counter') and an options object.</li>
                        <li className="mb-1"><code>state</code> is a function that returns the initial state object. Dotzee makes this object reactive.</li>
                        <li className="mb-1"><code>actions</code> is an object containing methods. Inside these methods, <code>this</code> refers to the store instance, allowing direct mutation of state properties like <code>this.count</code>.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Using the Store in a Component</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Next, we create a React component that consumes our <code>useCounterStore</code>.
                </p>
                <CodeBlock
                    code={componentUsage}
                    language="tsx"
                    filename="src/components/Counter.tsx"
                />
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Component Interaction:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-1">We import the <code>useCounterStore</code> hook.</li>
                        <li className="mb-1">Calling <code>useCounterStore()</code> gives us access to the store instance.</li>
                        <li className="mb-1">State properties (e.g., <code>counterStore.count</code>) can be accessed directly in the JSX.</li>
                        <li className="mb-1">Actions (e.g., <code>counterStore.increment()</code>) can be called directly from event handlers like <code>onClick</code>.</li>
                        <li className="mb-1">Dotzee automatically handles reactivity: when an action changes <code>count</code>, the component re-renders to display the new value.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">How it Works</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    The <code>useCounterStore</code> hook, returned by <code>defineDotzeeStore</code>, is the entry point to using the store.
                    When called within a component, Dotzee ensures that the component subscribes to changes in the store's state.
                </p>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    When an action like <code>increment()</code> is called, it directly mutates <code>this.count</code>. Dotzee's reactivity system detects this change
                    and notifies any subscribed components. React then re-renders the parts of the UI that depend on <code>counterStore.count</code>,
                    displaying the updated value.
                </p>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Key Concepts Demonstrated</h2>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                        <li>
                            <strong><code>defineDotzeeStore</code></strong>: The function used to create new stores.
                        </li>
                        <li>
                            <strong>State Definition (Options API)</strong>: Defining the store's data structure using the <code>state</code> function.
                        </li>
                        <li>
                            <strong>Actions (Options API)</strong>: Defining methods to mutate state using the <code>actions</code> object and <code>this</code> context.
                        </li>
                        <li>
                            <strong>Store Hook Usage</strong>: Calling the generated hook (<code>useCounterStore</code>) to access the store in a component.
                        </li>
                        <li>
                            <strong>Direct State Access</strong>: Reading state properties directly from the store instance in the component.
                        </li>
                        <li>
                            <strong>Direct Action Invocation</strong>: Calling action methods directly from the store instance.
                        </li>
                        <li>
                            <strong>Automatic Reactivity</strong>: Components automatically update when the state they use changes.
                        </li>
                    </ul>
                </div>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/examples" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Examples Overview
                </Link>
                <Link to="/examples/todo" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    Todo App Example
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default CounterPage; 
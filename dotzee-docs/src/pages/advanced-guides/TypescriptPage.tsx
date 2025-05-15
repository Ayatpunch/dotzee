import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const TypescriptPage: React.FC = () => {
    const optionsStoreTypingExample = `// src/stores/counterStore.ts
import { defineDotzeeStore } from 'dotzee';

// Define interfaces for your state, getters, and actions
interface CounterState {
  count: number;
  history: number[];
}

interface CounterGetters {
  doubleCount: number;
  isPositive: boolean;
  countHistory: number[];
}

interface CounterActions {
  increment: (amount?: number) => void;
  decrement: (amount?: number) => void;
  reset: () => void;
  fetchCount: () => Promise<number>;
}

// Use the interfaces to type your store
export const useCounterStore = defineDotzeeStore<CounterState, CounterGetters, CounterActions>(
  'counter',
  {
    state: () => ({
      count: 0,
      history: []
    }),
    
    getters: {
      doubleCount: (state) => state.count * 2,
      isPositive: (state) => state.count > 0,
      countHistory: (state) => [...state.history]
    },
    
    actions: {
      increment(amount = 1) {
        this.count += amount;
        this.history.push(this.count);
      },
      
      decrement(amount = 1) {
        this.count -= amount;
        this.history.push(this.count);
      },
      
      reset() {
        this.count = 0;
        this.history = [];
      },
      
      async fetchCount() {
        const response = await fetch('/api/counter');
        const data = await response.json();
        this.count = data.count;
        return this.count;
      }
    }
  }
);

// TypeScript will ensure:
// - The correct type for this.count in actions (number)
// - The correct return type for getters (e.g., doubleCount is number)
// - The correct parameter types for actions (e.g., amount in increment is number | undefined)
// - The correct return type for async actions (fetchCount returns Promise<number>)`;

    const setupStoreTypingExample = `// src/stores/todoStore.ts
import { defineDotzeeStore, ref, computed } from 'dotzee';

// Define types for your store
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Define return type from the setup function
interface TodoStore {
  // State (note that these are refs)
  todos: { value: Todo[] };
  filter: { value: 'all' | 'active' | 'completed' };
  
  // Computed properties
  filteredTodos: { value: Todo[] };
  totalCount: { value: number };
  
  // Actions
  addTodo: (text: string) => void;
  toggleTodo: (id: number) => void;
  removeTodo: (id: number) => void;
  setFilter: (filter: 'all' | 'active' | 'completed') => void;
}

export const useTodoStore = defineDotzeeStore<TodoStore>(
  'todos',
  () => {
    // State
    const todos = ref<Todo[]>([]);
    const filter = ref<'all' | 'active' | 'completed'>('all');
    
    // Computed
    const filteredTodos = computed(() => {
      switch (filter.value) {
        case 'active':
          return todos.value.filter(todo => !todo.completed);
        case 'completed':
          return todos.value.filter(todo => todo.completed);
        default:
          return todos.value;
      }
    });
    
    const totalCount = computed(() => todos.value.length);
    
    // Actions
    function addTodo(text: string) {
      const newTodo: Todo = {
        id: Date.now(),
        text,
        completed: false
      };
      todos.value.push(newTodo);
    }
    
    function toggleTodo(id: number) {
      const todo = todos.value.find(todo => todo.id === id);
      if (todo) {
        todo.completed = !todo.completed;
      }
    }
    
    function removeTodo(id: number) {
      todos.value = todos.value.filter(todo => todo.id !== id);
    }
    
    function setFilter(newFilter: 'all' | 'active' | 'completed') {
      filter.value = newFilter;
    }
    
    // Return the store
    return {
      // State
      todos,
      filter,
      // Computed
      filteredTodos,
      totalCount,
      // Actions
      addTodo,
      toggleTodo,
      removeTodo,
      setFilter
    };
  }
);`;

    const pluginTypingExample = `// src/plugins/analyticsPlugin.ts
import { DotzeePlugin, PluginInstallContext, StoreCreatedContext } from 'dotzee';

// Define types for your plugin options
interface AnalyticsPluginOptions {
  apiKey: string;
  trackStateChanges?: boolean;
  trackActions?: boolean;
  ignoreStores?: string[];
}

// Define typings for methods you'll add to store instances
declare module 'dotzee' {
  // Extend the DotzeeStore interface
  interface DotzeeStore {
    // Add trackEvent method to all store instances
    trackEvent: (eventName: string, data?: Record<string, any>) => void;
  }
}

// Create a typed plugin
export function createAnalyticsPlugin(options: AnalyticsPluginOptions): DotzeePlugin {
  const { apiKey, trackStateChanges = true, trackActions = true, ignoreStores = [] } = options;
  
  // Initialize analytics (mock implementation)
  const analytics = {
    init(apiKey: string) {
      console.log(\`Analytics initialized with API key: \${apiKey}\`);
    },
    track(event: string, data?: Record<string, any>) {
      console.log(\`Event tracked: \${event}\`, data);
    }
  };
  
  return {
    name: 'analyticsPlugin',
    
    onInstall(context: PluginInstallContext) {
      // Initialize analytics
      analytics.init(apiKey);
      
      // Add global hooks if tracking actions
      if (trackActions) {
        context.addGlobalHook({
          afterAction({ storeId, actionName, args, result }) {
            // Skip ignored stores
            if (ignoreStores.includes(storeId)) return;
            
            analytics.track(\`\${storeId}:\${actionName}\`, {
              args,
              result: typeof result === 'object' ? 'object' : result
            });
          }
        });
      }
    },
    
    onStoreCreated(context: StoreCreatedContext) {
      const { storeId, storeInstance, subscribe } = context;
      
      // Skip ignored stores
      if (ignoreStores.includes(storeId)) return;
      
      // Extend the store with trackEvent method
      Object.assign(storeInstance, {
        trackEvent(eventName: string, data?: Record<string, any>) {
          analytics.track(\`\${storeId}:\${eventName}\`, data);
        }
      });
      
      // Subscribe to state changes if enabled
      if (trackStateChanges) {
        subscribe(() => {
          analytics.track(\`\${storeId}:stateChanged\`);
        });
      }
    }
  };
}`;

    const utilityTypesExample = `// src/types/dotzee.d.ts
import { DotzeeStore as OriginalDotzeeStore } from 'dotzee';

// Utility type to extract store type (including state, getters, and actions)
export type ExtractStore<T extends (...args: any) => any> = 
  T extends (...args: any) => infer R ? R : never;

// Utility type to extract state type from a store
export type ExtractState<T extends (...args: any) => any> = 
  ExtractStore<T> extends OriginalDotzeeStore<infer S, any, any> ? S : never;

// Utility type for unwrapping ref values
export type Unwrap<T> = T extends { value: infer V } ? V : T;

// --- Usage examples ---

// For Options API store:
import { useCounterStore } from '../stores/counterStore';

type CounterStore = ExtractStore<typeof useCounterStore>;
type CounterState = ExtractState<typeof useCounterStore>;

// Now you can use these types elsewhere:
function logCounterState(store: CounterStore) {
  console.log('Count:', store.count);
  console.log('Double count:', store.doubleCount);
  
  // Type error if you try to access a property that doesn't exist
  // console.log(store.nonExistentProperty); // Error!
}

// For Setup API store with refs:
import { useTodoStore } from '../stores/todoStore';

type TodoStore = ExtractStore<typeof useTodoStore>;
type TodoState = Unwrap<TodoStore['todos']>; // Array<Todo>

function addCompletedTodo(store: TodoStore, text: string) {
  // Use the store with proper types
  store.addTodo(text);
  const newTodoId = store.todos.value[store.todos.value.length - 1].id;
  store.toggleTodo(newTodoId); // Mark as completed
}`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">TypeScript Usage</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Dotzee is built with TypeScript and provides strong type safety for all aspects of state management.
                This guide shows how to fully leverage TypeScript with Dotzee for improved developer experience and code quality.
            </p>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Benefits of TypeScript with Dotzee</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Using TypeScript with Dotzee provides several important benefits:
                </p>

                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li><strong>Type Safety:</strong> Catch errors at compile time rather than runtime</li>
                    <li><strong>Better IDE Support:</strong> Autocompletion for store properties and methods</li>
                    <li><strong>Documentation:</strong> Types serve as documentation for your state structure</li>
                    <li><strong>Refactoring:</strong> Safely refactor code with confidence that breaking changes will be caught</li>
                    <li><strong>Maintainability:</strong> Types make the codebase more maintainable, especially as it grows</li>
                </ul>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">TypeScript Requirements:</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                        Dotzee works best with TypeScript 4.4 or higher, with the following compiler options enabled:
                    </p>
                    <ul className="list-disc pl-6 mt-2 text-gray-700 dark:text-gray-300">
                        <li><code>strict: true</code> - Enables strict type checking</li>
                        <li><code>noImplicitThis: true</code> - Ensures correct typing of <code>this</code> in actions</li>
                        <li><code>esModuleInterop: true</code> - Better module interoperability</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Typing an Options API Store</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    The Options API lets you type your state, getters, and actions explicitly by providing type parameters to <code>defineDotzeeStore</code>:
                </p>

                <CodeBlock
                    code={optionsStoreTypingExample}
                    language="typescript"
                    filename="src/stores/counterStore.ts"
                />

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Type Inference in Options API:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">TypeScript can often infer types automatically from your state definition, but explicit interfaces provide better clarity and documentation.</li>
                        <li className="mb-2">In most cases, you should define interfaces for each aspect of your store: state, getters, and actions.</li>
                        <li className="mb-2">The <code>this</code> in actions is correctly typed to include all state properties, getters, and other actions.</li>
                        <li className="mb-2">Action parameters and return types are properly enforced.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Typing a Setup API Store</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    For the Setup API, you define types for the store's public interface:
                </p>

                <CodeBlock
                    code={setupStoreTypingExample}
                    language="typescript"
                    filename="src/stores/todoStore.ts"
                />

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Working with Refs in TypeScript:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">When using <code>ref</code>, provide the type parameter: <code>ref&lt;number&gt;(0)</code></li>
                        <li className="mb-2">State as refs need to be typed with the <code>value</code> property included (<code>{'{'}value: T {'}'}</code>)</li>
                        <li className="mb-2">The interface describes what the store exposes, mirroring the setup function\'s return value</li>
                        <li className="mb-2">The <code>computed</code> function will generally infer its return type, but you can also provide a type parameter</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Typing Plugins</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    When creating plugins, TypeScript helps ensure your plugin correctly implements the required interfaces:
                </p>

                <CodeBlock
                    code={pluginTypingExample}
                    language="typescript"
                    filename="src/plugins/analyticsPlugin.ts"
                />

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">Plugin Type Considerations:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Use the <code>DotzeePlugin</code> interface for basic typing of your plugin</li>
                        <li className="mb-2">Type context parameters for lifecycle hooks (<code>PluginInstallContext</code>, <code>StoreCreatedContext</code>)</li>
                        <li className="mb-2">For extending store instances, use module augmentation (the <code>declare module 'dotzee'</code> pattern above)</li>
                        <li className="mb-2">Create typed options interfaces for configurable plugins</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Utility Types and Helpers</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    You can create utility types to work more effectively with Dotzee stores:
                </p>

                <CodeBlock
                    code={utilityTypesExample}
                    language="typescript"
                    filename="src/types/dotzee.d.ts"
                />

                <p className="mt-4 text-gray-700 dark:text-gray-300">
                    These utility types make it easier to extract and work with store types in other parts of your application, such as in components or helper functions.
                </p>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">TypeScript Best Practices with Dotzee</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-green-600 dark:text-green-400 mb-3">Do</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Define separate interfaces for state, getters, and actions</li>
                            <li>Use explicit type parameters for <code>ref</code> and <code>computed</code></li>
                            <li>Create utility types for commonly used patterns</li>
                            <li>Type plugin options and extension methods</li>
                            <li>Enable strict TypeScript checking</li>
                            <li>Document complex types with JSDoc comments</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-red-600 dark:text-red-400 mb-3">Avoid</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Using <code>any</code> types (use <code>unknown</code> if needed)</li>
                            <li>Type assertions without proper checks</li>
                            <li>Overly complex type hierarchies</li>
                            <li>Forgetting to type async action return values</li>
                            <li>Circular type references</li>
                            <li>Ignoring TypeScript errors with <code>// @ts-ignore</code></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/advanced-guides/plugins" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Plugins
                </Link>
                <Link to="/advanced-guides/code-splitting" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    Code Splitting
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default TypescriptPage; 
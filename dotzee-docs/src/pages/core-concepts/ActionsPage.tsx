import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const ActionsPage: React.FC = () => {
    const optionsActionsExample = `// src/stores/userStore.ts
import { defineDotzeeStore } from 'dotzee';

export const useUserStore = defineDotzeeStore('user', {
  state: () => ({
    userId: null,
    username: 'Guest',
    isLoggedIn: false,
    profile: {
      email: '',
      avatar: '',
      preferences: { theme: 'light' }
    },
    loading: false,
    error: null
  }),
  
  actions: {
    // Simple synchronous action
    setUsername(newUsername) {
      this.username = newUsername;
    },
    
    // Action that updates multiple state properties
    logOut() {
      this.userId = null;
      this.username = 'Guest';
      this.isLoggedIn = false;
      this.profile = {
        email: '',
        avatar: '',
        preferences: { theme: 'light' }
      };
    },
    
    // Action with parameters
    updateTheme(theme) {
      this.profile.preferences.theme = theme;
    },
    
    // Async action with loading state
    async login(username, password) {
      try {
        this.loading = true;
        this.error = null;
        
        // Simulate API call
        const response = await apiClient.login(username, password);
        
        // Update multiple properties with API response
        this.userId = response.userId;
        this.username = response.username;
        this.isLoggedIn = true;
        this.profile = response.profile;
        
        return true; // Success indicator
      } catch (err) {
        this.error = err.message;
        return false; // Failure indicator
      } finally {
        this.loading = false;
      }
    }
  }
});`;

    const setupActionsExample = `// src/stores/userSetupStore.ts
import { defineDotzeeStore, ref } from 'dotzee';
import { apiClient } from '../api';

export const useUserStore = defineDotzeeStore('user', () => {
  // State as refs
  const userId = ref(null);
  const username = ref('Guest');
  const isLoggedIn = ref(false);
  const profile = ref({
    email: '',
    avatar: '',
    preferences: { theme: 'light' }
  });
  const loading = ref(false);
  const error = ref(null);
  
  // Simple synchronous action
  function setUsername(newUsername) {
    username.value = newUsername;
  }
  
  // Action that updates multiple state properties
  function logOut() {
    userId.value = null;
    username.value = 'Guest';
    isLoggedIn.value = false;
    profile.value = {
      email: '',
      avatar: '',
      preferences: { theme: 'light' }
    };
  }
  
  // Action with parameters
  function updateTheme(theme) {
    profile.value.preferences.theme = theme;
  }
  
  // Async action with loading state
  async function login(username, password) {
    try {
      loading.value = true;
      error.value = null;
      
      // Simulate API call
      const response = await apiClient.login(username, password);
      
      // Update multiple properties with API response
      userId.value = response.userId;
      username.value = response.username;
      isLoggedIn.value = true;
      profile.value = response.profile;
      
      return true; // Success indicator
    } catch (err) {
      error.value = err.message;
      return false; // Failure indicator
    } finally {
      loading.value = false;
    }
  }
  
  return {
    // State
    userId,
    username,
    isLoggedIn,
    profile,
    loading,
    error,
    // Actions
    setUsername,
    logOut,
    updateTheme,
    login
  };
});`;

    const actionsUsageExample = `// Using actions from an Options Store
import { useUserStore } from '../stores/userStore';

function LoginForm() {
  const userStore = useUserStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await userStore.login(username, password);
    
    if (success) {
      navigate('/dashboard');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {userStore.error && <div className="error">{userStore.error}</div>}
      <input 
        type="text" 
        value={username} 
        onChange={e => setUsername(e.target.value)} 
        placeholder="Username"
      />
      <input 
        type="password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        placeholder="Password"
      />
      <button type="submit" disabled={userStore.loading}>
        {userStore.loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
}

// Using actions from a Setup Store
import { useUserStore } from '../stores/userSetupStore';

function LoginForm() {
  const userStore = useUserStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await userStore.login(username, password);
    
    if (success) {
      navigate('/dashboard');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {userStore.error.value && <div className="error">{userStore.error.value}</div>}
      <input 
        type="text" 
        value={username} 
        onChange={e => setUsername(e.target.value)} 
        placeholder="Username"
      />
      <input 
        type="password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        placeholder="Password"
      />
      <button type="submit" disabled={userStore.loading.value}>
        {userStore.loading.value ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
}`;

    const composingActionsExample = `// Composing actions in Options API
actions: {
  incrementBy(amount) {
    this.count += amount;
  },
  
  doubleCount() {
    // Call another action with 'this'
    this.incrementBy(this.count);
  },
  
  async fetchAndUpdate() {
    const data = await this.fetchData(); // Call another async action
    this.processData(data); // Call a third action
  }
}

// Composing actions in Setup API
function incrementBy(amount) {
  count.value += amount;
}

function doubleCount() {
  // Call another action directly
  incrementBy(count.value);
}

async function fetchAndUpdate() {
  const data = await fetchData(); // Call another async function
  processData(data); // Call a third function
}`;

    const storeInteractionsExample = `// src/stores/cartStore.ts
export const useCartStore = defineDotzeeStore('cart', {
  state: () => ({
    items: [],
    total: 0
  }),
  actions: {
    addItem(product) {
      this.items.push(product);
      this.recalculateTotal();
    },
    recalculateTotal() {
      this.total = this.items.reduce((sum, item) => sum + item.price, 0);
    }
  }
});

// src/stores/checkoutStore.ts
import { useCartStore } from './cartStore';

export const useCheckoutStore = defineDotzeeStore('checkout', {
  state: () => ({
    paymentMethod: null,
    shipping: {
      address: '',
      cost: 0
    }
  }),
  actions: {
    async processOrder() {
      const cartStore = useCartStore();
      
      // Use data from the cart store
      const order = {
        items: cartStore.items,
        total: cartStore.total + this.shipping.cost,
        shipping: this.shipping,
        payment: this.paymentMethod
      };
      
      const result = await apiClient.submitOrder(order);
      
      if (result.success) {
        // Call an action on another store
        cartStore.clearCart();
      }
      
      return result;
    }
  }
});`;

    const actionPayloadsExample = `// Using action payloads - Options API
actions: {
  // Single primitive parameter
  updateUsername(username) {
    this.username = username;
  },
  
  // Multiple parameters
  updateProfile(name, email, avatar) {
    this.profile.name = name;
    this.profile.email = email;
    this.profile.avatar = avatar;
  },
  
  // Object parameter for more complex updates
  updateUser(userData) {
    this.username = userData.username;
    this.profile = { ...this.profile, ...userData.profile };
    this.lastUpdated = new Date();
  }
}

// Using action payloads - Setup API
function updateUsername(username) {
  username.value = username;
}

function updateProfile(name, email, avatar) {
  profile.value.name = name;
  profile.value.email = email;
  profile.value.avatar = avatar;
}

function updateUser(userData) {
  username.value = userData.username;
  profile.value = { ...profile.value, ...userData.profile };
  lastUpdated.value = new Date();
}`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Actions</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Actions are the methods that change state in your Dotzee stores. They encapsulate the business logic
                of your application, handle side effects, and can perform asynchronous operations like API calls.
            </p>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">What are Actions?</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Actions are methods that change the state of your store. Unlike some state management
                    libraries that require reducers or dispatchers, Dotzee actions allow you to directly
                    mutate state for a more intuitive development experience.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Options API: Actions</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Defined in the <code>actions</code> object</li>
                            <li>Methods where <code>this</code> refers to the store</li>
                            <li>Directly mutate state via <code>this.propertyName</code></li>
                            <li>Can call other actions using <code>this.actionName()</code></li>
                            <li>Can be async functions that update state after awaiting</li>
                        </ul>
                    </div>

                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Setup API: Functions</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Regular functions defined in the setup function</li>
                            <li>Mutate state by changing <code>ref.value</code></li>
                            <li>Call other functions directly by name</li>
                            <li>Can be async functions</li>
                            <li>Must be returned from setup to be accessible</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Key Benefits of Actions:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2"><strong>Direct mutations:</strong> Update state intuitively without reducers or action types</li>
                        <li className="mb-2"><strong>Encapsulation:</strong> Business logic stays in the store, not in components</li>
                        <li className="mb-2"><strong>Composition:</strong> Actions can call other actions for code reuse</li>
                        <li className="mb-2"><strong>Async support:</strong> Built-in support for async operations</li>
                        <li className="mb-2"><strong>DevTools integration:</strong> Actions are automatically tracked in DevTools</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Defining Actions in Options API</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    In the Options API, actions are defined in the <code>actions</code> object of the store definition.
                    Actions have access to the store instance via <code>this</code>, allowing them to read and update state.
                </p>

                <CodeBlock
                    code={optionsActionsExample}
                    language="typescript"
                    filename="src/stores/userStore.ts"
                />

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Options API Actions:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2"><code>this</code> refers to the store instance, giving access to state, getters, and other actions</li>
                        <li className="mb-2">Actions can accept parameters for more flexibility</li>
                        <li className="mb-2">Async actions work naturally with <code>async/await</code> syntax</li>
                        <li className="mb-2">Actions can return values, useful for communicating results to components</li>
                        <li className="mb-2">State changes within async actions (even after awaits) still trigger reactivity</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Defining Actions in Setup API</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    In the Setup API, actions are regular functions defined within the setup function.
                    These functions have access to the refs and other functions in the setup scope.
                </p>

                <CodeBlock
                    code={setupActionsExample}
                    language="typescript"
                    filename="src/stores/userSetupStore.ts"
                />

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">Setup API Actions:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Functions have direct access to refs through closure (no need for <code>this</code>)</li>
                        <li className="mb-2">Update state by changing <code>ref.value</code></li>
                        <li className="mb-2">Functions not returned from setup remain private to the store</li>
                        <li className="mb-2">Async functions work exactly the same as in the Options API</li>
                        <li className="mb-2">This pattern is similar to React's custom hooks approach</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Using Actions in Components</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Using actions in components is simple. Just call them as methods on the store instance:
                </p>

                <CodeBlock
                    code={actionsUsageExample}
                    language="jsx"
                />

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Key Points about Using Actions:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Actions are called as methods on the store instance</li>
                        <li className="mb-2">No difference in calling between Options API and Setup API</li>
                        <li className="mb-2">For async actions, you can <code>await</code> them directly</li>
                        <li className="mb-2">Actions can return values you can use in your components</li>
                        <li className="mb-2">Actions automatically trigger UI updates when they change state</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Composing Actions</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Actions can call other actions, allowing you to compose and reuse logic:
                </p>

                <CodeBlock
                    code={composingActionsExample}
                    language="javascript"
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Action Composition:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Options API: Call other actions via <code>this.actionName()</code></li>
                        <li className="mb-2">Setup API: Call other functions directly by name</li>
                        <li className="mb-2">Actions can be async and await other async actions</li>
                        <li className="mb-2">This encourages breaking down complex operations into smaller, reusable functions</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Interacting with Other Stores</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Actions can interact with other stores, allowing for cross-store communication:
                </p>

                <CodeBlock
                    code={storeInteractionsExample}
                    language="typescript"
                />

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Cross-Store Interactions:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Import and use other store hooks within your actions</li>
                        <li className="mb-2">Access state from other stores</li>
                        <li className="mb-2">Call actions on other stores</li>
                        <li className="mb-2">This pattern enables modular stores while still allowing communication</li>
                        <li className="mb-2">Be careful to avoid circular dependencies between stores</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Action Parameters & Payloads</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Actions can accept parameters, allowing you to pass data from components:
                </p>

                <CodeBlock
                    code={actionPayloadsExample}
                    language="javascript"
                />

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">Action Parameter Patterns:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2"><strong>Single value:</strong> Good for simple updates (<code>updateUsername('alice')</code>)</li>
                        <li className="mb-2"><strong>Multiple parameters:</strong> Useful for related data (<code>updateProfile('Alice', 'alice@example.com', 'avatar.jpg')</code>)</li>
                        <li className="mb-2"><strong>Object payload:</strong> Best for complex updates with many fields (<code>{`updateUser({ username: 'alice', profile: { /* ... */ } })`}</code>)</li>
                        <li className="mb-2">Consider using TypeScript to define parameter types for better autocompletion</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Best Practices</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-green-600 dark:text-green-400 mb-3">Do</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Name actions with verbs that describe what they do</li>
                            <li>Keep actions focused on a single responsibility</li>
                            <li>Handle async error states (e.g., with try/catch)</li>
                            <li>Use loading/error flags for async operations</li>
                            <li>Return values from actions when useful</li>
                            <li>Break down complex logic into multiple actions</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-red-600 dark:text-red-400 mb-3">Avoid</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Modifying state outside of actions</li>
                            <li>Extremely large actions with multiple responsibilities</li>
                            <li>Side effects unrelated to state (use separate services)</li>
                            <li>Updating unrelated parts of state in a single action</li>
                            <li>Triggering unnecessary rerenders by updating state too frequently</li>
                            <li>Circular dependencies between stores</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">DevTools Integration</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Dotzee automatically tracks action calls and state changes in DevTools. When you enable DevTools
                    integration, you'll see all action invocations as events, allowing you to trace state changes
                    and even time-travel debug your application.
                </p>

                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-md my-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-300 mb-2">DevTools show for each action:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Action name (in the format <code>storeId/actionName</code>)</li>
                        <li className="mb-2">Parameters passed to the action</li>
                        <li className="mb-2">State before and after the action</li>
                        <li className="mb-2">Timestamp of when the action was called</li>
                    </ul>
                    <p className="mt-4 text-gray-700 dark:text-gray-300">
                        This is invaluable for debugging complex state flows and understanding how your application state evolves over time.
                    </p>
                </div>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/core-concepts/getters" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Getters
                </Link>
                <Link to="/core-concepts" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    Core Concepts
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default ActionsPage; 
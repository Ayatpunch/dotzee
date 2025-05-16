import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../components/CodeBlock';

const GettingStartedPage: React.FC = () => {
  const installationCode = `# Using npm
npm install dotzee

# Using yarn
yarn add dotzee

# Using pnpm
pnpm add dotzee`;

  const basicExampleCode = `// src/stores/todoStore.ts
import { defineDotzeeStore } from 'dotzee';

// Define a simple todo store
export const useTodoStore = defineDotzeeStore('todos', {
  state: () => ({
    todos: [],
    filter: 'all' // 'all', 'completed', 'active'
  }),
  getters: {
    filteredTodos: (state) => {
      if (state.filter === 'all') return state.todos;
      const isCompleted = state.filter === 'completed';
      return state.todos.filter(todo => todo.completed === isCompleted);
    },
    completedCount: (state) => {
      return state.todos.filter(todo => todo.completed).length;
    },
    totalCount: (state) => state.todos.length
  },
  actions: {
    addTodo(text) {
      if (!text.trim()) return;
      this.todos.push({
        id: Date.now(),
        text,
        completed: false
      });
    },
    removeTodo(id) {
      const index = this.todos.findIndex(todo => todo.id === id);
      if (index !== -1) {
        this.todos.splice(index, 1);
      }
    },
    toggleTodo(id) {
      const todo = this.todos.find(todo => todo.id === id);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    setFilter(filter) {
      this.filter = filter;
    },
    clearCompleted() {
      this.todos = this.todos.filter(todo => !todo.completed);
    }
  }
});`;

  const componentCode = `// src/components/TodoList.tsx
import React, { useState } from 'react';
import { useTodoStore } from '../stores/todoStore';

const TodoList = () => {
  const [newTodo, setNewTodo] = useState('');
  const todoStore = useTodoStore();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    todoStore.addTodo(newTodo);
    setNewTodo('');
  };
  
  return (
    <div className="todo-app">
      <h1>Todo App</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
        />
        <button type="submit">Add</button>
      </form>
      
      <div className="filters">
        <button 
          onClick={() => todoStore.setFilter('all')}
          className={todoStore.filter === 'all' ? 'active' : ''}
        >
          All ({todoStore.totalCount})
        </button>
        <button 
          onClick={() => todoStore.setFilter('active')}
          className={todoStore.filter === 'active' ? 'active' : ''}
        >
          Active
        </button>
        <button 
          onClick={() => todoStore.setFilter('completed')}
          className={todoStore.filter === 'completed' ? 'active' : ''}
        >
          Completed ({todoStore.completedCount})
        </button>
      </div>
      
      <ul className="todo-list">
        {todoStore.filteredTodos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => todoStore.toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => todoStore.removeTodo(todo.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      
      {todoStore.completedCount > 0 && (
        <button 
          className="clear-completed"
          onClick={() => todoStore.clearCompleted()}
        >
          Clear completed
        </button>
      )}
    </div>
  );
};

export default TodoList;`;

  const devToolsCode = `// src/main.tsx or src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { enableDotzeeDevTools } from 'dotzee';

// Enable DevTools in development mode only
if (process.env.NODE_ENV === 'development') {
  enableDotzeeDevTools({
    name: 'My Dotzee App', // Optional: Custom name for the DevTools instance
    trace: true, // Optional: Enable action tracing
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

  return (
    <div className="prose max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Getting Started with Dotzee</h1>

      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        This guide will help you get started with Dotzee - a Pinia-like reactive state management library for React. We'll cover installation, basic usage, and best practices.
      </p>

      <div className="doc-section">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Installation</h2>
        <p className="mb-4">Install Dotzee using your preferred package manager:</p>
        <CodeBlock
          code={installationCode}
          language="bash"
          showLineNumbers={false}
        />
      </div>

      <div className="doc-section">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Basic Usage</h2>
        <p className="mb-4">Dotzee provides two ways to define stores: <strong>Options API</strong> and <strong>Setup API</strong>. Let's start with the Options API, which is similar to Pinia's Options stores.</p>

        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-3">1. Define Your Store</h3>
        <p className="mb-4">Create a store file in your project:</p>
        <CodeBlock
          code={basicExampleCode}
          language="typescript"
          filename="src/stores/todoStore.ts"
        />

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
          <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Understanding the Store:</h4>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
            <li className="mb-2"><strong>state</strong> - A function that returns the initial state object</li>
            <li className="mb-2"><strong>getters</strong> - Computed properties derived from the state</li>
            <li className="mb-2"><strong>actions</strong> - Methods to modify the state (where <code>this</code> refers to the store instance)</li>
          </ul>
        </div>

        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-3">2. Use Your Store in Components</h3>
        <p className="mb-4">Import your store and use it in your React components with the <code>useDotzeeStore</code> hook:</p>
        <CodeBlock
          code={componentCode}
          language="tsx"
          filename="src/components/TodoList.tsx"
        />

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md my-6">
          <h4 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">Key Points:</h4>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
            <li className="mb-2">We use <code>useTodoStore()</code> to access our store - direct invocation</li>
            <li className="mb-2">The store is fully reactive - updates trigger component re-renders</li>
            <li className="mb-2">Getters update automatically when their dependencies change</li>
            <li className="mb-2">Actions can be called directly from event handlers</li>
          </ul>
        </div>
      </div>

      <div className="doc-section">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">DevTools Integration</h2>
        <p className="mb-4">Dotzee integrates with Redux DevTools for debugging. Enable it in your main entry file:</p>
        <CodeBlock
          code={devToolsCode}
          language="typescript"
          filename="src/main.tsx"
        />
        <p className="mt-4">With DevTools enabled, you can inspect state changes, track actions, and use time-travel debugging.</p>
      </div>

      <div className="doc-section">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Next Steps</h2>
        <p className="mb-4">Now that you've created your first Dotzee store, here are some next topics to explore:</p>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <Link to="/core-concepts" className="doc-card hover:no-underline block">
            <h3 className="text-xl font-medium text-purple-700 dark:text-purple-400 mb-2">Core Concepts</h3>
            <p className="text-gray-700 dark:text-gray-300">Learn about reactivity, state management, getters, and actions in depth.</p>
          </Link>

          <Link to="/core-concepts/stores" className="doc-card hover:no-underline block">
            <h3 className="text-xl font-medium text-purple-700 dark:text-purple-400 mb-2">Stores</h3>
            <p className="text-gray-700 dark:text-gray-300">Explore the Options API and Setup API for more flexibility with composition.</p>
          </Link>

          <Link to="/advanced-guides/ssr" className="doc-card hover:no-underline block">
            <h3 className="text-xl font-medium text-purple-700 dark:text-purple-400 mb-2">SSR Support</h3>
            <p className="text-gray-700 dark:text-gray-300">Learn how to use Dotzee with server-side rendering.</p>
          </Link>

          <Link to="/advanced-guides/plugins" className="doc-card hover:no-underline block">
            <h3 className="text-xl font-medium text-purple-700 dark:text-purple-400 mb-2">Plugins</h3>
            <p className="text-gray-700 dark:text-gray-300">Extend Dotzee with plugins for persistence, logging, and more.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GettingStartedPage; 
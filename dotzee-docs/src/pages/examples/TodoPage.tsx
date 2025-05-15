import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const TodoPage: React.FC = () => {
    const storeDefinition = `// src/stores/todoStore.ts
import { defineDotzeeStore, ref, computed } from 'dotzee';

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

let nextId = 0;

export const useTodoStore = defineDotzeeStore('todos', () => {
  // 1. State as refs
  const todos = ref<Todo[]>([]);
  const filter = ref<'all' | 'active' | 'completed'>('all');

  // 2. Actions as functions
  function addTodo(text: string) {
    todos.value.push({ id: nextId++, text, completed: false });
  }

  function toggleTodo(id: number) {
    const todo = todos.value.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }

  function removeTodo(id: number) {
    todos.value = todos.value.filter(t => t.id !== id);
  }

  function setFilter(newFilter: 'all' | 'active' | 'completed') {
    filter.value = newFilter;
  }

  // 3. Getters as computed properties
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

  const activeCount = computed(() => todos.value.filter(todo => !todo.completed).length);
  const completedCount = computed(() => todos.value.filter(todo => todo.completed).length);

  // 4. Return state, actions, and getters
  return {
    todos, // Exposing raw todos array (can be modified by actions)
    filter, // Current filter
    addTodo,
    toggleTodo,
    removeTodo,
    setFilter,
    filteredTodos, // Derived list of todos based on filter
    activeCount,
    completedCount,
  };
});`;

    const componentUsage = `// src/components/TodoList.tsx
import React, { useState } from 'react';
import { useTodoStore, Todo } from '../stores/todoStore';

const TodoItem: React.FC<{ todo: Todo }> = ({ todo }) => {
  const todoStore = useTodoStore();
  return (
    <li style={{
      textDecoration: todo.completed ? 'line-through' : 'none',
      opacity: todo.completed ? 0.6 : 1,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #eee'
    }}>
      <span onClick={() => todoStore.toggleTodo(todo.id)} style={{ cursor: 'pointer' }}>
        {todo.text}
      </span>
      <button onClick={() => todoStore.removeTodo(todo.id)} style={{ marginLeft: '10px', background: '#ff6666', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}>
        Remove
      </button>
    </li>
  );
};

const TodoList: React.FC = () => {
  const todoStore = useTodoStore();
  const [newTodoText, setNewTodoText] = useState('');

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      todoStore.addTodo(newTodoText.trim());
      setNewTodoText('');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2em' }}>Todo App (Setup API)</h2>
      
      <form onSubmit={handleAddTodo} style={{ display: 'flex', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={newTodoText} 
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="What needs to be done?"
          style={{ flexGrow: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px 0 0 4px' }}
        />
        <button type="submit" style={{ padding: '10px 15px', background: '#5cb85c', color: 'white', border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}>
          Add Todo
        </button>
      </form>

      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button onClick={() => todoStore.setFilter('all')} disabled={todoStore.filter.value === 'all'}>All</button>
        <button onClick={() => todoStore.setFilter('active')} disabled={todoStore.filter.value === 'active'}>Active</button>
        <button onClick={() => todoStore.setFilter('completed')} disabled={todoStore.filter.value === 'completed'}>Completed</button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {/* Use the computed filteredTodos for rendering */}
        {todoStore.filteredTodos.value.map(todo => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
      
      <div style={{ marginTop: '20px', textAlign: 'center', color: '#555' }}>
        <p>Active tasks: {todoStore.activeCount.value}</p>
        <p>Completed tasks: {todoStore.completedCount.value}</p>
      </div>
    </div>
  );
};

export default TodoList;`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Todo App Example</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                This Todo App example demonstrates more advanced state management techniques using Dotzee, including managing a list of objects,
                handling CRUD (Create, Read, Update, Delete) operations, and using computed properties for derived state like filtering.
                This example utilizes the <strong>Setup API</strong> for defining the store.
            </p>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Defining the Todo Store (Setup API)</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    The store is defined using <code>defineDotzeeStore</code> with the Setup API. State properties like <code>todos</code> (an array of Todo objects)
                    and <code>filter</code> are created as <code>ref</code>s. Actions are plain functions, and getters are created using <code>computed</code>.
                </p>
                <CodeBlock
                    code={storeDefinition}
                    language="typescript"
                    filename="src/stores/todoStore.ts"
                />
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Key points in Setup API store:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-1">State variables (e.g., <code>todos</code>, <code>filter</code>) are declared using <code>ref()</code>.</li>
                        <li className="mb-1">Actions (e.g., <code>addTodo</code>, <code>toggleTodo</code>) are regular JavaScript functions that operate on the <code>.value</code> of refs.</li>
                        <li className="mb-1">Computed properties (e.g., <code>filteredTodos</code>, <code>activeCount</code>) are created using <code>computed()</code>. They automatically track dependencies and re-evaluate when those dependencies change.</li>
                        <li className="mb-1">The setup function returns an object containing all state, actions, and computed properties that should be exposed by the store.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Using the Todo Store in Components</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    The <code>TodoList</code> component manages the input for new todos, filter buttons, and renders the list of todos.
                    The <code>TodoItem</code> component renders individual todo items.
                </p>
                <CodeBlock
                    code={componentUsage}
                    language="tsx"
                    filename="src/components/TodoList.tsx"
                />
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Component Interaction:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-1">The <code>useTodoStore</code> hook is called to get the store instance.</li>
                        <li className="mb-1">State refs and computed properties from the store are accessed using <code>.value</code> (e.g., <code>todoStore.filteredTodos.value</code>, <code>todoStore.filter.value</code>).</li>
                        <li className="mb-1">Actions are called directly (e.g., <code>todoStore.addTodo(text)</code>, <code>todoStore.setFilter('active')</code>).</li>
                        <li className="mb-1">The list of todos is rendered using the <code>filteredTodos.value</code> computed property, which automatically updates when the <code>todos</code> array or the <code>filter</code> ref changes.</li>
                        <li className="mb-1">Local component state (<code>newTodoText</code>) is used for the input field.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">How it Works: Managing Lists and Derived Data</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    The <code>todos</code> state is a <code>ref</code> holding an array. Actions like <code>addTodo</code> and <code>removeTodo</code> directly modify <code>todos.value</code> by pushing to it or filtering it.
                    Dotzee's reactivity system ensures that changes to this array (or properties of objects within it, if those objects are also reactive) trigger updates.
                </p>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    The <code>filteredTodos</code> computed property is a powerful feature. It depends on both the <code>todos</code> array and the <code>filter</code> ref.
                    Whenever either of these dependencies changes, <code>filteredTodos</code> re-evaluates its getter function and provides the new, filtered list.
                    The component, by rendering <code>filteredTodos.value</code>, automatically displays the correct set of todos without needing manual filtering logic within the component itself.
                </p>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Key Concepts Demonstrated</h2>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                        <li>
                            <strong>Setup API for Stores</strong>: Defining stores using functions, <code>ref</code> for state, and <code>computed</code> for getters.
                        </li>
                        <li>
                            <strong><code>ref()</code></strong>: Creating reactive references for state, including arrays of objects.
                        </li>
                        <li>
                            <strong><code>computed()</code></strong>: Creating derived, reactive data (e.g., filtered lists, counts) that cache their results and update automatically.
                        </li>
                        <li>
                            <strong>List Management</strong>: Adding, removing, and updating items in a reactive array.
                        </li>
                        <li>
                            <strong>Stateful Filtering</strong>: Changing a <code>filter</code> ref to dynamically alter what data is displayed, powered by computed properties.
                        </li>
                        <li>
                            <strong>Component Composition</strong>: Breaking down the UI into smaller components (<code>TodoList</code>, <code>TodoItem</code>) that share the same store.
                        </li>
                        <li>
                            <strong>TypeScript Integration</strong>: Using interfaces (<code>Todo</code>) for type safety in the store and components.
                        </li>
                    </ul>
                </div>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/examples/counter" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Counter Example
                </Link>
                <Link to="/examples/async" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    Async Actions Example
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default TodoPage; 
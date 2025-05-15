import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const AsyncActionsPage: React.FC = () => {
    const storeDefinition = `// src/stores/postsStore.ts
import { defineDotzeeStore } from 'dotzee';

export interface Post {
  id: number;
  title: string;
  body: string;
}

// Mock API function
const fetchPostsFromApi = (): Promise<Post[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.2) { // 80% chance of success
        resolve([
          { id: 1, title: 'Understanding Dotzee Async Actions', body: 'Async actions are powerful...' },
          { id: 2, title: 'State Management with Dotzee', body: 'Keep your state organized...' },
          { id: 3, title: 'Reactivity in Dotzee', body: 'Learn how Dotzee handles reactivity...' },
        ]);
      } else {
        reject(new Error('Failed to fetch posts. Please try again.'));
      }
    }, 1500); // Simulate network delay
  });
};

export const usePostsStore = defineDotzeeStore('posts', {
  // 1. Define State
  state: () => ({
    posts: [] as Post[],
    isLoading: false,
    error: null as string | null,
  }),

  // 2. Define Actions (including async)
  actions: {
    async fetchPosts() {
      this.isLoading = true;
      this.error = null;
      try {
        const data = await fetchPostsFromApi();
        this.posts = data;
      } catch (err: any) {
        this.error = err.message || 'An unknown error occurred';
      } finally {
        this.isLoading = false;
      }
    },
    clearPosts() {
      this.posts = [];
      this.error = null;
    }
  },
  
  // 3. (Optional) Getters can be added if needed
  getters: {
    hasPosts: (state) => state.posts.length > 0,
    postsCount: (state) => state.posts.length,
  }
});`;

    const componentUsage = `// src/components/PostsList.tsx
import React, { useEffect } from 'react';
import { usePostsStore } from '../stores/postsStore';

const PostsList: React.FC = () => {
  // 4. Use the store hook
  const postsStore = usePostsStore();

  // 5. Fetch posts when the component mounts
  useEffect(() => {
    // Check if posts are already loaded or if it's currently loading to avoid multiple fetches
    if (!postsStore.hasPosts && !postsStore.isLoading) {
        postsStore.fetchPosts();
    }
  }, [postsStore]); // Dependency array includes postsStore to re-run if the store instance itself were to change (rare)

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '700px', margin: '20px auto' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2em', marginBottom: '20px' }}>Async Actions: Fetching Posts</h2>
      
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button 
            onClick={() => postsStore.fetchPosts()} 
            disabled={postsStore.isLoading}
            style={{ padding: '10px 15px', marginRight: '10px', cursor: 'pointer' }}
        >
          {postsStore.isLoading ? 'Fetching...' : 'Refetch Posts'}
        </button>
        <button 
            onClick={() => postsStore.clearPosts()} 
            disabled={!postsStore.hasPosts && !postsStore.error}
            style={{ padding: '10px 15px', cursor: 'pointer' }}
        >
          Clear Posts
        </button>
      </div>

      {/* 6. Display loading state */}
      {postsStore.isLoading && <p style={{ textAlign: 'center', fontSize: '1.2em' }}>Loading posts...</p>}

      {/* 7. Display error state */}
      {postsStore.error && (
        <div style={{ color: 'red', textAlign: 'center', padding: '10px', border: '1px solid red', borderRadius: '4px', marginBottom: '20px' }}>
          <p>Error: {postsStore.error}</p>
        </div>
      )}

      {/* 8. Display data */}
      {!postsStore.isLoading && !postsStore.error && postsStore.hasPosts && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {postsStore.posts.map(post => (
            <li key={post.id} style={{ padding: '15px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '4px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '5px' }}>{post.title}</h3>
              <p style={{ margin: 0, color: '#555' }}>{post.body}</p>
            </li>
          ))}
        </ul>
      )}
      
      {!postsStore.isLoading && !postsStore.error && !postsStore.hasPosts && (
          <p style={{ textAlign: 'center', fontSize: '1.1em', color: '#777' }}>No posts to display. Try fetching them!</p>
      )}

      {postsStore.hasPosts && (
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#333' }}>
          Showing {postsStore.postsCount} post(s).
        </p>
      )}
    </div>
  );
};

export default PostsList;`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Async Actions Example</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                This example demonstrates how to handle asynchronous operations in Dotzee, such as fetching data from an API.
                It showcases managing loading and error states within the store and reflecting these in the UI.
                This example uses the <strong>Options API</strong> for defining the store.
            </p>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Defining the Posts Store (Options API)</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    The store (<code>usePostsStore</code>) is defined with state properties for <code>posts</code>, <code>isLoading</code>, and <code>error</code>.
                    The <code>fetchPosts</code> action is an <code>async</code> function that simulates an API call.
                </p>
                <CodeBlock
                    code={storeDefinition}
                    language="typescript"
                    filename="src/stores/postsStore.ts"
                />
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Key points for async in Options API:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-1">State includes data (<code>posts</code>), a boolean for loading status (<code>isLoading</code>), and a potential error message (<code>error</code>).</li>
                        <li className="mb-1">The <code>fetchPosts</code> action is marked <code>async</code>. Inside, <code>this</code> refers to the store instance.</li>
                        <li className="mb-1">Before the API call, <code>this.isLoading</code> is set to <code>true</code> and <code>this.error</code> is cleared.</li>
                        <li className="mb-1">A <code>try...catch...finally</code> block handles the API call:
                            data is assigned to <code>this.posts</code> on success, <code>this.error</code> is set on failure,
                            and <code>this.isLoading</code> is set to <code>false</code> in the <code>finally</code> block regardless of outcome.
                        </li>
                        <li className="mb-1">Getters like <code>hasPosts</code> and <code>postsCount</code> provide derived information based on the state.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Using the Async Store in a Component</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    The <code>PostsList</code> component uses the <code>usePostsStore</code> to fetch and display posts, along with loading and error indicators.
                </p>
                <CodeBlock
                    code={componentUsage}
                    language="tsx"
                    filename="src/components/PostsList.tsx"
                />
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Component Interaction:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-1">The <code>usePostsStore</code> hook provides the store instance.</li>
                        <li className="mb-1">A <code>useEffect</code> hook calls <code>postsStore.fetchPosts()</code> when the component mounts (if data isn't already loaded or loading).</li>
                        <li className="mb-1">The UI conditionally renders based on <code>postsStore.isLoading</code> and <code>postsStore.error</code>.</li>
                        <li className="mb-1">Fetched <code>postsStore.posts</code> are displayed in a list.</li>
                        <li className="mb-1">Buttons allow re-fetching or clearing posts, with their disabled state managed by store properties.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">How Async Actions Work</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    When an async action like <code>fetchPosts</code> is called, it can perform asynchronous operations (e.g., <code>await fetchPostsFromApi()</code>).
                    State mutations (<code>this.isLoading = true</code>, <code>this.posts = data</code>) can happen before, during (e.g., for progress updates, though not shown here), or after the asynchronous part.
                </p>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Dotzee's reactivity system ensures that any component using the store (e.g., accessing <code>postsStore.isLoading</code> or <code>postsStore.posts</code>)
                    will automatically re-render when these state properties are changed by the async action.
                    This allows the UI to reflect the loading process, display fetched data, or show error messages seamlessly.
                </p>
            </div>

            <div className="doc-section mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Key Concepts Demonstrated</h2>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                        <li>
                            <strong>Async Actions</strong>: Defining actions as <code>async</code> functions to perform operations like API calls.
                        </li>
                        <li>
                            <strong>Loading State Management</strong>: Using a boolean state property (e.g., <code>isLoading</code>) to track if an async operation is in progress.
                        </li>
                        <li>
                            <strong>Error State Management</strong>: Using a state property (e.g., <code>error</code>) to store and display error messages from async operations.
                        </li>
                        <li>
                            <strong><code>try...catch...finally</code></strong>: Standard JavaScript pattern for robust error handling in async code.
                        </li>
                        <li>
                            <strong>Conditional Rendering</strong>: Showing different UI elements based on loading, error, or data states.
                        </li>
                        <li>
                            <strong>Options API for Stores</strong>: Structuring the store with <code>state</code>, <code>actions</code>, and <code>getters</code> objects.
                        </li>
                        <li>
                            <strong>Data Fetching Pattern</strong>: Initiating data fetch on component mount using <code>useEffect</code>.
                        </li>
                    </ul>
                </div>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/examples/todo" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Todo App Example
                </Link>
                <Link to="/examples/ssr" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    SSR Example
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default AsyncActionsPage; 
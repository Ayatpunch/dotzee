import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const CodeSplittingPage: React.FC = () => {
    const lazyLoadingExample = `// src/components/HeavyFeature.tsx
import React from 'react';
import { defineDotzeeStore, ref } from 'dotzee';

// Define a store specific to this feature
// This store will only be registered when HeavyFeature is loaded
export const useFeatureStore = defineDotzeeStore('heavyFeature', () => {
  const featureData = ref<string | null>(null);
  const isLoading = ref(false);

  async function loadFeatureData() {
    isLoading.value = true;
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    featureData.value = 'Feature data loaded successfully!';
    isLoading.value = false;
  }

  return { featureData, isLoading, loadFeatureData };
});

const HeavyFeature: React.FC = () => {
  const store = useFeatureStore();

  React.useEffect(() => {
    store.loadFeatureData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (store.isLoading.value) {
    return <p className="text-lg text-gray-700 dark:text-gray-300">Loading feature...</p>;
  }

  return (
    <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg shadow">
      <h3 className="text-2xl font-semibold text-green-800 dark:text-green-300 mb-3">Heavy Feature Loaded!</h3>
      <p className="text-gray-700 dark:text-gray-300">{store.featureData.value}</p>
    </div>
  );
};

export default HeavyFeature;

// src/App.tsx (or your router setup)
import React, { Suspense } from 'react';
// ... other imports

const HeavyFeature = React.lazy(() => import('./components/HeavyFeature'));

function App() {
  // ...
  return (
    // ...
    <Suspense fallback={<div className="p-4 text-center">Loading page...</div>}>
      <Routes>
        {/* ... other routes */}
        <Route path="/heavy-feature-demo" element={<HeavyFeature />} />
      </Routes>
    </Suspense>
    // ...
  );
}
`;

    const ssrConsiderationsExample = `// Server-side (e.g., in a Next.js Server Component or loader)
async function getInitialFeatureState() {
  // Fetch or determine initial state for the lazy-loaded feature
  const initialData = await fetchFeatureDataFromServer(); 
  return { featureData: initialData };
}

// Pass \`initialFeatureState\` as a prop to the client component 
// that will eventually render the lazy-loaded \`HeavyFeature\`.

// src/components/HeavyFeature.tsx (modified)
// ... (store definition remains the same) ...

interface HeavyFeatureProps {
  initialState?: { featureData: string };
}

const HeavyFeature: React.FC<HeavyFeatureProps> = ({ initialState }) => {
  const store = useFeatureStore();

  React.useEffect(() => {
    if (initialState && !store.featureData.value) {
      // Hydrate store if initial state is provided and not yet set
      store.featureData.value = initialState.featureData;
      // Optionally set loading to false if data is pre-filled
      store.isLoading.value = false; 
    } else if (!store.featureData.value) {
      store.loadFeatureData();
    }
  }, [initialState, store]); // Ensure all dependencies are listed

  // ... rest of the component
};
`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Code Splitting with Dotzee</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Code splitting is a powerful technique to improve the initial load performance of your React application.
                By splitting your code into smaller chunks, you can ensure that users only download the code they need
                for the initial view, leading to faster startup times. Dotzee is designed to work seamlessly with code splitting.
            </p>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">How Dotzee Supports Code Splitting</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Dotzee's core design principle of registering stores on their first use makes it inherently compatible with code splitting:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                    <li><strong>Automatic Registration:</strong> When you define a Dotzee store (e.g., using <code>defineDotzeeStore</code>), it isn't immediately instantiated or added to a global registry until it's actually used (i.e., its hook is called).</li>
                    <li><strong>Lazy Loading Friendly:</strong> If a store is defined within a code-split chunk (e.g., a component loaded with <code>React.lazy()</code>), the store's code and its registration will only occur when that chunk is loaded and the store is accessed.</li>
                    <li><strong>No Upfront Configuration:</strong> You don't need to pre-register all possible stores. Dotzee handles this dynamically.</li>
                </ul>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Key Benefit:</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                        This means that stores associated with features that are not immediately visible or needed by the user won't contribute to the initial bundle size, improving your application's performance.
                    </p>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Example: Lazy Loading a Feature with its Own Store</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Let's consider an example where you have a "heavy feature" component that has its own dedicated Dotzee store. You can use <code>React.lazy()</code> to load this component (and its store) only when it's needed.
                </p>
                <CodeBlock
                    code={lazyLoadingExample}
                    language="tsx"
                    filename="src/components/HeavyFeature.tsx & App.tsx"
                />
                <p className="mt-4 text-gray-700 dark:text-gray-300">
                    In this example:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>The <code>HeavyFeature.tsx</code> file contains both the component and its <code>useFeatureStore</code> definition.</li>
                    <li>The <code>useFeatureStore</code> (and the store 'heavyFeature') will only be defined and registered in Dotzee when the <code>HeavyFeature</code> component is actually rendered due to navigation or conditional rendering.</li>
                    <li>The initial application bundle will not include the code for <code>HeavyFeature</code> or its store.</li>
                </ul>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Server-Side Rendering (SSR) and Hydration</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    When using code splitting with SSR, you need to consider how initial state for lazy-loaded stores is handled. Dotzee's global <code>hydrateDotzeeState</code> is primarily designed for eagerly known stores.
                </p>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    For lazy-loaded stores that require initial state from the server, the recommended pattern is:
                </p>
                <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>The server fetches or determines the specific initial state for the lazy-loaded feature/store.</li>
                    <li>This initial state is passed as props to the lazy-loaded component (or a wrapper around it).</li>
                    <li>The lazy-loaded component, upon mounting on the client, uses an action on its own store (or directly sets ref values) to initialize itself from these props. The store should expose such an initialization mechanism if needed.</li>
                </ol>
                <CodeBlock
                    code={ssrConsiderationsExample}
                    language="tsx"
                    filename="Server & src/components/HeavyFeature.tsx (Modified for SSR)"
                />
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Hydration Strategy:</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                        This manual hydration approach ensures that the client-side store for the lazy-loaded feature starts with the correct state that was determined during SSR, preventing UI flickers or inconsistencies. Dotzee is also exploring more automated library-level solutions for pending hydration data for future enhancements.
                    </p>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">DevTools Integration</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Dotzee's DevTools integration works as expected with lazy-loaded stores. Once a code-split chunk containing a store definition is loaded and the store is used for the first time:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>The store will appear in the DevTools.</li>
                    <li>Its initial state will be reported.</li>
                    <li>Subsequent actions and state changes for that store will be logged.</li>
                    <li>Time-travel debugging will function correctly for the lazy-loaded store just like any other store.</li>
                </ul>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Best Practices for Code Splitting with Dotzee</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                    <li><strong>Colocate Stores with Features:</strong> Define stores within the same code-split chunk as the primary feature/components that use them. This maximizes the benefits of lazy loading.</li>
                    <li><strong>Route-Based Splitting:</strong> A common and effective strategy is to code-split based on application routes. Each page or major section can be a separate chunk with its associated stores.</li>
                    <li><strong>Identify Heavy Components:</strong> Use bundle analysis tools to identify large components or features that are good candidates for lazy loading.</li>
                    <li><strong>Suspense for Loading States:</strong> Always use <code>&lt;Suspense&gt;</code> with <code>React.lazy()</code> to provide a good user experience while chunks are loading.</li>
                    <li><strong>Plan for SSR Hydration:</strong> If using SSR, think about how initial state for lazy-loaded stores will be passed to the client and hydrated, as outlined above.</li>
                </ul>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/advanced-guides/typescript" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    TypeScript Usage
                </Link>
                <Link to="/api-reference" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    API Reference
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default CodeSplittingPage; 
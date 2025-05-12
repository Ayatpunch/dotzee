// REMOVE ALL zest-state-library imports
// import {
//   createZestRegistry,
//   setActiveZestRegistry,
//   resetActiveZestRegistry,
// } from 'zest-state-library';
// import type { ZestRegistry } from 'zest-state-library';

// import dynamic from 'next/dynamic'; // REMOVED
import ClientContainer from '../components/ClientContainer'; // IMPORT new container

// Dynamically import ClientPage with SSR turned off - REMOVED from here
// const ClientPage = dynamic(() => import('../components/ClientPage'), { // REMOVED
//   ssr: false, // REMOVED
//   // Optional: Add a loading component // REMOVED
//   // loading: () => <p>Loading counter...</p>, // REMOVED
// }); // REMOVED

export default function Page() {
  // REMOVE registry-related code
  // const requestRegistry: ZestRegistry = createZestRegistry();
  // setActiveZestRegistry(requestRegistry);

  // Simply hardcode the initial state without any Zest dependencies
  const initialZestState = {
    'counterOptions': {
      count: 5,
      name: 'Next.js Options Counter',
      loading: false,
    },
  };

  // REMOVE registry reset
  // resetActiveZestRegistry();

  return (
    <div className="min-h-screen">
      <div className="hero-section">
        <h1>Zest</h1>
        <p className="subtitle">A Pinia-like Reactive State Library for React</p>
        <div className="mt-2 inline-block bg-indigo-100 dark:bg-indigo-900/50 rounded-full px-3 py-1 text-sm">
          Next.js Server Components + Client Components Demo
        </div>
      </div>

      <ClientContainer initialZestState={initialZestState} />

      <footer className="footer">
        <p>Powered by Next.js App Router + Zest State Management</p>
      </footer>
    </div>
  );
}

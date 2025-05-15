import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import Dotzee DevTools utilities and Plugin utilities
import { enableDotzeeDevTools, useDotzeePlugin, loggerPlugin, persistencePlugin } from 'dotzee';

// Enable DevTools and Plugins before rendering the app
// Only do this in development mode for best practice
if (import.meta.env.MODE === 'development') {
  // Register plugins
  useDotzeePlugin(loggerPlugin);
  useDotzeePlugin(persistencePlugin());

  enableDotzeeDevTools({
    name: 'Dotzee Example App', // Optional: Custom name for the DevTools instance
    trace: true, // Optional: Enable action tracing
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

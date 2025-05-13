import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import Zest DevTools utilities and Plugin utilities
import { enableZestDevTools, useZestPlugin, loggerPlugin, persistencePlugin } from 'zest-state-library';

// Enable DevTools and Plugins before rendering the app
// Only do this in development mode for best practice
if (import.meta.env.MODE === 'development') {
  // Register plugins
  useZestPlugin(loggerPlugin);
  useZestPlugin(persistencePlugin);

  enableZestDevTools({
    name: 'Zest Example App', // Optional: Custom name for the DevTools instance
    trace: true, // Optional: Enable action tracing
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import Zest DevTools utilities and the internal registry
import { enableZestDevTools, _internal_storeRegistry } from 'zest-state-library';

// Enable DevTools before rendering the app
// Only do this in development mode for best practice
if (import.meta.env.MODE === 'development') {
  enableZestDevTools(_internal_storeRegistry, {
    name: 'Zest Example App', // Optional: Custom name for the DevTools instance
    trace: true, // Optional: Enable action tracing
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

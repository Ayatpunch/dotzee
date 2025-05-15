import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';

const DevtoolsPage: React.FC = () => {
    const enableDevtoolsExample = `// In your main client file (e.g., main.tsx or index.tsx)
import { enableDotzeeDevTools } from 'dotzee';

// Enable DevTools during development
if (process.env.NODE_ENV === 'development') {
  enableDotzeeDevTools();
}`;

    const devtoolsOptionsExample = `// Configure DevTools with custom options
enableDotzeeDevTools({
  // Log all actions and state changes to console (default: false)
  logToConsole: true,
  
  // Provide a custom name to identify your app in DevTools
  name: 'My Dotzee App',
  
  // Disable time-travel features (default: false - time travel is enabled)
  disableTimeTravel: false,
  
  // Only allow certain actions to be tracked
  allowedActions: ['user/login', 'user/logout', 'cart/*'],
  
  // Persist state across page reloads (default: false)
  persistState: true
});`;

    const storeWithLabelsExample = `// src/stores/userStore.ts
import { defineDotzeeStore } from 'dotzee';

export const useUserStore = defineDotzeeStore('user', {
  state: () => ({
    userId: null,
    profile: {
      username: 'Guest',
      email: ''
    },
    preferences: {
      theme: 'light'
    },
    isLoggedIn: false,
  }),
  
  actions: {
    // These action names will appear in DevTools
    login(username, password) {
      // This action will be logged as 'user/login' in DevTools
      // The parameters will be shown in the action details
      // ...implementation...
    },
    
    updateProfile(profileData) {
      // This will be logged as 'user/updateProfile' with profileData as payload
      this.profile = { ...this.profile, ...profileData };
    },
    
    // Add DevTools label for clearer debugging
    ['THEME_CHANGE: updateTheme'](theme) { // Custom action label
      this.preferences.theme = theme;
    }
  }
});`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">DevTools Integration</h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Dotzee integrates seamlessly with Redux DevTools to offer powerful debugging capabilities. This allows you to
                inspect your application state, track actions, and use time-travel debugging to better understand and
                troubleshoot your state management.
            </p>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Why Use DevTools?</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    DevTools integration provides several key benefits for development:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                    <li><strong>State Inspection:</strong> View your entire application state tree in an organized way</li>
                    <li><strong>Action Tracking:</strong> Monitor all actions dispatched in your app with their payloads</li>
                    <li><strong>Time-Travel Debugging:</strong> Jump back and forth between state changes to debug issues</li>
                    <li><strong>State History:</strong> Review how your application state evolves over time</li>
                    <li><strong>Visualization:</strong> See state changes highlighted in real-time as they occur</li>
                </ul>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Getting Started with DevTools</h2>

                <div className="space-y-4 mb-6">
                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">1. Install the Browser Extension</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            First, you need to install the Redux DevTools Extension for your browser:
                        </p>
                        <ul className="list-disc pl-6 mt-2 text-gray-700 dark:text-gray-300">
                            <li><a href="https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd" className="text-purple-600 dark:text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer">Chrome Extension</a></li>
                            <li><a href="https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/" className="text-purple-600 dark:text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer">Firefox Extension</a></li>
                        </ul>
                    </div>

                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">2. Enable DevTools in Your Dotzee App</h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                            After installing the browser extension, you need to connect Dotzee to it. Add the following code to your application:
                        </p>
                        <CodeBlock
                            code={enableDevtoolsExample}
                            language="typescript"
                            filename="main.tsx"
                        />
                        <p className="text-gray-700 dark:text-gray-300 mt-3">
                            It's recommended to only enable DevTools during development to avoid potential performance overhead in production.
                        </p>
                    </div>

                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">3. Open DevTools in Your Browser</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            Once your app is running, open Redux DevTools from your browser's developer tools or extensions menu.
                            You should see your Dotzee stores and actions listed in the DevTools interface.
                        </p>
                    </div>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">DevTools Features</h2>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-medium text-purple-600 dark:text-purple-400 mb-2">Action Monitoring</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            All actions dispatched by your Dotzee stores are tracked in DevTools. Each action includes:
                        </p>
                        <ul className="list-disc pl-5 mt-2 text-gray-700 dark:text-gray-300">
                            <li>Action name (in the format <code>storeId/actionName</code>)</li>
                            <li>Action parameters/payload</li>
                            <li>Timestamp</li>
                            <li>State before and after the action</li>
                        </ul>
                    </div>

                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400 mb-2">State Tree Inspection</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            DevTools displays your entire state tree in a hierarchical format:
                        </p>
                        <ul className="list-disc pl-5 mt-2 text-gray-700 dark:text-gray-300">
                            <li>Organized by store ID</li>
                            <li>Expandable nested objects</li>
                            <li>Diff view highlighting changes</li>
                            <li>Raw state view for copying values</li>
                        </ul>
                    </div>

                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-medium text-green-600 dark:text-green-400 mb-2">Time Travel</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            Jump back to any previous state:
                        </p>
                        <ul className="list-disc pl-5 mt-2 text-gray-700 dark:text-gray-300">
                            <li>Slider to move through action history</li>
                            <li>Play/pause for automatic replay</li>
                            <li>Jump directly to specific actions</li>
                            <li>See exactly how state changed over time</li>
                        </ul>
                    </div>

                    <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <h3 className="text-xl font-medium text-orange-600 dark:text-orange-400 mb-2">Advanced Controls</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            Additional developer utilities:
                        </p>
                        <ul className="list-disc pl-5 mt-2 text-gray-700 dark:text-gray-300">
                            <li>Filter actions by name or store</li>
                            <li>Import/export action logs</li>
                            <li>Persist debugging sessions</li>
                            <li>Customize the DevTools UI</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Configuration Options</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    The <code>enableDotzeeDevTools</code> function accepts an options object to customize the DevTools behavior:
                </p>

                <CodeBlock
                    code={devtoolsOptionsExample}
                    language="typescript"
                    filename="devtools-config.ts"
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Configuration Tips:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Use <code>name</code> to identify your app when working with multiple applications.</li>
                        <li className="mb-2">The <code>allowedActions</code> option is useful for filtering noise in complex applications.</li>
                        <li className="mb-2">Consider enabling <code>logToConsole</code> for additional debugging information.</li>
                        <li className="mb-2">The <code>persistState</code> option lets you keep your state across page reloads during development.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Action Labels and Organization</h2>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Dotzee formats actions in DevTools as <code>storeId/actionName</code>, making them easy to identify.
                    You can enhance this by using descriptive store IDs and action names:
                </p>

                <CodeBlock
                    code={storeWithLabelsExample}
                    language="typescript"
                    filename="userStore.ts"
                />

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md my-6">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Tips for Better DevTools Organization:</h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                        <li className="mb-2">Use consistent naming conventions for actions across your stores.</li>
                        <li className="mb-2">For complex applications, consider prefixing action names with categories (e.g., <code>auth/login</code>, <code>data/fetch</code>).</li>
                        <li className="mb-2">You can use computed property names with descriptive prefixes as shown in the example.</li>
                        <li className="mb-2">Keep action payloads serializable to ensure they display correctly in DevTools.</li>
                    </ul>
                </div>
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Best Practices</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-green-600 dark:text-green-400 mb-3">Do</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Disable DevTools in production builds</li>
                            <li>Use meaningful store IDs and action names</li>
                            <li>Keep action payloads serializable</li>
                            <li>Use time-travel to identify and fix bugs</li>
                            <li>Filter actions when debugging specific issues</li>
                            <li>Inspect the state structure frequently when developing</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-medium text-red-600 dark:text-red-400 mb-3">Avoid</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Including sensitive information in state</li>
                            <li>Non-serializable values in state/payloads</li>
                            <li>Circular references in your state objects</li>
                            <li>Extremely large state objects that slow DevTools</li>
                            <li>Over-relying on time-travel in lieu of proper testing</li>
                            <li>Using DevTools in production, which adds overhead</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-10 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link to="/advanced-guides/ssr" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Server-Side Rendering
                </Link>
                <Link to="/advanced-guides/plugins" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center">
                    Plugins
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default DevtoolsPage; 
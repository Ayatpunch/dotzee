import React from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from '../components/CodeBlock';

const InstallationPage: React.FC = () => {
    const installationCode = `# Using npm
npm install dotzee

# Using yarn
yarn add dotzee

# Using pnpm
pnpm add dotzee`;

    const requirementsCode = `// Dotzee requires React 18 or later
"dependencies": {
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "dotzee": "^1.0.0"
}`;

    return (
        <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Installation</h1>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Requirements</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Dotzee is compatible with React 18 and above. It uses React's <code>useSyncExternalStore</code> hook
                    which was introduced in React 18 to safely subscribe to external data sources.
                </p>
                <CodeBlock
                    code={requirementsCode}
                    language="json"
                    filename="package.json"
                />
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Installation</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    You can install Dotzee using npm, yarn, or pnpm:
                </p>
                <CodeBlock
                    code={installationCode}
                    language="bash"
                    showLineNumbers={false}
                />
            </div>

            <div className="doc-section mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">TypeScript Support</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Dotzee is built with TypeScript and provides first-class type support out of the box.
                    TypeScript definitions are included with the package, so no additional installation is required.
                </p>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    For the best development experience, we recommend using TypeScript with Dotzee to get full type inference
                    for your store state, actions, and getters.
                </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-8">
                <h2 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Next Steps</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Now that you've installed Dotzee, you can begin building your first store:
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link to="/quick-start" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                        Quick Start Guide
                    </Link>
                    <Link to="/core-concepts/stores" className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Defining Stores
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default InstallationPage; 
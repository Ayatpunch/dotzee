import React from 'react';

const CoreConceptsPage: React.FC = () => {
    return (
        <div>
            <h1>Core Concepts</h1>
            <p>This section will explain the fundamental concepts of Dotzee, including:</p>
            <ul>
                <li>Reactivity (Proxies, Refs, Computed)</li>
                <li>Defining Stores with `defineDotzeeStore` (Options and Setup syntaxes)</li>
                <li>State Management</li>
                <li>Getters (Computed Properties)</li>
                <li>Actions</li>
            </ul>
            {/* Content will be added here, likely from Markdown */}
        </div>
    );
};

export default CoreConceptsPage; 
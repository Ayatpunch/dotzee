import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
    code: string;
    language?: string;
    filename?: string;
    showLineNumbers?: boolean;
}

// TODO: To enable syntax highlighting, install and import:
// npm install react-syntax-highlighter
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock: React.FC<CodeBlockProps> = ({
    code,
    language = 'typescript',
    filename = '',
    showLineNumbers = true
}) => {
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    // Custom style overrides for the syntax highlighter
    const customStyle = {
        padding: '1rem',
        borderRadius: '0',
        margin: 0,
        backgroundColor: '#1e1e1e', // Match dark VS Code theme
    };

    return (
        <div className="relative group overflow-hidden mb-6 border border-gray-700 dark:border-gray-800 rounded-md shadow-md">
            {filename && (
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 text-gray-200 text-sm font-mono border-b border-gray-700">
                    <div className="flex items-center">
                        <div className="flex space-x-1.5 mr-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <span>{filename}</span>
                    </div>
                    <div className="text-xs px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">
                        {language}
                    </div>
                </div>
            )}

            <div className="relative overflow-hidden">
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    showLineNumbers={showLineNumbers}
                    customStyle={customStyle}
                    wrapLongLines={false}
                >
                    {code}
                </SyntaxHighlighter>

                <button
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 rounded-md p-2 text-gray-400 hover:text-white bg-gray-700 bg-opacity-30 hover:bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                    aria-label={isCopied ? "Copied" : "Copy code"}
                >
                    {isCopied ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CodeBlock; 
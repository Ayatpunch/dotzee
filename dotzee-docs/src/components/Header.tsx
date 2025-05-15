import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  onSidebarToggle?: () => void;
  showLogo?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle, showLogo = true }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // Detect if we're on mobile for logo display
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Listen for resize events
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
      <div className="flex items-center justify-between h-[65px] px-6 lg:px-8">
        {/* Logo and Title - only show on mobile or if showLogo is true */}
        {(showLogo || isMobile) && (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <Link to="/" className="text-xl font-semibold text-gray-800 dark:text-white">
              Dotzee
              <span className="ml-2 hidden sm:inline-block text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                docs
              </span>
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6 items-center">
            {[
              { path: '/', label: 'Home' },
              { path: '/getting-started', label: 'Getting Started' },
              { path: '/core-concepts', label: 'Core Concepts' },
              { path: '/api-reference', label: 'API Reference' },
              { path: '/advanced-guides', label: 'Advanced Guides' },
              { path: '/examples', label: 'Examples' }
            ].map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`transition-colors duration-200 ${location.pathname === item.path
                    ? 'text-purple-600 dark:text-purple-400 font-medium'
                    : 'text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400'
                    }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* GitHub Link and Mobile Menu Toggle */}
        <div className="flex items-center space-x-4">
          {/* GitHub Link */}
          <a
            href="https://github.com/Ayatpunch/dotzee"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            aria-label="GitHub Repository"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>

          {/* Mobile menu button */}
          <button
            onClick={onSidebarToggle}
            className="md:hidden rounded-md bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Toggle sidebar menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 
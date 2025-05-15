import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Close the sidebar when the route changes (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen font-inter bg-gray-50 dark:bg-gray-900">
            {/* Sidebar - fixed position on desktop */}
            <div className="hidden md:block fixed left-0 top-0 bottom-0 w-72 z-50">
                <Sidebar isOpen={true} />
            </div>

            {/* Mobile sidebar and overlay */}
            <div className="md:hidden">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-30"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </div>

            {/* Main content area including header */}
            <div className="flex flex-col w-full md:pl-72">
                {/* Header */}
                <Header onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} showLogo={false} />

                {/* Main content */}
                <main className="flex-grow px-6 lg:px-8 pt-6 pb-16 overflow-auto">
                    <div className="mx-auto w-full">
                        {children}
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}

export default Layout; 
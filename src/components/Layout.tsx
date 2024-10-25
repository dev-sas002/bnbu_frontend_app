import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-300">
            <Header />
            <div className="flex pt-16"> {/* Add padding to prevent content overlap */}
                {/* Sidebar */}
                <Sidebar />
                {/* Main content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;

import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false); // State for sidebar visibility

    const toggleSidebar = () => {
        setIsOpen(!isOpen); // Toggle the sidebar open/close state
    };

    return (
        <div>
            {/* Hamburger Icon below the header */}
            <div className="md:hidden fixed top-16 left-4 z-50">
                <button onClick={toggleSidebar} className="p-4">
                    {/* Display FaBars if closed */}
                    {!isOpen && <FaBars size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed top-16 left-0 bottom-0 bg-gray-300 z-40 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 md:translate-x-0 md:static md:h-full md:overflow-auto w-64 p-6 h-full`}
            >
                {/* Close Button for smaller screens */}
                <button onClick={toggleSidebar} className="md:hidden absolute top-4 right-4 z-50">
                    <FaTimes size={24} />
                </button>

                {/* Your Menu Section */}
                <div className="flex items-center space-x-2 mb-6">
                    <span>📑</span>
                    <span className="font-bold text-gray-700">Your Menu</span>
                </div>

                <nav>
                    <ul className="space-y-6">
                        {/* Your Action Items */}
                        <li className="flex items-center space-x-2 cursor-pointer">
                            <span>📋</span>
                            <span className="font-semibold text-gray-700">Your Action Items</span>
                        </li>

                        {/* Deal Reviews */}
                        <li className="flex items-center space-x-2 cursor-pointer">
                            <span>🔍</span>
                            <span className="font-semibold text-gray-700">Deal Reviews</span>
                        </li>

                        {/* Regulations */}
                        <li className="flex items-center space-x-2 cursor-pointer">
                            <span>⚖️</span>
                            <span className="font-semibold text-gray-700">Regulations</span>
                        </li>

                        {/* Portfolio Tracker */}
                        <li>
                            <div className="flex items-center space-x-2 cursor-pointer">
                                <span>📊</span>
                                <span className="font-semibold text-gray-700">Portfolio Tracker</span>
                            </div>
                            {/* Submenu for Portfolio Tracker */}
                            <ul className="ml-6 mt-2 space-y-2">
                                <li className="flex items-center space-x-2 cursor-pointer">
                                    <span>🔗</span>
                                    <span>View All Properties</span>
                                </li>
                                <li className="flex items-center space-x-2 cursor-pointer">
                                    <span>➕</span>
                                    <span>Add New Property</span>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </nav>
            </aside>
        </div>
    );
};

export default Sidebar;

import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false); // State for sidebar visibility
    const navigate = useNavigate(); // Hook to handle navigation

    const toggleSidebar = () => {
        setIsOpen(!isOpen); // Toggle the sidebar open/close state
    };

    const goToLeasePage = () => {
      navigate('/leases'); // Navigate to Lease Management page
      setIsOpen(false); // Close sidebar after navigation
  };

    const goToDashboardPage = () => {
        navigate('/dashboard'); // Navigate to Lease Management page
        setIsOpen(false); // Close sidebar after navigation
    };

    const goToRegulationsPage = () => {
        navigate('/regulations'); // Navigate to Regulations page
        setIsOpen(false); // Close sidebar after navigation
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
                <div className="flex items-center space-x-2 ml-2 mt-1 mb-3">
                    <span className="font-bold text-black">Your Menu</span>
                </div>

                <nav>
                    <ul>
                        {/* Dashboard */}
                        <li onClick={goToDashboardPage} className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-black hover:font-bold hover:bg-gray-400 transition-colors duration-200 p-2 rounded whitespace-nowrap">
                            <span>🔑</span>
                            <span>Dashboard</span>
                        </li>

                        {/* Your Action Items */}
                        {/* <li className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-black hover:font-bold hover:bg-gray-400 transition-colors duration-200 p-2 rounded whitespace-nowrap">
                            <span>📋</span>
                            <span>Your Action Items</span>
                        </li> */}

                        {/* Deal Reviews */}
                        {/* <li className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-black hover:font-bold hover:bg-gray-400 transition-colors duration-200 p-2 rounded whitespace-nowrap">
                            <span>🔍</span>
                            <span>Deal Reviews</span>
                        </li> */}

                        {/* Regulations */}
                        <li onClick={goToRegulationsPage} className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-black hover:font-bold hover:bg-gray-400 transition-colors duration-200 p-2 rounded whitespace-nowrap">
                            <span>⚖️</span>
                            <span>Regulations</span>
                        </li>

                        {/* Portfolio Tracker */}
                        {/* <li> */}
                            {/* <div className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-black hover:font-bold hover:bg-gray-400 transition-colors duration-200 p-2 rounded whitespace-nowrap">
                                <span>📊</span>
                                <span>Portfolio Tracker</span>
                            </div> */}
                            {/* Submenu for Portfolio Tracker */}
                            {/* <ul className="ml-6">
                                <li className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-black hover:font-bold hover:bg-gray-400 transition-colors duration-200 p-2 rounded whitespace-nowrap">
                                    <span>📈</span>
                                    <span>View All Properties</span>
                                </li>
                                <li className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-black hover:font-bold hover:bg-gray-400 transition-colors duration-200 p-2 rounded whitespace-nowrap">
                                    <span>⨁</span>
                                    <span>Add New Property</span>
                                </li>
                            </ul> */}
                        {/* </li> */}
                        {/* Lease Management */}
                        <li
                            onClick={goToLeasePage}
                            className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-black hover:font-bold hover:bg-gray-400 transition-colors duration-200 p-2 rounded whitespace-nowrap">
                            <span>📋</span>
                            <span>LeaseGuard AI</span>
                        </li>
                    </ul>
                </nav>
            </aside>
        </div>
    );
};

export default Sidebar;

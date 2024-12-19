import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import icon from '@/assets/images/icon.png';
import menuicon from '@/assets/images/menuicon.png';

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(true); // Default state as open
    const navigate = useNavigate(); // Hook to handle navigation

    const toggleSidebar = () => {
        setIsOpen(!isOpen); // Toggle the sidebar open/close state
    };

    const goToLeasePage = () => {
      navigate('/leases'); // Navigate to Lease Management page
  };

    const goToDashboardPage = () => {
        navigate('/dashboard'); // Navigate to Lease Management page
    };

    const goToRegulationsPage = () => {
        navigate('/regulations'); // Navigate to Regulations page
    };
    const goToRentalAnalyzerPage = () => {
        navigate('/rental-analyzer'); // Navigate to Rental Analyzer page
    };

    // Detect screen size and adjust sidebar visibility on load and resize
    useEffect(() => {
        const handleResize = () => {
        if (window.innerWidth <= 768 && isOpen) {
            setIsOpen(false); // Close the sidebar on smaller screens
        } else {
            if (!isOpen) {
                setIsOpen(true); // Open the sidebar on larger screens
            }
        }
        };

        handleResize(); // Initial check on component mount

        window.addEventListener('resize', handleResize); // Listen for resize events

        return () => {
        window.removeEventListener('resize', handleResize); // Cleanup listener on unmount
        };
    }, []);


    return (
        <div>
            {/* Hamburger Icon below the header */}
            <div className="fixed top-16 z-50">
                <button onClick={toggleSidebar} className="p-4">
                  {/* Display menuicon if closed */}
                  {!isOpen && <img src={menuicon} alt="menuicon" className="w-5 h-5" />}
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed top-16 md:top-0 left-0 bottom-0 h-full overflow-auto bg-gray-300 z-40 transform transition-transform duration-300 w-64 p-6 ${
                    isOpen ? 'translate-x-0 md:static' : '-translate-x-full md:absolute md:-translate-x-full'
                }`}
            >
                {/* Close Button for smaller screens */}
                {/* <button onClick={toggleSidebar} className="md:hidden absolute top-4 right-4 z-50">
                    <FaTimes size={24} />
                </button> */}
                {/* Menu icon as close button */}
                <button onClick={toggleSidebar} className="absolute top-4 right-4 z-50">
                    <img src={menuicon} alt="menuicon" className="w-5 h-5" />
                </button>


                {/* Your Menu Section */}
                <div className="flex items-center space-x-2 ml-2 mt-1 mb-3">
                    <span className="font-bold text-black">Your Menu</span>
                </div>

                <nav>
                    <ul>
                        {/* Dashboard */}
                        <li onClick={goToDashboardPage} className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-black hover:font-bold hover:bg-gray-400 transition-colors duration-200 p-2 rounded whitespace-nowrap">
                            <img src={icon}
                                alt="icon"
                                className="w-5 h-5" 
                            />
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
                            <img src={icon}
                                alt="icon"
                                className="w-5 h-5" 
                            />
                            <span>RegAdvisor AI</span>
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
                            <img src={icon}
                                alt="icon"
                                className="w-5 h-5" 
                            />
                            <span>LeaseGuard AI</span>
                        </li>
                        <li
                            onClick={goToRentalAnalyzerPage}
                            className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-black hover:font-bold hover:bg-gray-400 transition-colors duration-200 p-2 rounded whitespace-nowrap">
                            <img src={icon}
                                alt="icon"
                                className="w-5 h-5" 
                            />
                            <span>Rental Analyzer</span>
                        </li>
                    </ul>
                </nav>
            </aside>
        </div>
    );
};

export default Sidebar;

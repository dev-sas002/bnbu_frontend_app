import React, { useState, useRef, useEffect } from 'react';
import { useGetUserProfileQuery } from '../services/api'; 
import { useDispatch } from 'react-redux';
import { useLogoutMutation } from '../services/api';
import { logout as logoutAction } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import bnbLogo from '@/assets/images/bnb_logo.png';

const Header: React.FC = () => {
  const { data: user, isLoading } = useGetUserProfileQuery();
  const [logout] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false); 
  const dropdownRef = useRef<HTMLDivElement | null>(null); // Ref for dropdown menu

  const getEmailInitials = (email: string) => {
    const namePart = email.split('@')[0]; 
    return namePart.charAt(0).toUpperCase(); 
  };

  const userInitials = user && user.email ? getEmailInitials(user.email) : 'N/A';

  const handleLogout = async () => {
    try {
      await logout({}).unwrap();
      dispatch(logoutAction());
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  if (isLoading) return null;

  return (
    <header className="fixed top-0 left-0 right-0 flex items-center justify-between bg-red-500 p-2 z-50 shadow-lg">
      <div className="flex items-center">
        <img src={bnbLogo} alt="bnb University Logo" className="h-14" />
      </div>
      <div className="relative" ref={dropdownRef}>
        <div 
          className="bg-gray-300 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer transition duration-300 hover:bg-gray-400"
          onClick={toggleDropdown} 
        >
          <span className="text-gray-700 font-semibold">{userInitials}</span>
        </div>
        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 bg-white text-gray-700 rounded-md hover:text-black hover:bg-gray-200 transition duration-200 hover:font-bold"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

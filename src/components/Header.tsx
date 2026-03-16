// /Users/dev/Documents/bnbu-frontend-app/bnbu_frontend_app/src/components/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useGetUserProfileQuery } from '../services/api'; 
import Modal from './Modal'; 
import ChangePasswordForm from './ChangePasswordForm'; 
import HeaderDropdown from './HeaderDropdown'; 
import bnbLogo from '@/assets/images/bnb_logo.png';

const Header: React.FC = () => {
  const { data: user, isLoading } = useGetUserProfileQuery(undefined);
  const [dropdownOpen, setDropdownOpen] = useState(false); 
  const dropdownRef = useRef<HTMLDivElement | null>(null); 
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const getEmailInitials = (email: string) => {
    const namePart = email.split('@')[0]; 
    return namePart.charAt(0).toUpperCase(); 
  };

  const userInitials = user && user.email ? getEmailInitials(user.email) : 'N/A';

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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
        <HeaderDropdown 
          isOpen={dropdownOpen} 
          onClose={toggleDropdown} 
          onChangePassword={handleOpenModal} // Pass the modal opening function
          userInitials={userInitials} 
        />
      </div>

      {/* Modal for Change Password */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ChangePasswordForm onClose={handleCloseModal} />
      </Modal>
    </header>
  );
};

export default Header;

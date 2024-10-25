import React from 'react';
import { useGetUserProfileQuery } from '../services/api'; 
import bnbLogo from '@/assets/images/bnb_logo.png';

const Header: React.FC = () => {
  const { data: user, isLoading } = useGetUserProfileQuery();

  const getEmailInitials = (email: string) => {
    const namePart = email.split('@')[0]; 
    return namePart.charAt(0).toUpperCase(); 
  };

  const userInitials = user && user.email ? getEmailInitials(user.email) : 'N/A';

  if (isLoading) return null;
  return (
    <header className="fixed top-0 left-0 right-0 flex items-center justify-between bg-red-500 p-2 z-50 shadow-lg">
      <div className="flex items-center">
        <img src={bnbLogo} alt="bnb University Logo" className="h-14" />
      </div>
      <div className="bg-gray-300 rounded-full w-10 h-10 flex items-center justify-center">
        <span className="text-gray-700 font-semibold">{userInitials}</span>
      </div>
    </header>
  );
};

export default Header;

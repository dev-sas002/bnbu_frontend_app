// /Users/dev/Documents/bnbu-frontend-app/bnbu_frontend_app/src/components/HeaderDropdown.tsx
import React from 'react';
import { useLogoutMutation } from '../services/api'; 
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

interface HeaderDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onChangePassword: () => void; // Add this prop
  userInitials: string;
}

const HeaderDropdown: React.FC<HeaderDropdownProps> = ({ isOpen, onClose, onChangePassword, userInitials }) => {
  const [logout] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout({}).unwrap();
      dispatch(logoutAction());
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
      <button
        onClick={handleLogout}
        className="block w-full text-left px-4 py-2 bg-white text-gray-700 rounded-md hover:text-black hover:bg-gray-200 transition duration-200 hover:font-bold"
      >
        Logout
      </button>
      <button 
        onClick={() => { onChangePassword(); onClose(); }} // Call both functions
        className="block w-full text-left px-4 py-2 bg-white text-gray-700 rounded-md hover:text-black hover:bg-gray-200 transition duration-200 hover:font-bold"
      >
        Change Password
      </button>
    </div>
  );
};

export default HeaderDropdown;

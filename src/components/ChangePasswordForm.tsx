// /Users/dev/Documents/bnbu-frontend-app/bnbu_frontend_app/src/components/ChangePasswordForm.tsx
import React, { useState } from 'react';
import { useChangePasswordMutation } from '../services/api'; 
import { toast } from 'react-toastify'; 

interface ChangePasswordFormProps {
  onClose: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [changePassword] = useChangePasswordMutation();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      setSuccess(null);
      return;
    }

    const passwordData = {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_new_password: confirmPassword,
    };

    try {
      await changePassword(passwordData).unwrap();
      toast.success("Password changed successfully.");
      setSuccess(null);
      onClose(); // Close the modal automatically
    } catch (err) {
      console.error('Error changing password:', err);
      setError("An error occurred.");
      setSuccess(null);
    }
  };

  return (
    <form onSubmit={handleChangePassword} className="p-4">
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <input 
        type="password" 
        placeholder="Old Password" 
        value={oldPassword} 
        onChange={(e) => setOldPassword(e.target.value)} 
        required 
        className="border rounded-md p-2 mb-2 w-full"
      />
      <input 
        type="password" 
        placeholder="New Password" 
        value={newPassword} 
        onChange={(e) => setNewPassword(e.target.value)} 
        required 
        className="border rounded-md p-2 mb-2 w-full"
      />
      <input 
        type="password" 
        placeholder="Confirm New Password" 
        value={confirmPassword} 
        onChange={(e) => setConfirmPassword(e.target.value)} 
        required 
        className="border rounded-md p-2 mb-2 w-full"
      />
      <div className="flex justify-between">
        <button 
          type="submit" 
          className="flex-1 mr-2 text-center bg-gray-600 text-white rounded-md hover:bg-gray-800 transition duration-200 py-2 px-8" // Change Password button on the left
        >
          Change Password
        </button>
        <button 
          type="button" 
          onClick={onClose} 
          className="text-center bg-red-500 text-white rounded-md hover:bg-red-700 transition duration-200 py-1 px-3" // Shorter Cancel button on the right
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;

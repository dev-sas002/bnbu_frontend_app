import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useChangePasswordMutation } from '@/services/api';
import { Button, Field, Input } from '@/ui';

interface ChangePasswordFormProps {
  onClose: () => void;
}

const MIN_LENGTH = 8;

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Checked here as well as server-side so the user is not told "an error
    // occurred" for something the form already knows is wrong.
    if (newPassword.length < MIN_LENGTH) {
      setError(`The new password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The new password and its confirmation do not match.');
      return;
    }
    setError(null);

    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_new_password: confirmPassword,
      }).unwrap();
      toast.success('Password changed.');
      onClose();
    } catch {
      setError('The password could not be changed. Check the current password and try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Current password" required>
        <Input
          type="password"
          autoComplete="current-password"
          value={oldPassword}
          onChange={(event) => setOldPassword(event.target.value)}
          required
        />
      </Field>

      <Field label="New password" required hint={`At least ${MIN_LENGTH} characters.`}>
        <Input
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />
      </Field>

      <Field label="Confirm new password" required error={error}>
        <Input
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
      </Field>

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          Change password
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;

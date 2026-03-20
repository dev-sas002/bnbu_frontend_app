import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import bnbLogo from '@/assets/images/bnb_logo.webp';
import { useUpdatePasswordMutation } from '@/services/api';
import { Button, Card, Field, Input } from '@/ui';

const MIN_LENGTH = 8;

/**
 * The first-login password set. Deliberately outside the auth guard: the user
 * gets here from an invitation link before they have a token.
 */
const UpdatePassword: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password.length < MIN_LENGTH) {
      setError(`The password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirmation) {
      setError('The two passwords do not match.');
      return;
    }
    setError(null);

    try {
      await updatePassword({ id, passwordData: { password } }).unwrap();
      toast.success('Password set. Sign in to continue.');
      navigate('/');
    } catch {
      setError('The password could not be set. The invitation link may have expired.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6 py-12">
      <div className="w-full max-w-md">
        <img src={bnbLogo} alt="bnb University" className="mx-auto mb-8 h-6 w-auto" />

        <Card>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Set your password</h1>
          <p className="mt-1 text-sm text-ink-subtle">
            Choose a password for your account. You will use it to sign in from now on.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <Field label="New password" required hint={`At least ${MIN_LENGTH} characters.`}>
              <Input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </Field>

            <Field label="Confirm password" required error={error}>
              <Input
                type="password"
                autoComplete="new-password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                required
              />
            </Field>

            <Button type="submit" className="w-full" loading={isLoading}>
              Set password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default UpdatePassword;

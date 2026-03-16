import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import bnbLogo from '@/assets/images/bnb_logo.webp';
import { useUpdatePasswordMutation } from '@/services/api';
import { Button, Card, Field, Input } from '@/ui';

const MIN_LENGTH = 8;

/** The DRF error body for this route: field errors, or `{error}` on a 403. */
const describeFailure = (error: unknown): string => {
  const data = (error as { data?: Record<string, unknown> } | undefined)?.data;
  const first = (value: unknown) => (Array.isArray(value) ? String(value[0]) : value);
  const detail =
    first(data?.new_password) ?? first(data?.non_field_errors) ?? data?.error ?? data?.detail;
  return typeof detail === 'string' && detail
    ? detail
    : 'The password could not be set. Try again in a moment.';
};

/**
 * The first-login password set. Login sends a user here when their profile
 * still has `is_first_login`; the API accepts it only from that signed-in
 * account, so the route sits behind the auth guard.
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
      await updatePassword({ id, newPassword: password, confirmPassword: confirmation }).unwrap();
      toast.success('Password set.');
      navigate('/dashboard', { replace: true });
    } catch (failure) {
      setError(describeFailure(failure));
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

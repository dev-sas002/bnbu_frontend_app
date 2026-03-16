import React, { useEffect, useState } from 'react';
import { useResetPasswordMutation } from '@/services/api';
import { Button, Field, Input, Modal } from '@/ui';

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-fills the address from the sign-in form. */
  initialEmail?: string;
}

/**
 * The API answers 200 whether or not the address has an account, so the
 * confirmation here is deliberately the same in both cases. Only a malformed
 * address (400) or a failed request reads differently.
 */
export const RESET_SENT_MESSAGE =
  'If an account exists for that address, a reset link is on its way. Check your inbox and spam folder.';

const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    if (!isOpen) return;
    setEmail(initialEmail);
    setError(null);
    setSent(false);
  }, [isOpen, initialEmail]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const address = email.trim();
    if (!address) {
      setError('Enter the email address you sign in with.');
      return;
    }
    setError(null);

    try {
      await resetPassword(address).unwrap();
      setSent(true);
    } catch (failure) {
      const status = (failure as { status?: number }).status;
      setError(
        status === 400
          ? 'That does not look like an email address.'
          : 'The request could not be sent. Try again in a moment.'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Reset your password"
      description="We will email a link to the address on the account."
    >
      {sent ? (
        <div className="space-y-4">
          <p role="status" className="rounded-md bg-info-bg px-3 py-2.5 text-sm text-info-fg">
            {RESET_SENT_MESSAGE}
          </p>
          <div className="flex justify-end">
            <Button onClick={onClose}>Back to sign in</Button>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <Field label="Email" required error={error}>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoFocus
            />
          </Field>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              Send reset link
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ForgotPasswordDialog;

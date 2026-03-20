import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUserProfileQuery, useLogoutMutation } from '@/services/api';
import { useAppDispatch } from '@/store';
import { logout as logoutAction } from '@/store/slices/authSlice';
import { initialFromEmail } from '@/lib/format';
import { Modal, Skeleton, cn } from '@/ui';
import { KeyIcon, LogoutIcon, MenuIcon } from '@/ui/icons';
import ChangePasswordForm from './ChangePasswordForm';

export interface HeaderProps {
  onOpenNav: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenNav }) => {
  const { data: user, isLoading } = useGetUserProfileQuery();
  const [logout] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // A failed logout call must not strand the user in a signed-in shell;
      // the local session is cleared either way.
    } finally {
      dispatch(logoutAction());
      navigate('/');
    }
  };

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ');

  return (
    <header className="sticky top-0 z-20 flex h-header items-center justify-between gap-4 border-b border-line bg-surface/90 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="-ml-1 rounded p-2 text-ink-muted hover:bg-surface-accent hover:text-ink md:hidden"
      >
        <MenuIcon />
      </button>

      <div className="min-w-0 flex-1" />

      <div className="relative shrink-0" ref={menuRef}>
        {isLoading ? (
          <Skeleton className="h-9 w-9 rounded-full" />
        ) : (
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-surface-accent"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {initialFromEmail(user?.email)}
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block truncate text-sm font-medium text-ink">
                {fullName || user?.email || 'Signed in'}
              </span>
              <span className="block truncate text-xs capitalize text-ink-subtle">
                {user?.user_type ?? ''}
              </span>
            </span>
          </button>
        )}

        <div
          role="menu"
          className={cn(
            'absolute right-0 mt-2 w-52 overflow-hidden rounded-md border border-line bg-surface shadow-raised',
            menuOpen ? 'block animate-fade-in' : 'hidden'
          )}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setPasswordModalOpen(true);
              setMenuOpen(false);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            <KeyIcon className="h-4 w-4" />
            Change password
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 border-t border-line px-3 py-2.5 text-left text-sm text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            <LogoutIcon className="h-4 w-4" />
            Log out
          </button>
        </div>
      </div>

      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Change password"
        description="You will stay signed in on this device."
        size="sm"
      >
        <ChangePasswordForm onClose={() => setPasswordModalOpen(false)} />
      </Modal>
    </header>
  );
};

export default Header;

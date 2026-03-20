import React from 'react';
import { NavLink } from 'react-router-dom';
import bnbLogo from '@/assets/images/bnb_logo.webp';
import { cn } from '@/ui';
import { AnalyzerIcon, CloseIcon, DashboardIcon, LeaseIcon, RegulationIcon } from '@/ui/icons';

export interface SidebarProps {
  /** Controls the drawer below `md`; above it the rail is always visible. */
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

/**
 * The navigation, as data. Adding a section is one entry here — previously it
 * meant a new `<li>` with its own `onClick={() => navigate(...)}` handler and
 * its own copy of eight Tailwind classes.
 */
const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', description: 'Overview', icon: DashboardIcon },
  {
    to: '/regulations',
    label: 'RegAdvisor AI',
    description: 'Short-term rental rules',
    icon: RegulationIcon,
  },
  { to: '/leases', label: 'LeaseGuard AI', description: 'Lease review', icon: LeaseIcon },
  {
    to: '/rental-analyzer',
    label: 'Rental Analyzer',
    description: 'Deal pricing',
    icon: AnalyzerIcon,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => (
  <>
    {/* Scrim, below md only. */}
    <div
      className={cn(
        'fixed inset-0 z-30 bg-ink/40 transition-opacity md:hidden',
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
      onClick={onClose}
      aria-hidden="true"
    />

    <aside
      aria-label="Main navigation"
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-sidebar flex-col bg-ink text-ink-inverse',
        'transition-transform duration-200 md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex h-header shrink-0 items-center justify-between gap-2 px-5">
        <NavLink to="/dashboard" className="rounded" onClick={onClose}>
          <img src={bnbLogo} alt="bnb University" className="h-6 w-auto" />
        </NavLink>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white md:hidden"
        >
          <CloseIcon />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
          Workspace
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ to, label, description, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors',
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn('mt-0.5 shrink-0', isActive ? 'opacity-100' : 'opacity-70')} />
                    <span className="min-w-0">
                      <span className="block truncate text-base font-medium">{label}</span>
                      <span
                        className={cn(
                          'block truncate text-xs',
                          isActive ? 'text-white/75' : 'text-white/40'
                        )}
                      >
                        {description}
                      </span>
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <p className="shrink-0 border-t border-white/10 px-5 py-4 text-xs text-white/40">
        BnBu Console
      </p>
    </aside>
  </>
);

export default Sidebar;

import React from 'react';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Rendered to the left of the label; hidden from assistive tech. */
  icon?: React.ReactNode;
  /** Swaps the icon for a spinner and disables the button. */
  loading?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-card',
  secondary: 'bg-surface text-ink border border-line hover:bg-surface-sunken active:bg-surface-accent',
  ghost: 'bg-transparent text-ink-muted hover:bg-surface-accent hover:text-ink',
  danger: 'bg-negative-fg text-white hover:brightness-110 active:brightness-95',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-base gap-2',
};

/**
 * The single button in the product. Every call site picks a variant rather
 * than assembling its own colour classes, which is what stopped the five
 * slightly-different shades of red this app used to have.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, loading = false, className, children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={rest.type ?? 'button'}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        icon && (
          <span aria-hidden="true" className="shrink-0">
            {icon}
          </span>
        )
      )}
      {children}
    </button>
  );
});

export default Button;

/**
 * FanzSSO Button Component
 *
 * React component for "Sign in with FanzSSO" button.
 */

import React from 'react';

export interface FanzSSOButtonProps {
  /** Button text */
  label?: string;
  /** Return URL after authentication */
  returnTo?: string;
  /** Custom class name */
  className?: string;
  /** Button style variant */
  variant?: 'default' | 'outline' | 'minimal';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom styles */
  style?: React.CSSProperties;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Click handler (called before redirect) */
  onClick?: () => void;
}

/**
 * FanzSSO Login Button
 *
 * Redirects users to FanzSSO for authentication.
 */
export function FanzSSOButton({
  label = 'Sign in with FanzSSO',
  returnTo,
  className = '',
  variant = 'default',
  size = 'md',
  style,
  disabled = false,
  loading = false,
  onClick,
}: FanzSSOButtonProps): React.ReactElement {
  const handleClick = () => {
    if (disabled || loading) return;

    if (onClick) {
      onClick();
    }

    // Redirect to SSO login endpoint
    const loginUrl = returnTo
      ? `/auth/sso/login?returnTo=${encodeURIComponent(returnTo)}`
      : '/auth/sso/login';

    window.location.href = loginUrl;
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Variant styles
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    },
    outline: {
      background: 'transparent',
      color: '#667eea',
      border: '2px solid #667eea',
    },
    minimal: {
      background: 'transparent',
      color: '#667eea',
      border: 'none',
      textDecoration: 'underline',
    },
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    borderRadius: '8px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={`fanzsso-button ${sizeClasses[size]} ${className}`}
      style={baseStyles}
    >
      {loading ? (
        <span className="fanzsso-spinner" style={{ marginRight: '8px' }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="31.416"
              strokeDashoffset="10.472"
            />
          </svg>
        </span>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            fill="currentColor"
          />
        </svg>
      )}
      {label}
    </button>
  );
}

export default FanzSSOButton;

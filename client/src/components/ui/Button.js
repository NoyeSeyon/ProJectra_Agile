import React from 'react';
import { clsx } from 'clsx';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-button transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-sm hover:shadow-md',
    secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 focus:ring-neutral-500 border border-neutral-300',
    tertiary: 'bg-transparent text-primary-500 hover:bg-primary-50 focus:ring-primary-500',
    accent: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500 shadow-sm hover:shadow-md',
    success: 'bg-success text-white hover:bg-green-600 focus:ring-success shadow-sm hover:shadow-md',
    warning: 'bg-warning text-gray-800 hover:bg-yellow-500 focus:ring-warning shadow-sm hover:shadow-md',
    error: 'bg-error text-white hover:bg-red-600 focus:ring-error shadow-sm hover:shadow-md',
    ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 focus:ring-neutral-500',
    link: 'bg-transparent text-primary-500 hover:text-primary-600 focus:ring-primary-500 underline-offset-4 hover:underline'
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-xs h-6',
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-sm h-10',
    lg: 'px-6 py-3 text-base h-12',
    xl: 'px-8 py-4 text-lg h-14'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const classes = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  );

  const iconClasses = clsx(
    iconSizes[size],
    iconPosition === 'left' ? 'mr-2' : 'ml-2'
  );

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <svg className={clsx(iconSizes[size], 'mr-2 animate-spin')} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      );
    }

    if (icon && iconPosition === 'left') {
      return (
        <>
          <span className={iconClasses}>{icon}</span>
          {children}
        </>
      );
    }

    if (icon && iconPosition === 'right') {
      return (
        <>
          {children}
          <span className={iconClasses}>{icon}</span>
        </>
      );
    }

    return children;
  };

  return (
    <button 
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(({ 
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  size = 'md',
  variant = 'default',
  className = '',
  ...props 
}, ref) => {
  const baseClasses = 'block w-full border border-neutral-300 rounded-button bg-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed';
  
  const variants = {
    default: '',
    error: 'border-error focus:ring-error focus:border-error',
    success: 'border-success focus:ring-success focus:border-success'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const inputClasses = clsx(
    baseClasses,
    variants[error ? 'error' : 'success'],
    sizes[size],
    icon && iconPosition === 'left' ? 'pl-10' : '',
    icon && iconPosition === 'right' ? 'pr-10' : '',
    className
  );

  const iconClasses = clsx(
    iconSizes[size],
    'text-neutral-400',
    iconPosition === 'left' ? 'left-3' : 'right-3',
    'absolute top-1/2 transform -translate-y-1/2'
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className={iconClasses}>
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-error">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

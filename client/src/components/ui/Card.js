import React from 'react';
import { clsx } from 'clsx';

const Card = ({ 
  children, 
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-card border border-neutral-200 transition-all duration-200';
  
  const variants = {
    default: 'shadow-card',
    elevated: 'shadow-lg',
    flat: 'shadow-none border-neutral-300',
    outlined: 'shadow-none border-2 border-neutral-300',
    ghost: 'shadow-none border-transparent bg-transparent'
  };
  
  const paddings = {
    none: 'p-0',
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const hoverClasses = hover ? 'hover:shadow-card-hover hover:border-neutral-300 cursor-pointer' : '';

  const classes = clsx(
    baseClasses,
    variants[variant],
    paddings[padding],
    hoverClasses,
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Card Header Component
const CardHeader = ({ children, className = '', ...props }) => {
  const classes = clsx('px-4 py-3 border-b border-neutral-200 bg-neutral-50 rounded-t-card', className);
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Card Body Component
const CardBody = ({ children, className = '', ...props }) => {
  const classes = clsx('p-4', className);
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Card Footer Component
const CardFooter = ({ children, className = '', ...props }) => {
  const classes = clsx('px-4 py-3 border-t border-neutral-200 bg-neutral-50 rounded-b-card', className);
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;

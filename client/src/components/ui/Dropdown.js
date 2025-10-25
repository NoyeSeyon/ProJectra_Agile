import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { clsx } from 'clsx';

const Dropdown = ({
  trigger,
  children,
  position = 'bottom-left',
  className = ''
}) => {
  const positions = {
    'bottom-left': 'left-0 mt-2 origin-top-left',
    'bottom-right': 'right-0 mt-2 origin-top-right',
    'top-left': 'left-0 bottom-full mb-2 origin-bottom-left',
    'top-right': 'right-0 bottom-full mb-2 origin-bottom-right'
  };

  return (
    <Menu as="div" className={clsx('relative inline-block text-left', className)}>
      <div>
        <Menu.Button className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500">
          {trigger}
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className={clsx(
          'absolute z-10 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
          positions[position]
        )}>
          <div className="py-1">
            {children}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

// Dropdown Item Component
const DropdownItem = ({ 
  children, 
  onClick, 
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <Menu.Item disabled={disabled}>
      {({ active }) => (
        <button
          className={clsx(
            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
            'block w-full px-4 py-2 text-left text-sm',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            className
          )}
          onClick={onClick}
          {...props}
        >
          {children}
        </button>
      )}
    </Menu.Item>
  );
};

// Dropdown Divider Component
const DropdownDivider = () => {
  return <div className="border-t border-gray-100" />;
};

// Dropdown Header Component
const DropdownHeader = ({ children, className = '' }) => {
  return (
    <div className={clsx('px-4 py-2 text-sm font-medium text-gray-900', className)}>
      {children}
    </div>
  );
};

Dropdown.Item = DropdownItem;
Dropdown.Divider = DropdownDivider;
Dropdown.Header = DropdownHeader;

export default Dropdown;

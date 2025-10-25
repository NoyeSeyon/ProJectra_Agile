import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}) => {
  const sizes = {
    xs: 'max-w-sm',
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={closeOnOverlayClick ? onClose : () => {}}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={clsx(
                'w-full transform overflow-hidden rounded-card bg-white text-left align-middle shadow-modal transition-all',
                sizes[size],
                className
              )}>
                {title && (
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900 px-6 py-4 border-b border-neutral-200"
                  >
                    <div className="flex items-center justify-between">
                      <span>{title}</span>
                      {showCloseButton && (
                        <button
                          type="button"
                          className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          onClick={onClose}
                        >
                          <span className="sr-only">Close</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </Dialog.Title>
                )}
                
                <div className="px-6 py-4">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Modal Header Component
const ModalHeader = ({ children, className = '', ...props }) => {
  const classes = clsx('px-6 py-4 border-b border-neutral-200', className);
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Modal Body Component
const ModalBody = ({ children, className = '', ...props }) => {
  const classes = clsx('px-6 py-4', className);
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Modal Footer Component
const ModalFooter = ({ children, className = '', ...props }) => {
  const classes = clsx('px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-card', className);
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;

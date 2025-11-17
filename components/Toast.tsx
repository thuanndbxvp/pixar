import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import type { Toast as ToastType } from '../types';

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

const icons = {
  success: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
  error: <XCircleIcon className="w-6 h-6 text-red-400" />,
  info: <InformationCircleIcon className="w-6 h-6 text-blue-400" />,
};

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);

    const timer = setTimeout(() => {
      handleClose();
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(toast.id), 300); 
  };

  return (
    <div
      className={`
        w-full max-w-sm bg-[#1A233A] shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden
        transition-all duration-300 ease-in-out
        ${visible ? 'transform opacity-100 translate-x-0' : 'transform opacity-0 translate-x-full'}
      `}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icons[toast.type]}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-100">{toast.message}</p>
            {toast.subMessage && <p className="mt-1 text-sm text-gray-400">{toast.subMessage}</p>}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-[var(--theme-500)]"
            >
              <span className="sr-only">Đóng</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;

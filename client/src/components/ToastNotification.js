import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import './ToastNotification.css';

const ToastNotification = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Fade in animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, notification.duration || 5000);

    return () => clearTimeout(timer);
  }, [notification]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose(notification.id);
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  return (
    <div 
      className={`toast-notification toast-${notification.type} ${isVisible ? 'visible' : ''} ${isLeaving ? 'leaving' : ''}`}
    >
      <div className="toast-icon">
        {getIcon()}
      </div>
      <div className="toast-content">
        {notification.title && (
          <div className="toast-title">{notification.title}</div>
        )}
        <div className="toast-message">{notification.message}</div>
      </div>
      <button className="toast-close" onClick={handleClose}>
        <X size={16} />
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for custom notification events
    const handleNotification = (event) => {
      const notification = {
        id: Date.now() + Math.random(),
        ...event.detail
      };
      setNotifications(prev => [...prev, notification]);
    };

    window.addEventListener('show-toast', handleNotification);

    return () => {
      window.removeEventListener('show-toast', handleNotification);
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="toast-container">
      {notifications.map(notification => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

// Toast service
export const showToast = {
  success: (message, title = 'Success', duration = 5000) => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { type: 'success', message, title, duration }
    }));
  },
  
  error: (message, title = 'Error', duration = 5000) => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { type: 'error', message, title, duration }
    }));
  },
  
  warning: (message, title = 'Warning', duration = 5000) => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { type: 'warning', message, title, duration }
    }));
  },
  
  info: (message, title = 'Info', duration = 5000) => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { type: 'info', message, title, duration }
    }));
  }
};

export default ToastContainer;


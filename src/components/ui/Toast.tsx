import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      bg: 'bg-green-100 border-green-300',
      text: 'text-green-800',
      icon: CheckCircle,
    },
    error: {
      bg: 'bg-red-100 border-red-300',
      text: 'text-red-800',
      icon: AlertCircle,
    },
    info: {
      bg: 'bg-blue-100 border-blue-300',
      text: 'text-blue-800',
      icon: Info,
    },
  };

  const { bg, text, icon: Icon } = config[type];

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 ${bg} ${text} px-4 py-3 rounded-lg shadow-lg border max-w-md animate-slide-in`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="text-current hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

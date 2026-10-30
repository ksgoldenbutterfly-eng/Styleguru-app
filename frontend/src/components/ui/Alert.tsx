import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { ReactNode } from 'react';
import clsx from 'clsx';

type AlertVariant = 'error' | 'success' | 'info' | 'warning';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

const config = {
  error: { icon: AlertCircle, classes: 'bg-red-50 border-red-200 text-red-800', iconClass: 'text-red-500' },
  success: { icon: CheckCircle, classes: 'bg-green-50 border-green-200 text-green-800', iconClass: 'text-green-500' },
  info: { icon: Info, classes: 'bg-blue-50 border-blue-200 text-blue-800', iconClass: 'text-blue-500' },
  warning: { icon: AlertCircle, classes: 'bg-yellow-50 border-yellow-200 text-yellow-800', iconClass: 'text-yellow-500' },
};

export default function Alert({ variant = 'info', title, children, onClose, className }: AlertProps) {
  const { icon: Icon, classes, iconClass } = config[variant];

  return (
    <div className={clsx('flex gap-3 p-4 rounded-xl border', classes, className)} role="alert">
      <Icon className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', iconClass)} aria-hidden="true" />
      <div className="flex-1 text-sm">
        {title && <p className="font-semibold mb-1">{title}</p>}
        {children}
      </div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0" aria-label="Dismiss">
          <X className="w-4 h-4 opacity-60 hover:opacity-100" />
        </button>
      )}
    </div>
  );
}


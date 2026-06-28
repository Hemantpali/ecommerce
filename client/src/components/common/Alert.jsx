import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const Alert = ({ type = 'error', message, onClose, className }) => {
  const styles = {
    error: 'border-destructive bg-destructive/10 text-destructive',
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    info: 'border-primary/20 bg-primary/10 text-primary',
    warning: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  };

  const icons = {
    error: AlertCircle,
    success: CheckCircle2,
    info: Info,
    warning: AlertTriangle,
  };

  if (!message) return null;

  const Icon = icons[type] || Info;

  return (
    <div className={cn(
      'relative flex items-start gap-3 rounded-lg border p-3.5 text-sm duration-200 animate-in fade-in-50',
      styles[type],
      className
    )}>
      <Icon className="h-4.5 w-4.5 mt-0.5 shrink-0" />
      <div className="flex-1 pr-6 font-medium leading-relaxed">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-current opacity-70 hover:opacity-100 transition-opacity focus:outline-none"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;

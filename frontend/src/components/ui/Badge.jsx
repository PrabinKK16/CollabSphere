import { getPriorityColor, getStatusColor, getStatusLabel } from '../../utils/helpers';

export const PriorityBadge = ({ priority }) => (
  <span className={`badge border ${getPriorityColor(priority)}`}>
    {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
  </span>
);

export const StatusBadge = ({ status }) => (
  <span className={`badge ${getStatusColor(status)}`}>
    {getStatusLabel(status)}
  </span>
);

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    primary: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    success: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
    info: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
  };
  return (
    <span className={`badge ${variants[variant]} ${className}`}>{children}</span>
  );
};

export default Badge;

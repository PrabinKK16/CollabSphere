import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon, iconRight, className = '', ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            input-field
            ${icon ? 'pl-10' : ''}
            ${iconRight ? 'pr-10' : ''}
            ${error ? 'border-red-400 focus:ring-red-400' : ''}
            ${className}
          `}
          {...props}
        />
        {iconRight && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {iconRight}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = forwardRef(({ label, error, className = '', rows = 4, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
    <textarea
      ref={ref}
      rows={rows}
      className={`input-field resize-none ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`}
      {...props}
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
));

Textarea.displayName = 'Textarea';

export const Select = forwardRef(({ label, error, children, className = '', ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
    <select
      ref={ref}
      className={`input-field ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
));

Select.displayName = 'Select';

export default Input;

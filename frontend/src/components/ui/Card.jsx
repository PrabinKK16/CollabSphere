import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = false, glass = false, onClick, animate = true }) => {
  const base = `rounded-2xl border p-6 ${
    glass
      ? 'glass dark:glass-dark'
      : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-700/50'
  } ${hover ? 'card-hover cursor-pointer' : ''} ${className}`;

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={base}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={base} onClick={onClick}>{children}</div>;
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between mb-4 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-slate-900 dark:text-white ${className}`}>{children}</h3>
);

export default Card;

import { getInitials, generateAvatarColor } from '../../utils/helpers';

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
  '2xl': 'w-20 h-20 text-xl',
};

const Avatar = ({ user, size = 'md', className = '', showOnline = false, isOnline = false }) => {
  const sizeClass = sizeMap[size] || sizeMap.md;
  const initials = getInitials(user?.fullName || user?.username);
  const bgColor = generateAvatarColor(user?.fullName || user?.username);

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.fullName}
          className={`${sizeClass} rounded-full object-cover ring-2 ring-white dark:ring-slate-800`}
        />
      ) : (
        <div
          className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-white dark:ring-slate-800 flex-shrink-0`}
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
      )}
      {showOnline && (
        <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-800 ${isOnline ? 'bg-emerald-400' : 'bg-slate-300'}`} />
      )}
    </div>
  );
};

export const AvatarGroup = ({ users = [], max = 3, size = 'sm' }) => {
  const visible = users.slice(0, max);
  const remaining = users.length - max;
  const sizeClass = sizeMap[size] || sizeMap.sm;

  return (
    <div className="flex -space-x-2">
      {visible.map((user, i) => (
        <div key={user._id || i} className="relative" style={{ zIndex: visible.length - i }}>
          <Avatar user={user} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div className={`${sizeClass} rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-slate-800`}>
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default Avatar;

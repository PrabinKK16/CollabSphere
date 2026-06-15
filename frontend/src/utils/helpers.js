import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, yyyy');
};

export const formatRelative = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getPriorityColor = (priority) => {
  const colors = {
    low: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    medium: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    high: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
    critical: 'text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
  };
  return colors[priority] || colors.medium;
};

export const getStatusColor = (status) => {
  const colors = {
    backlog: 'text-slate-500 bg-slate-100 dark:bg-slate-800',
    todo: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
    in_progress: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
    review: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30',
    testing: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30',
    done: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
    planning: 'text-slate-500 bg-slate-100 dark:bg-slate-800',
    active: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
    on_hold: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
    completed: 'text-green-600 bg-green-50 dark:bg-green-950/30',
    archived: 'text-slate-400 bg-slate-100 dark:bg-slate-800',
  };
  return colors[status] || colors.todo;
};

export const getStatusLabel = (status) => {
  const labels = {
    backlog: 'Backlog', todo: 'To Do', in_progress: 'In Progress',
    review: 'Review', testing: 'Testing', done: 'Done',
    planning: 'Planning', active: 'Active', on_hold: 'On Hold',
    completed: 'Completed', archived: 'Archived',
  };
  return labels[status] || status;
};

export const truncate = (str, n = 50) => str?.length > n ? str.slice(0, n) + '...' : str;

export const generateAvatarColor = (name) => {
  const colors = ['#059669','#0D9488','#06B6D4','#8B5CF6','#EC4899','#F59E0B','#EF4444','#3B82F6'];
  if (!name) return colors[0];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

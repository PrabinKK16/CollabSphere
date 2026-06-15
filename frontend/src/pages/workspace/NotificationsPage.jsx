import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../store/slices/notificationSlice';
import Header from '../../components/layout/Header';
import Avatar from '../../components/ui/Avatar';
import { formatRelative } from '../../utils/helpers';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector(s => s.notification);

  useEffect(() => { dispatch(fetchNotifications({ limit: 50 })); }, [dispatch]);

  const handleMarkRead = (id) => dispatch(markNotificationRead(id));
  const handleMarkAllRead = () => { dispatch(markAllNotificationsRead()); toast.success('All marked as read'); };
  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      dispatch(fetchNotifications({ limit: 50 }));
    } catch { toast.error('Failed to delete'); }
  };

  const typeIcons = {
    task_assigned: '✅', task_updated: '🔄', task_completed: '🎉',
    project_created: '📁', project_updated: '📝', comment_added: '💬',
    mention_received: '👋', role_changed: '🔐', member_invited: '👥',
    file_uploaded: '📎', discussion_created: '💭',
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Notifications"
        subtitle={`${unreadCount} unread`}
        actions={
          unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn-secondary text-sm flex items-center gap-2 py-2">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="max-w-2xl mx-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">All caught up!</h3>
              <p className="text-slate-500 dark:text-slate-400">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif, i) => (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                    !notif.isRead
                      ? 'bg-emerald-50 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-800/50'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar user={notif.sender} size="md" />
                    <span className="absolute -bottom-1 -right-1 text-base">{typeIcons[notif.type] || '🔔'}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm mb-0.5">{notif.title}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{notif.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatRelative(notif.createdAt)}</p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.isRead && (
                      <button onClick={() => handleMarkRead(notif._id)} title="Mark as read"
                        className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(notif._id)} title="Delete"
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!notif.isRead && <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-2" />}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;

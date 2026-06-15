import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FolderKanban, Users, CheckSquare, TrendingUp, Plus, ArrowRight, Activity, Loader2 } from 'lucide-react';
import { fetchWorkspace } from '../../store/slices/workspaceSlice';
import { fetchProjects } from '../../store/slices/projectSlice';
import { fetchNotifications } from '../../store/slices/notificationSlice';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { formatRelative } from '../../utils/helpers';

const StatCard = ({ label, value, icon: Icon, gradient, sub }) => (
  <Card className="relative overflow-hidden" hover>
    <div className={`absolute right-0 top-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-10 rounded-full -translate-y-4 translate-x-4`} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
        {sub && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">{sub}</p>}
      </div>
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </Card>
);

const DashboardPage = () => {
  const { workspaceId } = useParams();
  const dispatch = useDispatch();
  const { currentWorkspace, stats, loading: wsLoading } = useSelector(s => s.workspace);
  const { projects } = useSelector(s => s.project);
  const { notifications } = useSelector(s => s.notification);
  const { user } = useSelector(s => s.auth);

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchWorkspace(workspaceId));
      dispatch(fetchProjects({ workspaceId }));
      dispatch(fetchNotifications({ limit: 5 }));
    }
  }, [workspaceId, dispatch]);

  if (wsLoading && !currentWorkspace) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const recentProjects = projects.slice(0, 4);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Dashboard" subtitle={currentWorkspace?.name} />
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-6 gradient-bg shadow-xl shadow-emerald-500/20">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white mb-1">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.fullName?.split(' ')[0]}! 👋
              </h2>
              <p className="text-emerald-100">Here's what's happening in <strong>{currentWorkspace?.name}</strong> today.</p>
            </div>
            <Link to={`/workspaces/${workspaceId}/projects`}
              className="hidden md:flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors backdrop-blur-sm">
              <Plus className="w-4 h-4" /> New Project
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Projects" value={stats?.projectCount || 0} icon={FolderKanban} gradient="from-emerald-500 to-teal-500" />
          <StatCard label="Active Projects" value={stats?.activeProjects || 0} icon={TrendingUp} gradient="from-cyan-500 to-blue-500" sub="Currently running" />
          <StatCard label="Completed" value={stats?.completedProjects || 0} icon={CheckSquare} gradient="from-green-500 to-emerald-500" />
          <StatCard label="Team Members" value={stats?.memberCount || 0} icon={Users} gradient="from-violet-500 to-purple-500" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Recent Projects</h3>
              <Link to={`/workspaces/${workspaceId}/projects`} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <Card className="text-center py-12">
                <FolderKanban className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 mb-4">No projects yet</p>
                <Link to={`/workspaces/${workspaceId}/projects`} className="btn-primary text-sm py-2">Create First Project</Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project, i) => (
                  <motion.div key={project._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                    <Link to={`/workspaces/${workspaceId}/projects/${project._id}`}>
                      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl w-10 h-10 flex items-center justify-center flex-shrink-0">{project.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">{project.name}</h4>
                              <StatusBadge status={project.status} />
                              <PriorityBadge priority={project.priority} />
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                                <div className="gradient-bg h-1.5 rounded-full transition-all" style={{ width: `${project.progress || 0}%` }} />
                              </div>
                              <span className="text-xs text-slate-500 flex-shrink-0">{project.progress || 0}%</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                            <CheckSquare className="w-3.5 h-3.5" />
                            {project.taskStats?.completed}/{project.taskStats?.total}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" /> Recent Activity
            </h3>
            <Card className="p-0 overflow-hidden">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No activity yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.slice(0, 6).map((notif) => (
                    <div key={notif._id} className={`p-4 flex gap-3 ${!notif.isRead ? 'bg-emerald-50/50 dark:bg-emerald-950/10' : ''}`}>
                      <Avatar user={notif.sender} size="xs" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{notif.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatRelative(notif.createdAt)}</p>
                      </div>
                      {!notif.isRead && <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

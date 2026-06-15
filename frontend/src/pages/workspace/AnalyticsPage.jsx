import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';
import { TrendingUp, CheckCircle, AlertCircle, Users, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

const AnalyticsPage = () => {
  const { workspaceId } = useParams();
  const { theme } = useSelector(s => s.ui);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? '#1e293b' : '#f1f5f9';

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    api.get(`/analytics/workspace/${workspaceId}`, { params: { period } })
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [workspaceId, period]);

  const statusColors = { backlog: '#94a3b8', todo: '#3b82f6', in_progress: '#f59e0b', review: '#8b5cf6', testing: '#06b6d4', done: '#10b981' };

  const taskTrendData = {
    labels: data?.taskTrend?.map(d => d._id) || [],
    datasets: [
      {
        label: 'Tasks Created',
        data: data?.taskTrend?.map(d => d.created) || [],
        borderColor: '#059669',
        backgroundColor: 'rgba(5,150,105,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#059669',
      },
      {
        label: 'Tasks Completed',
        data: data?.completionTrend?.map(d => d.completed) || [],
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6,182,212,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#06b6d4',
      }
    ]
  };

  const statusData = {
    labels: data?.tasksByStatus?.map(s => s._id?.replace('_', ' ').toUpperCase()) || [],
    datasets: [{
      data: data?.tasksByStatus?.map(s => s.count) || [],
      backgroundColor: data?.tasksByStatus?.map(s => statusColors[s._id] || '#94a3b8') || [],
      borderWidth: 0,
    }]
  };

  const priorityColors = { low: '#3b82f6', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };
  const priorityData = {
    labels: data?.tasksByPriority?.map(p => p._id?.toUpperCase()) || [],
    datasets: [{
      data: data?.tasksByPriority?.map(p => p.count) || [],
      backgroundColor: data?.tasksByPriority?.map(p => priorityColors[p._id]) || [],
      borderWidth: 0,
    }]
  };

  const chartScales = {
    x: { ticks: { color: textColor, font: { size: 11 } }, grid: { color: gridColor } },
    y: { ticks: { color: textColor, font: { size: 11 } }, grid: { color: gridColor } }
  };

  if (loading) return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Analytics" />
      <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
    </div>
  );

  const { overview, completionRate } = data || {};

  const statCards = [
    { label: 'Total Tasks', value: overview?.totalTasks || 0, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Completed', value: overview?.completedTasks || 0, icon: TrendingUp, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
    { label: 'Overdue', value: overview?.overdueTasks || 0, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
    { label: 'Team Members', value: overview?.memberCount || 0, icon: Users, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Analytics"
        subtitle="Workspace performance overview"
        actions={
          <select value={period} onChange={e => setPeriod(e.target.value)} className="input-field w-auto text-sm py-2">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-900 dark:text-white">Task Trend</h3>
                <div className="flex gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-3 h-1 bg-emerald-500 rounded inline-block" />Created</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-1 bg-cyan-500 rounded inline-block" />Completed</span>
                </div>
              </div>
              <div className="h-56">
                <Line data={taskTrendData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } }, scales: chartScales }} />
              </div>
            </Card>
          </div>

          <div>
            <Card>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-900 dark:text-white">Tasks by Status</h3>
              </div>
              <div className="h-40 mb-4">
                <Doughnut data={statusData} options={{ ...chartDefaults, cutout: '65%' }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {data?.tasksByStatus?.map(s => (
                  <div key={s._id} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: statusColors[s._id] }} />
                    <span className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">{s._id?.replace('_', ' ')}</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-auto">{s.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <h3 className="font-bold text-slate-900 dark:text-white mb-5">Tasks by Priority</h3>
            <div className="h-48">
              <Bar data={{
                labels: data?.tasksByPriority?.map(p => p._id?.toUpperCase()) || [],
                datasets: [{ data: data?.tasksByPriority?.map(p => p.count) || [], backgroundColor: data?.tasksByPriority?.map(p => priorityColors[p._id]) || [], borderRadius: 8, borderSkipped: false }]
              }} options={{ ...chartDefaults, scales: chartScales }} />
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-slate-900 dark:text-white mb-5">Completion Rate</h3>
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <div className="relative w-36 h-36 mx-auto">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="2.5" className="dark:stroke-slate-700" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="url(#grad)" strokeWidth="2.5" strokeDasharray={`${completionRate}, 100`} />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#059669" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black gradient-text">{completionRate || 0}%</span>
                    <span className="text-xs text-slate-500">Completion</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm mt-3">{overview?.completedTasks} of {overview?.totalTasks} tasks done</p>
              </div>
            </div>
          </Card>
        </div>

        {data?.recentActivities?.length > 0 && (
          <Card>
            <h3 className="font-bold text-slate-900 dark:text-white mb-5">Recent Activity</h3>
            <div className="space-y-3">
              {data.recentActivities.map((activity, i) => (
                <div key={activity._id} className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                  <Avatar user={activity.actor} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{activity.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(activity.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;

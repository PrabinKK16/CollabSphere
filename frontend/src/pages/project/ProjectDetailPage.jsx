import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Kanban, List, Users, MessageSquare, FileText, Settings, ArrowLeft, Calendar, CheckSquare, Loader2, Plus } from 'lucide-react'
import { fetchProject } from '../../store/slices/projectSlice'
import { fetchTasks } from '../../store/slices/taskSlice'
import Header from '../../components/layout/Header'
import Avatar, { AvatarGroup } from '../../components/ui/Avatar'
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge'
import { formatDate, formatRelative } from '../../utils/helpers'
import api from '../../api/axios'

const TABS = [
  { id: 'overview', label: 'Overview', icon: CheckSquare },
  { id: 'kanban', label: 'Board', icon: Kanban },
  { id: 'tasks', label: 'Tasks', icon: List },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'discussions', label: 'Discussions', icon: MessageSquare },
  { id: 'files', label: 'Files', icon: FileText },
]

const ProjectDetailPage = () => {
  const { workspaceId, projectId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentProject, stats, loading } = useSelector(s => s.project)
  const { tasks } = useSelector(s => s.task)
  const [tab, setTab] = useState('overview')
  const [discussions, setDiscussions] = useState([])
  const [files, setFiles] = useState([])

  useEffect(() => {
    dispatch(fetchProject(projectId))
    dispatch(fetchTasks({ projectId }))
  }, [projectId, dispatch])

  useEffect(() => {
    if (tab === 'discussions') {
      api.get('/discussions', { params: { projectId } }).then(r => setDiscussions(r.data.data.discussions)).catch(() => {})
    }
    if (tab === 'files') {
      api.get('/files', { params: { projectId } }).then(r => setFiles(r.data.data.files)).catch(() => {})
    }
  }, [tab, projectId])

  if (loading && !currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  const project = currentProject

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title={project ? `${project.icon} ${project.name}` : 'Project'}
        subtitle={project?.description}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/kanban`)}
              className="btn-primary text-sm py-2 flex items-center gap-1.5"
            >
              <Kanban className="w-3.5 h-3.5" /> Open Board
            </button>
          </div>
        }
      />

      {/* Tab bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-6">
        <div className="flex gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === id
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        {/* OVERVIEW TAB */}
        {tab === 'overview' && project && (
          <div className="max-w-4xl space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Tasks', value: stats?.total ?? tasks.length },
                { label: 'Completed', value: stats?.completed ?? tasks.filter(t => t.status === 'done').length },
                { label: 'In Progress', value: stats?.inProgress ?? tasks.filter(t => t.status === 'in_progress').length },
                { label: 'Members', value: project.members?.length ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-center">
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
                  <p className="text-sm text-slate-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-900 dark:text-white">Overall Progress</h3>
                <span className="text-2xl font-black gradient-text">{project.progress || 0}%</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress || 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="gradient-bg h-3 rounded-full"
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>{stats?.completed ?? 0} completed</span>
                <span>{stats?.total ?? tasks.length} total</span>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Project Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Status</p>
                  <StatusBadge status={project.status} />
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Priority</p>
                  <PriorityBadge priority={project.priority} />
                </div>
                {project.startDate && (
                  <div>
                    <p className="text-slate-500 mb-1">Start Date</p>
                    <p className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(project.startDate)}</p>
                  </div>
                )}
                {project.endDate && (
                  <div>
                    <p className="text-slate-500 mb-1">Due Date</p>
                    <p className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(project.endDate)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent tasks */}
            {tasks.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white">Recent Tasks</h3>
                  <button onClick={() => setTab('tasks')} className="text-sm text-emerald-600 hover:text-emerald-700">View all</button>
                </div>
                <div className="space-y-3">
                  {tasks.slice(0, 5).map(task => (
                    <div key={task._id} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${task.status === 'done' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      <span className={`flex-1 text-sm ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{task.title}</span>
                      <StatusBadge status={task.status} />
                      {task.assignees?.length > 0 && <AvatarGroup users={task.assignees} max={2} size="xs" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOARD TAB — redirect */}
        {tab === 'kanban' && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Kanban className="w-12 h-12 text-emerald-500" />
            <p className="text-slate-600 dark:text-slate-400">Opens the full Kanban board</p>
            <Link to={`/workspaces/${workspaceId}/projects/${projectId}/kanban`} className="btn-primary">Open Board</Link>
          </div>
        )}

        {/* TASKS LIST TAB */}
        {tab === 'tasks' && (
          <div className="max-w-4xl space-y-2">
            <div className="flex justify-end mb-4">
              <Link to={`/workspaces/${workspaceId}/projects/${projectId}/kanban`} className="btn-primary text-sm py-2 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Task
              </Link>
            </div>
            {tasks.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No tasks yet. Add one via the Board.</p>
              </div>
            ) : tasks.map(task => (
              <Link key={task._id} to={`/workspaces/${workspaceId}/projects/${projectId}/tasks/${task._id}`}>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${task.status === 'done' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  <span className={`flex-1 text-sm font-medium ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>{task.title}</span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                    {task.assignees?.length > 0 && <AvatarGroup users={task.assignees} max={2} size="xs" />}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* MEMBERS TAB */}
        {tab === 'members' && (
          <div className="max-w-2xl space-y-3">
            {project?.members?.length === 0 ? (
              <div className="text-center py-16 text-slate-400"><Users className="w-10 h-10 mx-auto mb-3 opacity-40" /><p>No members added yet</p></div>
            ) : project?.members?.map(m => (
              <div key={m.user?._id || m._id} className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <Avatar user={m.user || m} size="md" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{m.user?.fullName || m.fullName}</p>
                  <p className="text-xs text-slate-500">{m.user?.designation || m.user?.email}</p>
                </div>
                <span className="badge bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 capitalize">{m.role}</span>
              </div>
            ))}
          </div>
        )}

        {/* DISCUSSIONS TAB */}
        {tab === 'discussions' && (
          <div className="max-w-3xl space-y-4">
            {discussions.length === 0 ? (
              <div className="text-center py-16 text-slate-400"><MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" /><p>No discussions yet</p></div>
            ) : discussions.map(d => (
              <div key={d._id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-start gap-3">
                  <Avatar user={d.author} size="sm" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-white">{d.title}</h4>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{d.content}</p>
                    <p className="text-xs text-slate-400 mt-2">{formatRelative(d.createdAt)} · {d.commentCount || 0} replies</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FILES TAB */}
        {tab === 'files' && (
          <div className="max-w-3xl space-y-3">
            {files.length === 0 ? (
              <div className="text-center py-16 text-slate-400"><FileText className="w-10 h-10 mx-auto mb-3 opacity-40" /><p>No files uploaded yet</p></div>
            ) : files.map(f => (
              <div key={f._id} className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <FileText className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 dark:text-white text-sm truncate">{f.originalName}</p>
                  <p className="text-xs text-slate-500">{(f.size / 1024 / 1024).toFixed(2)} MB · {formatRelative(f.createdAt)}</p>
                </div>
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-1.5 px-3">Download</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectDetailPage

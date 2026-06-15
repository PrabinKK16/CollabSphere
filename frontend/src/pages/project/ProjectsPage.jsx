import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, FolderKanban, Calendar, Users, CheckSquare, MoreVertical, Archive, Trash2 } from 'lucide-react';
import { fetchProjects, createProject, archiveProject } from '../../store/slices/projectSlice';
import Header from '../../components/layout/Header';
import Modal from '../../components/ui/Modal';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const COLORS = ['#059669','#0D9488','#06B6D4','#8B5CF6','#EC4899','#F59E0B','#EF4444','#3B82F6'];
const ICONS = ['📁','🚀','⚡','🎯','🔧','💡','🌟','🔥','📊','🎨','🛡️','🌍'];

const ProjectsPage = () => {
  const { workspaceId } = useParams();
  const dispatch = useDispatch();
  const { projects, loading } = useSelector(s => s.project);
  const { members } = useSelector(s => s.workspace);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', priority: 'medium', color: '#059669', icon: '📁', startDate: '', endDate: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => { dispatch(fetchProjects({ workspaceId })); }, [workspaceId, dispatch]);

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await dispatch(createProject({ ...form, workspaceId })).unwrap();
      toast.success('Project created!');
      setShowCreate(false);
      setForm({ name: '', description: '', priority: 'medium', color: '#059669', icon: '📁', startDate: '', endDate: '' });
    } catch (err) { toast.error(err || 'Failed'); }
    finally { setCreating(false); }
  };

  const handleArchive = async (id) => {
    try { await dispatch(archiveProject(id)).unwrap(); toast.success('Project archived'); }
    catch (err) { toast.error(err || 'Failed'); }
    setMenuOpen(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Projects"
        subtitle={`${projects.length} projects`}
        actions={
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> New Project
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="input-field pl-9" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto">
            <option value="">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FolderKanban className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No projects found</h3>
            <p className="text-slate-500 mb-6">{search ? 'Try a different search' : 'Create your first project to get started'}</p>
            {!search && <button onClick={() => setShowCreate(true)} className="btn-primary">Create Project</button>}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filtered.map((project, i) => (
                <motion.div key={project._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300">
                  <div className="h-1.5" style={{ background: project.color }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Link to={`/workspaces/${workspaceId}/projects/${project._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl">{project.icon}</span>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors truncate">{project.name}</h3>
                          {project.description && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{project.description}</p>}
                        </div>
                      </Link>
                      <div className="relative flex-shrink-0 ml-2">
                        <button onClick={(e) => { e.preventDefault(); setMenuOpen(menuOpen === project._id ? null : project._id); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {menuOpen === project._id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                            <div className="absolute right-0 top-8 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-20 min-w-36">
                              <button onClick={() => handleArchive(project._id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                                <Archive className="w-3.5 h-3.5" /> Archive
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap mb-4">
                      <StatusBadge status={project.status} />
                      <PriorityBadge priority={project.priority} />
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Progress</span>
                        <span className="font-medium">{project.progress || 0}%</span>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress || 0}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="gradient-bg h-2 rounded-full"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5" />{project.taskStats?.completed}/{project.taskStats?.total} tasks</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{project.members?.length || 0}</span>
                      </div>
                      {project.endDate && (
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(project.endDate)}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Project" size="md">
        <form onSubmit={handleCreate} className="p-6 space-y-5">
          <div className="flex gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Icon</label>
              <select value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="input-field w-20 text-center text-2xl">
                {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Project Name *</label>
              <input placeholder="e.g. Mobile App Redesign" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required autoFocus />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea placeholder="What is this project about?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field resize-none" rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Color</label>
              <div className="flex gap-2 flex-wrap pt-1">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                    className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="input-field" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="input-field" />
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={creating || !form.name} className="btn-primary flex-1">
              {creating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;

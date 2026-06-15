import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Zap,
  Users,
  FolderKanban,
  ArrowRight,
  Settings,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import {
  fetchWorkspaces,
  createWorkspace,
} from "../../store/slices/workspaceSlice";
import { toggleTheme } from "../../store/slices/uiSlice";
import { useAuth } from "../../hooks/useAuth";
import Modal from "../../components/ui/Modal";
import Avatar from "../../components/ui/Avatar";
import { SkeletonCard } from "../../components/ui/Skeleton";
import toast from "react-hot-toast";

const WorkspacesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { workspaces, loading } = useSelector((s) => s.workspace);
  const { theme } = useSelector((s) => s.ui);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const ws = await dispatch(createWorkspace(form)).unwrap();
      toast.success("Workspace created!");
      setShowCreate(false);
      setForm({ name: "", description: "" });
      navigate(`/workspaces/${ws._id}/dashboard`);
    } catch (err) {
      toast.error(err || "Failed to create workspace");
    } finally {
      setCreating(false);
    }
  };

  const colors = [
    "from-emerald-500 to-teal-500",
    "from-cyan-500 to-blue-500",
    "from-violet-500 to-purple-500",
    "from-orange-500 to-red-500",
    "from-pink-500 to-rose-500",
    "from-amber-500 to-yellow-500",
  ];

  return (
    <div className="min-h-screen page-bg">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              CollabSphere
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <Avatar user={user} size="sm" />
            <button
              onClick={logout}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
              Hello, {user?.fullName?.split(" ")[0]} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Choose a workspace to get started
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Workspace
          </button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="w-20 h-20 gradient-bg rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Create your first workspace
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Workspaces are where your team collaborates. Create one for your
              company, project, or client.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary text-base px-8 py-3"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Workspace
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws, i) => (
              <motion.div
                key={ws._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/workspaces/${ws._id}/dashboard`)}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`h-2 bg-gradient-to-r ${colors[i % colors.length]}`}
                />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {ws.logo ? (
                        <img
                          src={ws.logo}
                          alt={ws.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                        >
                          {ws.name[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {ws.name}
                        </h3>
                        <span className="text-xs text-slate-400 capitalize">
                          {ws.userRole}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors mt-1" />
                  </div>

                  {ws.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                      {ws.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {ws.stats?.memberCount || 0} members
                    </span>
                    <span className="flex items-center gap-1">
                      <FolderKanban className="w-3.5 h-3.5" />
                      {ws.stats?.projectCount || 0} projects
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: workspaces.length * 0.07 }}
              onClick={() => setShowCreate(true)}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all group min-h-[160px]"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <span className="text-sm font-medium text-slate-500 group-hover:text-emerald-600 transition-colors">
                New Workspace
              </span>
            </motion.div>
          </div>
        )}
      </main>

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Workspace"
        size="sm"
      >
        <form onSubmit={handleCreate} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Workspace Name *
            </label>
            <input
              placeholder="e.g. Acme Engineering"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              placeholder="What is this workspace for?"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="input-field resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !form.name}
              className="btn-primary flex-1"
            >
              {creating ? "Creating..." : "Create Workspace"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkspacesPage;

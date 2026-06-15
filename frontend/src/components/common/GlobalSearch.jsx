import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  CheckSquare,
  FolderKanban,
  Users,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { setGlobalSearchOpen } from "../../store/slices/uiSlice";
import api from "../../api/axios";
import Avatar from "../ui/Avatar";
import { StatusBadge } from "../ui/Badge";
import { useDebounce } from "../../hooks/useDebounce";

const GlobalSearch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const { globalSearchOpen } = useSelector((s) => s.ui);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        dispatch(setGlobalSearchOpen(true));
      }
      if (e.key === "Escape") dispatch(setGlobalSearchOpen(false));
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [dispatch]);

  useEffect(() => {
    if (globalSearchOpen) setTimeout(() => inputRef.current?.focus(), 100);
    else {
      setQuery("");
      setResults({});
    }
  }, [globalSearchOpen]);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults({});
      return;
    }
    setLoading(true);
    api
      .get("/search", { params: { q: debouncedQuery, workspaceId } })
      .then((res) => setResults(res.data.data.results))
      .catch(() => setResults({}))
      .finally(() => setLoading(false));
  }, [debouncedQuery, workspaceId]);

  const close = () => dispatch(setGlobalSearchOpen(false));

  const handleNavigate = (path) => {
    navigate(path);
    close();
  };

  const hasResults = Object.values(results).some((arr) => arr?.length > 0);

  return (
    <AnimatePresence>
      {globalSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
              {loading ? (
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin flex-shrink-0" />
              ) : (
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              )}
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, projects, members..."
                className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-base"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded font-mono">
                Esc
              </kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto scrollbar-thin p-2">
              {!query && (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Search className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">Start typing to search...</p>
                </div>
              )}

              {query && !loading && !hasResults && (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <p className="text-sm">No results for "{query}"</p>
                </div>
              )}

              {results.tasks?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2 flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5" />
                    Tasks
                  </p>
                  {results.tasks.map((task) => (
                    <button
                      key={task._id}
                      onClick={() =>
                        handleNavigate(
                          `/workspaces/${workspaceId}/projects/${task.project?._id}`,
                        )
                      }
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {task.project?.name}
                        </p>
                      </div>
                      <StatusBadge status={task.status} />
                    </button>
                  ))}
                </div>
              )}

              {results.projects?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2 flex items-center gap-2">
                    <FolderKanban className="w-3.5 h-3.5" />
                    Projects
                  </p>
                  {results.projects.map((project) => (
                    <button
                      key={project._id}
                      onClick={() =>
                        handleNavigate(
                          `/workspaces/${workspaceId}/projects/${project._id}`,
                        )
                      }
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <span className="text-xl">{project.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                          {project.name}
                        </p>
                      </div>
                      <StatusBadge status={project.status} />
                    </button>
                  ))}
                </div>
              )}

              {results.members?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    Members
                  </p>
                  {results.members.map((member) => (
                    <button
                      key={member._id}
                      onClick={() => handleNavigate(`/profile/${member._id}`)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <Avatar user={member} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-white">
                          {member.fullName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {member.designation || member.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearch;

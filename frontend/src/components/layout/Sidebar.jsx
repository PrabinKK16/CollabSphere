import { NavLink, Link, useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  MessageSquare,
  FileText,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Home,
  Search,
  Zap,
  LogOut,
} from "lucide-react";
import { toggleSidebarCollapse } from "../../store/slices/uiSlice";
import { setGlobalSearchOpen } from "../../store/slices/uiSlice";
import Avatar from "../ui/Avatar";
import { useAuth } from "../../hooks/useAuth";

const navItems = [
  { to: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "projects", icon: FolderKanban, label: "Projects" },
  { to: "tasks", icon: CheckSquare, label: "My Tasks" },
  { to: "discussions", icon: MessageSquare, label: "Discussions" },
  { to: "files", icon: FileText, label: "Files" },
  { to: "members", icon: Users, label: "Members" },
  { to: "analytics", icon: BarChart3, label: "Analytics" },
  { to: "notifications", icon: Bell, label: "Notifications" },
  { to: "settings", icon: Settings, label: "Settings" },
];

const Sidebar = () => {
  const { workspaceId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { sidebarCollapsed, onlineUsers } = useSelector((s) => s.ui);
  const { unreadCount } = useSelector((s) => s.notification);
  const { currentWorkspace } = useSelector((s) => s.workspace);

  const isOnline = (userId) => onlineUsers.includes(userId?.toString());

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex-shrink-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden z-20 relative shadow-sm"
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 dark:border-slate-800 h-16">
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <Link
                to="/workspaces"
                className="flex items-center gap-2 overflow-hidden"
              >
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight truncate">
                    CollabSphere
                  </p>
                  {currentWorkspace && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {currentWorkspace.name}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        {sidebarCollapsed && (
          <Link
            to="/workspaces"
            className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center mx-auto"
          >
            <Zap className="w-4 h-4 text-white" />
          </Link>
        )}
        <button
          onClick={() => dispatch(toggleSidebarCollapse())}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex-shrink-0 ml-auto"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => dispatch(setGlobalSearchOpen(true))}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-sm ${sidebarCollapsed ? "justify-center" : ""}`}
        >
          <Search className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && <span>Search...</span>}
          {!sidebarCollapsed && (
            <kbd className="ml-auto text-xs bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">
              ⌘K
            </kbd>
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-1">
        <NavLink
          to={`/workspaces`}
          className={({ isActive }) =>
            `sidebar-item ${sidebarCollapsed ? "justify-center" : ""}`
          }
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="text-sm">Workspaces</span>}
        </NavLink>

        {workspaceId && (
          <>
            {!sidebarCollapsed && (
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider px-3 pt-3 pb-1">
                Workspace
              </p>
            )}
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={`/workspaces/${workspaceId}/${to}`}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? "active" : ""} ${sidebarCollapsed ? "justify-center" : ""}`
                }
                title={sidebarCollapsed ? label : undefined}
              >
                <div className="relative flex-shrink-0">
                  <Icon className="w-5 h-5" />
                  {label === "Notifications" && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                {!sidebarCollapsed && <span className="text-sm">{label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div
        className={`px-3 py-3 border-t border-slate-100 dark:border-slate-800 space-y-1`}
      >
        {/* Profile */}
        <button
          onClick={() => navigate("/profile")}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white ${sidebarCollapsed ? "justify-center" : ""}`}
        >
          <Avatar
            user={user}
            size="sm"
            showOnline
            isOnline={isOnline(user?._id)}
          />
          {!sidebarCollapsed && (
            <div className="overflow-hidden flex-1 text-left">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.designation || user?.email}
              </p>
            </div>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-slate-500 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 ${sidebarCollapsed ? "justify-center" : ""}`}
          title={sidebarCollapsed ? "Log out" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && (
            <span className="text-sm font-medium">Log out</span>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;

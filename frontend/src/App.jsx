import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCurrentUser } from './store/slices/authSlice'
import { fetchNotifications } from './store/slices/notificationSlice'
import { Loader2 } from 'lucide-react'

// Layouts
import AppLayout from './components/layout/AppLayout'

// Pages - Auth
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Pages - Workspace
import WorkspacesPage from './pages/workspace/WorkspacesPage'
import DashboardPage from './pages/workspace/DashboardPage'
import MembersPage from './pages/workspace/MembersPage'
import AnalyticsPage from './pages/workspace/AnalyticsPage'
import NotificationsPage from './pages/workspace/NotificationsPage'
import DiscussionsPage from './pages/workspace/DiscussionsPage'
import FilesPage from './pages/workspace/FilesPage'
import SettingsPage from './pages/workspace/SettingsPage'

// Pages - Project
import ProjectsPage from './pages/project/ProjectsPage'
import ProjectDetailPage from './pages/project/ProjectDetailPage'

// Pages - Task
import KanbanPage from './pages/tasks/KanbanPage'
import TaskDetailPage from './pages/tasks/TaskDetailPage'

// Pages - User
import ProfilePage from './pages/ProfilePage'
import InvitePage from './pages/InvitePage'

const ProtectedRoute = () => {
  const { isAuthenticated, initialized } = useSelector(s => s.auth)
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center page-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center shadow-xl animate-pulse-slow">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading CollabSphere…</p>
        </div>
      </div>
    )
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

const PublicRoute = () => {
  const { isAuthenticated, initialized } = useSelector(s => s.auth)
  if (!initialized) return null
  return isAuthenticated ? <Navigate to="/workspaces" replace /> : <Outlet />
}

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(s => s.auth)

  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications({ limit: 20 }))
    }
  }, [isAuthenticated, dispatch])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public marketing */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/invite/:token" element={<InvitePage />} />

        {/* Auth routes – redirect to /workspaces if already logged in */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          {/* Workspaces list (no sidebar) */}
          <Route path="/workspaces" element={<WorkspacesPage />} />

          {/* Profile (no sidebar) */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />

          {/* Workspace shell with sidebar */}
          <Route path="/workspaces/:workspaceId" element={<AppLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="projects/:projectId/kanban" element={<KanbanPage />} />
            <Route path="projects/:projectId/tasks/:taskId" element={<TaskDetailPage />} />
            <Route path="tasks" element={<KanbanPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="discussions" element={<DiscussionsPage />} />
            <Route path="files" element={<FilesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

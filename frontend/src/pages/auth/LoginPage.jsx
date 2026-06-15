import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  Moon,
  Sun,
} from "lucide-react";
import { loginUser } from "../../store/slices/authSlice";
import { toggleTheme } from "../../store/slices/uiSlice";
import toast from "react-hot-toast";

const Field = ({ label, right, children }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {right}
    </div>
    {children}
  </div>
);

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const { theme } = useSelector((s) => s.ui);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser(form)).unwrap();
      toast.success("Welcome back!");
      navigate("/workspaces");
    } catch (err) {
      toast.error(err || "Login failed");
    }
  };

  const inp =
    "w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm";

  return (
    <div className="min-h-screen flex page-bg relative">
      <button
        onClick={() => dispatch(toggleTheme())}
        className="absolute top-5 right-5 z-10 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-600 shadow-sm transition-all"
      >
        {theme === "dark" ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </button>

      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-95" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-lg">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">CollabSphere</span>
          </Link>
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            Where teams
            <br />
            build together.
          </h1>
          <p className="text-emerald-100 text-lg mb-10 leading-relaxed">
            Join 50,000+ teams who manage projects, ship faster, and collaborate
            in real-time.
          </p>
          <div className="space-y-4">
            {[
              "Real-time collaboration with Socket.io",
              "Kanban boards + task management",
              "Analytics and productivity insights",
              "Enterprise-grade security",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
                <span className="text-emerald-50 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-xl">
              CollabSphere
            </span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
              Welcome back
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Email address">
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm"
                  required
                  autoFocus
                />
              </div>
            </Field>

            <Field
              label="Password"
              right={
                <Link
                  to="/forgot-password"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Forgot password?
                </Link>
              }
            >
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all">
                <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0"
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-emerald-600 font-semibold hover:text-emerald-700"
              >
                Create one free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;

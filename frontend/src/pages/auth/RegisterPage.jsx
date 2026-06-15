import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  AtSign,
  Zap,
  Moon,
  Sun,
} from "lucide-react";
import { registerUser } from "../../store/slices/authSlice";
import { toggleTheme } from "../../store/slices/uiSlice";
import toast from "react-hot-toast";

// Reusable input row with icon - uses flexbox NOT absolute positioning
const IconInput = ({ icon: Icon, right, ...props }) => (
  <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all">
    <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
    <input
      {...props}
      className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm min-w-0"
    />
    {right}
  </div>
);

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const { theme } = useSelector((s) => s.ui);
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    try {
      await dispatch(registerUser(form)).unwrap();
      toast.success("Account created! Welcome to CollabSphere.");
      navigate("/workspaces");
    } catch (err) {
      toast.error(err || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center page-bg px-6 py-12 relative">
      <button
        onClick={() => dispatch(toggleTheme())}
        className="absolute top-5 right-5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-600 shadow-sm transition-all"
      >
        {theme === "dark" ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-xl">
            CollabSphere
          </span>
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl">
          <div className="mb-7">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              Create your account
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Start collaborating with your team in minutes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <IconInput
                icon={User}
                type="text"
                placeholder="Alex Johnson"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Username
              </label>
              <IconInput
                icon={AtSign}
                type="text"
                placeholder="alexj"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <IconInput
                icon={Mail}
                type="email"
                placeholder="alex@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <IconInput
                icon={Lock}
                type={showPass ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                right={
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
                }
              />
              <p className="text-xs text-slate-400 pl-1">
                Must be at least 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-5">
            By signing up, you agree to our{" "}
            <a href="#" className="text-emerald-600 hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-emerald-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-emerald-600 font-semibold hover:text-emerald-700"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

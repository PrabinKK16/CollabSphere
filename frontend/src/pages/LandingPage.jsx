import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Globe,
  BarChart3,
  Users,
  Star,
  Play,
  Moon,
  Sun,
} from "lucide-react";
import { toggleTheme } from "../store/slices/uiSlice";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Real-time sync across all team members with sub-second latency via Socket.io.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    desc: "JWT auth, RBAC, rate limiting, and end-to-end data protection built in.",
  },
  {
    icon: BarChart3,
    title: "Powerful Analytics",
    desc: "Deep productivity insights, completion trends, and team performance charts.",
  },
  {
    icon: Globe,
    title: "Unlimited Workspaces",
    desc: "Create isolated workspaces for every team, client, or department.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    desc: "Owner, Admin, Manager, Member, and Guest roles with granular permissions.",
  },
  {
    icon: CheckCircle,
    title: "Kanban + Lists",
    desc: "Drag-and-drop Kanban boards plus list views — work how your team works.",
  },
];

const stats = [
  { value: "50K+", label: "Teams Worldwide" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "2M+", label: "Tasks Completed" },
  { value: "4.9★", label: "Average Rating" },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CTO at Vertex Labs",
    text: "CollabSphere replaced four tools for us. The Kanban board and real-time sync alone saved 8 hours a week per engineer.",
    avatar: "SC",
  },
  {
    name: "Marcus Reid",
    role: "Product Lead at NovaSaaS",
    text: "The analytics dashboard gives us visibility we've never had. We shipped our last sprint 2 days early because of it.",
    avatar: "MR",
  },
  {
    name: "Priya Nair",
    role: "Founder at BuildFast",
    text: "Setup took 10 minutes. The invite flow, roles, and notifications worked perfectly out of the box. Best onboarding ever.",
    avatar: "PN",
  },
];

const pricing = [
  {
    name: "Starter",
    price: "Free",
    desc: "Perfect for solo founders and small projects",
    features: [
      "3 Workspaces",
      "5 Team Members",
      "Kanban Boards",
      "Basic Analytics",
      "1GB Storage",
    ],
    cta: "Get Started Free",
    primary: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/mo per user",
    desc: "For growing teams that need more power",
    features: [
      "Unlimited Workspaces",
      "Unlimited Members",
      "Advanced Analytics",
      "Priority Support",
      "50GB Storage",
      "Custom Roles",
      "API Access",
    ],
    cta: "Start Free Trial",
    primary: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For organizations that need full control",
    features: [
      "Everything in Pro",
      "SSO / SAML",
      "Dedicated Infra",
      "SLA 99.99%",
      "Audit Logs",
      "Custom Integrations",
      "Onboarding Support",
    ],
    cta: "Contact Sales",
    primary: false,
  },
];

const faqs = [
  {
    q: "Can I migrate from Jira or Asana?",
    a: "Yes. We provide import tools for Jira CSV exports, Asana JSON, and Trello boards. Most teams migrate in under an hour.",
  },
  {
    q: "How does real-time collaboration work?",
    a: "CollabSphere uses WebSockets (Socket.io) to sync task updates, comments, and board changes instantly across all connected users.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use AES-256 encryption at rest, TLS in transit, JWT with refresh token rotation, and SOC 2 compliant infrastructure.",
  },
  {
    q: "Can guests access projects without an account?",
    a: "Workspace admins can invite guests with read-only access. Guests see only the projects they are explicitly added to.",
  },
];

const LandingPage = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((s) => s.ui);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-lg">
            CollabSphere
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-600 dark:text-slate-400">
          <a
            href="#features"
            className="hover:text-emerald-600 transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="hover:text-emerald-600 transition-colors"
          >
            Pricing
          </a>
          <a href="#faq" className="hover:text-emerald-600 transition-colors">
            FAQ
          </a>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <Link
            to="/login"
            className="text-sm text-slate-600 dark:text-slate-300 hover:text-emerald-600 font-medium transition-colors hidden md:block"
          >
            Log in
          </Link>
          <Link to="/register" className="btn-primary py-2 px-5 text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      {/* pt-16 offsets the fixed navbar so content starts right below it */}
      <section className="relative flex flex-col items-center justify-center pt-28 pb-20 overflow-hidden px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-1/3 -right-32 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-blob animate-delay-200" />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-15 animate-blob animate-delay-400" />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Now with real-time collaboration
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.05] tracking-tight mb-6"
          >
            Manage Projects.{" "}
            <span className="gradient-text">Collaborate Better.</span> Deliver
            Faster.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A powerful collaboration platform designed for modern teams,
            startups, and enterprises. One workspace for everything.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <Link
              to="/register"
              className="btn-primary text-base px-8 py-4 flex items-center gap-2"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="btn-secondary text-base px-8 py-4 flex items-center gap-2">
              <Play className="w-4 h-4" /> Watch Demo
            </button>
          </motion.div>

          {/* Kanban mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative mx-auto max-w-4xl"
          >
            <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-slate-900 dark:to-emerald-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/30 p-4 shadow-2xl shadow-emerald-500/10">
              <div className="flex gap-1.5 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="grid grid-cols-4 gap-3 h-56">
                {["Backlog", "In Progress", "Review", "Done"].map((col, ci) => (
                  <div
                    key={col}
                    className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-3 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-1.5 mb-3">
                      <div
                        className={`w-2 h-2 rounded-full ${["bg-slate-400", "bg-amber-400", "bg-purple-400", "bg-emerald-400"][ci]}`}
                      />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {col}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {Array.from({ length: ci === 3 ? 1 : ci + 2 }).map(
                        (_, i) => (
                          <div
                            key={i}
                            className="bg-slate-100 dark:bg-slate-700 rounded-lg p-2"
                          >
                            <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded mb-1.5" />
                            <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded w-3/4" />
                            <div className="flex items-center justify-between mt-2">
                              <div
                                className={`h-1.5 w-10 rounded-full ${["bg-blue-200", "bg-amber-200", "bg-orange-200", "bg-emerald-200"][ci]}`}
                              />
                              <div className="w-4 h-4 rounded-full bg-emerald-200 dark:bg-emerald-800" />
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 border-y border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-sm font-medium text-slate-400 dark:text-slate-500 mb-8 uppercase tracking-widest">
            Trusted by 50,000+ teams worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-4xl font-black gradient-text mb-1">
                  {value}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4"
            >
              Everything your team needs
            </motion.h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Built to replace Jira, Asana, and Notion — in one unified
              platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300"
              >
                <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">
                  {title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              What teams say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, avatar }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"
              >
                <div className="flex mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-5">
                  "{text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                      {name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-slate-500 dark:text-slate-400">
              Start free. Scale as you grow.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map(
              (
                { name, price, period, desc, features: feats, cta, primary },
                i,
              ) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative p-8 rounded-2xl border ${primary ? "gradient-bg border-transparent shadow-2xl shadow-emerald-500/30 scale-105" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}
                >
                  {primary && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}
                  <h3
                    className={`font-bold text-xl mb-1 ${primary ? "text-white" : "text-slate-900 dark:text-white"}`}
                  >
                    {name}
                  </h3>
                  <p
                    className={`text-sm mb-4 ${primary ? "text-emerald-100" : "text-slate-500 dark:text-slate-400"}`}
                  >
                    {desc}
                  </p>
                  <div className="flex items-end gap-1 mb-6">
                    <span
                      className={`text-4xl font-black ${primary ? "text-white" : "text-slate-900 dark:text-white"}`}
                    >
                      {price}
                    </span>
                    {period && (
                      <span
                        className={`text-sm pb-1 ${primary ? "text-emerald-100" : "text-slate-500"}`}
                      >
                        {period}
                      </span>
                    )}
                  </div>
                  <div className="space-y-3 mb-8">
                    {feats.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <CheckCircle
                          className={`w-4 h-4 flex-shrink-0 ${primary ? "text-white" : "text-emerald-500"}`}
                        />
                        <span
                          className={`text-sm ${primary ? "text-white" : "text-slate-600 dark:text-slate-300"}`}
                        >
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/register"
                    className={`block text-center py-3 rounded-xl font-semibold transition-all ${primary ? "bg-white text-emerald-700 hover:bg-emerald-50" : "btn-secondary"}`}
                  >
                    {cta}
                  </Link>
                </motion.div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-6 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white text-center mb-12">
            Frequently asked
          </h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div
                key={q}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
              >
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                  {q}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl gradient-bg overflow-hidden shadow-2xl shadow-emerald-500/30">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Start building together today
              </h2>
              <p className="text-emerald-100 text-xl mb-8">
                Free forever for small teams. No credit card required.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-8 py-4 rounded-2xl hover:bg-emerald-50 transition-colors text-lg shadow-xl"
              >
                Create your workspace <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 gradient-bg rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              CollabSphere
            </span>
            <span className="text-slate-400 text-sm">
              — Where Teams Build Together
            </span>
          </div>
          <p className="text-sm text-slate-400">
            © 2025 CollabSphere. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

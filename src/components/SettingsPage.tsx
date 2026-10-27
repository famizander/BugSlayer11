import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Sun,
  Moon,
  Check,
  Sparkles,
  CreditCard,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';

interface SettingsPageProps {
  onNavigateToAccount: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigateToAccount }) => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header in Glassmorphism Container */}
      <div className="glass-panel rounded-2xl p-5 border border-black/10 dark:border-white/10 shadow-lg">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white flex items-center gap-2">
          <span>Settings & Preferences</span>
        </h1>
        <p className="text-sm sm:text-base text-black dark:text-slate-300 mt-1.5">
          Customize BugSlayer appearance and review your learning subscription.
        </p>
      </div>

      {/* 1. Appearance Settings Section */}
      <section className="glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 dark:text-white space-y-5 border border-black/10 dark:border-white/10">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-black dark:text-white flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500 dark:text-amber-300" />
            <span>Appearance Settings</span>
          </h2>
          <p className="text-sm text-black dark:text-slate-300 mt-1">
            Choose your preferred theme. Changes are applied immediately across the entire website and saved to your device.
          </p>
        </div>

        {/* Theme Selectable Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dark Theme Card */}
          <div
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
              theme === 'dark'
                ? 'glass-card border-blue-500 shadow-xl shadow-blue-500/20'
                : 'glass-input border-transparent hover:border-slate-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-950/80 flex items-center justify-center text-blue-300 border border-blue-500/30 backdrop-blur-md">
                    <Moon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-black dark:text-white">Dark Theme</h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">Deep sapphire palette (Default)</p>
                  </div>
                </div>
                {theme === 'dark' && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Mini Preview Box */}
              <div className="rounded-xl p-2.5 code-dark-bg border border-white/10 space-y-1.5 font-mono text-[11px]">
                <div className="h-2 w-12 bg-blue-500 rounded" />
                <div className="h-1.5 w-full bg-slate-700/60 rounded" />
                <div className="h-1.5 w-3/4 bg-slate-700/40 rounded" />
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <span>Optimized for low-light coding sessions</span>
            </div>
          </div>

          {/* Light Theme Card */}
          <div
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
              theme === 'light'
                ? 'glass-card border-blue-500 shadow-xl shadow-blue-500/20'
                : 'glass-input border-transparent hover:border-slate-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 border border-amber-500/30 backdrop-blur-md">
                    <Sun className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-black dark:text-white">Light Theme</h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">Clean slate and crisp contrast</p>
                  </div>
                </div>
                {theme === 'light' && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Mini Preview Box */}
              <div className="rounded-xl p-2.5 bg-slate-100 border border-slate-300 space-y-1.5 font-mono text-[11px]">
                <div className="h-2 w-12 bg-blue-600 rounded" />
                <div className="h-1.5 w-full bg-slate-300 rounded" />
                <div className="h-1.5 w-3/4 bg-slate-200 rounded" />
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
              <span>High contrast for daytime lecture halls</span>
            </div>
          </div>
        </div>

        <div className="pt-2 text-xs text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>
            Theme is automatically persisted in your browser and synced with your account when logged in.
          </span>
        </div>
      </section>

      {/* 2. Subscription Plan Section */}
      <section className="glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 dark:text-white space-y-6 border border-black/10 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-black/10 dark:border-white/10">
          <div>
            <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Subscription Plan</span>
            </h2>
            <p className="text-xs text-black dark:text-slate-300 mt-1">
              BugSlayer offers free Socratic debugging tools for all computer science students.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-black dark:text-slate-400">Your Plan:</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-400/40 backdrop-blur-md">
              {user?.plan === 'premium' ? 'Premium' : 'Free Plan'}
            </span>
          </div>
        </div>

        {/* Unauthenticated notice */}
        {!user && (
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                You are currently browsing as a guest. Please log in to manage your account-specific subscription status.
              </span>
            </div>
            <button
              onClick={onNavigateToAccount}
              className="text-xs font-semibold px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white shrink-0 cursor-pointer shadow-md"
            >
              Log In
            </button>
          </div>
        )}

        {/* Plans Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Free Plan Card */}
          <div className="student-plan-box p-5 rounded-2xl glass-card border-2 border-blue-500/40 flex flex-col justify-between space-y-4 relative shadow-lg">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-400/30 backdrop-blur-md">
                    Free
                  </span>
                  <h3 className="text-xl font-bold text-black dark:text-white mt-2">Student Free</h3>
                  <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                    RM 0 <span className="text-xs text-black dark:text-slate-400 font-normal">/ forever</span>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 backdrop-blur-md">
                  Active Plan
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 space-y-2.5 text-xs text-black dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-black dark:text-slate-200">C++ & Python error detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-black dark:text-slate-200">Socratic hints delivered one at a time</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-black dark:text-slate-200">Diagnostic line locator & conceptual explanation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-black dark:text-slate-200">Save recent submissions history locally</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="w-full py-2.5 rounded-xl glass-input text-black dark:text-slate-300 text-xs font-semibold text-center border border-black/10 dark:border-white/10">
                Current Active Plan
              </div>
            </div>
          </div>

          {/* Premium Plan Card */}
          <div className="p-5 rounded-2xl glass-card border border-black/10 dark:border-white/10 hover:border-blue-400/50 transition-all flex flex-col justify-between space-y-4 relative shadow-lg">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-400/30 backdrop-blur-md">
                    Premium
                  </span>
                  <h3 className="text-xl font-bold text-black dark:text-white mt-2">BugSlayer Pro</h3>
                  <div className="premium-price-text text-2xl font-extrabold text-black dark:text-white mt-1">
                    RM 9.99 <span className="text-xs text-black dark:text-slate-400 font-normal">/ month (with student ID)</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-100 dark:bg-blue-600/30 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-400/40 backdrop-blur-md">
                  Coming Soon
                </span>
              </div>

              <div className="premium-plan-features mt-4 pt-4 border-t border-black/10 dark:border-white/10 space-y-2.5 text-xs text-black dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-black dark:text-slate-200">Everything in Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-black dark:text-slate-200">Unlimited submission history & multi-device sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-black dark:text-slate-200">Interactive memory model & step-by-step visualizer</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-black dark:text-slate-200">Automated test case generator for tricky edge bugs</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Explore Premium Upgrade</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Honest Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel border border-white/20 rounded-3xl max-w-md w-full p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">BugSlayer Premium</h3>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl glass-input border border-blue-400/30 text-xs text-blue-200 leading-relaxed space-y-2">
              <p className="font-semibold text-white">Payment Gateway Notice:</p>
              <p>
                BugSlayer Premium upgrades are currently in private pilot testing with university partners. Live payment processing (Stripe / Razorpay) will be enabled in our next scheduled platform update.
              </p>
              <p className="text-slate-300">
                In the meantime, your student account has access to all Socratic C++ & Python hint engines and debugging workflows on the Free tier at zero cost.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

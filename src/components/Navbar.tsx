import React from 'react';
import { ActivePage } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Sparkles, User as UserIcon } from 'lucide-react';

import { BugSlayerLogo } from './BugSlayerLogo';

interface NavbarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b transition-colors bg-white/80 dark:bg-[#030d1b]/70 backdrop-blur-xl border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-sm dark:shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo: { 🐞/ } BugSlayer */}
        <button
          onClick={() => onNavigate('solve')}
          className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
        >
          <div className="p-1.5 rounded-xl bg-[#071933] border border-blue-500/40 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:border-blue-400 transition-colors logo-dark-bg">
            <BugSlayerLogo size="sm" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
              BugSlayer
            </span>
          </div>
        </button>

        {/* Central / Right Navigation: | Solve | Recent | Account | Settings | */}
        <nav className="flex items-center text-sm md:text-base font-medium select-none">
          <span className="text-slate-400 dark:text-slate-500 px-1.5 hidden sm:inline">|</span>
          <button
            onClick={() => onNavigate('solve')}
            className={`px-3 py-1.5 rounded transition-all duration-150 relative cursor-pointer ${
              activePage === 'solve'
                ? 'text-blue-600 dark:text-blue-400 font-bold underline underline-offset-8 decoration-2 decoration-blue-500'
                : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'
            }`}
          >
            Solve
          </button>

          <span className="text-slate-400 dark:text-slate-500 px-1.5">|</span>
          <button
            onClick={() => onNavigate('recent')}
            className={`px-3 py-1.5 rounded transition-all duration-150 relative cursor-pointer ${
              activePage === 'recent'
                ? 'text-blue-600 dark:text-blue-400 font-bold underline underline-offset-8 decoration-2 decoration-blue-500'
                : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'
            }`}
          >
            Recent
          </button>

          <span className="text-slate-400 dark:text-slate-500 px-1.5">|</span>
          <button
            onClick={() => onNavigate('account')}
            className={`px-3 py-1.5 rounded transition-all duration-150 relative flex items-center gap-1.5 cursor-pointer ${
              activePage === 'account'
                ? 'text-blue-600 dark:text-blue-400 font-bold underline underline-offset-8 decoration-2 decoration-blue-500'
                : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'
            }`}
          >
            {user ? (
              <span className="inline-flex items-center gap-1">
                <span>Account</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse inline-block ml-0.5" />
              </span>
            ) : (
              'Account'
            )}
          </button>

          <span className="text-slate-400 dark:text-slate-500 px-1.5">|</span>
          <button
            onClick={() => onNavigate('settings')}
            className={`px-3 py-1.5 rounded transition-all duration-150 relative cursor-pointer ${
              activePage === 'settings'
                ? 'text-blue-600 dark:text-blue-400 font-bold underline underline-offset-8 decoration-2 decoration-blue-500'
                : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'
            }`}
          >
            Settings
          </button>
          <span className="text-slate-400 dark:text-slate-500 px-1.5 hidden sm:inline">|</span>
        </nav>

        {/* User indicator & theme switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl glass-button text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-all focus:outline-none cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-black stroke-black stroke-[2.4]" />
            )}
          </button>

          {user ? (
            <button
              onClick={() => onNavigate('account')}
              className="flex items-center gap-2 py-1.5 px-3 rounded-full glass-input text-sm text-slate-800 dark:text-blue-200 hover:border-blue-400 transition-colors focus:outline-none cursor-pointer"
              title="View account"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline font-semibold max-w-[110px] truncate text-sm">
                {user.username}
              </span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('account')}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all shadow-md shadow-blue-500/25 border border-blue-400/30 cursor-pointer"
            >
              <UserIcon className="w-4 h-4" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

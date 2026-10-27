/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActivePage } from './types';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { HistoryProvider } from './context/HistoryContext';
import { Navbar } from './components/Navbar';
import { SolvePage } from './components/SolvePage';
import { RecentPage } from './components/RecentPage';
import { AccountPage } from './components/AccountPage';
import { SettingsPage } from './components/SettingsPage';

function BugSlayerApp() {
  const [activePage, setActivePage] = useState<ActivePage>('solve');

  return (
    <div className="min-h-screen flex flex-col transition-colors selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar activePage={activePage} onNavigate={setActivePage} />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activePage === 'solve' && (
          <SolvePage
            onNavigateToRecent={() => setActivePage('recent')}
            onNavigateToAccount={() => setActivePage('account')}
          />
        )}

        {activePage === 'recent' && (
          <RecentPage
            onNavigateToSolve={() => setActivePage('solve')}
            onNavigateToAccount={() => setActivePage('account')}
          />
        )}

        {activePage === 'account' && (
          <AccountPage
            onNavigateToSolve={() => setActivePage('solve')}
            onNavigateToRecent={() => setActivePage('recent')}
            onNavigateToSettings={() => setActivePage('settings')}
          />
        )}

        {activePage === 'settings' && (
          <SettingsPage onNavigateToAccount={() => setActivePage('account')} />
        )}
      </main>

      {/* Student Footer with Strivaholics Team Attribution */}
      <footer className="border-t border-white/10 py-6 px-4 text-center text-sm text-white bg-[#020b18] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
            <span className="font-bold text-white tracking-wide text-base">BugSlayer</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="text-white font-semibold">Made by Strivaholics</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="text-white font-normal">We strive to improve the coding experience.</span>
          </div>

          <div className="flex items-center gap-5 text-sm font-medium text-white">
            <button
              onClick={() => setActivePage('solve')}
              className="text-white hover:text-blue-200 transition-colors cursor-pointer"
            >
              Solve
            </button>
            <button
              onClick={() => setActivePage('recent')}
              className="text-white hover:text-blue-200 transition-colors cursor-pointer"
            >
              Recent
            </button>
            <button
              onClick={() => setActivePage('account')}
              className="text-white hover:text-blue-200 transition-colors cursor-pointer"
            >
              Account
            </button>
            <button
              onClick={() => setActivePage('settings')}
              className="text-white hover:text-blue-200 transition-colors cursor-pointer"
            >
              Settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HistoryProvider>
          <BugSlayerApp />
        </HistoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

import React, { useState, useMemo } from 'react';
import { Submission, Language, SubmissionStatus } from '../types';
import { useHistory } from '../context/HistoryContext';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Code2,
  Calendar,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  FileCode,
  ArrowRight,
  Filter,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';

interface RecentPageProps {
  onNavigateToSolve: () => void;
  onNavigateToAccount: () => void;
}

export const RecentPage: React.FC<RecentPageProps> = ({
  onNavigateToSolve,
  onNavigateToAccount,
}) => {
  const { user } = useAuth();
  const { submissions, deleteSubmission, clearHistory, loadIntoSolve } = useHistory();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Selected Submission Detail Modal
  const [activeItem, setActiveItem] = useState<Submission | null>(null);
  const [copiedOriginal, setCopiedOriginal] = useState<boolean>(false);
  const [copiedCorrected, setCopiedCorrected] = useState<boolean>(false);

  // Clear All Confirmation Modal
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Filtered Submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      // Language filter
      if (selectedLanguage !== 'all' && item.language !== selectedLanguage) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesCode = item.code.toLowerCase().includes(query);
        const matchesSummary = item.errorSummary.toLowerCase().includes(query);
        return matchesTitle || matchesCode || matchesSummary;
      }
      return true;
    });
  }, [submissions, searchQuery, selectedLanguage, selectedStatus]);

  const handleCopy = (text: string, isCorrected: boolean) => {
    navigator.clipboard.writeText(text);
    if (isCorrected) {
      setCopiedCorrected(true);
      setTimeout(() => setCopiedCorrected(false), 2000);
    } else {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    }
  };

  const handleReopenInSolve = (submission: Submission) => {
    loadIntoSolve(submission);
    onNavigateToSolve();
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Page Header in Glassmorphism Panel */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2.5">
            <span>Recent Code Submissions</span>
            <span className="recent-items-badge text-xs sm:text-sm font-bold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-950 dark:text-blue-200 border border-blue-400 dark:border-blue-400/30 backdrop-blur-md">
              {filteredSubmissions.length} of {submissions.length} items
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mt-1.5">
            Review your previous coding mistakes, inspect explanations, and track your learning progress.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2.5">
          {submissions.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-1.5 rounded-xl text-sm font-bold text-rose-900 dark:text-rose-200 bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 dark:hover:bg-rose-900/80 border border-rose-300 dark:border-rose-500/40 transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md shadow-sm"
            >
              <Trash2 className="w-4 h-4 text-rose-800 dark:text-rose-300" />
              <span>Clear History</span>
            </button>
          )}

          <button
            onClick={onNavigateToSolve}
            className="px-4 py-1.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Code2 className="w-4 h-4" />
            <span>New Solve</span>
          </button>
        </div>
      </div>

      {/* Guest Notice if not logged in */}
      {!user && (
        <div className="p-4 rounded-2xl glass-panel border border-blue-400/30 text-sm text-slate-800 dark:text-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="leading-relaxed">
              You are currently viewing as a guest. History resets whenever you visit without an account. Log in or create an account to preserve and keep your submissions permanently.
            </span>
          </div>
          <button
            onClick={onNavigateToAccount}
            className="text-white bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-xl text-sm font-bold shrink-0 cursor-pointer shadow-md transition-all"
          >
            Log In / Sign Up
          </button>
        </div>
      )}

      {/* Search and Filters Bar with Glassmorphic styling */}
      <div className="glass-panel rounded-2xl p-4 shadow-xl border border-white/10 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, code content, or bug description..."
              className="w-full pl-9 pr-4 py-2 glass-input rounded-xl text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-medium text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Language Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full glass-input rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Languages</option>
              <option value="cpp">C++</option>
              <option value="python">Python</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full glass-input rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Error Found">Error Found</option>
              <option value="Fixed">Fixed</option>
              <option value="No Errors">No Errors</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions List: Compiler preview box removed as requested */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-16 px-4 glass-panel rounded-2xl shadow-xl border border-white/10 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-400/20 backdrop-blur-md">
            <Code2 className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">No Submissions Found</h3>
            <p className="text-xs text-slate-300">
              {searchQuery || selectedLanguage !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search query or filters to find what you are looking for.'
                : 'You have not submitted or analyzed any code yet. Start debugging code to track your learning journey!'}
            </p>
          </div>
          <div>
            {searchQuery || selectedLanguage !== 'all' || selectedStatus !== 'all' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLanguage('all');
                  setSelectedStatus('all');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            ) : (
              <button
                onClick={onNavigateToSolve}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Go to Solve Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((item) => {
            const progress = item.progressPercent ?? (item.status === 'Fixed' ? 100 : item.status === 'No Errors' ? 100 : 60);

            return (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className="group relative glass-panel hover:bg-blue-950/40 rounded-2xl p-5 shadow-xl transition-all duration-200 cursor-pointer text-white border border-white/10 hover:border-blue-400/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                      {item.title}
                    </h2>
                    <span className="text-xs sm:text-sm uppercase font-bold px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-950 dark:text-blue-200 border border-blue-300 dark:border-blue-400/30 backdrop-blur-md">
                      {item.language === 'cpp' ? 'C++' : 'Python'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      {formatDate(item.timestamp)}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 backdrop-blur-md ${
                        item.status === 'Error Found'
                          ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-500/50'
                          : item.status === 'Fixed'
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-500/50'
                          : 'bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-200 border border-blue-400 dark:border-blue-500/50'
                      }`}
                    >
                      {item.status === 'Error Found' ? (
                        <AlertCircle className="w-4 h-4 text-rose-700 dark:text-rose-300" />
                      ) : item.status === 'Fixed' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                      )}
                      <span>{item.status}</span>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSubmission(item.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ml-1 cursor-pointer"
                      title="Delete this entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar (PDF page 2 wireframe) */}
                <div className="mt-2 mb-3">
                  <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden border border-white/10">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-500 h-2.5 rounded-full transition-all duration-500 group-hover:from-blue-500 group-hover:to-indigo-400 shadow-sm shadow-blue-500/50"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Code Preview Only (Compiler box removed as requested) */}
                <div className="text-sm pt-1">
                  <div className="code-dark-bg p-3.5 rounded-xl border border-white/10 font-mono text-slate-200 line-clamp-2">
                    <span className="text-slate-400 select-none mr-2 font-bold">Code Preview:</span>
                    {item.code.replace(/\n/g, ' ')}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm font-semibold text-blue-800 dark:text-blue-300 group-hover:text-blue-600 dark:group-hover:text-blue-200">
                  <span className="flex items-center gap-1.5 font-medium">
                    Click to inspect Socratic explanation & corrected code
                  </span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Details Modal in Glassmorphism (Compiler box removed as requested) */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl text-white space-y-5 border border-white/20">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-md">
                    {activeItem.language === 'cpp' ? 'C++' : 'Python'}
                  </span>
                  <span className="text-xs text-slate-300">
                    Submitted on {formatDate(activeItem.timestamp)}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{activeItem.title}</h2>
              </div>

              <button
                onClick={() => setActiveItem(null)}
                className="text-slate-400 hover:text-white text-base px-2 py-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Reopen in Solve button banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl glass-input border border-blue-400/30">
              <span className="text-sm font-medium text-slate-800 dark:text-blue-200">
                Want to test, modify, or solve this code in the interactive editor?
              </span>
              <button
                onClick={() => handleReopenInSolve(activeItem)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-sm font-bold text-white shadow-lg shadow-blue-500/25 border border-blue-400/30 flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reopen in Solve Editor</span>
              </button>
            </div>

            {/* Original Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-bold text-slate-800 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  Original Code
                </span>
                <button
                  onClick={() => handleCopy(activeItem.code, false)}
                  className="text-blue-800 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-200 flex items-center gap-1.5 cursor-pointer font-semibold"
                >
                  {copiedOriginal ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedOriginal ? 'Copied' : 'Copy Original'}</span>
                </button>
              </div>
              <div className="p-4 rounded-xl code-dark-bg border border-white/10 font-mono text-sm text-slate-200 whitespace-pre overflow-x-auto leading-relaxed">
                {activeItem.code}
              </div>
            </div>

            {/* Simple Student-Friendly Explanation */}
            <div className="p-4.5 rounded-2xl glass-input border border-blue-400/30 space-y-2">
              <div className="text-sm font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500 dark:text-amber-300" />
                Simple Explanation
              </div>
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                {activeItem.explanation}
              </p>
            </div>

            {/* Corrected Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-bold text-slate-800 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Corrected Code
                </span>
                <button
                  onClick={() => handleCopy(activeItem.correctedCode, true)}
                  className="px-3 py-1.5 rounded-lg glass-button border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedCorrected ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Copied Corrected Code</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Corrected Code</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 rounded-xl code-dark-bg border border-emerald-500/30 font-mono text-sm text-emerald-300 whitespace-pre overflow-x-auto leading-relaxed">
                {activeItem.correctedCode}
              </div>
            </div>

            {/* Learning Tips */}
            {activeItem.learningTips && activeItem.learningTips.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-black/10 dark:border-white/10">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                  Learning Tips to Avoid This in the Future
                </h4>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  {activeItem.learningTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-black/10 dark:border-white/10">
              <button
                onClick={() => {
                  deleteSubmission(activeItem.id);
                  setActiveItem(null);
                }}
                className="text-sm font-semibold text-rose-700 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete this entry</span>
              </button>

              <button
                onClick={() => setActiveItem(null)}
                className="px-5 py-2 rounded-xl glass-button text-slate-900 dark:text-white text-sm font-bold cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Clear All History */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-950/80 text-rose-400 flex items-center justify-center border border-rose-500/40 backdrop-blur-md">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Clear All History?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete all {submissions.length} submission entries? Your saved codes and tips will be removed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white glass-button cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

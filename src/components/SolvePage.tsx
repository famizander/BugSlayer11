import React, { useState, useEffect, useRef } from 'react';
import { Language, Submission } from '../types';
import { useHistory } from '../context/HistoryContext';
import { useAuth } from '../context/AuthContext';
import { analyzeCode, analyzeCodeLocally, AnalysisResult } from '../services/analyzer';
import {
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Copy,
  Check,
  Eye,
  FileCode,
  ArrowRight,
} from 'lucide-react';

interface SolvePageProps {
  onNavigateToRecent: () => void;
  onNavigateToAccount: () => void;
}

export const SolvePage: React.FC<SolvePageProps> = ({ onNavigateToRecent, onNavigateToAccount }) => {
  const { user } = useAuth();
  const { addSubmission, activeSolveCode } = useHistory();

  // Language selection: C++ or Python (defaults to C++)
  const [language, setLanguage] = useState<Language>('cpp');

  // Coding area starts EMPTY for users to paste their own codes
  const [code, setCode] = useState<string>('');
  const [expectedOutput, setExpectedOutput] = useState<string>('');

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Progressive Hints: "one at a time"
  const [currentHintIndex, setCurrentHintIndex] = useState<number>(0);
  const [revealedHintCount, setRevealedHintCount] = useState<number>(1);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showSolutionModal, setShowSolutionModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Code editor scroll synchronization refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Load from active submission if user clicked "Reopen in Solve Editor"
  useEffect(() => {
    if (activeSolveCode) {
      setLanguage(activeSolveCode.language);
      setCode(activeSolveCode.code);
      setExpectedOutput(activeSolveCode.expectedOutput);
      // Run analysis on loaded code
      handleAnalyze(activeSolveCode.code, activeSolveCode.language, activeSolveCode.expectedOutput, false);
    }
  }, [activeSolveCode]);

  // Synchronize gutter scroll with textarea scroll
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Switch language handler
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setValidationError(null);
  };

  const handleAnalyze = async (
    codeToAnalyze = code,
    lang = language,
    expected = expectedOutput,
    saveToHistory = true
  ) => {
    if (!codeToAnalyze.trim()) {
      setValidationError('Please paste or write your code into the editor first.');
      return;
    }

    setValidationError(null);
    setIsAnalyzing(true);
    setCurrentHintIndex(0);
    setRevealedHintCount(1);
    setShowExplanation(false);

    try {
      const result = await analyzeCode(codeToAnalyze, lang, expected);
      setAnalysis(result);

      if (saveToHistory) {
        // Automatically save to Recent history
        const firstLine = codeToAnalyze.split('\n').find((l) => l.trim().length > 0) || 'Code snippet';
        const title =
          result.errorSummary.length > 0
            ? result.errorSummary
            : `${lang === 'cpp' ? 'C++' : 'Python'} Submission`;

        addSubmission({
          title,
          language: lang,
          code: codeToAnalyze,
          status: result.status,
          compilerOutput: result.compilerOutput,
          expectedOutput: expected,
          actualOutput: result.actualOutput,
          errorSummary: result.errorSummary,
          hints: result.hints,
          explanation: result.explanation,
          correctedCode: result.correctedCode,
          learningTips: result.learningTips,
          progressPercent: result.progressPercent,
        });

        setSavedToast('Saved to your Recent history!');
        setTimeout(() => setSavedToast(null), 3000);
      }
    } catch (e) {
      console.error('Error analyzing code', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearCode = () => {
    setCode('');
    setExpectedOutput('');
    setAnalysis(null);
    setValidationError(null);
    setCurrentHintIndex(0);
    setRevealedHintCount(1);
    setShowExplanation(false);
    if (gutterRef.current) gutterRef.current.scrollTop = 0;
    if (textareaRef.current) textareaRef.current.scrollTop = 0;
  };

  const handleCopyCode = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const nextHint = () => {
    if (analysis && currentHintIndex < analysis.hints.length - 1) {
      const nextIdx = currentHintIndex + 1;
      setCurrentHintIndex(nextIdx);
      if (nextIdx + 1 > revealedHintCount) {
        setRevealedHintCount(nextIdx + 1);
      }
    }
  };

  const prevHint = () => {
    if (currentHintIndex > 0) {
      setCurrentHintIndex(currentHintIndex - 1);
    }
  };

  const hintsList = analysis?.hints || [
    'Paste or write your code on the left, then click "Check Code" to generate step-by-step Socratic hints.',
  ];

  // Calculate lines accurately without gutter scroll misalignment
  const linesArray = code ? code.split('\n') : [''];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / Breadcrumb & Notice in Glassmorphic Container */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-lg">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2.5">
          <span>Solve & Understand</span>
          <span className="socratic-badge text-xs sm:text-sm font-bold px-3 py-1 rounded-full bg-blue-900/15 dark:bg-blue-500/20 text-blue-950 dark:text-blue-200 border border-blue-900/30 dark:border-blue-400/30 backdrop-blur-md">
            Interactive Socratic Debugger
          </span>
        </h1>
        {/* Exact Requested Description */}
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mt-2.5 leading-relaxed max-w-4xl">
          We strive to improve the coding experience while helping students strengthen their programming skills. BugSlayer helps students understand their coding errors, learn from their mistakes, and develop problem-solving skills instead of simply providing corrected code.
        </p>
      </div>

      {savedToast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-sm flex items-center justify-between shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{savedToast}</span>
          </div>
          <button
            onClick={onNavigateToRecent}
            className="text-xs underline font-medium hover:text-emerald-100 flex items-center gap-1"
          >
            View in Recent <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {validationError && (
        <div className="p-3.5 rounded-xl bg-amber-950/60 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Grid: Coding Area on the LEFT (col-span-7) and Socratic Hints on the RIGHT (col-span-5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SIDE: Language Selector + Code Editor + Expected Output (No "The compiler said" box as requested) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Code Editor Glassmorphism Card */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-2xl border border-white/10 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              {/* Language Dropdown Selector */}
              <div className="flex items-center gap-2.5">
                <span className="text-sm sm:text-base font-bold text-black dark:text-slate-200">Language:</span>
                <div className="relative inline-block">
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value as Language)}
                    className="glass-input text-black dark:text-blue-300 border border-slate-300 dark:border-blue-500/40 rounded-xl px-3.5 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer pr-9 appearance-none bg-white dark:bg-transparent"
                  >
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black dark:text-blue-300">
                    <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Editor Actions */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleClearCode}
                  className="glass-button px-3.5 py-1.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Clear editor"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Clear</span>
                </button>

                {code.trim().length > 0 && (
                  <button
                    onClick={() => handleCopyCode(code)}
                    className="glass-button px-3.5 py-1.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Copy code"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => handleAnalyze()}
                  disabled={isAnalyzing}
                  className="px-4.5 py-1.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Check Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Editor Box with Synchronized Line Numbers & Clean Scroll */}
            <div className="mt-4 rounded-xl code-dark-bg border border-white/10 overflow-hidden font-mono text-sm shadow-inner">
              <div className="px-3.5 py-2 bg-black/50 border-b border-white/10 flex items-center justify-between text-xs sm:text-sm text-slate-300">
                <span className="flex items-center gap-1.5 font-medium text-slate-200">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  {language === 'cpp' ? 'main.cpp' : 'main.py'}
                </span>
                <span className="text-xs text-slate-400 font-sans">
                  {code ? `${linesArray.length} lines` : 'Empty (Paste your code)'}
                </span>
              </div>

              {/* Synchronized container */}
              <div className="relative flex h-80 overflow-hidden">
                {/* Line numbers gutter: synchronized with textarea scrollTop */}
                <div
                  ref={gutterRef}
                  className="select-none py-3 px-2.5 text-right line-number text-xs sm:text-sm bg-black/60 border-r border-white/10 w-12 overflow-hidden shrink-0"
                >
                  {linesArray.map((_, i) => (
                    <div key={i} className="leading-6 font-mono h-6 line-number text-slate-400 font-medium">
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Textarea code input: wrap="off" ensures 1:1 line matching, vertical & horizontal scroll */}
                <textarea
                  ref={textareaRef}
                  value={code}
                  onScroll={handleScroll}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCode(val);
                    if (validationError) setValidationError(null);
                    if (val.trim().length === 0) {
                      setAnalysis(null);
                      setCurrentHintIndex(0);
                      setRevealedHintCount(1);
                    } else if (!analysis) {
                      const instant = analyzeCodeLocally(val, language, expectedOutput);
                      setAnalysis(instant);
                    }
                  }}
                  wrap="off"
                  placeholder={
                    language === 'cpp'
                      ? '// Paste or write your C++ code here...\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n  // your code\n  return 0;\n}'
                      : '# Paste or write your Python code here...\n\ndef main():\n    # your code\n    pass\n\nif __name__ == "__main__":\n    main()'
                  }
                  spellCheck={false}
                  className="w-full h-full p-3 bg-transparent text-white font-mono text-sm leading-6 resize-none focus:outline-none selection:bg-blue-600/40 placeholder-slate-400 overflow-y-auto overflow-x-auto"
                />
              </div>
            </div>

            {/* Expected Output Box */}
            <div className="mt-4 space-y-1.5">
              <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black dark:text-slate-300 flex items-center justify-between">
                <span>Expected Output:</span>
                <span className="text-xs font-normal text-slate-600 dark:text-slate-400">(Optional: What your code should produce)</span>
              </label>
              <div className="rounded-xl glass-input p-3 text-sm font-mono bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 shadow-sm">
                <input
                  type="text"
                  value={expectedOutput}
                  onChange={(e) => setExpectedOutput(e.target.value)}
                  className="w-full bg-transparent border-none text-black dark:text-slate-100 font-mono text-sm sm:text-base focus:outline-none placeholder-slate-500 dark:placeholder-slate-400"
                  placeholder="e.g. Age: 20 or Hello World"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Socratic Hints (Appears only when user writes code) */}
        <div className="lg:col-span-5 space-y-5">
          {code.trim().length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 border border-white/10 text-center space-y-3 shadow-xl animate-in fade-in">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-400/20 backdrop-blur-md">
                <Lightbulb className="w-6 h-6 text-blue-500 dark:text-blue-300" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">No Code Entered Yet</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                Paste or write your {language === 'cpp' ? 'C++' : 'Python'} code in the editor on the left. Socratic hints will appear here as soon as you enter code.
              </p>
            </div>
          ) : (
            /* Socratic Hints Card */
            <div className="glass-panel rounded-2xl p-5 shadow-2xl border border-white/10 text-white animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-300 flex items-center justify-center border border-amber-500/30 backdrop-blur-md">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Socratic Hints</h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Revealed one at a time</p>
                  </div>
                </div>

                {/* Step indicator */}
                <div className="text-xs sm:text-sm font-bold px-3 py-1 rounded-xl glass-input text-blue-900 dark:text-blue-300 border border-blue-400/40 bg-blue-50 dark:bg-blue-950/40">
                  Hint {currentHintIndex + 1} of {hintsList.length}
                </div>
              </div>

              {/* Hint Progress Dots */}
              <div className="flex items-center gap-1.5 mt-4 mb-3">
                {hintsList.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (idx < revealedHintCount) {
                        setCurrentHintIndex(idx);
                      }
                    }}
                    disabled={idx >= revealedHintCount}
                    title={`Hint ${idx + 1}`}
                    className={`h-2.5 flex-1 rounded-full transition-all ${
                      idx === currentHintIndex
                        ? 'bg-blue-500 shadow-sm shadow-blue-500/50'
                        : idx < revealedHintCount
                        ? 'bg-blue-600/60 hover:bg-blue-500'
                        : 'bg-black/10 dark:bg-white/10 cursor-not-allowed'
                    }`}
                  />
                ))}
              </div>

              {/* Current Hint Display Box */}
              <div className="min-h-[140px] p-4.5 rounded-xl glass-input border border-white/10 flex flex-col justify-between my-4 shadow-inner">
                <div>
                  <div className="text-xs sm:text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Clue #{currentHintIndex + 1}</span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed font-sans">
                    {hintsList[currentHintIndex]}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  <span>
                    {revealedHintCount < hintsList.length
                      ? `${hintsList.length - revealedHintCount} more clue(s) available`
                      : 'All clues revealed'}
                  </span>
                  {analysis?.status === 'Error Found' && (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Error detected
                    </span>
                  )}
                </div>
              </div>

              {/* Hint Navigation Controls */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={prevHint}
                  disabled={currentHintIndex === 0}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 transition-colors border ${
                    currentHintIndex === 0
                      ? 'border-transparent text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      : 'glass-button text-slate-700 dark:text-slate-200 hover:text-black dark:hover:text-white cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                {currentHintIndex < hintsList.length - 1 ? (
                  <button
                    onClick={nextHint}
                    className="px-4.5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center gap-1.5 shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all cursor-pointer"
                  >
                    <span>
                      {currentHintIndex + 1 >= revealedHintCount ? 'Reveal Next Hint' : 'Next Hint'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="px-4.5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/25 border border-indigo-400/30 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{showExplanation ? 'Hide Concept' : 'Why Does This Happen?'}</span>
                  </button>
                )}
              </div>

              {/* Deep Conceptual Explanation (Toggled) */}
              {showExplanation && analysis && (
                <div className="mt-4 p-4 rounded-xl glass-input border border-blue-400/30 text-sm text-slate-800 dark:text-slate-200 space-y-2 animate-in fade-in">
                  <div className="font-bold text-blue-600 dark:text-blue-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span>In-Depth Explanation</span>
                  </div>
                  <p className="leading-relaxed">{analysis.explanation}</p>
                  <div className="pt-2 border-t border-black/10 dark:border-white/10">
                    <div className="font-semibold text-slate-800 dark:text-slate-300 mb-1">Key Takeaway:</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                      {analysis.learningTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* View Full Solution Button: In light mode, text is black as requested */}
              {analysis && (
                <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Still stuck after all hints?</span>
                  <button
                    onClick={() => setShowSolutionModal(true)}
                    className="reveal-code-btn text-sm font-bold text-black dark:text-amber-300 hover:text-slate-800 dark:hover:text-amber-200 underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-black dark:text-amber-300" /> Reveal Corrected Code
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Learning Tips Card in Glassmorphism */}
          <div className="glass-panel rounded-2xl p-4.5 border border-white/10 text-white shadow-xl">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span>Student Tips for {language === 'cpp' ? 'C++' : 'Python'}</span>
            </h3>
            <ul className="text-sm text-black dark:text-slate-300 space-y-2 list-disc list-inside">
              {language === 'cpp' ? (
                <>
                  <li className="text-black dark:text-slate-300">Every executable C++ program requires an <code className="text-black dark:text-blue-300 font-mono font-bold bg-slate-200/80 dark:bg-white/10 px-1 py-0.5 rounded">int main()</code> block.</li>
                  <li className="text-black dark:text-slate-300">Semicolons <code className="text-black dark:text-blue-300 font-mono font-bold bg-slate-200/80 dark:bg-white/10 px-1 py-0.5 rounded">;</code> mark the end of instructions inside function bodies.</li>
                  <li className="text-black dark:text-slate-300">Check line terminations right before the compiler diagnostic line.</li>
                </>
              ) : (
                <>
                  <li className="text-black dark:text-slate-300">Python uses 4 spaces for indentation instead of curly braces.</li>
                  <li className="text-black dark:text-slate-300">Clauses introducing code blocks (<code className="text-black dark:text-blue-300 font-mono font-bold bg-slate-200/80 dark:bg-white/10 px-1 py-0.5 rounded">if</code>, <code className="text-black dark:text-blue-300 font-mono font-bold bg-slate-200/80 dark:bg-white/10 px-1 py-0.5 rounded">for</code>, <code className="text-black dark:text-blue-300 font-mono font-bold bg-slate-200/80 dark:bg-white/10 px-1 py-0.5 rounded">def</code>) require a colon <code className="text-black dark:text-blue-300 font-mono font-bold bg-slate-200/80 dark:bg-white/10 px-1 py-0.5 rounded">:</code>.</li>
                  <li className="text-black dark:text-slate-300">Check spelling for built-in functions like <code className="text-black dark:text-blue-300 font-mono font-bold bg-slate-200/80 dark:bg-white/10 px-1 py-0.5 rounded">print</code> and variable names.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Corrected Code Modal (Glassmorphism) */}
      {showSolutionModal && analysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-white space-y-4 border border-white/20">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold">Corrected Solution</h3>
              </div>
              <button
                onClick={() => setShowSolutionModal(false)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-white/10"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Here is the corrected code that resolves the syntax and execution issues. Study the fix and compare it against your original code:
            </p>

            <div className="relative rounded-xl code-dark-bg border border-white/10 p-4 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre">
              {analysis.correctedCode}
              <button
                onClick={() => handleCopyCode(analysis.correctedCode)}
                className="absolute top-3 right-3 px-2 py-1 rounded-lg glass-button text-slate-200 text-xs flex items-center gap-1 border border-white/10 hover:border-white/20"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setCode(analysis.correctedCode);
                  setShowSolutionModal(false);
                  handleAnalyze(analysis.correctedCode, language, expectedOutput, true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all cursor-pointer"
              >
                Apply Corrected Code to Editor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

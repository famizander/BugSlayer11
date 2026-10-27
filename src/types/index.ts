export type Language = 'cpp' | 'python';

export type SubmissionStatus = 'Error Found' | 'Fixed' | 'No Errors';

export interface Submission {
  id: string;
  userId: string;
  title: string;
  language: Language;
  code: string;
  status: SubmissionStatus;
  timestamp: string; // ISO date or formatted
  compilerOutput: string;
  expectedOutput: string;
  actualOutput?: string;
  errorSummary: string;
  hints: string[];
  explanation: string;
  correctedCode: string;
  learningTips: string[];
  progressPercent?: number; // e.g. for progress bar in Recent page
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  plan: 'free' | 'premium';
  avatar?: string;
}

export type Theme = 'dark' | 'light';

export type ActivePage = 'solve' | 'recent' | 'account' | 'settings';

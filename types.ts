
export type QuizType = 'MCQ' | 'TRUE_FALSE' | 'FILL_BLANKS';
export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type UserRole = 'PROFESSEUR' | 'ETUDIANT';

export interface User {
  email: string;
  role: UserRole;
  name: string;
}

export interface Question {
  id: string;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface QuizResult {
  title: string;
  questions: Question[];
}

export interface GradingResult {
  grade: number;
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
  subject: string;
  level: string;
}

export interface Activity {
  id: string;
  type: 'QUIZ' | 'GRADING';
  date: string;
  title: string;
  score?: string;
}

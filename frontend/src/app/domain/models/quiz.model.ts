// Quiz Hub domain models — IDs are Guid (string) to match backend

export interface QuestionCategory {
  id: string;
  name: string;
  color: string;
  questionCount?: number;
}

export interface QuestionResponse {
  id: string;
  text: string;
  mainImg?: string;
  audio?: string;
  ansL: string;
  ansR: string;
  imgL?: string;
  imgR?: string;
  correctSide: 'L' | 'R';
  categoryId?: string;
  categoryName?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  explanation?: string;
  timesShown: number;
  timesCorrect: number;
  accuracyPct?: number;
  createdDate?: string;
}

export interface CreateQuestionRequest {
  text: string;
  mainImg?: string;
  audio?: string;
  ansL: string;
  ansR: string;
  imgL?: string;
  imgR?: string;
  correctSide: 'L' | 'R';
  categoryId?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  explanation?: string;
}

export interface UpdateQuestionRequest {
  text?: string;
  mainImg?: string;
  audio?: string;
  ansL?: string;
  ansR?: string;
  imgL?: string;
  imgR?: string;
  correctSide?: 'L' | 'R';
  categoryId?: string;
  difficulty?: string;
  points?: number;
  explanation?: string;
}

export interface QuestionFilterRequest {
  search?: string;
  categoryId?: string;
  difficulty?: string;
  page?: number;
  pageSize?: number;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface GameSummaryResponse {
  id: string;
  title: string;
  description?: string;
  questionCount: number;
  createdAt?: string;
  shufQ: boolean;
  shufA: boolean;
  bonusTime: boolean;
  streakBonus: boolean;
  wrongPenalty: number;
}

export interface GameDetailResponse extends GameSummaryResponse {
  questions: QuestionResponse[];
}

export interface GameQuestionItem {
  questionId: string;
  order: number;
}

export interface CreateGameRequest {
  title: string;
  description?: string;
  shufQ: boolean;
  shufA: boolean;
  bonusTime: boolean;
  streakBonus: boolean;
  wrongPenalty: number;
  questions: GameQuestionItem[];
}

export interface SaveSessionRequest {
  gameId: string;
  playerName: string;
  score: number;
  maxScore: number;
  correctCount: number;
  wrongCount: number;
  streakMax: number;
  totalTimeSeconds: number;
  details: SessionDetailItem[];
}

export interface SessionDetailItem {
  questionId: string;
  isCorrect: boolean;
  timeTakenMs: number;
  earnedPoints: number;
  chosenSide: 'L' | 'R';
}

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  maxScore: number;
  correctCount: number;
  wrongCount: number;
  streakMax: number;
  totalTimeSeconds: number;
  playedAt?: string;
}

export interface QuizStatsOverview {
  totalQuestions: number;
  totalGames: number;
  totalSessions: number;
  avgAccuracy: number;
  hardestQuestion?: string;
  easiestQuestion?: string;
}

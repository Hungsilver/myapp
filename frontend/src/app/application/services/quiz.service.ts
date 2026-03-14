import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { QuizApiService } from '../../infrastructure/api/quiz-api.service';
import {
  QuestionCategory,
  QuestionResponse,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  QuestionFilterRequest,
  BulkDeleteRequest,
  GameSummaryResponse,
  GameDetailResponse,
  CreateGameRequest,
  SaveSessionRequest,
  LeaderboardEntry,
  QuizStatsOverview
} from '../../domain/models/quiz.model';
import { ApiResponse } from '../../domain/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly api = inject(QuizApiService);

  // Categories
  getCategories() { return this.api.getCategories(); }
  createCategory(name: string, color: string) { return this.api.createCategory(name, color); }
  deleteCategory(id: string) { return this.api.deleteCategory(id); }

  // Questions
  getQuestions(filter: QuestionFilterRequest) { return this.api.getQuestions(filter); }
  getQuestion(id: string) { return this.api.getQuestion(id); }
  createQuestion(req: CreateQuestionRequest) { return this.api.createQuestion(req); }
  updateQuestion(id: string, req: UpdateQuestionRequest) { return this.api.updateQuestion(id, req); }
  deleteQuestion(id: string) { return this.api.deleteQuestion(id); }
  bulkDeleteQuestions(req: BulkDeleteRequest) { return this.api.bulkDeleteQuestions(req); }

  // Games
  getGames() { return this.api.getGames(); }
  getGame(id: string) { return this.api.getGame(id); }
  createGame(req: CreateGameRequest) { return this.api.createGame(req); }
  updateGame(id: string, req: CreateGameRequest) { return this.api.updateGame(id, req); }
  deleteGame(id: string) { return this.api.deleteGame(id); }

  // Sessions
  saveSession(req: SaveSessionRequest) { return this.api.saveSession(req); }
  getLeaderboard(gameId: string, top = 10) { return this.api.getLeaderboard(gameId, top); }

  // Stats
  getStats() { return this.api.getStats(); }
}

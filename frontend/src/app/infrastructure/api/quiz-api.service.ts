import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../domain/models/api-response.model';
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
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class QuizApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/quiz`;

  // ── Categories ──────────────────────────────────────────────────────────────
  getCategories(): Observable<ApiResponse<QuestionCategory[]>> {
    return this.http.get<ApiResponse<QuestionCategory[]>>(`${this.base}/categories`);
  }

  createCategory(name: string, color: string): Observable<ApiResponse<QuestionCategory>> {
    return this.http.post<ApiResponse<QuestionCategory>>(`${this.base}/categories`, { name, color });
  }

  deleteCategory(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/categories/${id}`);
  }

  // ── Questions ────────────────────────────────────────────────────────────────
  getQuestions(filter: QuestionFilterRequest): Observable<ApiResponse<QuestionResponse[]>> {
    let params = new HttpParams();
    if (filter.search)     params = params.set('search', filter.search);
    if (filter.categoryId) params = params.set('categoryId', filter.categoryId);
    if (filter.difficulty) params = params.set('difficulty', filter.difficulty);
    if (filter.page)       params = params.set('page', filter.page.toString());
    if (filter.pageSize)   params = params.set('pageSize', filter.pageSize.toString());
    return this.http.get<ApiResponse<QuestionResponse[]>>(`${this.base}/questions`, { params });
  }

  getQuestion(id: string): Observable<ApiResponse<QuestionResponse>> {
    return this.http.get<ApiResponse<QuestionResponse>>(`${this.base}/questions/${id}`);
  }

  createQuestion(req: CreateQuestionRequest): Observable<ApiResponse<QuestionResponse>> {
    return this.http.post<ApiResponse<QuestionResponse>>(`${this.base}/questions`, req);
  }

  updateQuestion(id: string, req: UpdateQuestionRequest): Observable<ApiResponse<QuestionResponse>> {
    return this.http.put<ApiResponse<QuestionResponse>>(`${this.base}/questions/${id}`, req);
  }

  deleteQuestion(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/questions/${id}`);
  }

  bulkDeleteQuestions(req: BulkDeleteRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.base}/questions/bulk-delete`, req);
  }

  // ── Games ─────────────────────────────────────────────────────────────────────
  getGames(): Observable<ApiResponse<GameSummaryResponse[]>> {
    return this.http.get<ApiResponse<GameSummaryResponse[]>>(`${this.base}/games`);
  }

  getGame(id: string): Observable<ApiResponse<GameDetailResponse>> {
    return this.http.get<ApiResponse<GameDetailResponse>>(`${this.base}/games/${id}`);
  }

  createGame(req: CreateGameRequest): Observable<ApiResponse<GameSummaryResponse>> {
    return this.http.post<ApiResponse<GameSummaryResponse>>(`${this.base}/games`, req);
  }

  updateGame(id: string, req: CreateGameRequest): Observable<ApiResponse<GameSummaryResponse>> {
    return this.http.put<ApiResponse<GameSummaryResponse>>(`${this.base}/games/${id}`, req);
  }

  deleteGame(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/games/${id}`);
  }

  // ── Sessions ──────────────────────────────────────────────────────────────────
  saveSession(req: SaveSessionRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.base}/sessions`, req);
  }

  // URL khớp controller: GET api/quiz/sessions/leaderboard/{gameId}
  getLeaderboard(gameId: string, top = 10): Observable<ApiResponse<LeaderboardEntry[]>> {
    return this.http.get<ApiResponse<LeaderboardEntry[]>>(
      `${this.base}/sessions/leaderboard/${gameId}`, { params: { top: top.toString() } }
    );
  }

  // ── Stats ─────────────────────────────────────────────────────────────────────
  // URL khớp controller: GET api/quiz/stats/overview
  getStats(): Observable<ApiResponse<QuizStatsOverview>> {
    return this.http.get<ApiResponse<QuizStatsOverview>>(`${this.base}/stats/overview`);
  }
}

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { QuizService } from '../../../application/services/quiz.service';
import { GameSummaryResponse, QuizStatsOverview } from '../../../domain/models/quiz.model';

@Component({
  selector: 'app-quiz-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="quiz-home">
      <!-- Hero -->
      <div class="hero">
        <div class="hero-content">
          <div class="hero-badge">🎮 Quiz Hub AI</div>
          <h1>Học thông minh<br><span class="gradient-text">với AI Head Tilt</span></h1>
          <p>Nghiêng đầu để trả lời — học tập vui hơn bao giờ hết!</p>
          <div class="hero-actions">
            <a routerLink="/quiz/bank" class="btn-primary">📚 Quản lý câu hỏi</a>
            <a routerLink="/quiz/editor" class="btn-secondary">+ Tạo game mới</a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="camera-demo">
            <div class="camera-circle">
              <span class="camera-icon">📷</span>
              <div class="tilt-arrows">
                <span class="arrow-left">←</span>
                <span class="arrow-right">→</span>
              </div>
            </div>
            <p class="demo-label">Nghiêng đầu để chọn đáp án</p>
          </div>
        </div>
      </div>

      <!-- Stats bar -->
      @if (stats()) {
        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-num">{{ stats()!.totalQuestions }}</span>
            <span class="stat-label">Câu hỏi</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">{{ stats()!.totalGames }}</span>
            <span class="stat-label">Bộ game</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">{{ stats()!.totalSessions }}</span>
            <span class="stat-label">Lượt chơi</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">{{ stats()!.avgAccuracy | number:'1.0-0' }}%</span>
            <span class="stat-label">Độ chính xác TB</span>
          </div>
        </div>
      }

      <!-- Game Library -->
      <div class="section">
        <div class="section-header">
          <h2>🎯 Bộ câu hỏi</h2>
          <a routerLink="/quiz/editor" class="btn-sm">+ Tạo mới</a>
        </div>

        @if (loading()) {
          <div class="loading-grid">
            @for (i of [1,2,3]; track i) {
              <div class="game-card skeleton"></div>
            }
          </div>
        } @else if (games().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">🎮</span>
            <p>Chưa có bộ game nào.</p>
            <a routerLink="/quiz/editor" class="btn-primary">Tạo bộ game đầu tiên</a>
          </div>
        } @else {
          <div class="games-grid">
            @for (game of games(); track game.id) {
              <div class="game-card">
                <div class="game-card-header">
                  <div class="game-icon">🧠</div>
                  <div class="game-meta">
                    <span class="q-count">{{ game.questionCount }} câu</span>
                    @if (game.bonusTime) { <span class="badge">⏱ Bonus</span> }
                    @if (game.streakBonus) { <span class="badge">🔥 Streak</span> }
                  </div>
                </div>
                <h3>{{ game.title }}</h3>
                @if (game.description) {
                  <p class="game-desc">{{ game.description }}</p>
                }
                <div class="game-footer">
                  <div class="game-actions">
                    <button class="icon-btn" title="Bảng xếp hạng" (click)="viewLeaderboard(game.id)">🏆</button>
                    <button class="icon-btn" title="Chỉnh sửa" (click)="editGame(game.id)">✏️</button>
                    <button class="icon-btn danger" title="Xóa" (click)="deleteGame(game.id)">🗑</button>
                  </div>
                </div>
                <button class="play-btn" (click)="playGame(game.id)">▶ Chơi ngay</button>
              </div>
            }
          </div>
        }
      </div>

      <!-- Quick links -->
      <div class="quick-links">
        <a routerLink="/quiz/stats" class="quick-link">
          <span>📊</span><span>Thống kê</span>
        </a>
        <a routerLink="/quiz/bank" class="quick-link">
          <span>📚</span><span>Ngân hàng câu hỏi</span>
        </a>
        <a routerLink="/quiz/editor" class="quick-link">
          <span>⚙️</span><span>Tạo game</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .quiz-home { padding-bottom: 60px; }
    .hero { display: flex; align-items: center; gap: 40px; padding: 60px 40px; background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); border-radius: 20px; margin-bottom: 30px; }
    .hero-content { flex: 1; }
    .hero-badge { display: inline-block; background: rgba(139,92,246,0.2); border: 1px solid #7c3aed; color: #a78bfa; padding: 6px 16px; border-radius: 20px; font-size: 13px; margin-bottom: 16px; }
    .hero-content h1 { font-size: 42px; font-weight: 800; color: #fff; margin: 0 0 16px; line-height: 1.2; }
    .gradient-text { background: linear-gradient(135deg, #7c3aed, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero-content p { color: #94a3b8; font-size: 18px; margin-bottom: 28px; }
    .hero-actions { display: flex; gap: 12px; }
    .btn-primary { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; transition: opacity 0.2s; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-secondary { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; transition: background 0.2s; }
    .btn-secondary:hover { background: rgba(255,255,255,0.15); }
    .hero-visual { flex: 0 0 200px; display: flex; justify-content: center; }
    .camera-circle { width: 140px; height: 140px; border-radius: 50%; background: rgba(139,92,246,0.15); border: 2px solid #7c3aed; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .camera-icon { font-size: 40px; }
    .tilt-arrows { display: flex; gap: 20px; margin-top: 8px; font-size: 20px; color: #a78bfa; }
    .demo-label { color: #64748b; font-size: 12px; text-align: center; margin-top: 10px; }
    .stats-bar { display: flex; gap: 20px; background: #1e1e2e; border-radius: 14px; padding: 20px 30px; margin-bottom: 30px; }
    .stat-item { flex: 1; text-align: center; }
    .stat-num { display: block; font-size: 28px; font-weight: 700; color: #a78bfa; }
    .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
    .section { margin-bottom: 40px; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .section-header h2 { font-size: 20px; font-weight: 700; color: #e2e8f0; margin: 0; }
    .btn-sm { background: rgba(124,58,237,0.2); color: #a78bfa; border: 1px solid #7c3aed; padding: 6px 16px; border-radius: 8px; text-decoration: none; font-size: 13px; }
    .btn-sm:hover { background: rgba(124,58,237,0.35); }
    .games-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .game-card { background: #1e1e2e; border: 1px solid #2d2d3d; border-radius: 14px; padding: 20px; transition: transform 0.2s, border-color 0.2s; display: flex; flex-direction: column; gap: 10px; }
    .game-card:hover { transform: translateY(-3px); border-color: #7c3aed; }
    .game-card-header { display: flex; align-items: center; justify-content: space-between; }
    .game-icon { font-size: 28px; }
    .game-meta { display: flex; gap: 6px; align-items: center; }
    .q-count { color: #64748b; font-size: 12px; }
    .badge { background: rgba(139,92,246,0.2); color: #a78bfa; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
    .game-card h3 { font-size: 16px; font-weight: 700; color: #e2e8f0; margin: 0; }
    .game-desc { color: #64748b; font-size: 13px; margin: 0; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
    .game-footer { display: flex; align-items: center; justify-content: flex-end; }
    .game-actions { display: flex; gap: 4px; }
    .icon-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 6px; border-radius: 6px; opacity: 0.7; transition: opacity 0.2s; }
    .icon-btn:hover { opacity: 1; background: rgba(255,255,255,0.05); }
    .icon-btn.danger:hover { background: rgba(239,68,68,0.15); }
    .play-btn { margin-top: 4px; padding: 10px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: opacity 0.2s; }
    .play-btn:hover { opacity: 0.9; }
    .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .skeleton { height: 220px; background: linear-gradient(90deg, #1e1e2e 25%, #2d2d3d 50%, #1e1e2e 75%); background-size: 200%; animation: shimmer 1.5s infinite; border-radius: 14px; border: 1px solid #2d2d3d; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .empty-state { text-align: center; padding: 60px 20px; }
    .empty-icon { font-size: 48px; display: block; margin-bottom: 12px; }
    .empty-state p { color: #64748b; margin-bottom: 20px; }
    .quick-links { display: flex; gap: 16px; }
    .quick-link { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px; background: #1e1e2e; border: 1px solid #2d2d3d; border-radius: 12px; text-decoration: none; color: #94a3b8; font-size: 14px; transition: all 0.2s; }
    .quick-link:hover { border-color: #7c3aed; color: #a78bfa; background: rgba(124,58,237,0.05); }
    .quick-link span:first-child { font-size: 24px; }
    @media (max-width: 768px) { .hero { flex-direction: column; padding: 30px 20px; } .hero-content h1 { font-size: 28px; } .hero-visual { display: none; } .stats-bar { flex-wrap: wrap; } .quick-links { flex-wrap: wrap; } }
  `]
})
export class QuizHomeComponent implements OnInit {
  private readonly quizService = inject(QuizService);
  private readonly router = inject(Router);

  games = signal<GameSummaryResponse[]>([]);
  stats = signal<QuizStatsOverview | null>(null);
  loading = signal(true);

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading.set(true);
    this.quizService.getGames().subscribe({
      next: res => { if (res.isSuccess) this.games.set(res.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.quizService.getStats().subscribe({
      next: res => { if (res.isSuccess) this.stats.set(res.data!); }
    });
  }

  playGame(id: string) { this.router.navigate(['/quiz/play', id]); }
  editGame(id: string) { this.router.navigate(['/quiz/editor', id]); }
  viewLeaderboard(id: string) { this.router.navigate(['/quiz/play', id], { queryParams: { leaderboard: 1 } }); }

  deleteGame(id: string) {
    if (!confirm('Xóa bộ game này?')) return;
    this.quizService.deleteGame(id).subscribe({
      next: res => { if (res.isSuccess) this.loadData(); }
    });
  }
}

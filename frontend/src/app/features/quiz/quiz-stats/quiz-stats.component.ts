import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { QuizService } from '../../../application/services/quiz.service';
import { QuizStatsOverview, QuestionResponse } from '../../../domain/models/quiz.model';

@Component({
  selector: 'app-quiz-stats',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="quiz-stats">
      <div class="page-header">
        <div>
          <a routerLink="/quiz" class="back-link">← Quiz Hub</a>
          <h1>📊 Thống kê</h1>
        </div>
      </div>

      @if (loading()) {
        <div class="loading">Đang tải...</div>
      } @else {
        @if (overview()) {
          <div class="overview-grid">
            <div class="ov-card">
              <div class="ov-icon">📝</div>
              <div class="ov-data"><span class="ov-num">{{ overview()!.totalQuestions }}</span><span class="ov-lbl">Câu hỏi</span></div>
            </div>
            <div class="ov-card">
              <div class="ov-icon">🎮</div>
              <div class="ov-data"><span class="ov-num">{{ overview()!.totalGames }}</span><span class="ov-lbl">Bộ game</span></div>
            </div>
            <div class="ov-card">
              <div class="ov-icon">🎯</div>
              <div class="ov-data"><span class="ov-num">{{ overview()!.totalSessions }}</span><span class="ov-lbl">Lượt chơi</span></div>
            </div>
            <div class="ov-card highlight">
              <div class="ov-icon">✨</div>
              <div class="ov-data"><span class="ov-num">{{ overview()!.avgAccuracy | number:'1.0-1' }}%</span><span class="ov-lbl">Chính xác TB</span></div>
            </div>
          </div>

          @if (overview()!.easiestQuestion || overview()!.hardestQuestion) {
            <div class="extremes">
              @if (overview()!.easiestQuestion) {
                <div class="extreme-card easy">
                  <span>🌟</span>
                  <div><div class="extreme-lbl">Câu dễ nhất</div><div class="extreme-text">{{ overview()!.easiestQuestion }}</div></div>
                </div>
              }
              @if (overview()!.hardestQuestion) {
                <div class="extreme-card hard">
                  <span>🔥</span>
                  <div><div class="extreme-lbl">Câu khó nhất</div><div class="extreme-text">{{ overview()!.hardestQuestion }}</div></div>
                </div>
              }
            </div>
          }
        }

        <div class="section">
          <h2>Độ chính xác từng câu hỏi</h2>
          @if (questions().length === 0) {
            <div class="empty">Chưa có dữ liệu thống kê (chưa có lượt chơi nào).</div>
          }
          <div class="q-bars">
            @for (q of questions(); track q.id) {
              <div class="q-bar-row">
                <div class="q-bar-label" [title]="q.text">{{ q.text | slice:0:50 }}{{ q.text.length > 50 ? '...' : '' }}</div>
                <div class="q-bar-track">
                  <div class="q-bar-fill" [style.width]="getAccuracy(q) + '%'" [class]="'diff-' + q.difficulty.toLowerCase()"></div>
                </div>
                <div class="q-bar-pct">{{ getAccuracy(q) | number:'1.0-0' }}%</div>
                <div class="q-bar-meta">{{ q.timesShown }} lần</div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .quiz-stats { padding: 24px 24px 60px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .back-link { color: #64748b; text-decoration: none; font-size: 13px; display: block; margin-bottom: 4px; }
    .back-link:hover { color: #a78bfa; }
    .page-header h1 { font-size: 24px; font-weight: 700; color: #e2e8f0; margin: 0; }
    .loading, .empty { text-align: center; color: #64748b; padding: 60px; }
    .overview-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .ov-card { background: #1e1e2e; border: 1px solid #2d2d3d; border-radius: 14px; padding: 20px; display: flex; align-items: center; gap: 16px; }
    .ov-card.highlight { border-color: #7c3aed; background: rgba(124,58,237,0.08); }
    .ov-icon { font-size: 32px; }
    .ov-num { display: block; font-size: 28px; font-weight: 800; color: #e2e8f0; }
    .ov-lbl { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .extremes { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .extreme-card { display: flex; gap: 16px; align-items: flex-start; padding: 16px 20px; border-radius: 12px; }
    .extreme-card.easy { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); }
    .extreme-card.hard { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); }
    .extreme-card > span { font-size: 24px; }
    .extreme-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px; }
    .extreme-text { color: #e2e8f0; font-size: 14px; }
    .section { background: #1e1e2e; border: 1px solid #2d2d3d; border-radius: 14px; padding: 24px; }
    .section h2 { font-size: 16px; font-weight: 600; color: #94a3b8; margin: 0 0 20px; text-transform: uppercase; letter-spacing: 0.5px; }
    .q-bars { display: flex; flex-direction: column; gap: 12px; }
    .q-bar-row { display: grid; grid-template-columns: 300px 1fr 55px 60px; align-items: center; gap: 12px; }
    .q-bar-label { color: #94a3b8; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .q-bar-track { height: 8px; background: #2d2d3d; border-radius: 4px; overflow: hidden; }
    .q-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s; min-width: 2px; }
    .q-bar-fill.diff-easy { background: linear-gradient(90deg, #22c55e, #4ade80); }
    .q-bar-fill.diff-medium { background: linear-gradient(90deg, #eab308, #facc15); }
    .q-bar-fill.diff-hard { background: linear-gradient(90deg, #ef4444, #f87171); }
    .q-bar-pct { color: #a78bfa; font-size: 13px; font-weight: 600; text-align: right; }
    .q-bar-meta { color: #475569; font-size: 12px; }
    @media (max-width: 768px) { .overview-grid { grid-template-columns: repeat(2,1fr); } .extremes { grid-template-columns: 1fr; } .q-bar-row { grid-template-columns: 1fr 80px; } .q-bar-label, .q-bar-meta { display: none; } }
  `]
})
export class QuizStatsComponent implements OnInit {
  private readonly quizService = inject(QuizService);

  overview  = signal<QuizStatsOverview | null>(null);
  questions = signal<QuestionResponse[]>([]);
  loading   = signal(true);

  ngOnInit() {
    this.quizService.getStats().subscribe(res => {
      if (res.isSuccess) this.overview.set(res.data!);
    });
    this.quizService.getQuestions({ pageSize: 500 }).subscribe({
      next: res => {
        if (res.isSuccess) {
          const played = (res.data ?? [])
            .filter(q => q.timesShown > 0)
            .sort((a, b) => this.getAccuracy(a) - this.getAccuracy(b));
          this.questions.set(played);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getAccuracy(q: QuestionResponse): number {
    return q.timesShown ? (q.timesCorrect / q.timesShown) * 100 : 0;
  }
}

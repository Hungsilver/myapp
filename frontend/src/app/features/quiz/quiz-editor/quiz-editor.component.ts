import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../../application/services/quiz.service';
import { QuestionCategory, QuestionResponse, GameDetailResponse, GameQuestionItem } from '../../../domain/models/quiz.model';

interface PickedQuestion {
  questionId: string;
  order: number;
  text: string;
  difficulty: string;
  points: number;
  ansL: string;
  ansR: string;
}

@Component({
  selector: 'app-quiz-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="quiz-editor">
      <div class="page-header">
        <div>
          <a routerLink="/quiz" class="back-link">← Quiz Hub</a>
          <h1>{{ editId() ? '✏️ Sửa game' : '🎮 Tạo game mới' }}</h1>
        </div>
        <div class="header-actions">
          <a routerLink="/quiz" class="btn-secondary">Hủy</a>
          <button class="btn-primary" (click)="save()" [disabled]="saving()">
            {{ saving() ? 'Đang lưu...' : 'Lưu game' }}
          </button>
        </div>
      </div>

      @if (error()) {
        <div class="alert-error">{{ error() }}</div>
      }

      <div class="editor-layout">
        <!-- Left: Config -->
        <div class="config-panel">
          <div class="panel-section">
            <h3>Thông tin cơ bản</h3>
            <div class="form-group">
              <label>Tên game *</label>
              <input [(ngModel)]="title" placeholder="Nhập tên bộ câu hỏi...">
            </div>
            <div class="form-group">
              <label>Mô tả</label>
              <textarea [(ngModel)]="description" rows="2" placeholder="Mô tả ngắn..."></textarea>
            </div>
          </div>

          <div class="panel-section">
            <h3>Cài đặt gameplay</h3>
            <div class="toggle-row">
              <label>🔀 Xáo trộn câu hỏi</label>
              <div class="toggle" [class.on]="shufQ" (click)="shufQ = !shufQ"><div class="thumb"></div></div>
            </div>
            <div class="toggle-row">
              <label>🔄 Xáo trộn đáp án</label>
              <div class="toggle" [class.on]="shufA" (click)="shufA = !shufA"><div class="thumb"></div></div>
            </div>
            <div class="toggle-row">
              <label>⏱ Thưởng điểm nhanh</label>
              <div class="toggle" [class.on]="bonusTime" (click)="bonusTime = !bonusTime"><div class="thumb"></div></div>
            </div>
            <div class="toggle-row">
              <label>🔥 Thưởng streak</label>
              <div class="toggle" [class.on]="streakBonus" (click)="streakBonus = !streakBonus"><div class="thumb"></div></div>
            </div>
            <div class="form-group" style="margin-top:12px">
              <label>Điểm phạt mỗi câu sai (0 = không phạt)</label>
              <input type="number" [(ngModel)]="wrongPenalty" min="0">
            </div>
          </div>

          <div class="panel-section">
            <h3>Câu hỏi đã thêm <span class="count-badge">{{ pickedQuestions.length }}</span></h3>
            @if (pickedQuestions.length === 0) {
              <div class="empty-hint">Chọn câu hỏi từ ngân hàng bên phải →</div>
            }
            @for (q of pickedQuestions; track q.questionId; let i = $index) {
              <div class="selected-q">
                <span class="q-num">{{ i + 1 }}</span>
                <span class="q-text-small">{{ q.text }}</span>
                <button class="remove-btn" (click)="removeQuestion(q.questionId)">✕</button>
              </div>
            }
          </div>
        </div>

        <!-- Right: Question Bank Picker -->
        <div class="bank-panel">
          <div class="bank-header">
            <h3>📚 Ngân hàng câu hỏi</h3>
            <div class="bank-filters">
              <input class="search-sm" placeholder="🔍 Tìm..." [(ngModel)]="bankSearch" (ngModelChange)="filterBank()">
              <select class="select-sm" [(ngModel)]="bankCategoryId" (ngModelChange)="filterBank()">
                <option value="">Tất cả</option>
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>
          </div>

          <div class="bank-list">
            @if (bankLoading()) {
              <div class="bank-loading">Đang tải...</div>
            }
            @for (q of bankFiltered(); track q.id) {
              <div class="bank-item" [class.picked]="isPicked(q.id)" (click)="togglePick(q)">
                <div class="bank-item-check">{{ isPicked(q.id) ? '✓' : '+' }}</div>
                <div class="bank-item-content">
                  <div class="bank-q-text">{{ q.text }}</div>
                  <div class="bank-q-meta">
                    <span class="diff-sm" [class]="'diff-' + q.difficulty.toLowerCase()">{{ q.difficulty }}</span>
                    <span class="cat-sm">{{ q.categoryName }}</span>
                    <span class="pts-sm">{{ q.points }}pt</span>
                  </div>
                </div>
              </div>
            }
            @if (!bankLoading() && bankFiltered().length === 0) {
              <div class="bank-loading">Không tìm thấy câu hỏi nào.</div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quiz-editor { padding-bottom: 60px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .back-link { color: #64748b; text-decoration: none; font-size: 13px; display: block; margin-bottom: 4px; }
    .back-link:hover { color: #a78bfa; }
    .page-header h1 { font-size: 24px; font-weight: 700; color: #e2e8f0; margin: 0; }
    .header-actions { display: flex; gap: 10px; }
    .btn-primary { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: rgba(255,255,255,0.07); color: #94a3b8; border: 1px solid #2d2d3d; padding: 10px 20px; border-radius: 8px; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; }
    .alert-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #f87171; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; }
    .editor-layout { display: grid; grid-template-columns: 380px 1fr; gap: 20px; height: calc(100vh - 180px); }
    .config-panel { display: flex; flex-direction: column; gap: 20px; overflow-y: auto; padding-right: 4px; }
    .panel-section { background: #1e1e2e; border: 1px solid #2d2d3d; border-radius: 12px; padding: 20px; }
    .panel-section h3 { font-size: 14px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
    .form-group label { color: #94a3b8; font-size: 13px; }
    .form-group input, .form-group textarea { background: #0f0f1a; border: 1px solid #2d2d3d; border-radius: 8px; color: #e2e8f0; padding: 10px 12px; font-size: 14px; font-family: inherit; }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #7c3aed; }
    .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1e1e2e; }
    .toggle-row label { color: #94a3b8; font-size: 14px; }
    .toggle { width: 44px; height: 24px; background: #2d2d3d; border-radius: 12px; cursor: pointer; position: relative; transition: background 0.2s; }
    .toggle.on { background: #7c3aed; }
    .thumb { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; background: #fff; border-radius: 50%; transition: left 0.2s; }
    .toggle.on .thumb { left: 23px; }
    .count-badge { background: #7c3aed; color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 10px; margin-left: 8px; }
    .empty-hint { color: #475569; font-size: 13px; text-align: center; padding: 20px; }
    .selected-q { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #1e1e2e; }
    .q-num { width: 24px; height: 24px; background: rgba(124,58,237,0.2); color: #a78bfa; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
    .q-text-small { flex: 1; color: #94a3b8; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .remove-btn { background: none; border: none; color: #475569; cursor: pointer; font-size: 14px; flex-shrink: 0; }
    .remove-btn:hover { color: #f87171; }
    .bank-panel { background: #1e1e2e; border: 1px solid #2d2d3d; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; }
    .bank-header { padding: 16px 20px; border-bottom: 1px solid #2d2d3d; }
    .bank-header h3 { font-size: 14px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px; }
    .bank-filters { display: flex; gap: 8px; }
    .search-sm { flex: 1; padding: 8px 12px; background: #0f0f1a; border: 1px solid #2d2d3d; border-radius: 8px; color: #e2e8f0; font-size: 13px; }
    .search-sm:focus { outline: none; border-color: #7c3aed; }
    .select-sm { padding: 8px 12px; background: #0f0f1a; border: 1px solid #2d2d3d; border-radius: 8px; color: #e2e8f0; font-size: 13px; }
    .bank-list { flex: 1; overflow-y: auto; }
    .bank-loading { text-align: center; color: #475569; padding: 40px; }
    .bank-item { display: flex; align-items: flex-start; gap: 12px; padding: 14px 20px; border-bottom: 1px solid #1a1a2e; cursor: pointer; transition: background 0.15s; }
    .bank-item:hover { background: rgba(124,58,237,0.06); }
    .bank-item.picked { background: rgba(124,58,237,0.12); }
    .bank-item-check { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #2d2d3d; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #64748b; flex-shrink: 0; transition: all 0.15s; }
    .bank-item.picked .bank-item-check { background: #7c3aed; border-color: #7c3aed; color: #fff; }
    .bank-item-content { flex: 1; min-width: 0; }
    .bank-q-text { color: #e2e8f0; font-size: 14px; margin-bottom: 6px; }
    .bank-q-meta { display: flex; gap: 8px; align-items: center; }
    .diff-sm { font-size: 11px; padding: 2px 8px; border-radius: 8px; font-weight: 600; }
    .diff-easy { background: rgba(34,197,94,0.15); color: #4ade80; }
    .diff-medium { background: rgba(234,179,8,0.15); color: #facc15; }
    .diff-hard { background: rgba(239,68,68,0.15); color: #f87171; }
    .cat-sm { color: #64748b; font-size: 12px; }
    .pts-sm { color: #a78bfa; font-size: 12px; }
    @media (max-width: 768px) { .editor-layout { grid-template-columns: 1fr; height: auto; } .bank-panel { height: 400px; } }
  `]
})
export class QuizEditorComponent implements OnInit {
  private readonly quizService = inject(QuizService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  editId = signal<string | null>(null);
  categories = signal<QuestionCategory[]>([]);
  allBank = signal<QuestionResponse[]>([]);
  bankFiltered = signal<QuestionResponse[]>([]);
  bankLoading = signal(false);
  saving = signal(false);
  error = signal('');

  title = '';
  description = '';
  shufQ = true;
  shufA = false;
  bonusTime = true;
  streakBonus = true;
  wrongPenalty = 0;
  bankSearch = '';
  bankCategoryId = '';

  pickedQuestions: PickedQuestion[] = [];

  ngOnInit() {
    this.loadCategories();
    this.loadBank();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.editId.set(id); this.loadGame(id); }
  }

  loadCategories() {
    this.quizService.getCategories().subscribe(res => {
      if (res.isSuccess) this.categories.set(res.data ?? []);
    });
  }

  loadBank() {
    this.bankLoading.set(true);
    this.quizService.getQuestions({ pageSize: 500 }).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.allBank.set(res.data ?? []);
          this.bankFiltered.set(res.data ?? []);
        }
        this.bankLoading.set(false);
      },
      error: () => this.bankLoading.set(false)
    });
  }

  loadGame(id: string) {
    this.quizService.getGame(id).subscribe(res => {
      if (!res.isSuccess || !res.data) return;
      const g = res.data;
      this.title = g.title;
      this.description = g.description ?? '';
      this.shufQ = g.shufQ;
      this.shufA = g.shufA;
      this.bonusTime = g.bonusTime;
      this.streakBonus = g.streakBonus;
      this.wrongPenalty = g.wrongPenalty;
      this.pickedQuestions = g.questions.map((q, i) => ({
        questionId: q.id, order: i + 1, text: q.text,
        difficulty: q.difficulty, points: q.points, ansL: q.ansL, ansR: q.ansR
      }));
    });
  }

  filterBank() {
    let list = this.allBank();
    if (this.bankSearch) {
      const s = this.bankSearch.toLowerCase();
      list = list.filter(q => q.text.toLowerCase().includes(s));
    }
    if (this.bankCategoryId) {
      list = list.filter(q => q.categoryId === this.bankCategoryId);
    }
    this.bankFiltered.set(list);
  }

  isPicked(id: string) { return this.pickedQuestions.some(q => q.questionId === id); }

  togglePick(q: QuestionResponse) {
    if (this.isPicked(q.id)) {
      this.pickedQuestions = this.pickedQuestions.filter(p => p.questionId !== q.id)
        .map((p, i) => ({ ...p, order: i + 1 }));
    } else {
      this.pickedQuestions = [...this.pickedQuestions, {
        questionId: q.id, order: this.pickedQuestions.length + 1,
        text: q.text, difficulty: q.difficulty, points: q.points, ansL: q.ansL, ansR: q.ansR
      }];
    }
  }

  removeQuestion(id: string) {
    this.pickedQuestions = this.pickedQuestions.filter(q => q.questionId !== id)
      .map((q, i) => ({ ...q, order: i + 1 }));
  }

  save() {
    if (!this.title.trim()) { this.error.set('Vui lòng nhập tên game.'); return; }
    if (this.pickedQuestions.length === 0) { this.error.set('Vui lòng chọn ít nhất 1 câu hỏi.'); return; }
    this.saving.set(true);
    this.error.set('');

    const req = {
      title: this.title, description: this.description,
      shufQ: this.shufQ, shufA: this.shufA,
      bonusTime: this.bonusTime, streakBonus: this.streakBonus, wrongPenalty: this.wrongPenalty,
      questions: this.pickedQuestions.map(q => ({ questionId: q.questionId, order: q.order })),
      inlineQuestions: []
    };

    const id = this.editId();
    const obs = id ? this.quizService.updateGame(id, req) : this.quizService.createGame(req);

    obs.subscribe({
      next: res => {
        this.saving.set(false);
        if (res.isSuccess) this.router.navigate(['/quiz']);
        else this.error.set(res.error ?? 'Lỗi không xác định');
      },
      error: () => { this.saving.set(false); this.error.set('Lỗi server.'); }
    });
  }
}

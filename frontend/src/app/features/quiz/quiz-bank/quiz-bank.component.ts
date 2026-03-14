import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { QuizService } from '../../../application/services/quiz.service';
import { QuestionCategory, QuestionResponse, CreateQuestionRequest, UpdateQuestionRequest } from '../../../domain/models/quiz.model';

@Component({
  selector: 'app-quiz-bank',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="quiz-bank">
      <div class="page-header">
        <div>
          <a routerLink="/quiz" class="back-link">← Quiz Hub</a>
          <h1>📚 Ngân hàng câu hỏi</h1>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" (click)="exportCsv()">⬇ Xuất CSV</button>
          <label class="btn-secondary" style="cursor:pointer">
            ⬆ Nhập CSV
            <input type="file" accept=".csv" style="display:none" (change)="importCsv($event)">
          </label>
          <button class="btn-primary" (click)="openForm()">+ Thêm câu hỏi</button>
        </div>
      </div>

      <div class="filter-bar">
        <input class="search-input" placeholder="🔍 Tìm kiếm..." [(ngModel)]="searchText" (ngModelChange)="onFilterChange()">
        <select class="select-input" [(ngModel)]="filterCategoryId" (ngModelChange)="onFilterChange()">
          <option value="">Tất cả danh mục</option>
          @for (cat of categories(); track cat.id) {
            <option [value]="cat.id">{{ cat.name }}</option>
          }
        </select>
        <select class="select-input" [(ngModel)]="filterDifficulty" (ngModelChange)="onFilterChange()">
          <option value="">Tất cả độ khó</option>
          <option value="Easy">Dễ</option>
          <option value="Medium">Trung bình</option>
          <option value="Hard">Khó</option>
        </select>
        @if (selectedIds().length > 0) {
          <button class="btn-danger" (click)="bulkDelete()">🗑 Xóa {{ selectedIds().length }} câu</button>
        }
      </div>

      <div class="table-wrapper">
        <table class="q-table">
          <thead>
            <tr>
              <th><input type="checkbox" (change)="toggleAll($event)"></th>
              <th>#</th>
              <th>Câu hỏi</th>
              <th>Danh mục</th>
              <th>Độ khó</th>
              <th>Điểm</th>
              <th>Độ chính xác</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            @if (loading()) {
              <tr><td colspan="8" class="loading-row">Đang tải...</td></tr>
            } @else if (questions().length === 0) {
              <tr><td colspan="8" class="empty-row">Không có câu hỏi nào</td></tr>
            }
            @for (q of questions(); track q.id; let idx = $index) {
              <tr [class.selected]="isSelected(q.id)">
                <td><input type="checkbox" [checked]="isSelected(q.id)" (change)="toggleSelect(q.id)"></td>
                <td class="idx-col">{{ (page - 1) * pageSize + idx + 1 }}</td>
                <td class="text-col">
                  <div class="q-text">{{ q.text }}</div>
                  <div class="q-answers">
                    <span class="ans-l">← {{ q.ansL }}</span> | <span class="ans-r">{{ q.ansR }} →</span>
                    <span class="correct-tag">✓ {{ q.correctSide === 'L' ? 'Trái' : 'Phải' }}</span>
                  </div>
                </td>
                <td><span class="cat-badge" [style.background]="getCatColor(q.categoryId)">{{ q.categoryName || '—' }}</span></td>
                <td><span class="diff-badge" [class]="'diff-' + q.difficulty.toLowerCase()">{{ diffLabel(q.difficulty) }}</span></td>
                <td class="center">{{ q.points }}</td>
                <td class="center">
                  <div class="accuracy-bar">
                    <div class="bar-fill" [style.width]="getAccuracy(q) + '%'"></div>
                    <span>{{ q.timesShown > 0 ? (getAccuracy(q) | number:'1.0-0') + '%' : '—' }}</span>
                  </div>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="icon-btn" (click)="openForm(q)">✏️</button>
                    <button class="icon-btn danger" (click)="deleteQuestion(q.id)">🗑</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button [disabled]="page <= 1" (click)="changePage(-1)">‹ Trước</button>
        <span>Trang {{ page }} / {{ totalPages }}</span>
        <button [disabled]="questions().length < pageSize" (click)="changePage(1)">Tiếp ›</button>
      </div>

      @if (showForm()) {
        <div class="modal-overlay" (click)="closeForm()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editingId() ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới' }}</h2>
              <button class="close-btn" (click)="closeForm()">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Nội dung câu hỏi *</label>
                <textarea [(ngModel)]="form.text" rows="3" placeholder="Nhập câu hỏi..."></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Danh mục *</label>
                  <select [(ngModel)]="form.categoryId">
                    <option value="">— Chọn danh mục —</option>
                    @for (cat of categories(); track cat.id) {
                      <option [value]="cat.id">{{ cat.name }}</option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label>Độ khó *</label>
                  <select [(ngModel)]="form.difficulty">
                    <option value="Easy">Dễ</option>
                    <option value="Medium">Trung bình</option>
                    <option value="Hard">Khó</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Điểm</label>
                  <input type="number" [(ngModel)]="form.points" min="1">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Đáp án TRÁI (←) *</label>
                  <input [(ngModel)]="form.ansL" placeholder="Đáp án bên trái">
                </div>
                <div class="form-group">
                  <label>Đáp án PHẢI (→) *</label>
                  <input [(ngModel)]="form.ansR" placeholder="Đáp án bên phải">
                </div>
              </div>
              <div class="form-group">
                <label>Đáp án đúng</label>
                <div class="correct-toggle">
                  <button [class.active]="form.correctSide === 'L'" (click)="form.correctSide = 'L'">← Trái</button>
                  <button [class.active]="form.correctSide === 'R'" (click)="form.correctSide = 'R'">Phải →</button>
                </div>
              </div>
              <div class="form-group">
                <label>Giải thích (tùy chọn)</label>
                <textarea [(ngModel)]="form.explanation" rows="2" placeholder="Giải thích đáp án..."></textarea>
              </div>
              @if (formError()) {
                <div class="form-error">{{ formError() }}</div>
              }
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeForm()">Hủy</button>
              <button class="btn-primary" (click)="saveQuestion()" [disabled]="saving()">
                {{ saving() ? 'Đang lưu...' : (editingId() ? 'Cập nhật' : 'Thêm mới') }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .quiz-bank { padding-bottom: 60px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .back-link { color: #64748b; text-decoration: none; font-size: 13px; display: block; margin-bottom: 4px; }
    .back-link:hover { color: #a78bfa; }
    .page-header h1 { font-size: 24px; font-weight: 700; color: #e2e8f0; margin: 0; }
    .header-actions { display: flex; gap: 10px; flex-shrink: 0; }
    .btn-primary { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn-secondary { background: rgba(255,255,255,0.07); color: #94a3b8; border: 1px solid #2d2d3d; padding: 10px 18px; border-radius: 8px; cursor: pointer; }
    .btn-danger { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); padding: 10px 18px; border-radius: 8px; cursor: pointer; }
    .filter-bar { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
    .search-input { flex: 1; min-width: 200px; padding: 10px 14px; background: #1e1e2e; border: 1px solid #2d2d3d; border-radius: 8px; color: #e2e8f0; font-size: 14px; }
    .search-input:focus { outline: none; border-color: #7c3aed; }
    .select-input { padding: 10px 14px; background: #1e1e2e; border: 1px solid #2d2d3d; border-radius: 8px; color: #e2e8f0; font-size: 14px; }
    .table-wrapper { overflow-x: auto; border-radius: 12px; border: 1px solid #2d2d3d; }
    .q-table { width: 100%; border-collapse: collapse; }
    .q-table th { padding: 12px 16px; background: #1a1a2e; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; border-bottom: 1px solid #2d2d3d; }
    .q-table td { padding: 12px 16px; border-bottom: 1px solid #1e1e2e; color: #94a3b8; font-size: 14px; vertical-align: middle; }
    .q-table tr:last-child td { border-bottom: none; }
    .q-table tr:hover td { background: rgba(124,58,237,0.04); }
    .q-table tr.selected td { background: rgba(124,58,237,0.08); }
    .loading-row, .empty-row { text-align: center; color: #475569; padding: 40px !important; }
    .idx-col { color: #475569; width: 40px; }
    .text-col { max-width: 280px; }
    .q-text { color: #e2e8f0; font-weight: 500; margin-bottom: 4px; }
    .q-answers { font-size: 12px; color: #64748b; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    .ans-l { color: #60a5fa; }
    .ans-r { color: #34d399; }
    .correct-tag { background: rgba(34,197,94,0.15); color: #4ade80; padding: 1px 6px; border-radius: 6px; font-size: 11px; }
    .center { text-align: center; }
    .cat-badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; color: #fff; opacity: 0.85; }
    .diff-badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 600; }
    .diff-easy { background: rgba(34,197,94,0.15); color: #4ade80; }
    .diff-medium { background: rgba(234,179,8,0.15); color: #facc15; }
    .diff-hard { background: rgba(239,68,68,0.15); color: #f87171; }
    .accuracy-bar { display: flex; align-items: center; gap: 8px; min-width: 80px; }
    .bar-fill { height: 6px; background: linear-gradient(90deg, #7c3aed, #06b6d4); border-radius: 3px; min-width: 2px; flex-shrink: 0; }
    .accuracy-bar span { font-size: 12px; color: #94a3b8; white-space: nowrap; }
    .row-actions { display: flex; gap: 4px; }
    .icon-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 6px; border-radius: 6px; opacity: 0.7; }
    .icon-btn:hover { opacity: 1; background: rgba(255,255,255,0.05); }
    .icon-btn.danger:hover { background: rgba(239,68,68,0.1); }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 20px; color: #64748b; }
    .pagination button { background: #1e1e2e; border: 1px solid #2d2d3d; color: #94a3b8; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
    .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal { background: #1a1a2e; border: 1px solid #2d2d3d; border-radius: 16px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #2d2d3d; }
    .modal-header h2 { color: #e2e8f0; font-size: 18px; margin: 0; }
    .close-btn { background: none; border: none; color: #64748b; font-size: 20px; cursor: pointer; }
    .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
    .modal-footer { padding: 16px 24px; border-top: 1px solid #2d2d3d; display: flex; gap: 10px; justify-content: flex-end; }
    .form-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .form-group label { color: #94a3b8; font-size: 13px; font-weight: 500; }
    .form-group input, .form-group select, .form-group textarea { background: #0f0f1a; border: 1px solid #2d2d3d; border-radius: 8px; color: #e2e8f0; padding: 10px 12px; font-size: 14px; font-family: inherit; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #7c3aed; }
    .form-row { display: flex; gap: 12px; }
    .correct-toggle { display: flex; gap: 8px; }
    .correct-toggle button { flex: 1; padding: 10px; background: #0f0f1a; border: 1px solid #2d2d3d; color: #64748b; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
    .correct-toggle button.active { background: rgba(124,58,237,0.2); border-color: #7c3aed; color: #a78bfa; }
    .form-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #f87171; padding: 10px 14px; border-radius: 8px; font-size: 13px; }
  `]
})
export class QuizBankComponent implements OnInit {
  private readonly quizService = inject(QuizService);

  questions = signal<QuestionResponse[]>([]);
  categories = signal<QuestionCategory[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  editingId = signal<string | null>(null);
  formError = signal('');
  selectedIds = signal<string[]>([]);

  page = 1;
  pageSize = 20;
  totalPages = 1;
  searchText = '';
  filterCategoryId = '';
  filterDifficulty = '';

  form: CreateQuestionRequest = this.emptyForm();

  ngOnInit() {
    this.loadCategories();
    this.loadQuestions();
  }

  emptyForm(): CreateQuestionRequest {
    return { text: '', ansL: '', ansR: '', correctSide: 'L', difficulty: 'Medium', points: 100 };
  }

  loadCategories() {
    this.quizService.getCategories().subscribe(res => {
      if (res.isSuccess) this.categories.set(res.data ?? []);
    });
  }

  loadQuestions() {
    this.loading.set(true);
    const filter = {
      search: this.searchText || undefined,
      categoryId: this.filterCategoryId || undefined,
      difficulty: this.filterDifficulty || undefined,
      page: this.page,
      pageSize: this.pageSize
    };
    this.quizService.getQuestions(filter).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.questions.set(res.data ?? []);
          this.totalPages = Math.max(1, Math.ceil((res.totalRecord ?? 0) / this.pageSize));
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange() { this.page = 1; this.loadQuestions(); }
  changePage(delta: number) { this.page += delta; this.loadQuestions(); }

  openForm(q?: QuestionResponse) {
    if (q) {
      this.editingId.set(q.id);
      this.form = {
        text: q.text, ansL: q.ansL, ansR: q.ansR, correctSide: q.correctSide,
        categoryId: q.categoryId, difficulty: q.difficulty, points: q.points, explanation: q.explanation
      };
    } else {
      this.editingId.set(null);
      this.form = this.emptyForm();
    }
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  saveQuestion() {
    if (!this.form.text.trim() || !this.form.ansL.trim() || !this.form.ansR.trim()) {
      this.formError.set('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    this.saving.set(true);
    this.formError.set('');

    const id = this.editingId();
    const obs = id
      ? this.quizService.updateQuestion(id, this.form as UpdateQuestionRequest)
      : this.quizService.createQuestion(this.form);

    obs.subscribe({
      next: res => {
        this.saving.set(false);
        if (res.isSuccess) { this.closeForm(); this.loadQuestions(); }
        else this.formError.set(res.error ?? 'Lỗi không xác định');
      },
      error: () => { this.saving.set(false); this.formError.set('Lỗi server.'); }
    });
  }

  deleteQuestion(id: string) {
    if (!confirm('Xóa câu hỏi này?')) return;
    this.quizService.deleteQuestion(id).subscribe(res => {
      if (res.isSuccess) this.loadQuestions();
    });
  }

  toggleSelect(id: string) {
    this.selectedIds.update(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  }
  isSelected(id: string) { return this.selectedIds().includes(id); }
  toggleAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedIds.set(checked ? this.questions().map(q => q.id) : []);
  }

  bulkDelete() {
    const ids = this.selectedIds();
    if (!confirm(`Xóa ${ids.length} câu hỏi đã chọn?`)) return;
    this.quizService.bulkDeleteQuestions({ ids }).subscribe(res => {
      if (res.isSuccess) { this.selectedIds.set([]); this.loadQuestions(); }
    });
  }

  getAccuracy(q: QuestionResponse): number {
    if (!q.timesShown) return 0;
    return (q.timesCorrect / q.timesShown) * 100;
  }

  getCatColor(id?: string): string {
    const cat = this.categories().find(c => c.id === id);
    return cat?.color ?? '#7c3aed';
  }

  diffLabel(d: string): string {
    return d === 'Easy' ? 'Dễ' : d === 'Medium' ? 'TB' : 'Khó';
  }

  exportCsv() {
    const rows = [['id', 'text', 'ansL', 'ansR', 'correctSide', 'category', 'difficulty', 'points', 'explanation']];
    this.questions().forEach(q => rows.push([
      q.id, q.text, q.ansL, q.ansR, q.correctSide,
      q.categoryName ?? '', q.difficulty, q.points.toString(), q.explanation ?? ''
    ]));
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'questions.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  importCsv(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string).replace(/^\uFEFF/, '');
      const lines = text.split('\n').slice(1);
      const requests: CreateQuestionRequest[] = [];
      for (const line of lines) {
        if (!line.trim()) continue;
        const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"'));
        const cat = this.categories().find(c => c.name === cols[5]);
        requests.push({
          text: cols[1], ansL: cols[2], ansR: cols[3],
          correctSide: cols[4] as 'L' | 'R', categoryId: cat?.id,
          difficulty: cols[6] as any, points: parseInt(cols[7]) || 100,
          explanation: cols[8]
        });
      }
      let done = 0;
      requests.forEach(r => this.quizService.createQuestion(r).subscribe(() => {
        done++;
        if (done === requests.length) this.loadQuestions();
      }));
    };
    reader.readAsText(file, 'utf-8');
  }
}

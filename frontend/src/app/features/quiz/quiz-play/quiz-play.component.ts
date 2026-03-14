import { Component, OnInit, OnDestroy, signal, computed, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../../application/services/quiz.service';
import { GameDetailResponse, QuestionResponse, LeaderboardEntry, SaveSessionRequest, SessionDetailItem } from '../../../domain/models/quiz.model';

type Screen = 'loading' | 'lobby' | 'camera-setup' | 'playing' | 'summary' | 'leaderboard';
type TiltDir = 'left' | 'right' | 'center';

interface PlayQuestion {
  q: QuestionResponse;
  displayLeft: string;
  displayRight: string;
}

interface SessionQ extends PlayQuestion {
  isCorrect: boolean;
  timeTakenMs: number;
  earnedPoints: number;
  chosenSide: 'L' | 'R' | null;
}

@Component({
  selector: 'app-quiz-play',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="quiz-play">

      <!-- Loading -->
      @if (screen() === 'loading') {
        <div class="center-screen">
          <div class="spinner"></div>
          <p>Đang tải game...</p>
        </div>
      }

      <!-- Lobby -->
      @if (screen() === 'lobby') {
        <div class="lobby">
          <div class="lobby-card">
            <div class="game-icon-big">🧠</div>
            <h1>{{ game()?.title }}</h1>
            @if (game()?.description) { <p class="game-desc">{{ game()?.description }}</p> }
            <div class="game-info-row">
              <span>📋 {{ playQuestions().length }} câu hỏi</span>
              @if (game()?.bonusTime) { <span>⏱ Bonus thời gian</span> }
              @if (game()?.streakBonus) { <span>🔥 Bonus streak</span> }
            </div>
            <div class="form-group">
              <label>Tên người chơi</label>
              <input [(ngModel)]="playerName" placeholder="Nhập tên..." maxlength="50" class="player-input">
            </div>
            <div class="lobby-actions">
              <a routerLink="/quiz" class="btn-back">← Quay lại</a>
              <button class="btn-play" (click)="startGame()">▶ Bắt đầu chơi</button>
            </div>
            <button class="btn-leaderboard" (click)="goLeaderboard()">🏆 Bảng xếp hạng</button>
          </div>
        </div>
      }

      <!-- Camera Setup -->
      @if (screen() === 'camera-setup') {
        <div class="camera-setup">
          <div class="setup-card">
            <h2>📷 Cài đặt camera</h2>
            <p>Cho phép truy cập camera để dùng tính năng nghiêng đầu</p>

            <!-- Container placeholder — video element thực được inject vào đây programmatically -->
            <div id="camera-preview-container" class="preview-container">
              @if (!cameraActive()) {
                <div class="preview-placeholder">
                  <span>📷</span>
                  <p>Đang khởi động camera...</p>
                </div>
              }
            </div>

            <!-- Tilt test indicator -->
            @if (cameraActive()) {
              <div class="tilt-test" [class]="'tilt-' + currentTilt()">
                <div class="tilt-bar">
                  <span class="tl">← TRÁI</span>
                  <div class="tilt-track">
                    <div class="tilt-knob" [class]="'knob-' + currentTilt()"></div>
                  </div>
                  <span class="tr">PHẢI →</span>
                </div>
                <p class="tilt-status">
                  @if (currentTilt() === 'center') { 😐 Nhìn thẳng }
                  @else if (currentTilt() === 'left') { 👈 Nghiêng TRÁI — sẽ chọn đáp án TRÁI }
                  @else { 👉 Nghiêng PHẢI — sẽ chọn đáp án PHẢI }
                </p>
              </div>
              <p class="setup-hint">Giữ nghiêng {{ TILT_HOLD_MS / 1000 }} giây để xác nhận đáp án. Ngưỡng: ±{{ TILT_THRESHOLD }}°</p>
            }

            <div class="setup-actions">
              <button class="btn-secondary" (click)="skipCamera()">Bỏ qua camera</button>
              <button class="btn-play" (click)="beginPlay()" [disabled]="!cameraActive()">
                {{ cameraActive() ? '✓ Sẵn sàng' : 'Đợi camera...' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Playing -->
      @if (screen() === 'playing') {
        <div class="playing-screen">
          <!-- Progress -->
          <div class="progress-header">
            <div class="progress-bar">
              <div class="progress-fill" [style.width]="progressPct() + '%'"></div>
            </div>
            <div class="hud">
              <span class="q-counter">{{ currentIdx() + 1 }} / {{ playQuestions().length }}</span>
              <span class="score-display">⭐ {{ totalScore() }}</span>
              @if (streak() >= 2) { <span class="streak-badge">🔥 ×{{ streak() }}</span> }
              @if (cameraActive()) {
                <span class="cam-indicator" [class]="'tilt-' + currentTilt()">
                  @if (currentTilt() === 'left')  { <span class="ci-left active">←</span><span class="ci-right">→</span> }
                  @else if (currentTilt() === 'right') { <span class="ci-left">←</span><span class="ci-right active">→</span> }
                  @else { <span class="ci-left">←</span><span class="ci-center">😐</span><span class="ci-right">→</span> }
                </span>
              }
            </div>
          </div>

          <!-- Timer -->
          <div class="timer-row">
            <div class="timer-ring" [class.timer-urgent]="timeLeft() <= 5">
              <svg viewBox="0 0 36 36" width="80">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2d2d3d" stroke-width="2.5"/>
                <circle cx="18" cy="18" r="15.9" fill="none"
                  [attr.stroke]="timeLeft() <= 5 ? '#ef4444' : '#7c3aed'"
                  stroke-width="2.5" stroke-dasharray="100"
                  [attr.stroke-dashoffset]="100 - timerPct()"
                  stroke-linecap="round" transform="rotate(-90 18 18)"/>
              </svg>
              <span class="timer-text">{{ timeLeft() }}</span>
            </div>
          </div>

          @if (currentPQ(); as pq) {
            <!-- Question -->
            <div class="question-box">
              @if (pq.q.mainImg) { <img class="q-img" [src]="pq.q.mainImg" alt=""> }
              <div class="q-text">{{ pq.q.text }}</div>
              <div class="diff-info">
                <span class="diff-badge" [class]="'diff-' + pq.q.difficulty.toLowerCase()">{{ pq.q.difficulty }}</span>
                <span class="pts-info">{{ pq.q.points }} điểm</span>
              </div>
            </div>

            <!-- Answers -->
            <div class="answers-row">
              <div class="answer-col"
                [class.highlight]="answerHighlight() === 'L'"
                [class.correct]="answerResult() === 'correct-L'"
                [class.wrong]="answerResult() === 'wrong-L'">
                <!-- Tilt progress bar khi đang hold -->
                @if (answerHighlight() === 'L' && !answered()) {
                  <div class="hold-bar"><div class="hold-fill" [style.animation-duration]="TILT_HOLD_MS + 'ms'"></div></div>
                }
                <div class="tilt-arrow">←</div>
                <div class="ans-text">{{ pq.displayLeft }}</div>
                @if (pq.q.imgL) { <img class="ans-img" [src]="pq.q.imgL" alt=""> }
                <button class="ans-btn" (click)="chooseAnswer('L')" [disabled]="answered()">
                  Nghiêng TRÁI / Nhấn
                </button>
              </div>

              <div class="vs-divider">VS</div>

              <div class="answer-col"
                [class.highlight]="answerHighlight() === 'R'"
                [class.correct]="answerResult() === 'correct-R'"
                [class.wrong]="answerResult() === 'wrong-R'">
                @if (answerHighlight() === 'R' && !answered()) {
                  <div class="hold-bar"><div class="hold-fill" [style.animation-duration]="TILT_HOLD_MS + 'ms'"></div></div>
                }
                <div class="tilt-arrow">→</div>
                <div class="ans-text">{{ pq.displayRight }}</div>
                @if (pq.q.imgR) { <img class="ans-img" [src]="pq.q.imgR" alt=""> }
                <button class="ans-btn" (click)="chooseAnswer('R')" [disabled]="answered()">
                  Nghiêng PHẢI / Nhấn
                </button>
              </div>
            </div>

            <!-- Feedback -->
            @if (answered()) {
              <div class="feedback" [class.correct]="lastCorrect()" [class.wrong]="!lastCorrect()">
                <span class="fb-icon">{{ lastCorrect() ? '✓' : '✗' }}</span>
                <div>
                  <div class="fb-msg">{{ lastCorrect() ? 'Chính xác! +' + lastPoints() + ' điểm' : 'Sai rồi!' }}</div>
                  @if (pq.q.explanation) { <div class="fb-explain">{{ pq.q.explanation }}</div> }
                </div>
              </div>
            }
          }
        </div>
      }

      <!-- Summary -->
      @if (screen() === 'summary') {
        <div class="summary-screen">
          <div class="summary-card">
            <div class="summary-icon">{{ accuracy() >= 80 ? '🏆' : accuracy() >= 50 ? '⭐' : '💪' }}</div>
            <h1>{{ playerName || 'Bạn' }} đã hoàn thành!</h1>
            <div class="score-big">{{ totalScore() }} <span class="score-max">/ {{ maxScore() }} điểm</span></div>
            <div class="stats-grid">
              <div class="stat-box"><span class="stat-val correct-color">{{ correctCount() }}</span><span class="stat-lbl">Đúng</span></div>
              <div class="stat-box"><span class="stat-val wrong-color">{{ wrongCount() }}</span><span class="stat-lbl">Sai</span></div>
              <div class="stat-box"><span class="stat-val">{{ accuracy() | number:'1.0-0' }}%</span><span class="stat-lbl">Chính xác</span></div>
              <div class="stat-box"><span class="stat-val">🔥{{ maxStreak() }}</span><span class="stat-lbl">Streak</span></div>
            </div>
            <div class="breakdown">
              <h3>Chi tiết từng câu</h3>
              @for (sq of sessionQuestions(); track sq.q.id) {
                <div class="breakdown-row" [class.correct]="sq.isCorrect" [class.wrong]="!sq.isCorrect && sq.chosenSide">
                  <span class="br-icon">{{ sq.isCorrect ? '✓' : (sq.chosenSide ? '✗' : '—') }}</span>
                  <span class="br-text">{{ sq.q.text }}</span>
                  <span class="br-pts">+{{ sq.earnedPoints }}</span>
                </div>
              }
            </div>
            <div class="summary-actions">
              <button class="btn-secondary" (click)="goLeaderboard()">🏆 Bảng xếp hạng</button>
              <button class="btn-play" (click)="restart()">🔄 Chơi lại</button>
              <a routerLink="/quiz" class="btn-back">← Về trang chủ</a>
            </div>
          </div>
        </div>
      }

      <!-- Leaderboard -->
      @if (screen() === 'leaderboard') {
        <div class="leaderboard-screen">
          <div class="lb-header">
            <button class="btn-secondary" (click)="screen.set(lastScreen())">← Quay lại</button>
            <h2>🏆 {{ game()?.title }}</h2>
          </div>
          <div class="lb-table">
            <div class="lb-row lb-head">
              <span>#</span><span>Người chơi</span><span>Điểm</span><span>Đúng</span><span>Streak</span><span>Thời gian</span>
            </div>
            @for (e of leaderboard(); track e.rank) {
              <div class="lb-row" [class.me]="e.playerName === playerName">
                <span>@if(e.rank===1){🥇}@else if(e.rank===2){🥈}@else if(e.rank===3){🥉}@else{{{e.rank}}}</span>
                <span>{{ e.playerName }}</span>
                <span class="lb-score">{{ e.score }}</span>
                <span class="correct-color">{{ e.correctCount }}</span>
                <span>🔥{{ e.streakMax }}</span>
                <span class="lb-time">{{ e.totalTimeSeconds }}s</span>
              </div>
            }
            @if (leaderboard().length === 0) {
              <div class="lb-empty">Chưa có lượt chơi nào</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .quiz-play { min-height: 100vh; padding: 0 24px; }
    .center-screen { display:flex; flex-direction:column; align-items:center; justify-content:center; height:80vh; color:#64748b; gap:16px; }
    .spinner { width:40px; height:40px; border:3px solid #2d2d3d; border-top-color:#7c3aed; border-radius:50%; animation:spin 0.8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }

    /* Lobby */
    .lobby { display:flex; align-items:center; justify-content:center; min-height:80vh; }
    .lobby-card { background:#1e1e2e; border:1px solid #2d2d3d; border-radius:20px; padding:40px; max-width:480px; width:100%; text-align:center; }
    .game-icon-big { font-size:56px; display:block; margin-bottom:16px; }
    .lobby-card h1 { font-size:28px; font-weight:800; color:#e2e8f0; margin:0 0 8px; }
    .game-desc { color:#64748b; margin:0 0 16px; }
    .game-info-row { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-bottom:24px; }
    .game-info-row span { background:rgba(124,58,237,0.15); color:#a78bfa; padding:4px 12px; border-radius:10px; font-size:13px; }
    .form-group { text-align:left; margin-bottom:20px; }
    .form-group label { display:block; color:#94a3b8; font-size:13px; margin-bottom:6px; }
    .player-input { width:100%; padding:12px; background:#0f0f1a; border:1px solid #2d2d3d; border-radius:10px; color:#e2e8f0; font-size:15px; text-align:center; box-sizing:border-box; }
    .player-input:focus { outline:none; border-color:#7c3aed; }
    .lobby-actions { display:flex; gap:12px; }
    .btn-back { flex:1; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.07); color:#94a3b8; border:1px solid #2d2d3d; padding:14px; border-radius:10px; text-decoration:none; font-weight:600; }
    .btn-play { flex:2; background:linear-gradient(135deg,#7c3aed,#4f46e5); color:#fff; border:none; padding:14px; border-radius:10px; font-size:16px; font-weight:700; cursor:pointer; }
    .btn-play:disabled { opacity:0.5; cursor:not-allowed; }
    .btn-leaderboard { margin-top:12px; width:100%; background:none; border:1px solid #2d2d3d; color:#64748b; padding:10px; border-radius:8px; cursor:pointer; }
    .btn-leaderboard:hover { border-color:#7c3aed; color:#a78bfa; }

    /* Camera Setup */
    .camera-setup { display:flex; align-items:center; justify-content:center; min-height:80vh; }
    .setup-card { background:#1e1e2e; border:1px solid #2d2d3d; border-radius:20px; padding:32px; max-width:460px; width:100%; text-align:center; }
    .setup-card h2 { color:#e2e8f0; margin:0 0 8px; }
    .setup-card > p { color:#64748b; margin-bottom:16px; }
    .preview-container { width:320px; height:240px; border-radius:12px; overflow:hidden; background:#0f0f1a; border:2px solid #2d2d3d; margin:0 auto 16px; position:relative; }
    .preview-placeholder { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:#475569; font-size:13px; gap:8px; }
    .preview-placeholder span { font-size:36px; }

    /* Tilt test */
    .tilt-test { margin-bottom:12px; }
    .tilt-bar { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
    .tl, .tr { color:#64748b; font-size:12px; font-weight:700; white-space:nowrap; }
    .tilt-track { flex:1; height:12px; background:#0f0f1a; border-radius:6px; position:relative; border:1px solid #2d2d3d; }
    .tilt-knob { position:absolute; top:50%; width:20px; height:20px; border-radius:50%; background:#7c3aed; transform:translate(-50%,-50%); transition:left 0.15s ease; left:50%; }
    .tilt-left  .tilt-knob { left:15%; background:#60a5fa; }
    .tilt-right .tilt-knob { left:85%; background:#34d399; }
    .tilt-status { font-size:14px; color:#94a3b8; margin:4px 0; min-height:20px; }
    .setup-hint { color:#475569; font-size:12px; margin-bottom:16px; }
    .setup-actions { display:flex; gap:10px; }
    .btn-secondary { flex:1; background:rgba(255,255,255,0.07); color:#94a3b8; border:1px solid #2d2d3d; padding:12px; border-radius:8px; cursor:pointer; font-size:14px; }

    /* Playing */
    .playing-screen { display:flex; flex-direction:column; min-height:100vh; padding:16px; gap:16px; }
    .progress-header { display:flex; flex-direction:column; gap:8px; }
    .progress-bar { height:4px; background:#2d2d3d; border-radius:2px; }
    .progress-fill { height:100%; background:linear-gradient(90deg,#7c3aed,#06b6d4); border-radius:2px; transition:width 0.3s; }
    .hud { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
    .q-counter { color:#64748b; font-size:14px; }
    .score-display { font-weight:700; color:#a78bfa; font-size:16px; }
    .streak-badge { background:rgba(249,115,22,0.2); color:#fb923c; padding:2px 10px; border-radius:10px; font-size:13px; font-weight:700; }
    /* Camera indicator in HUD */
    .cam-indicator { display:inline-flex; align-items:center; gap:6px; background:#1e1e2e; border:1px solid #2d2d3d; padding:4px 10px; border-radius:20px; font-size:16px; }
    .ci-left, .ci-right { color:#2d2d3d; transition:color 0.1s, font-size 0.1s; }
    .ci-center { color:#64748b; font-size:13px; }
    .ci-left.active { color:#60a5fa; font-size:22px; }
    .ci-right.active { color:#34d399; font-size:22px; }

    .timer-row { display:flex; justify-content:center; }
    .timer-ring { position:relative; display:inline-block; }
    .timer-ring.timer-urgent { animation:pulse 0.5s ease-in-out infinite; }
    @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
    .timer-text { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:18px; font-weight:700; color:#e2e8f0; }

    .question-box { background:#1e1e2e; border:1px solid #2d2d3d; border-radius:16px; padding:24px; text-align:center; }
    .q-img { max-height:160px; border-radius:8px; margin-bottom:12px; }
    .q-text { font-size:20px; font-weight:700; color:#e2e8f0; }
    .diff-info { display:flex; gap:10px; justify-content:center; margin-top:12px; align-items:center; }
    .diff-badge { font-size:12px; padding:2px 10px; border-radius:8px; font-weight:700; }
    .diff-easy { background:rgba(34,197,94,0.15); color:#4ade80; }
    .diff-medium { background:rgba(234,179,8,0.15); color:#facc15; }
    .diff-hard { background:rgba(239,68,68,0.15); color:#f87171; }
    .pts-info { color:#a78bfa; font-size:13px; }

    .answers-row { display:flex; gap:16px; align-items:stretch; }
    .answer-col { flex:1; background:#1e1e2e; border:2px solid #2d2d3d; border-radius:16px; padding:20px; display:flex; flex-direction:column; align-items:center; gap:12px; transition:all 0.2s; position:relative; overflow:hidden; }
    .answer-col.highlight { border-color:#7c3aed; background:rgba(124,58,237,0.08); }
    .answer-col.correct { border-color:#22c55e; background:rgba(34,197,94,0.08); }
    .answer-col.wrong { border-color:#ef4444; background:rgba(239,68,68,0.08); }

    /* Hold progress bar */
    .hold-bar { position:absolute; bottom:0; left:0; right:0; height:4px; background:#2d2d3d; }
    .hold-fill { height:100%; background:linear-gradient(90deg,#7c3aed,#06b6d4); animation:fillBar linear forwards; width:0; }
    @keyframes fillBar { from{width:0} to{width:100%} }

    .tilt-arrow { font-size:28px; color:#a78bfa; }
    .ans-text { font-size:16px; font-weight:600; color:#e2e8f0; text-align:center; }
    .ans-img { max-height:120px; border-radius:8px; }
    .ans-btn { padding:12px 20px; background:linear-gradient(135deg,#7c3aed,#4f46e5); color:#fff; border:none; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; width:100%; }
    .ans-btn:disabled { opacity:0.4; cursor:not-allowed; }
    .vs-divider { color:#2d2d3d; font-size:18px; font-weight:700; display:flex; align-items:center; flex-shrink:0; }

    .feedback { display:flex; gap:12px; align-items:flex-start; padding:16px; border-radius:12px; }
    .feedback.correct { background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); }
    .feedback.wrong { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); }
    .fb-icon { font-size:24px; }
    .fb-msg { font-weight:700; color:#e2e8f0; }
    .fb-explain { color:#94a3b8; font-size:13px; margin-top:4px; }

    /* Summary */
    .summary-screen { display:flex; justify-content:center; padding:40px 20px; }
    .summary-card { background:#1e1e2e; border:1px solid #2d2d3d; border-radius:20px; padding:40px; max-width:600px; width:100%; text-align:center; }
    .summary-icon { font-size:56px; display:block; margin-bottom:16px; }
    .summary-card h1 { font-size:24px; font-weight:800; color:#e2e8f0; margin:0 0 8px; }
    .score-big { font-size:48px; font-weight:900; color:#a78bfa; margin:8px 0 24px; }
    .score-max { font-size:20px; color:#475569; }
    .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
    .stat-box { background:#0f0f1a; border-radius:12px; padding:16px; }
    .stat-val { display:block; font-size:24px; font-weight:700; color:#e2e8f0; }
    .stat-lbl { font-size:12px; color:#64748b; }
    .correct-color { color:#4ade80; }
    .wrong-color { color:#f87171; }
    .breakdown { text-align:left; margin-bottom:24px; max-height:300px; overflow-y:auto; }
    .breakdown h3 { color:#94a3b8; font-size:14px; margin-bottom:12px; }
    .breakdown-row { display:flex; gap:10px; align-items:center; padding:8px 0; border-bottom:1px solid #1e1e2e; }
    .br-icon { width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; background:#2d2d3d; color:#64748b; flex-shrink:0; }
    .breakdown-row.correct .br-icon { background:rgba(34,197,94,0.15); color:#4ade80; }
    .breakdown-row.wrong .br-icon { background:rgba(239,68,68,0.15); color:#f87171; }
    .br-text { flex:1; color:#94a3b8; font-size:13px; }
    .br-pts { color:#a78bfa; font-size:13px; font-weight:600; }
    .summary-actions { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; }
    .summary-actions .btn-back { flex:0 0 auto; padding:12px 20px; }

    /* Leaderboard */
    .leaderboard-screen { padding:20px; max-width:700px; margin:0 auto; }
    .lb-header { display:flex; align-items:center; gap:16px; margin-bottom:20px; }
    .lb-header h2 { color:#e2e8f0; font-size:20px; margin:0; }
    .lb-table { background:#1e1e2e; border:1px solid #2d2d3d; border-radius:12px; overflow:hidden; }
    .lb-row { display:grid; grid-template-columns:50px 1fr 80px 60px 70px 70px; gap:8px; padding:12px 20px; align-items:center; border-bottom:1px solid #1a1a2e; color:#94a3b8; font-size:14px; }
    .lb-head { color:#475569; font-size:12px; text-transform:uppercase; }
    .lb-row:last-child { border-bottom:none; }
    .lb-row.me { background:rgba(124,58,237,0.1); }
    .lb-score { color:#a78bfa; font-weight:700; }
    .lb-time { color:#64748b; }
    .lb-empty { text-align:center; padding:40px; color:#475569; }
  `]
})
export class QuizPlayComponent implements OnInit, OnDestroy {
  private readonly quizService = inject(QuizService);
  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);
  private readonly zone        = inject(NgZone);

  // ── Constants ────────────────────────────────────────────────────────────────
  readonly TILT_THRESHOLD = 12;   // degrees — lower = more sensitive
  readonly TILT_HOLD_MS   = 800;  // hold duration before confirming answer
  readonly QUESTION_TIME  = 15;

  // ── State ─────────────────────────────────────────────────────────────────────
  screen        = signal<Screen>('loading');
  lastScreen    = signal<Screen>('lobby');
  game          = signal<GameDetailResponse | null>(null);
  playQuestions = signal<PlayQuestion[]>([]);
  sessionQuestions = signal<SessionQ[]>([]);
  leaderboard   = signal<LeaderboardEntry[]>([]);

  currentIdx      = signal(0);
  currentTilt     = signal<TiltDir>('center');
  answered        = signal(false);
  lastCorrect     = signal(false);
  lastPoints      = signal(0);
  totalScore      = signal(0);
  maxScore        = signal(0);
  streak          = signal(0);
  maxStreak       = signal(0);
  correctCount    = signal(0);
  wrongCount      = signal(0);
  timeLeft        = signal(this.QUESTION_TIME);
  cameraActive    = signal(false);
  answerHighlight = signal<'L' | 'R' | null>(null);
  answerResult    = signal('');

  playerName = '';

  // ── Computed ─────────────────────────────────────────────────────────────────
  progressPct = computed(() => ((this.currentIdx() + 1) / Math.max(1, this.playQuestions().length)) * 100);
  timerPct    = computed(() => (this.timeLeft() / this.QUESTION_TIME) * 100);
  accuracy    = computed(() => { const t = this.correctCount() + this.wrongCount(); return t ? (this.correctCount() / t) * 100 : 0; });
  currentPQ   = computed(() => this.playQuestions()[this.currentIdx()] ?? null);

  // ── Private ───────────────────────────────────────────────────────────────────
  private timerInterval?:   ReturnType<typeof setInterval>;
  private tiltHoldTimer?:   ReturnType<typeof setTimeout>;
  private lastTiltDir:      TiltDir = 'center';

  // Camera — imperative DOM, không dùng @ViewChild để tránh mất reference khi đổi screen
  private videoEl:      HTMLVideoElement | null = null;
  private mediaStream:  MediaStream | null = null;
  private faceMeshObj:  any = null;
  private cameraObj:    any = null;
  private rafHandle:    number | null = null;

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    const showLb = this.route.snapshot.queryParamMap.get('leaderboard');
    if (!id) { this.router.navigate(['/quiz']); return; }

    this.quizService.getGame(id).subscribe({
      next: res => {
        if (!res.isSuccess || !res.data) { this.router.navigate(['/quiz']); return; }
        const g = res.data;
        this.game.set(g);
        let qs = [...g.questions];
        if (g.shufQ) qs = this.shuffle(qs);
        this.playQuestions.set(qs.map(q => ({ q, displayLeft: q.ansL, displayRight: q.ansR })));
        this.maxScore.set(qs.reduce((s, q) => s + q.points * 2, 0));
        if (showLb) { this.loadLeaderboard(); this.screen.set('leaderboard'); }
        else this.screen.set('lobby');
      },
      error: () => this.router.navigate(['/quiz'])
    });
  }

  ngOnDestroy() {
    this.stopTimer();
    this.destroyCamera();
  }

  // ── Game flow ─────────────────────────────────────────────────────────────────
  startGame() {
    if (!this.playerName.trim()) this.playerName = 'Ẩn danh';
    this.screen.set('camera-setup');
    // Chờ DOM render xong rồi mới init camera
    setTimeout(() => this.initCamera(), 300);
  }

  skipCamera() {
    this.destroyCamera();
    this.cameraActive.set(false);
    this.beginPlay();
  }

  beginPlay() {
    this.screen.set('playing');
    this.currentIdx.set(0);
    this.totalScore.set(0);
    this.streak.set(0);
    this.maxStreak.set(0);
    this.correctCount.set(0);
    this.wrongCount.set(0);
    this.sessionQuestions.set(this.playQuestions().map(pq => ({
      ...pq, isCorrect: false, timeTakenMs: 0, earnedPoints: 0, chosenSide: null
    })));
    // Di chuyển video element sang overlay nhỏ (playing mode)
    this.positionVideoForPlaying();
    this.startQuestion();
  }

  startQuestion() {
    this.answered.set(false);
    this.answerResult.set('');
    this.answerHighlight.set(null);
    this.clearTiltHold();
    this.lastTiltDir = 'center';
    this.timeLeft.set(this.QUESTION_TIME);
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      const t = this.timeLeft() - 1;
      this.timeLeft.set(t);
      if (t <= 0) this.timeExpired();
    }, 1000);
  }

  timeExpired() {
    this.stopTimer();
    if (this.answered()) return;
    this.answered.set(true);
    this.lastCorrect.set(false);
    this.lastPoints.set(0);
    this.streak.set(0);
    this.wrongCount.update(n => n + 1);
    if (this.game()!.wrongPenalty > 0)
      this.totalScore.update(s => Math.max(0, s - this.game()!.wrongPenalty));
    setTimeout(() => this.nextQuestion(), 2000);
  }

  chooseAnswer(side: 'L' | 'R') {
    if (this.answered()) return;
    this.stopTimer();
    this.clearTiltHold();
    this.answered.set(true);

    const pq = this.playQuestions()[this.currentIdx()];
    const elapsed = (this.QUESTION_TIME - this.timeLeft()) * 1000;
    const isCorrect = side === pq.q.correctSide;
    const game = this.game()!;
    let pts = isCorrect ? pq.q.points : 0;

    if (isCorrect) {
      if (game.bonusTime) {
        if (elapsed < 2000)      pts = Math.round(pts * 1.5);
        else if (elapsed < 4000) pts = Math.round(pts * 1.25);
      }
      const newStreak = this.streak() + 1;
      this.streak.set(newStreak);
      if (newStreak > this.maxStreak()) this.maxStreak.set(newStreak);
      if (game.streakBonus) {
        if (newStreak >= 5)      pts = Math.round(pts * 2.0);
        else if (newStreak >= 3) pts = Math.round(pts * 1.5);
      }
      this.correctCount.update(n => n + 1);
      this.totalScore.update(s => s + pts);
      this.answerResult.set(`correct-${side}`);
    } else {
      this.streak.set(0);
      this.wrongCount.update(n => n + 1);
      if (game.wrongPenalty > 0) this.totalScore.update(s => Math.max(0, s - game.wrongPenalty));
      this.answerResult.set(`wrong-${side}`);
    }

    this.lastCorrect.set(isCorrect);
    this.lastPoints.set(pts);

    this.sessionQuestions.update(sqs => {
      const copy = [...sqs];
      copy[this.currentIdx()] = { ...copy[this.currentIdx()], isCorrect, timeTakenMs: elapsed, earnedPoints: pts, chosenSide: side };
      return copy;
    });

    setTimeout(() => this.nextQuestion(), 2000);
  }

  nextQuestion() {
    const next = this.currentIdx() + 1;
    if (next >= this.playQuestions().length) { this.endGame(); return; }
    this.currentIdx.set(next);
    this.startQuestion();
  }

  endGame() {
    this.stopTimer();
    this.destroyCamera();
    this.lastScreen.set('summary');
    const details: SessionDetailItem[] = this.sessionQuestions().map(sq => ({
      questionId: sq.q.id, isCorrect: sq.isCorrect, timeTakenMs: sq.timeTakenMs,
      earnedPoints: sq.earnedPoints, chosenSide: sq.chosenSide ?? 'L'
    }));
    const totalTime = this.sessionQuestions().reduce((s, sq) => s + sq.timeTakenMs / 1000, 0);
    const req: SaveSessionRequest = {
      gameId: this.game()!.id, playerName: this.playerName || 'Ẩn danh',
      score: this.totalScore(), maxScore: this.maxScore(),
      correctCount: this.correctCount(), wrongCount: this.wrongCount(),
      streakMax: this.maxStreak(), totalTimeSeconds: Math.round(totalTime), details
    };
    this.quizService.saveSession(req).subscribe();
    this.screen.set('summary');
  }

  restart() {
    this.destroyCamera();
    this.cameraActive.set(false);
    let qs = [...(this.game()?.questions ?? [])];
    if (this.game()?.shufQ) qs = this.shuffle(qs);
    this.playQuestions.set(qs.map(q => ({ q, displayLeft: q.ansL, displayRight: q.ansR })));
    this.screen.set('lobby');
  }

  goLeaderboard() {
    this.lastScreen.set(this.screen() as Screen);
    this.loadLeaderboard();
    this.screen.set('leaderboard');
  }

  loadLeaderboard() {
    const id = this.game()?.id;
    if (id) this.quizService.getLeaderboard(id).subscribe(res => {
      if (res.isSuccess) this.leaderboard.set(res.data ?? []);
    });
  }

  stopTimer() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = undefined; }
  }

  clearTiltHold() {
    if (this.tiltHoldTimer) { clearTimeout(this.tiltHoldTimer); this.tiltHoldTimer = undefined; }
  }

  shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

  // ── Camera — Imperative DOM ───────────────────────────────────────────────────
  /**
   * Tạo video element trực tiếp trên document.body.
   * Không dùng @ViewChild để tránh mất reference khi Angular đổi screen (destroy @if blocks).
   * Element này tồn tại suốt vòng đời gameplay.
   */
  async initCamera() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' }
      });

      // Tạo video element persistent trên body
      this.videoEl = document.createElement('video');
      this.videoEl.srcObject = this.mediaStream;
      this.videoEl.autoplay = true;
      this.videoEl.muted = true;
      this.videoEl.playsInline = true;
      this.videoEl.setAttribute('playsinline', '');
      document.body.appendChild(this.videoEl);
      await this.videoEl.play();

      // Đặt video vào preview container (camera-setup screen)
      this.positionVideoForSetup();
      this.zone.run(() => this.cameraActive.set(true));

      await this.startFaceMesh();
    } catch (err) {
      console.warn('Camera không khả dụng:', err);
      this.zone.run(() => this.cameraActive.set(false));
    }
  }

  /** Di chuyển video element vào container trong camera-setup card */
  private positionVideoForSetup() {
    if (!this.videoEl) return;
    const container = document.getElementById('camera-preview-container');
    if (container) {
      // Reset styles và append vào container
      this.videoEl.style.cssText = `
        width: 100%; height: 100%; object-fit: cover;
        transform: scaleX(-1); display: block; border-radius: 10px;
      `;
      container.appendChild(this.videoEl);
    }
  }

  /** Di chuyển video element sang floating overlay góc phải khi đang chơi */
  private positionVideoForPlaying() {
    if (!this.videoEl || !this.cameraActive()) return;
    this.videoEl.style.cssText = `
      position: fixed; bottom: 80px; right: 16px;
      width: 120px; height: 90px; border-radius: 10px;
      object-fit: cover; transform: scaleX(-1);
      border: 2px solid rgba(124,58,237,0.5);
      z-index: 50; opacity: 0.85;
    `;
    document.body.appendChild(this.videoEl); // move back to body
  }

  /** Khởi động MediaPipe FaceMesh từ CDN */
  async startFaceMesh() {
    try {
      // Load MediaPipe từ CDN (xem index.html)
      const loader = (window as any).__loadMediaPipe;
      if (typeof loader === 'function') await loader();

      const FaceMesh = (window as any).FaceMesh;
      const Camera   = (window as any).Camera;
      if (!FaceMesh || !Camera || !this.videoEl) {
        console.warn('MediaPipe chưa load hoặc video chưa sẵn sàng');
        return;
      }

      const faceMesh = new FaceMesh({
        locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`
      });
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: false,        // false = nhẹ hơn, đủ để detect tilt
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
      });
      faceMesh.onResults((r: any) => {
        // Chạy trong NgZone để signal updates trigger change detection
        this.zone.run(() => this.onFaceResults(r));
      });
      this.faceMeshObj = faceMesh;

      const camera = new Camera(this.videoEl, {
        onFrame: async () => {
          if (this.videoEl && this.faceMeshObj) {
            await this.faceMeshObj.send({ image: this.videoEl });
          }
        },
        width: 320, height: 240
      });
      camera.start();
      this.cameraObj = camera;
    } catch (err) {
      console.warn('FaceMesh không khả dụng:', err);
    }
  }

  /**
   * Xử lý kết quả nhận diện khuôn mặt.
   * Tính góc nghiêng đầu dựa vào landmark tai trái (234) và tai phải (454).
   * dy > 0 → nghiêng phải; dy < 0 → nghiêng trái.
   */
  onFaceResults(results: any) {
    if (!results.multiFaceLandmarks?.length) {
      this.currentTilt.set('center');
      this.clearTiltHold();
      return;
    }

    const lm       = results.multiFaceLandmarks[0];
    const leftEar  = lm[234];   // landmark tai trái
    const rightEar = lm[454];   // landmark tai phải

    // dy: chênh lệch chiều cao (normalized 0-1) giữa 2 tai × 100
    const dy = (rightEar.y - leftEar.y) * 100;
    // Camera trước mirror ảnh → đảo trái/phải so với tọa độ landmark
    const newTilt: TiltDir = dy > this.TILT_THRESHOLD ? 'left'
                           : dy < -this.TILT_THRESHOLD ? 'right'
                           : 'center';

    this.currentTilt.set(newTilt);

    // Chỉ trigger khi đang trong màn chơi và chưa trả lời
    if (this.screen() !== 'playing' || this.answered()) {
      this.clearTiltHold();
      this.answerHighlight.set(null);
      return;
    }

    if (newTilt === 'center') {
      // Trở về center → hủy hold timer
      this.answerHighlight.set(null);
      this.clearTiltHold();
      this.lastTiltDir = 'center';
      return;
    }

    const side: 'L' | 'R' = newTilt === 'left' ? 'L' : 'R';
    this.answerHighlight.set(side);

    // Tilt direction changed → reset hold timer
    if (newTilt !== this.lastTiltDir) {
      this.clearTiltHold();
      this.lastTiltDir = newTilt;
    }

    // Bắt đầu hold timer nếu chưa có
    if (!this.tiltHoldTimer) {
      this.tiltHoldTimer = setTimeout(() => {
        this.tiltHoldTimer = undefined;
        // Double-check: vẫn đang nghiêng cùng hướng, chưa trả lời, đang chơi
        if (this.currentTilt() === newTilt && !this.answered() && this.screen() === 'playing') {
          this.chooseAnswer(side);
        }
      }, this.TILT_HOLD_MS);
    }
  }

  destroyCamera() {
    this.clearTiltHold();
    this.cameraActive.set(false);
    // Dừng MediaPipe Camera loop
    try { this.cameraObj?.stop(); } catch {}
    this.cameraObj    = null;
    this.faceMeshObj  = null;
    // Dừng stream
    try { this.mediaStream?.getTracks().forEach(t => t.stop()); } catch {}
    this.mediaStream = null;
    // Xóa video element khỏi DOM
    try { this.videoEl?.remove(); } catch {}
    this.videoEl = null;
  }
}

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AiTool {
  name: string;
  description: string;
  url: string;
  gradient: string;
  icon: string;
  badge: 'free' | 'paid' | 'freemium';
  badgeLabel: string;
}

interface AiCategory {
  id: string;
  title: string;
  emoji: string;
  color: string;
  tools: AiTool[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    :host { display: block; }

    .home-wrapper {
      min-height: 100vh;
      background: #080810;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    /* HERO */
    .hero {
      padding: 56px 24px 60px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -200px;
      left: 50%;
      transform: translateX(-50%);
      width: 800px;
      height: 600px;
      background: radial-gradient(ellipse at center, rgba(102,126,234,0.15) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(102,126,234,0.15);
      border: 1px solid rgba(102,126,234,0.3);
      border-radius: 999px;
      padding: 6px 16px;
      font-size: 13px;
      color: #a78bfa;
      margin-bottom: 24px;
      font-weight: 500;
    }
    .hero h1 {
      font-size: clamp(36px, 6vw, 72px);
      font-weight: 800;
      line-height: 1.1;
      margin: 0 0 20px;
      letter-spacing: -2px;
    }
    .hero h1 .gradient-text {
      background: linear-gradient(135deg, #667eea 0%, #a78bfa 50%, #f472b6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero p {
      font-size: 18px;
      color: rgba(255,255,255,0.5);
      max-width: 560px;
      margin: 0 auto 40px;
      line-height: 1.7;
    }
    .search-bar {
      display: flex;
      align-items: center;
      max-width: 540px;
      margin: 0 auto;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 14px;
      padding: 4px 4px 4px 18px;
      transition: all 0.3s;
    }
    .search-bar:focus-within {
      border-color: rgba(102,126,234,0.5);
      background: rgba(255,255,255,0.07);
      box-shadow: 0 0 0 4px rgba(102,126,234,0.1);
    }
    .search-bar input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: white;
      font-size: 15px;
      padding: 10px 0;
    }
    .search-bar input::placeholder { color: rgba(255,255,255,0.3); }
    .search-btn {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none;
      border-radius: 10px;
      color: white;
      padding: 10px 20px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .search-btn:hover {
      opacity: 0.9;
      transform: scale(1.02);
    }
    .stats {
      display: flex;
      justify-content: center;
      gap: 48px;
      margin-top: 48px;
      padding: 28px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      max-width: 540px;
      margin-left: auto;
      margin-right: auto;
    }
    .stat {
      text-align: center;
    }
    .stat-num {
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .stat-label {
      font-size: 12px;
      color: rgba(255,255,255,0.4);
      margin-top: 4px;
    }

    /* FILTER TABS */
    .filter-section {
      padding: 20px 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .filter-tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .filter-tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.04);
      color: rgba(255,255,255,0.6);
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .filter-tab:hover {
      background: rgba(255,255,255,0.08);
      color: white;
      border-color: rgba(255,255,255,0.2);
    }
    .filter-tab.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-color: transparent;
      color: white;
      box-shadow: 0 4px 15px rgba(102,126,234,0.3);
    }

    /* CONTENT */
    .content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 12px 24px 80px;
    }

    /* CATEGORY SECTION */
    .category-section {
      margin-bottom: 56px;
    }
    .category-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .category-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }
    .category-title {
      font-size: 20px;
      font-weight: 700;
      color: white;
    }
    .category-count {
      margin-left: auto;
      font-size: 12px;
      color: rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.05);
      border-radius: 999px;
      padding: 4px 12px;
    }

    /* TOOLS GRID */
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
      gap: 14px;
    }

    /* TOOL CARD */
    .tool-card {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      text-decoration: none;
      display: block;
    }
    .tool-card:hover {
      transform: translateY(-6px) scale(1.02);
    }
    .card-bg {
      position: absolute;
      inset: 0;
      opacity: 0.12;
      transition: opacity 0.3s;
    }
    .tool-card:hover .card-bg {
      opacity: 0.2;
    }
    .card-border {
      position: absolute;
      inset: 0;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.08);
      transition: border-color 0.3s;
    }
    .tool-card:hover .card-border {
      border-color: rgba(255,255,255,0.2);
    }
    .card-content {
      position: relative;
      padding: 20px 16px 18px;
    }
    .card-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      margin-bottom: 14px;
      position: relative;
    }
    .card-icon::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 14px;
      opacity: 0.2;
    }
    .card-name {
      font-size: 15px;
      font-weight: 700;
      color: white;
      margin-bottom: 6px;
      line-height: 1.2;
    }
    .card-desc {
      font-size: 12px;
      color: rgba(255,255,255,0.45);
      line-height: 1.5;
      margin-bottom: 14px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .badge {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge.free {
      background: rgba(34,197,94,0.2);
      color: #4ade80;
      border: 1px solid rgba(34,197,94,0.3);
    }
    .badge.freemium {
      background: rgba(251,191,36,0.2);
      color: #fbbf24;
      border: 1px solid rgba(251,191,36,0.3);
    }
    .badge.paid {
      background: rgba(249,115,22,0.2);
      color: #fb923c;
      border: 1px solid rgba(249,115,22,0.3);
    }
    .visit-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      font-weight: 500;
      transition: all 0.2s;
    }
    .tool-card:hover .visit-btn {
      color: white;
    }
    .visit-arrow {
      transition: transform 0.2s;
    }
    .tool-card:hover .visit-arrow {
      transform: translateX(3px);
    }

    /* NO RESULTS */
    .no-results {
      text-align: center;
      padding: 16px 24px;
      color: rgba(255,255,255,0.3);
    }
    .no-results-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
    .no-results h3 {
      font-size: 20px;
      color: rgba(255,255,255,0.5);
      margin-bottom: 8px;
    }

    /* FOOTER */
    .home-footer {
      text-align: center;
      padding: 32px 24px;
      border-top: 1px solid rgba(255,255,255,0.05);
      color: rgba(255,255,255,0.3);
      font-size: 13px;
    }
  `],
  template: `
    <div class="home-wrapper">

      <!-- HERO -->
      <div class="hero">
        <div class="hero-badge">✦ Khám phá thế giới AI</div>
        <h1>Tổng hợp <span class="gradient-text">AI Tools</span><br>tốt nhất hiện nay</h1>
        <p>Khám phá và truy cập nhanh các công cụ AI hàng đầu thế giới. Được phân loại theo chức năng để dễ dàng tìm kiếm.</p>

        <div class="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm công cụ AI..."
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
          />
          <button class="search-btn">🔍 Tìm</button>
        </div>

        <div class="stats">
          <div class="stat">
            <div class="stat-num">{{ totalTools }}</div>
            <div class="stat-label">Công cụ AI</div>
          </div>
          <div class="stat">
            <div class="stat-num">{{ categories.length }}</div>
            <div class="stat-label">Danh mục</div>
          </div>
          <div class="stat">
            <div class="stat-num">{{ freeCount }}</div>
            <div class="stat-label">Dùng miễn phí</div>
          </div>
        </div>
      </div>

      <!-- FILTER TABS -->
      <div class="filter-section">
        <div class="filter-tabs">
          <button
            class="filter-tab"
            [class.active]="activeFilter() === 'all'"
            (click)="setFilter('all')"
          >✨ Tất cả</button>
          @for (cat of categories; track cat.id) {
            <button
              class="filter-tab"
              [class.active]="activeFilter() === cat.id"
              (click)="setFilter(cat.id)"
            >{{ cat.emoji }} {{ cat.title }}</button>
          }
        </div>
      </div>

      <!-- CONTENT -->
      <div class="content">
        @if (filteredCategories().length === 0) {
          <div class="no-results">
            <div class="no-results-icon">🔍</div>
            <h3>Không tìm thấy kết quả</h3>
            <p>Thử tìm kiếm với từ khóa khác</p>
          </div>
        }

        @for (category of filteredCategories(); track category.id) {
          <div class="category-section">
            <div class="category-header">
              <div class="category-icon" [style.background]="category.color + '22'">
                {{ category.emoji }}
              </div>
              <span class="category-title">{{ category.title }}</span>
              <span class="category-count">{{ category.tools.length }} công cụ</span>
            </div>

            <div class="tools-grid">
              @for (tool of category.tools; track tool.name) {
                <a
                  class="tool-card"
                  [href]="tool.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  [title]="tool.name"
                >
                  <div class="card-bg" [style.background]="tool.gradient"></div>
                  <div class="card-border"></div>
                  <div class="card-content">
                    <div class="card-icon" [style.background]="tool.gradient + '33'">
                      {{ tool.icon }}
                    </div>
                    <div class="card-name">{{ tool.name }}</div>
                    <div class="card-desc">{{ tool.description }}</div>
                    <div class="card-footer">
                      <span class="badge" [class]="tool.badge">{{ tool.badgeLabel }}</span>
                      <span class="visit-btn">Truy cập <span class="visit-arrow">→</span></span>
                    </div>
                  </div>
                </a>
              }
            </div>
          </div>
        }
      </div>

      <div class="home-footer">
        AI Tools Hub © 2025 — Tổng hợp các công cụ AI tốt nhất
      </div>
    </div>
  `
})
export class HomeComponent {
  searchQuery = '';
  activeFilter = signal<string>('all');

  categories: AiCategory[] = [
    {
      id: 'chat',
      title: 'Chat AI',
      emoji: '💬',
      color: '#10a37f',
      tools: [
        {
          name: 'ChatGPT',
          description: 'Trợ lý AI mạnh mẽ nhất từ OpenAI, hỗ trợ đa ngôn ngữ',
          url: 'https://chat.openai.com',
          gradient: 'linear-gradient(135deg, #10a37f, #1a7d64)',
          icon: '🤖',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Claude',
          description: 'AI an toàn và hữu ích từ Anthropic, giỏi phân tích văn bản',
          url: 'https://claude.ai',
          gradient: 'linear-gradient(135deg, #d97757, #c4613d)',
          icon: '✦',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Gemini',
          description: 'AI đa phương thức mạnh mẽ từ Google DeepMind',
          url: 'https://gemini.google.com',
          gradient: 'linear-gradient(135deg, #4285f4, #34a853)',
          icon: '♊',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Microsoft Copilot',
          description: 'Trợ lý AI tích hợp vào hệ sinh thái Microsoft 365',
          url: 'https://copilot.microsoft.com',
          gradient: 'linear-gradient(135deg, #7b68ee, #0078d4)',
          icon: '🪟',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Perplexity',
          description: 'AI tìm kiếm và trả lời câu hỏi theo thời gian thực',
          url: 'https://www.perplexity.ai',
          gradient: 'linear-gradient(135deg, #20b2aa, #008b8b)',
          icon: '🔎',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Grok',
          description: 'AI hài hước từ xAI (Elon Musk), truy cập dữ liệu X thời gian thực',
          url: 'https://grok.com',
          gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          icon: '⚡',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'DeepSeek',
          description: 'LLM mã nguồn mở hiệu suất cao từ Trung Quốc',
          url: 'https://chat.deepseek.com',
          gradient: 'linear-gradient(135deg, #4d6eff, #3050cc)',
          icon: '🐋',
          badge: 'free',
          badgeLabel: 'Miễn phí'
        },
        {
          name: 'Meta AI',
          description: 'AI từ Meta, tích hợp trong WhatsApp, Instagram, Messenger',
          url: 'https://www.meta.ai',
          gradient: 'linear-gradient(135deg, #0668e1, #054db3)',
          icon: '🌐',
          badge: 'free',
          badgeLabel: 'Miễn phí'
        },
      ]
    },
    {
      id: 'image',
      title: 'Tạo ảnh AI',
      emoji: '🎨',
      color: '#7c3aed',
      tools: [
        {
          name: 'Midjourney',
          description: 'Tạo ảnh nghệ thuật chất lượng cao, phong cách độc đáo nhất',
          url: 'https://www.midjourney.com',
          gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          icon: '🌌',
          badge: 'paid',
          badgeLabel: 'Trả phí'
        },
        {
          name: 'DALL-E 3',
          description: 'Tạo ảnh từ văn bản của OpenAI, tích hợp trong ChatGPT',
          url: 'https://chat.openai.com',
          gradient: 'linear-gradient(135deg, #10a37f, #0d8a6b)',
          icon: '🖼️',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Adobe Firefly',
          description: 'AI tạo ảnh an toàn bản quyền từ Adobe, tích hợp Photoshop',
          url: 'https://firefly.adobe.com',
          gradient: 'linear-gradient(135deg, #ff0000, #cc0000)',
          icon: '🔥',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Leonardo.ai',
          description: 'Nền tảng tạo ảnh AI cho game, art, sáng tạo thương mại',
          url: 'https://leonardo.ai',
          gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
          icon: '🦁',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Ideogram',
          description: 'Tạo ảnh AI với chữ viết chính xác, phong cách đa dạng',
          url: 'https://ideogram.ai',
          gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
          icon: '✏️',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Stable Diffusion',
          description: 'Model tạo ảnh mã nguồn mở, có thể chạy locally',
          url: 'https://stability.ai',
          gradient: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
          icon: '⚗️',
          badge: 'free',
          badgeLabel: 'Miễn phí'
        },
        {
          name: 'Flux',
          description: 'Model tạo ảnh mới nhất từ Black Forest Labs, chất lượng vượt trội',
          url: 'https://blackforestlabs.ai',
          gradient: 'linear-gradient(135deg, #1e293b, #0f172a)',
          icon: '🌊',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Canva AI',
          description: 'Thiết kế đồ họa tích hợp AI, dễ dùng cho người không chuyên',
          url: 'https://www.canva.com',
          gradient: 'linear-gradient(135deg, #00c4cc, #7d2ae8)',
          icon: '🎭',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
      ]
    },
    {
      id: 'video',
      title: 'Tạo video AI',
      emoji: '🎬',
      color: '#f97316',
      tools: [
        {
          name: 'Sora',
          description: 'Tạo video từ text của OpenAI, chất lượng điện ảnh',
          url: 'https://sora.com',
          gradient: 'linear-gradient(135deg, #10a37f, #0d8a6b)',
          icon: '🎥',
          badge: 'paid',
          badgeLabel: 'Trả phí'
        },
        {
          name: 'Runway',
          description: 'Studio AI tạo và chỉnh sửa video chuyên nghiệp',
          url: 'https://runwayml.com',
          gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          icon: '🚀',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Pika',
          description: 'Tạo và chỉnh sửa video AI đơn giản và sáng tạo',
          url: 'https://pika.art',
          gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)',
          icon: '⚡',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'HeyGen',
          description: 'Tạo video avatar AI, nhân bản giọng nói, phù hợp marketing',
          url: 'https://www.heygen.com',
          gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
          icon: '👤',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Kling AI',
          description: 'Video AI chất lượng cao từ Kuaishou, hỗ trợ video dài',
          url: 'https://klingai.com',
          gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
          icon: '🎞️',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Veo 2',
          description: 'Model tạo video AI của Google DeepMind, siêu thực',
          url: 'https://deepmind.google/technologies/veo',
          gradient: 'linear-gradient(135deg, #4285f4, #1a73e8)',
          icon: '🌀',
          badge: 'paid',
          badgeLabel: 'Trả phí'
        },
        {
          name: 'Luma Dream Machine',
          description: 'Tạo video AI từ ảnh và text, chuyển động mượt mà',
          url: 'https://lumalabs.ai/dream-machine',
          gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
          icon: '💫',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Invideo AI',
          description: 'Tạo video marketing, YouTube từ script, có template đa dạng',
          url: 'https://invideo.io',
          gradient: 'linear-gradient(135deg, #06b6d4, #0284c7)',
          icon: '📹',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
      ]
    },
    {
      id: 'presentation',
      title: 'Thuyết trình & Slides',
      emoji: '📊',
      color: '#0ea5e9',
      tools: [
        {
          name: 'Gamma',
          description: 'Tạo slide, tài liệu, trang web đẹp bằng AI chỉ trong vài giây',
          url: 'https://gamma.app',
          gradient: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
          icon: '✨',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Beautiful.ai',
          description: 'Tạo slide chuyên nghiệp tự động căn chỉnh bố cục',
          url: 'https://www.beautiful.ai',
          gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
          icon: '💎',
          badge: 'paid',
          badgeLabel: 'Trả phí'
        },
        {
          name: 'Tome',
          description: 'Kể chuyện tương tác với AI, format mới thay thế PowerPoint',
          url: 'https://tome.app',
          gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          icon: '📖',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Slides AI',
          description: 'Tạo Google Slides tự động từ văn bản hoặc ý tưởng',
          url: 'https://www.slidesai.io',
          gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
          icon: '📑',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Copilot in PPT',
          description: 'Microsoft Copilot tích hợp trực tiếp trong PowerPoint 365',
          url: 'https://www.microsoft.com/en-us/microsoft-365/copilot',
          gradient: 'linear-gradient(135deg, #d97706, #b45309)',
          icon: '🪟',
          badge: 'paid',
          badgeLabel: 'Trả phí'
        },
        {
          name: 'Decktopus',
          description: 'Nền tảng AI tạo presentation đẹp mắt, có template phong phú',
          url: 'https://www.decktopus.com',
          gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)',
          icon: '🎯',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
      ]
    },
    {
      id: 'excel',
      title: 'Excel & Dữ liệu',
      emoji: '📈',
      color: '#22c55e',
      tools: [
        {
          name: 'Julius AI',
          description: 'Phân tích dữ liệu, vẽ biểu đồ, trả lời câu hỏi từ file CSV/Excel',
          url: 'https://julius.ai',
          gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          icon: '📊',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Sheet AI',
          description: 'Thêm AI vào Google Sheets, tạo công thức và phân tích tự động',
          url: 'https://sheetai.app',
          gradient: 'linear-gradient(135deg, #16a34a, #15803d)',
          icon: '📋',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Rows',
          description: 'Bảng tính thế hệ mới tích hợp AI và kết nối API trực tiếp',
          url: 'https://rows.com',
          gradient: 'linear-gradient(135deg, #6366f1, #4338ca)',
          icon: '🔢',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Copilot in Excel',
          description: 'Phân tích, tóm tắt, vẽ biểu đồ tự động với AI trong Excel 365',
          url: 'https://www.microsoft.com/en-us/microsoft-365/copilot',
          gradient: 'linear-gradient(135deg, #059669, #047857)',
          icon: '🪟',
          badge: 'paid',
          badgeLabel: 'Trả phí'
        },
        {
          name: 'Quadratic',
          description: 'Bảng tính AI kết hợp Python, phân tích dữ liệu mạnh mẽ',
          url: 'https://www.quadratichq.com',
          gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          icon: '🐍',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
      ]
    },
    {
      id: 'llm',
      title: 'Nền tảng LLM',
      emoji: '🧠',
      color: '#f59e0b',
      tools: [
        {
          name: 'Hugging Face',
          description: 'Kho model AI lớn nhất thế giới, host và chạy mọi model mã nguồn mở',
          url: 'https://huggingface.co',
          gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
          icon: '🤗',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Groq',
          description: 'Inference AI cực nhanh, chạy Llama/Mixtral tốc độ token/s cao nhất',
          url: 'https://groq.com',
          gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
          icon: '⚡',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Together AI',
          description: 'Cloud inference cho các model mã nguồn mở, API tương thích OpenAI',
          url: 'https://www.together.ai',
          gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
          icon: '🔗',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Replicate',
          description: 'Chạy model AI trên cloud, API đơn giản, thanh toán theo lượng dùng',
          url: 'https://replicate.com',
          gradient: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
          icon: '♻️',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Ollama',
          description: 'Chạy LLM locally trên máy tính cá nhân, hỗ trợ Llama, Mistral',
          url: 'https://ollama.com',
          gradient: 'linear-gradient(135deg, #1e293b, #334155)',
          icon: '🦙',
          badge: 'free',
          badgeLabel: 'Miễn phí'
        },
        {
          name: 'OpenRouter',
          description: 'API gateway tổng hợp 200+ model AI từ nhiều nhà cung cấp',
          url: 'https://openrouter.ai',
          gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          icon: '🛣️',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Anthropic API',
          description: 'API Claude cho developers, an toàn và mạnh mẽ cho enterprise',
          url: 'https://console.anthropic.com',
          gradient: 'linear-gradient(135deg, #d97757, #b45309)',
          icon: '✦',
          badge: 'paid',
          badgeLabel: 'Trả phí'
        },
        {
          name: 'Mistral AI',
          description: 'Model LLM châu Âu hiệu suất cao, cân bằng tốc độ và chất lượng',
          url: 'https://mistral.ai',
          gradient: 'linear-gradient(135deg, #f97316, #c2410c)',
          icon: '🌪️',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
      ]
    },
    {
      id: 'code',
      title: 'Code AI',
      emoji: '💻',
      color: '#6366f1',
      tools: [
        {
          name: 'GitHub Copilot',
          description: 'Trợ lý code AI trong VS Code, JetBrains, tích hợp GitHub',
          url: 'https://github.com/features/copilot',
          gradient: 'linear-gradient(135deg, #24292e, #1a1f24)',
          icon: '🐙',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Cursor',
          description: 'IDE AI mạnh nhất, chat với codebase, edit toàn dự án',
          url: 'https://cursor.sh',
          gradient: 'linear-gradient(135deg, #000000, #1a1a1a)',
          icon: '|',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Claude Code',
          description: 'CLI AI của Anthropic, lập trình toàn dự án qua terminal',
          url: 'https://claude.ai/code',
          gradient: 'linear-gradient(135deg, #d97757, #b45309)',
          icon: '✦',
          badge: 'paid',
          badgeLabel: 'Trả phí'
        },
        {
          name: 'Codeium',
          description: 'Autocomplete code AI miễn phí, hỗ trợ 70+ ngôn ngữ lập trình',
          url: 'https://codeium.com',
          gradient: 'linear-gradient(135deg, #09b6a2, #0d9488)',
          icon: '🌟',
          badge: 'free',
          badgeLabel: 'Miễn phí'
        },
        {
          name: 'Tabnine',
          description: 'AI code completion, hỗ trợ chạy locally bảo mật cho doanh nghiệp',
          url: 'https://www.tabnine.com',
          gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          icon: '📦',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'v0 by Vercel',
          description: 'Tạo UI components React/Next.js từ mô tả, export code ngay',
          url: 'https://v0.dev',
          gradient: 'linear-gradient(135deg, #000000, #171717)',
          icon: '△',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Bolt.new',
          description: 'Tạo ứng dụng web full-stack từ mô tả, deploy ngay lập tức',
          url: 'https://bolt.new',
          gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
          icon: '⚡',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Lovable',
          description: 'Tạo web app đầy đủ tính năng từ mô tả bằng ngôn ngữ tự nhiên',
          url: 'https://lovable.dev',
          gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
          icon: '❤️',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
      ]
    },
    {
      id: 'audio',
      title: 'Âm thanh & Giọng nói',
      emoji: '🎵',
      color: '#ec4899',
      tools: [
        {
          name: 'ElevenLabs',
          description: 'Chuyển văn bản thành giọng nói siêu thực, nhân bản giọng nói',
          url: 'https://elevenlabs.io',
          gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          icon: '🎙️',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Suno',
          description: 'Tạo bài nhạc hoàn chỉnh từ text, có lời và nhạc nền',
          url: 'https://suno.ai',
          gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
          icon: '🎶',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Udio',
          description: 'Tạo nhạc AI chất lượng cao, đa thể loại, tùy biến sâu',
          url: 'https://www.udio.com',
          gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
          icon: '🎸',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Murf AI',
          description: 'Giọng đọc AI chuyên nghiệp cho video, podcast, e-learning',
          url: 'https://murf.ai',
          gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          icon: '🔊',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Whisper',
          description: 'Nhận diện giọng nói mã nguồn mở từ OpenAI, hỗ trợ 99 ngôn ngữ',
          url: 'https://openai.com/research/whisper',
          gradient: 'linear-gradient(135deg, #10a37f, #0d8a6b)',
          icon: '🌬️',
          badge: 'free',
          badgeLabel: 'Miễn phí'
        },
        {
          name: 'Adobe Podcast',
          description: 'Nâng cao chất lượng âm thanh AI, khử tiếng ồn siêu sạch',
          url: 'https://podcast.adobe.com',
          gradient: 'linear-gradient(135deg, #ff0000, #cc0000)',
          icon: '🎧',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
      ]
    },
    {
      id: 'writing',
      title: 'Viết lách & Nội dung',
      emoji: '✍️',
      color: '#14b8a6',
      tools: [
        {
          name: 'Jasper AI',
          description: 'Viết nội dung marketing, blog, quảng cáo chuyên nghiệp',
          url: 'https://www.jasper.ai',
          gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
          icon: '🖊️',
          badge: 'paid',
          badgeLabel: 'Trả phí'
        },
        {
          name: 'Copy.ai',
          description: 'Tạo copy quảng cáo, email, mô tả sản phẩm nhanh chóng',
          url: 'https://www.copy.ai',
          gradient: 'linear-gradient(135deg, #6366f1, #4338ca)',
          icon: '📝',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Notion AI',
          description: 'AI tích hợp trong Notion, viết, tóm tắt, dịch nội dung',
          url: 'https://www.notion.so/product/ai',
          gradient: 'linear-gradient(135deg, #000000, #1a1a1a)',
          icon: '📒',
          badge: 'paid',
          badgeLabel: 'Trả phí'
        },
        {
          name: 'Grammarly',
          description: 'Kiểm tra ngữ pháp, cải thiện văn phong tiếng Anh với AI',
          url: 'https://www.grammarly.com',
          gradient: 'linear-gradient(135deg, #15c39a, #0fa37e)',
          icon: '✅',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'Writesonic',
          description: 'Tạo bài viết SEO, blog dài, nội dung marketing đa dạng',
          url: 'https://writesonic.com',
          gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          icon: '🚀',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
        {
          name: 'DeepL',
          description: 'Dịch thuật AI chính xác nhất, hỗ trợ 30+ ngôn ngữ',
          url: 'https://www.deepl.com',
          gradient: 'linear-gradient(135deg, #0f4c81, #0a3460)',
          icon: '🌍',
          badge: 'freemium',
          badgeLabel: 'Freemium'
        },
      ]
    },
  ];

  get totalTools(): number {
    return this.categories.reduce((sum, cat) => sum + cat.tools.length, 0);
  }

  get freeCount(): number {
    return this.categories.reduce((sum, cat) =>
      sum + cat.tools.filter(t => t.badge === 'free').length, 0
    );
  }

  filteredCategories = signal<AiCategory[]>(this.categories);

  setFilter(id: string): void {
    this.activeFilter.set(id);
    this._applyFilter();
  }

  onSearch(): void {
    this._applyFilter();
  }

  private _applyFilter(): void {
    const q = this.searchQuery.trim().toLowerCase();
    const filter = this.activeFilter();

    let cats = this.categories;
    if (filter !== 'all') {
      cats = cats.filter(c => c.id === filter);
    }

    if (q) {
      cats = cats.map(cat => ({
        ...cat,
        tools: cat.tools.filter(t =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
        )
      })).filter(cat => cat.tools.length > 0);
    }

    this.filteredCategories.set(cats);
  }
}

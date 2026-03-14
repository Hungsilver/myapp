import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'products',
    // Private: not shown in navbar, access by direct URL only
    loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  // Quiz Hub routes
  {
    path: 'quiz',
    loadComponent: () => import('./features/quiz/quiz-home/quiz-home.component').then(m => m.QuizHomeComponent)
  },
  {
    path: 'quiz/bank',
    loadComponent: () => import('./features/quiz/quiz-bank/quiz-bank.component').then(m => m.QuizBankComponent),
    canActivate: [authGuard]
  },
  {
    path: 'quiz/editor',
    loadComponent: () => import('./features/quiz/quiz-editor/quiz-editor.component').then(m => m.QuizEditorComponent),
    canActivate: [authGuard]
  },
  {
    path: 'quiz/editor/:id',
    loadComponent: () => import('./features/quiz/quiz-editor/quiz-editor.component').then(m => m.QuizEditorComponent),
    canActivate: [authGuard]
  },
  {
    path: 'quiz/play/:id',
    loadComponent: () => import('./features/quiz/quiz-play/quiz-play.component').then(m => m.QuizPlayComponent)
  },
  {
    path: 'quiz/stats',
    loadComponent: () => import('./features/quiz/quiz-stats/quiz-stats.component').then(m => m.QuizStatsComponent)
  },
  { path: '**', redirectTo: '' }
];

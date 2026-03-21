import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-12">
      <div class="relative">
        <div class="text-3xl font-bold tracking-tight text-amber-600 mb-4 animate-pulse">
          coolinaa
        </div>
        <div class="flex justify-center">
          <div class="spinner"></div>
        </div>
      </div>
      <p class="text-sm text-stone-500 mt-6">Загрузка...</p>
    </div>
  `,
  styles: [`
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #f5f5f4;
      border-top-color: #d97706;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class LoadingSpinnerComponent {}

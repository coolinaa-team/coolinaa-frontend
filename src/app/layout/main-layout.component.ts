import { Component, inject, computed, effect } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroHome,
  heroSparkles,
  heroArchiveBox,
  heroUserCircle,
  heroArrowRightOnRectangle
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIconComponent],
  providers: [provideIcons({ heroHome, heroSparkles, heroArchiveBox, heroUserCircle, heroArrowRightOnRectangle })],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-amber-100 text-stone-900 flex flex-col">
      @if (!isAdmin()) {
        <header class="px-4 py-3 flex items-center justify-between">
          <a routerLink="/feed" class="text-lg font-semibold tracking-tight hover:text-amber-700 transition cursor-pointer">coolinaa</a>
          <a routerLink="/recipes/create" class="text-sm px-3 py-1 rounded-full bg-amber-600 text-white font-semibold shadow-lg shadow-amber-200/60">
            Добавить рецепт
          </a>
        </header>

        <main class="flex-1 px-4 pb-16">
          <router-outlet></router-outlet>
        </main>

        <nav class="fixed bottom-3 inset-x-3 bg-white/90 backdrop-blur rounded-2xl shadow-xl shadow-amber-200/70 border border-stone-200 px-4 py-2 flex justify-between text-sm">
          <a routerLink="/feed" routerLinkActive="text-amber-700" class="py-2 flex flex-col items-center gap-1 text-stone-600">
            <ng-icon name="heroHome" size="20"></ng-icon>
            <span class="sr-only">Лента</span>
          </a>
          <a routerLink="/match" routerLinkActive="text-amber-700" class="py-2 flex flex-col items-center gap-1 text-stone-600">
            <ng-icon name="heroSparkles" size="20"></ng-icon>
            <span class="sr-only">Подбор</span>
          </a>
          <a routerLink="/fridge" routerLinkActive="text-amber-700" class="py-2 flex flex-col items-center gap-1 text-stone-600">
            <ng-icon name="heroArchiveBox" size="20"></ng-icon>
            <span class="sr-only">Холодильник</span>
          </a>
          <a routerLink="/profile" routerLinkActive="text-amber-700" class="py-2 flex flex-col items-center gap-1 text-stone-600">
            <ng-icon name="heroUserCircle" size="20"></ng-icon>
            <span class="sr-only">Профиль</span>
          </a>
        </nav>
      } @else {
        <header class="px-4 py-3 flex items-center justify-between bg-white/80 backdrop-blur shadow">
          <div class="text-lg font-semibold tracking-tight">coolinaa <span class="text-amber-600">Admin</span></div>
          <button (click)="logout()" class="text-sm px-3 py-1 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition flex items-center gap-2">
            <ng-icon name="heroArrowRightOnRectangle" size="16"></ng-icon>
            Выход
          </button>
        </header>

        <main class="flex-1 px-4 py-6">
          <router-outlet></router-outlet>
        </main>
      }
    </div>
  `
})
export class MainLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  
  protected readonly isAdmin = computed(() => this.auth.user()?.role === 'admin');

  constructor() {
    effect(() => {
      const user = this.auth.user();
      const currentUrl = this.router.url;
      
      if (user && user.role === 'admin' && !currentUrl.startsWith('/admin')) {
        this.router.navigate(['/admin']);
      } else if (user && user.role !== 'admin' && currentUrl.startsWith('/admin')) {
        this.router.navigate(['/feed']);
      }
    });
  }

  logout() {
    this.auth.logout();
  }
}

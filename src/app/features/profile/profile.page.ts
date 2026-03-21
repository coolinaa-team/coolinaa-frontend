import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="space-y-4">
      <div>
        <h1 class="text-2xl font-semibold">Профиль</h1>
        <p class="text-sm text-stone-500">Управление аккаунтом и настройками.</p>
      </div>

      <a routerLink="/profile/my-recipes" class="block rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-rose-50 p-4 hover:shadow-lg hover:shadow-amber-200/50 transition">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-stone-900">📖 Мои рецепты</h3>
            <p class="text-sm text-stone-600 mt-1">Просмотр и управление вашими рецептами</p>
          </div>
          <svg class="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </a>

      <div class="rounded-2xl border border-stone-200 bg-white/90 p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-stone-500">Аккаунт</p>
            <p class="text-lg font-semibold text-stone-900">{{ user()?.username || '—' }}</p>
            <p class="text-sm text-stone-600">{{ user()?.email || 'Email не указан' }}</p>
          </div>
          <button
            class="px-3 py-2 rounded-xl bg-accent-600 text-white text-sm font-semibold"
            (click)="logout()"
          >
            Выйти
          </button>
        </div>
        <div class="grid gap-2 sm:grid-cols-2 text-sm text-stone-700">
          <div class="flex justify-between bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
            <span>Роль</span>
            <span class="font-medium">{{ user()?.role || 'Пользователь' }}</span>
          </div>
          <div class="flex justify-between bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
            <span>Создан</span>
            <span>{{ (user()?.createdAt | date: 'dd.MM.yyyy') || '—' }}</span>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ProfilePage {
  private readonly auth = inject(AuthService);
  protected user = this.auth.user;

  protected logout() {
    this.auth.logout();
  }
}

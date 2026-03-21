import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-amber-100 text-stone-900 flex items-center justify-center px-4">
      <div class="w-full max-w-md bg-white/90 border border-stone-200 rounded-2xl p-6 shadow-soft">
        <h1 class="text-xl font-semibold mb-4">Добро пожаловать</h1>
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AuthLayoutComponent {}

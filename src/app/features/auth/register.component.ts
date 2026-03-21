import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <form class="space-y-4" [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="space-y-2">
        <label class="block text-sm text-stone-700">Имя пользователя</label>
        <input
          class="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 focus:outline-none focus:border-emerald-400"
          formControlName="username"
          type="text"
          placeholder="chef123"
        />
      </div>
      <div class="space-y-2">
        <label class="block text-sm text-stone-700">Email</label>
        <input
          class="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 focus:outline-none focus:border-emerald-400"
          formControlName="email"
          type="email"
          placeholder="you@example.com"
        />
      </div>
      <div class="space-y-2">
        <label class="block text-sm text-stone-700">Пароль</label>
        <input
          class="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 focus:outline-none focus:border-emerald-400"
          formControlName="password"
          type="password"
          placeholder="********"
        />
      </div>
      <button
        type="submit"
        class="w-full rounded-xl bg-accent-600 text-white font-semibold py-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        [disabled]="form.invalid || loading"
      >
        {{ loading ? 'Создаем...' : 'Создать аккаунт' }}
      </button>
      <p *ngIf="error" class="text-sm text-red-500 text-center">{{ error }}</p>
      <p class="text-sm text-stone-500 text-center">
        Уже есть аккаунт?
        <a routerLink="/auth/login" class="text-accent-800">Войти</a>
      </p>
    </form>
  `
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading = false;
  error = '';

  onSubmit() {
    if (this.form.invalid || this.loading) return;
    const { username, email, password } = this.form.value;
    this.loading = true;
    this.error = '';
    this.auth
      .register(username!, email!, password!)
      .pipe(
        catchError(() => {
          this.error = 'Unable to create account. Please try again.';
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((res) => {
        if (res) {
          this.router.navigate(['/feed']);
        }
      });
  }
}

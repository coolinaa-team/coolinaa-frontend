import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <form class="space-y-4" [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="space-y-2">
        <label class="block text-sm text-stone-700">Email или имя</label>
        <input
          class="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 focus:outline-none focus:border-emerald-400"
          formControlName="emailOrUsername"
          type="text"
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
        {{ loading ? 'Входим...' : 'Войти' }}
      </button>
      <p *ngIf="error" class="text-sm text-red-500 text-center">{{ error }}
      </p>
      <p class="text-sm text-stone-500 text-center">
        Нет аккаунта?
        <a routerLink="/auth/register" class="text-accent-800">Создать</a>
      </p>
    </form>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.group({
    emailOrUsername: ['', Validators.required],
    password: ['', Validators.required]
  });

  loading = false;
  error = '';

  onSubmit() {
    if (this.form.invalid || this.loading) return;
    const { emailOrUsername, password } = this.form.value;
    this.loading = true;
    this.error = '';
    this.auth
      .login(emailOrUsername!, password!)
      .pipe(
        catchError(() => {
          this.error = 'Unable to sign in. Please check your credentials.';
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((res) => {
        if (res) {
          setTimeout(() => {
            const isAdmin = res.user?.role === 'admin';
            this.router.navigate([isAdmin ? '/admin' : '/feed']);
          }, 0);
        }
      });
  }
}

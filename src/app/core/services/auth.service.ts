import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { AuthResponse, User } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  private readonly accessTokenSignal = signal<string | null>(this.storage.getAccessToken());
  private readonly currentUserSignal = signal<User | null | undefined>(undefined);
  readonly user = computed(() => this.currentUserSignal());
  readonly user$ = toObservable(this.currentUserSignal);
  readonly isAuthenticated = computed(() => !!this.accessTokenSignal());

  initialize() {
    const token = this.storage.getAccessToken();
    if (!token) {
      return of(null);
    }
    return this.fetchMe().pipe(
      catchError((err: unknown) => {
        const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
        const isNetworkError =
          err instanceof HttpErrorResponse &&
          (err.status === 0 || err.error instanceof ProgressEvent);

        if (isOffline || isNetworkError) {
          this.currentUserSignal.set(null);
          return of(null);
        }

        this.logout(false);
        return of(null);
      }),
    );
  }

  login(emailOrUsername: string, password: string) {
    return this.api.post<AuthResponse>('/auth/login', { emailOrUsername, password }).pipe(
      tap((res) => this.persistAuth(res)),
      switchMap((res) => {
        if (!res) {
          return of(res);
        }

        if (res.user) {
          return of(res);
        }

        return this.fetchMe().pipe(map((user) => ({ ...res, user })));
      }),
    );
  }

  register(username: string, email: string, password: string) {
    return this.api.post<AuthResponse>('/auth/register', { username, email, password }).pipe(
      tap((res) => this.persistAuth(res)),
      switchMap((res) => {
        if (res.user) {
          return of(res);
        }

        return this.fetchMe().pipe(map((user) => ({ ...res, user })));
      }),
    );
  }

  forgotPassword(email: string) {
    return this.api.post<void>('/auth/forgot-password', { email });
  }

  resetPassword(code: string, newPassword: string) {
    return this.api.post<void>('/auth/reset-password', { code, newPassword });
  }

  refresh() {
    const refreshToken = this.storage.getRefreshToken();
    if (!refreshToken) {
      return null;
    }
    return this.api
      .post<AuthResponse>('/auth/refresh', { refreshToken })
      .pipe(tap((res) => this.persistAuth(res)));
  }

  fetchMe() {
    return this.api.get<User>('/auth/me').pipe(tap((u) => this.currentUserSignal.set(u)));
  }

  logout(redirect = true) {
    this.storage.clearTokens();
    this.accessTokenSignal.set(null);
    this.currentUserSignal.set(null);
    if (redirect) {
      this.router.navigate(['/auth/login']);
    }
  }

  private persistAuth(res: AuthResponse) {
    this.storage.saveTokens(res.accessToken, res.refreshToken);
    this.accessTokenSignal.set(res.accessToken);
    this.currentUserSignal.set(res.user);
  }
}

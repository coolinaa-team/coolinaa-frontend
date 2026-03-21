import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { AuthResponse, User } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  private readonly currentUserSignal = signal<User | null | undefined>(undefined);
  readonly user = computed(() => this.currentUserSignal());
  readonly user$ = toObservable(this.currentUserSignal);
  readonly isAuthenticated = computed(() => !!this.storage.getAccessToken());

  initialize() {
    const token = this.storage.getAccessToken();
    if (!token) {
      return of(null);
    }
    return this.fetchMe().pipe(
      catchError(() => {
        this.logout(false);
        return of(null);
      })
    );
  }

  login(emailOrUsername: string, password: string) {
    return this.api.post<AuthResponse>('/auth/login', { emailOrUsername, password }).pipe(
      tap((res) => this.persistAuth(res))
    );
  }

  register(username: string, email: string, password: string) {
    return this.api.post<AuthResponse>('/auth/register', { username, email, password }).pipe(
      tap((res) => this.persistAuth(res))
    );
  }

  refresh() {
    const refreshToken = this.storage.getRefreshToken();
    if (!refreshToken) {
      return null;
    }
    return this.api.post<AuthResponse>('/auth/refresh', { refreshToken }).pipe(
      tap((res) => this.persistAuth(res))
    );
  }

  fetchMe() {
    return this.api.get<User>('/auth/me').pipe(tap((u) => this.currentUserSignal.set(u)));
  }

  logout(redirect = true) {
    this.storage.clearTokens();
    this.currentUserSignal.set(null);
    if (redirect) {
      this.router.navigate(['/auth/login']);
    }
  }

  private persistAuth(res: AuthResponse) {
    this.storage.saveTokens(res.accessToken, res.refreshToken);
    this.currentUserSignal.set(res.user);
  }
}

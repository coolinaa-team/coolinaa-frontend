import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CacheService } from './cache.service';

const API_BASE = 'http://localhost:8080/api/v1';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);

  private url(path: string): string {
    return `${API_BASE}${path}`;
  }

  private getCacheKey(path: string, params?: Record<string, any>): string {
    const queryString = params ? Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&') : '';
    return `GET:${path}${queryString ? `?${queryString}` : ''}`;
  }

  get<T>(path: string, options: { params?: Record<string, any> } = {}) {
    const cleaned = options.params
      ? Object.fromEntries(
          Object.entries(options.params).filter(([, value]) => value !== undefined && value !== null)
        )
      : undefined;

    const cacheKey = this.getCacheKey(path, cleaned);
    const source$ = this.http.get<T>(this.url(path), cleaned ? { ...options, params: cleaned } : options);

    return this.cache.get(cacheKey, source$, 5 * 60 * 1000);
  }

  post<T>(path: string, body: unknown, headers?: HttpHeaders) {
    this.cache.invalidateWithDependencies(path);
    return this.http.post<T>(this.url(path), body, { headers });
  }

  put<T>(path: string, body: unknown) {
    this.cache.invalidateWithDependencies(path);
    return this.http.put<T>(this.url(path), body);
  }

  patch<T>(path: string, body: unknown) {
    this.cache.invalidateWithDependencies(path);
    return this.http.patch<T>(this.url(path), body);
  }

  delete<T>(path: string) {
    this.cache.invalidateWithDependencies(path);
    return this.http.delete<T>(this.url(path));
  }
}

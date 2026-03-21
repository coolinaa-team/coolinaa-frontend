import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  
  private readonly DEFAULT_TTL_MS = 5 * 60 * 1000;

  private readonly dependencies = new Map<string, string[]>([
    ['/user-ingredients', ['/recipes/match']],
    ['/recipes', ['/recipes', '/recipes/match']],
  ]);

  get<T>(key: string, source$: Observable<T>, ttlMs = this.DEFAULT_TTL_MS): Observable<T> {
    const cached = this.getCached<T>(key);
    
    if (cached) {
      return of(cached);
    }

    return source$.pipe(
      tap((data) => this.set(key, data, ttlMs))
    );
  }

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > (entry as any).ttl || 0;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs = this.DEFAULT_TTL_MS): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    } as any);
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateByPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  invalidateWithDependencies(path: string): void {
    this.invalidateByPattern(`GET:${path.split('?')[0]}`);

    for (const [depKey, targets] of this.dependencies.entries()) {
      if (path.includes(depKey)) {
        targets.forEach(target => {
          this.invalidateByPattern(`GET:${target}`);
        });
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

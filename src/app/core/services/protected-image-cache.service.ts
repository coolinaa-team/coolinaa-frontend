import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, shareReplay, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProtectedImageCacheService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, Observable<string>>();
  private readonly objectUrls = new Map<string, string>();

  getObjectUrl(src: string): Observable<string> {
    const cached = this.cache.get(src);

    if (cached) {
      return cached;
    }

    const request$ = this.http.get(src, { responseType: 'blob' }).pipe(
      map((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.objectUrls.set(src, objectUrl);
        return objectUrl;
      }),
      catchError((error) => {
        this.cache.delete(src);
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.cache.set(src, request$);
    return request$;
  }

  clear(): void {
    for (const objectUrl of this.objectUrls.values()) {
      URL.revokeObjectURL(objectUrl);
    }

    this.objectUrls.clear();
    this.cache.clear();
  }
}

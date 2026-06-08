import { Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { API_BASE } from '../core/services/api.service';
import { ProtectedImageCacheService } from '../core/services/protected-image-cache.service';

@Directive({
  selector: 'img[appAuthenticatedImage]',
})
export class AuthenticatedImageDirective implements OnDestroy {
  private readonly imageCache = inject(ProtectedImageCacheService);
  private readonly element = inject<ElementRef<HTMLImageElement>>(ElementRef);

  private subscription: Subscription | null = null;

  @Input()
  set appAuthenticatedImage(src: string | null | undefined) {
    this.subscription?.unsubscribe();

    if (!src) {
      this.element.nativeElement.removeAttribute('src');
      return;
    }

    if (!this.isProtectedFileUrl(src)) {
      this.element.nativeElement.src = src;
      return;
    }

    this.subscription = this.imageCache.getObjectUrl(src).subscribe({
      next: (objectUrl) => (this.element.nativeElement.src = objectUrl),
      error: () => {
        this.element.nativeElement.removeAttribute('src');
      },
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private isProtectedFileUrl(src: string): boolean {
    return src.startsWith(`${API_BASE}/files/`);
  }
}

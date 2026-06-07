import { HttpClient } from '@angular/common/http';
import { Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { API_BASE } from '../core/services/api.service';

@Directive({
  selector: 'img[appAuthenticatedImage]',
})
export class AuthenticatedImageDirective implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly element = inject<ElementRef<HTMLImageElement>>(ElementRef);

  private subscription: Subscription | null = null;
  private objectUrl = '';

  @Input()
  set appAuthenticatedImage(src: string | null | undefined) {
    this.subscription?.unsubscribe();
    this.revokeObjectUrl();

    if (!src) {
      this.element.nativeElement.removeAttribute('src');
      return;
    }

    if (!this.isProtectedFileUrl(src)) {
      this.element.nativeElement.src = src;
      return;
    }

    this.subscription = this.http.get(src, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.revokeObjectUrl();
        this.objectUrl = URL.createObjectURL(blob);
        this.element.nativeElement.src = this.objectUrl;
      },
      error: () => {
        this.element.nativeElement.removeAttribute('src');
      },
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.revokeObjectUrl();
  }

  private isProtectedFileUrl(src: string): boolean {
    return src.startsWith(`${API_BASE}/files/`);
  }

  private revokeObjectUrl() {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = '';
    }
  }
}

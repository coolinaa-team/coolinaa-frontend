import { Component, inject, computed, effect } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroHome,
  heroSparkles,
  heroArchiveBox,
  heroUserCircle,
  heroArrowRightOnRectangle,
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIconComponent],
  providers: [
    provideIcons({
      heroHome,
      heroSparkles,
      heroArchiveBox,
      heroUserCircle,
      heroArrowRightOnRectangle,
    }),
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isAdmin = computed(() => this.auth.user()?.role === 'admin');

  constructor() {
    effect(() => {
      const user = this.auth.user();
      const currentUrl = this.router.url;

      if (user && user.role === 'admin' && !currentUrl.startsWith('/admin')) {
        this.router.navigate(['/admin']);
      } else if (user && user.role !== 'admin' && currentUrl.startsWith('/admin')) {
        this.router.navigate(['/feed']);
      }
    });
  }

  logout() {
    this.auth.logout();
  }
}

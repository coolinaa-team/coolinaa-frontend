import { TuiRoot } from '@taiga-ui/core';
import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiRoot],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class App implements OnInit {
  private readonly mobileMaxWidth = 767;
  private readonly auth = inject(AuthService);
  protected readonly title = signal('client');
  protected readonly isMobileViewport = signal(true);

  ngOnInit() {
    this.auth.initialize().subscribe();
    this.updateViewportState();
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.updateViewportState();
  }

  private updateViewportState() {
    this.isMobileViewport.set(window.innerWidth <= this.mobileMaxWidth);
  }
}

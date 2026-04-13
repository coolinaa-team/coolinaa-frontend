import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.css'
})
export class ProfilePage {
  private readonly auth = inject(AuthService);
  protected user = this.auth.user;

  protected logout() {
    this.auth.logout();
  }
}

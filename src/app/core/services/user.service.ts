import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { User } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  getCurrentUser() {
    return this.api.get<User>('/auth/me');
  }
}

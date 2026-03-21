import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isAuth = auth.isAuthenticated();
  console.log('authGuard - isAuthenticated:', isAuth);
  if (isAuth) {
    return true;
  }
  router.navigate(['/auth/login']);
  return false;
};

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, take, filter } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    console.log('authGuard - not authenticated (no token), redirecting to login');
    router.navigate(['/auth/login']);
    return false;
  }

  return auth.user$.pipe(
    filter((user) => user !== undefined),
    take(1),
    map((user) => {
      console.log('authGuard - user loaded:', user);
      return true;
    }),
  );
};

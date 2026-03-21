import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, take, filter } from 'rxjs/operators';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.user$.pipe(
    filter(user => user !== undefined),
    take(1),
    map(user => {
      console.log('Admin guard - user:', user);
      console.log('Admin guard - role:', user?.role);
      const isAdmin = user?.role === 'admin';
      console.log('Admin guard - isAdmin:', isAdmin);
      
      if (isAdmin) {
        return true;
      }
      
      router.navigate(['/']);
      return false;
    })
  );
};

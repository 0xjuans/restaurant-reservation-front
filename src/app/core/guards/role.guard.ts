// Guard de rol — permite el acceso solo a usuarios con ROLE_ADMIN.
// Si el usuario está autenticado pero no es admin, redirige al inicio.
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const roles = auth.currentUser()?.roles ?? [];

  if (roles.includes('ROLE_ADMIN')) {
    return true;
  }

  // Autenticado pero sin rol admin — redirige al inicio
  return router.createUrlTree(['/']);
};

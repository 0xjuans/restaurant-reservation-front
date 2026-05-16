// Guard que protege rutas privadas.
// Si el usuario no tiene token válido, redirige a /acceso.
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  // Sin sesión — redirige al login conservando la URL de destino
  return router.createUrlTree(['/acceso']);
};

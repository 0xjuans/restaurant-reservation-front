// Guard para rutas de invitado (login, registro).
// Si el usuario ya tiene sesión activa, redirige a la página principal.
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  // Ya tiene sesión — no necesita ver el login/registro
  return router.createUrlTree(['/']);
};

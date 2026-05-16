// Interceptor global de errores HTTP.
// 401 → cierra sesión y redirige a /acceso (token expirado o inválido).
// 500 → loguea el error sin interrumpir la experiencia del usuario.
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 401) {
        // Token expirado o inválido — limpia la sesión y redirige al login
        auth.logout();
      }

      if (error.status >= 500) {
        // Error del servidor — solo se loguea, cada componente maneja su propio mensaje
        console.error(`[Server Error] ${error.status} — ${req.url}`);
      }

      // Propaga el error para que cada componente lo maneje si necesita
      return throwError(() => error);
    })
  );
};

// Rutas principales de la aplicación
import { Routes } from '@angular/router';

import { authGuard }  from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Pública — landing
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then(m => m.LandingComponent),
  },

  // Solo invitados — redirige al inicio si ya hay sesión
  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'acceso',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },

  // Rutas privadas — redirige a /acceso si no hay sesión
  // (aquí irán reservaciones, mi-cuenta, etc.)

  {
    path: '**',
    redirectTo: '',
  },
];

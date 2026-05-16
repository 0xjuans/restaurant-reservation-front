// Rutas principales de la aplicación
import { Routes } from '@angular/router';

import { authGuard }  from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/role.guard';

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
  {
    path: 'reservaciones',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reservations/reservations.component').then(m => m.ReservationsComponent),
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then(m => m.ProfileComponent),
  },

  // Panel de administración — solo ROLE_ADMIN
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
      },
      {
        path: 'reservaciones',
        loadComponent: () =>
          import('./features/admin/reservations/admin-reservations.component').then(m => m.AdminReservationsComponent),
      },
      {
        path: 'mesas',
        loadComponent: () =>
          import('./features/admin/tables/admin-tables.component').then(m => m.AdminTablesComponent),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/admin/customers/admin-customers.component').then(m => m.AdminCustomersComponent),
      },
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];

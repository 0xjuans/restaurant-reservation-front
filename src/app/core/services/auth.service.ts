// Servicio de autenticación — login, registro y gestión del token JWT.
// Almacena el token y los datos de sesión en localStorage con signals reactivos.
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly TOKEN_KEY   = 'auth_token';
  private readonly SESSION_KEY = 'auth_session';

  // Signal reactivo — true si hay token válido en localStorage
  readonly isAuthenticated = signal<boolean>(this.hasToken());

  // Signal con los datos del usuario autenticado
  readonly currentUser = signal<AuthResponse | null>(this.loadSession());

  // ── Login ──────────────────────────────────────────────────────────────────
  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(tap(res => this.saveSession(res)));
  }

  // ── Registro ───────────────────────────────────────────────────────────────
  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(tap(res => this.saveSession(res)));
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/acceso']);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(res));
    this.isAuthenticated.set(true);
    this.currentUser.set(res);
  }

  private loadSession(): AuthResponse | null {
    const raw = localStorage.getItem(this.SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}

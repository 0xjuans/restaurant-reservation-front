// Página de inicio de sesión.
// Usa formularios reactivos y llama a AuthService para autenticar al usuario.
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  private readonly fb      = inject(FormBuilder);
  private readonly auth    = inject(AuthService);
  private readonly router  = inject(Router);

  // Estado de la petición
  isLoading = signal(false);
  errorMsg  = signal('');

  // Controla si la contraseña es visible
  showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // Getters para acceder a los controles en el template
  get email()    { return this.form.controls.email;    }
  get password() { return this.form.controls.password; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.isLoading.set(true);
    this.errorMsg.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/reservaciones']),
      error: (err) => {
        // Muestra mensaje según el código de respuesta del servidor
        this.errorMsg.set(
          err.status === 401
            ? 'Credenciales incorrectas. Verifica tu correo y contraseña.'
            : 'Ocurrió un error. Inténtalo de nuevo más tarde.'
        );
        this.isLoading.set(false);
      },
    });
  }
}

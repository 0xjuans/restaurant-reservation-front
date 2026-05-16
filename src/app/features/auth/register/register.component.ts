// Página de registro de nuevos usuarios.
// Incluye validación de contraseñas coincidentes con un validator personalizado.
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

// Validator que verifica que password y confirmPassword sean iguales
const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const pass    = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass === confirm ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {

  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  isLoading    = signal(false);
  errorMsg     = signal('');
  showPassword = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      firstName:       ['', [Validators.required, Validators.minLength(2)]],
      lastName:        ['', [Validators.required, Validators.minLength(2)]],
      email:           ['', [Validators.required, Validators.email]],
      phone:           ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-]{7,15}$/)]],
      password:        ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  // Getters para acceder a los controles en el template
  get firstName()       { return this.form.controls.firstName;       }
  get lastName()        { return this.form.controls.lastName;        }
  get email()           { return this.form.controls.email;           }
  get phone()           { return this.form.controls.phone;           }
  get password()        { return this.form.controls.password;        }
  get confirmPassword() { return this.form.controls.confirmPassword; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.isLoading.set(true);
    this.errorMsg.set('');

    // Extraemos solo los campos que espera el backend (sin confirmPassword)
    const { confirmPassword, ...payload } = this.form.getRawValue();

    this.auth.register(payload).subscribe({
      next: () => this.router.navigate(['/reservations']),
      error: (err) => {
        this.errorMsg.set(
          err.status === 409
            ? 'Ya existe una cuenta con ese correo electrónico.'
            : 'Ocurrió un error al registrarte. Inténtalo de nuevo.'
        );
        this.isLoading.set(false);
      },
    });
  }
}

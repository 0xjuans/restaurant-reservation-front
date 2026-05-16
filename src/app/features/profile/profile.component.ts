// Página de perfil del cliente autenticado.
// Permite ver y editar nombre, apellido y teléfono.
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NavbarComponent }       from '../../shared/components/navbar/navbar.component';
import { CustomerService }       from '../../core/services/customer.service';
import { AuthService }           from '../../core/services/auth.service';
import { NotificationService }   from '../../core/services/notification.service';
import { CustomerResponse }      from '../../core/models/customer.model';

@Component({
  selector: 'app-profile',
  imports: [NavbarComponent, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {

  private readonly fb          = inject(FormBuilder);
  private readonly customerSvc = inject(CustomerService);
  private readonly notif       = inject(NotificationService);
  readonly auth                = inject(AuthService);

  customer     = signal<CustomerResponse | null>(null);
  isLoading    = signal(true);
  isSaving     = signal(false);
  isEditing    = signal(false);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    phone:     ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-]{7,15}$/)]],
  });

  get firstName() { return this.form.controls.firstName; }
  get lastName()  { return this.form.controls.lastName;  }
  get phone()     { return this.form.controls.phone;     }

  ngOnInit(): void {
    this.customerSvc.getProfile().subscribe({
      next: (profile) => {
        this.customer.set(profile);
        this.fillForm(profile);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  // Activa el modo edición
  startEditing(): void {
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    const profile = this.customer();
    if (profile) this.fillForm(profile);
    this.isEditing.set(false);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.isSaving.set(true);

    this.customerSvc.updateProfile(this.form.getRawValue()).subscribe({
      next: (updated) => {
        this.customer.set(updated);
        this.isEditing.set(false);
        this.isSaving.set(false);
        this.notif.success('Perfil actualizado correctamente.');
      },
      error: () => {
        this.notif.error('No se pudo actualizar el perfil. Inténtalo de nuevo.');
        this.isSaving.set(false);
      },
    });
  }

  private fillForm(profile: CustomerResponse): void {
    this.form.patchValue({
      firstName: profile.firstName,
      lastName:  profile.lastName,
      phone:     profile.phone,
    });
  }
}

// Página de reservaciones del cliente autenticado.
// Flujo: verificar perfil → buscar mesas disponibles → crear reserva → ver historial.
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY, switchMap } from 'rxjs';

import { NavbarComponent }      from '../../shared/components/navbar/navbar.component';
import { CustomerService }      from '../../core/services/customer.service';
import { TableService }         from '../../core/services/table.service';
import { ReservationService }   from '../../core/services/reservation.service';
import { AuthService }          from '../../core/services/auth.service';
import { CustomerResponse }     from '../../core/models/customer.model';
import { TableResponse }        from '../../core/models/table.model';
import { ReservationResponse }  from '../../core/models/reservation.model';

@Component({
  selector: 'app-reservations',
  imports: [NavbarComponent, ReactiveFormsModule],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.css',
})
export class ReservationsComponent implements OnInit {

  private readonly fb          = inject(FormBuilder);
  private readonly customerSvc = inject(CustomerService);
  private readonly tableSvc    = inject(TableService);
  private readonly reservSvc   = inject(ReservationService);
  private readonly auth        = inject(AuthService);
  private readonly router      = inject(Router);

  // Estado del perfil del cliente
  customer        = signal<CustomerResponse | null>(null);
  loadingProfile  = signal(true);

  // Mesas disponibles cargadas según los invitados
  availableTables = signal<TableResponse[]>([]);
  loadingTables   = signal(false);
  tablesLoaded    = signal(false);

  // Historial de reservas del cliente
  reservations      = signal<ReservationResponse[]>([]);
  loadingReservations = signal(false);

  // Estado de los formularios
  savingProfile  = signal(false);
  savingReserv   = signal(false);
  profileError   = signal('');
  reservError    = signal('');
  reservSuccess  = signal(false);

  // Vista activa: 'nueva' | 'historial'
  activeTab = signal<'nueva' | 'historial'>('nueva');

  // Formulario de perfil (si el usuario no tiene uno aún)
  readonly profileForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    phone:     ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-]{7,15}$/)]],
  });

  // Formulario de nueva reserva
  readonly reservForm = this.fb.nonNullable.group({
    date:        ['', Validators.required],
    guestsCount: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    tableId:     [0, [Validators.required, Validators.min(1)]],
    startTime:   ['', Validators.required],
    endTime:     ['', Validators.required],
    notes:       [''],
  });

  // Fecha mínima para el datepicker (hoy + 1 día)
  readonly minDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  ngOnInit(): void {
    this.loadProfile();
  }

  // ── Perfil ──────────────────────────────────────────────────────────────────

  private loadProfile(): void {
    this.loadingProfile.set(true);
    this.customerSvc.getProfile().pipe(
      catchError(() => {
        // 404 — el usuario no tiene perfil todavía
        this.loadingProfile.set(false);
        return EMPTY;
      })
    ).subscribe(profile => {
      this.customer.set(profile);
      this.loadingProfile.set(false);
      this.loadReservations(profile.id);
    });
  }

  submitProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.savingProfile.set(true);
    this.profileError.set('');

    this.customerSvc.createProfile(this.profileForm.getRawValue()).subscribe({
      next: (profile) => {
        this.customer.set(profile);
        this.savingProfile.set(false);
        this.loadReservations(profile.id);
      },
      error: () => {
        this.profileError.set('No se pudo guardar el perfil. Inténtalo de nuevo.');
        this.savingProfile.set(false);
      },
    });
  }

  // ── Mesas disponibles ───────────────────────────────────────────────────────

  searchTables(): void {
    const guests = this.reservForm.controls.guestsCount.value;
    if (!guests || guests < 1) return;

    this.loadingTables.set(true);
    this.tablesLoaded.set(false);
    this.availableTables.set([]);
    this.reservForm.controls.tableId.setValue(0);

    this.tableSvc.getAvailable(guests).subscribe({
      next: (tables) => {
        this.availableTables.set(tables);
        this.loadingTables.set(false);
        this.tablesLoaded.set(true);
      },
      error: () => {
        this.loadingTables.set(false);
        this.tablesLoaded.set(true);
      },
    });
  }

  // ── Reserva ─────────────────────────────────────────────────────────────────

  submitReservation(): void {
    if (this.reservForm.invalid || !this.customer()) {
      this.reservForm.markAllAsTouched();
      return;
    }

    this.savingReserv.set(true);
    this.reservError.set('');
    this.reservSuccess.set(false);

    const f = this.reservForm.getRawValue();

    this.reservSvc.create({
      customerId:  this.customer()!.id,
      tableId:     f.tableId,
      date:        f.date,
      startTime:   f.startTime,
      endTime:     f.endTime,
      guestsCount: f.guestsCount,
      notes:       f.notes,
    }).subscribe({
      next: (res) => {
        this.reservSuccess.set(true);
        this.savingReserv.set(false);
        this.reservForm.reset({ guestsCount: 1, tableId: 0 });
        this.availableTables.set([]);
        this.tablesLoaded.set(false);
        // Recarga el historial con la nueva reserva
        this.loadReservations(this.customer()!.id);
      },
      error: (err) => {
        this.reservError.set(
          err.status === 409
            ? 'La mesa no está disponible en ese horario. Elige otro.'
            : 'No se pudo crear la reserva. Inténtalo de nuevo.'
        );
        this.savingReserv.set(false);
      },
    });
  }

  // ── Historial ───────────────────────────────────────────────────────────────

  private loadReservations(customerId: number): void {
    this.loadingReservations.set(true);
    this.reservSvc.getByCustomer(customerId).subscribe({
      next: (list) => {
        this.reservations.set(list);
        this.loadingReservations.set(false);
      },
      error: () => this.loadingReservations.set(false),
    });
  }

  cancelReservation(id: number): void {
    this.reservSvc.cancel(id).subscribe({
      next: () => this.loadReservations(this.customer()!.id),
    });
  }

  // ── Helpers de vista ────────────────────────────────────────────────────────

  // Etiqueta y color según el estado de la reserva
  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING:   'Pendiente',
      CONFIRMED: 'Confirmada',
      CANCELLED: 'Cancelada',
      COMPLETED: 'Completada',
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING:   'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-gray-100 text-gray-600',
    };
    return map[status] ?? '';
  }

  logout(): void {
    this.auth.logout();
  }
}

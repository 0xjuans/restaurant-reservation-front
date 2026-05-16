// Página de reservaciones del cliente autenticado.
// Flujo: verificar perfil → buscar mesas disponibles → crear reserva → ver historial.
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY, switchMap } from 'rxjs';

import { NavbarComponent }        from '../../shared/components/navbar/navbar.component';
import { CustomerService }        from '../../core/services/customer.service';
import { TableService }           from '../../core/services/table.service';
import { ReservationService }     from '../../core/services/reservation.service';
import { AuthService }            from '../../core/services/auth.service';
import { NotificationService }    from '../../core/services/notification.service';
import { CustomerResponse }       from '../../core/models/customer.model';
import { TableResponse }          from '../../core/models/table.model';
import { ReservationResponse }    from '../../core/models/reservation.model';

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
  private readonly notif       = inject(NotificationService);
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

  // Vista activa: 'nueva' | 'historial'
  activeTab = signal<'nueva' | 'historial'>('nueva');

  // Formulario de perfil (si el usuario no tiene uno aún)
  readonly profileForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    phone:     ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-]{7,15}$/)]],
  });

  // Opciones de duración disponibles para la reserva
  readonly durationOptions = [
    { value: 60,  label: '1 hora'         },
    { value: 90,  label: '1 hora 30 min'  },
    { value: 120, label: '2 horas'        },
    { value: 150, label: '2 horas 30 min' },
    { value: 180, label: '3 horas'        },
  ];

  // Formulario de nueva reserva — endTime se calcula a partir de startTime + duration
  readonly reservForm = this.fb.nonNullable.group({
    date:        ['', Validators.required],
    guestsCount: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    tableId:     [0, [Validators.required, Validators.min(1)]],
    startTime:   ['', Validators.required],
    duration:    [60, Validators.required],
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

    const f = this.reservForm.getRawValue();

    this.reservSvc.create({
      customerId:  this.customer()!.id,
      tableId:     f.tableId,
      date:        f.date,
      startTime:   f.startTime + ':00',
      endTime:     this.calcEndTime(f.startTime, f.duration),
      guestsCount: f.guestsCount,
      notes:       f.notes,
    }).subscribe({
      next: () => {
        this.notif.success('Reserva creada. Recibirás una confirmación pronto.');
        this.savingReserv.set(false);
        this.reservForm.reset({ guestsCount: 1, tableId: 0, duration: 60 });
        this.availableTables.set([]);
        this.tablesLoaded.set(false);
        this.loadReservations(this.customer()!.id);
      },
      error: (err) => {
        this.notif.error(
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
      next: () => {
        this.notif.info('Reserva cancelada correctamente.');
        this.loadReservations(this.customer()!.id);
      },
      error: () => this.notif.error('No se pudo cancelar la reserva.'),
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

  // Hora de salida calculada para mostrar en pantalla
  get endTimeDisplay(): string {
    const { startTime, duration } = this.reservForm.getRawValue();
    if (!startTime) return '--:--';
    return this.calcEndTime(startTime, duration).slice(0, 5);
  }

  // Suma los minutos de duración a la hora de inicio y devuelve "HH:mm:ss"
  private calcEndTime(startTime: string, durationMin: number): string {
    const [h, m] = startTime.split(':').map(Number);
    const totalMin = h * 60 + m + durationMin;
    const endH = Math.floor(totalMin / 60) % 24;
    const endM = totalMin % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
  }

  logout(): void {
    this.auth.logout();
  }
}

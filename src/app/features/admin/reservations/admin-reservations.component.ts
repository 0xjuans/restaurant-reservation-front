// Gestión de reservaciones para el administrador.
// Lista todas las reservas con filtros por estado y acciones de cambio de estado.
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ReservationService }  from '../../../core/services/reservation.service';
import { ReservationResponse, ReservationStatus } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-admin-reservations',
  imports: [FormsModule],
  templateUrl: './admin-reservations.component.html',
})
export class AdminReservationsComponent implements OnInit {

  private readonly reservSvc = inject(ReservationService);

  isLoading   = signal(true);
  allReservations = signal<ReservationResponse[]>([]);
  filterStatus    = signal<string>('ALL');
  updatingId      = signal<number | null>(null);

  // Reservaciones filtradas según el estado seleccionado
  filtered = computed(() => {
    const status = this.filterStatus();
    const list   = this.allReservations();
    return status === 'ALL' ? list : list.filter(r => r.status === status);
  });

  readonly statusOptions = [
    { value: 'ALL',       label: 'Todas'      },
    { value: 'PENDING',   label: 'Pendientes' },
    { value: 'CONFIRMED', label: 'Confirmadas'},
    { value: 'CANCELLED', label: 'Canceladas' },
    { value: 'COMPLETED', label: 'Completadas'},
  ];

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.isLoading.set(true);
    this.reservSvc.getAll().subscribe({
      next: (list) => {
        // Ordenar por fecha de creación descendente
        this.allReservations.set(
          [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  changeStatus(id: number, status: ReservationStatus): void {
    this.updatingId.set(id);
    this.reservSvc.updateStatus(id, status).subscribe({
      next: (updated) => {
        // Actualiza solo la reserva modificada sin recargar todo
        this.allReservations.update(list =>
          list.map(r => r.id === id ? updated : r)
        );
        this.updatingId.set(null);
      },
      error: () => this.updatingId.set(null),
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Pendiente', CONFIRMED: 'Confirmada',
      CANCELLED: 'Cancelada', COMPLETED: 'Completada',
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
}

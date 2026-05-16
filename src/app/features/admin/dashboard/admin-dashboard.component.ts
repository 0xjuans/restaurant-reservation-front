// Dashboard del panel de administración.
// Muestra tarjetas con estadísticas y las últimas reservaciones.
import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { ReservationService } from '../../../core/services/reservation.service';
import { TableService }       from '../../../core/services/table.service';
import { CustomerService }    from '../../../core/services/customer.service';
import { ReservationResponse } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-admin-dashboard',
  imports: [],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {

  private readonly reservSvc   = inject(ReservationService);
  private readonly tableSvc    = inject(TableService);
  private readonly customerSvc = inject(CustomerService);

  isLoading = signal(true);

  // Estadísticas
  stats = signal({
    totalReservations: 0,
    pending:           0,
    confirmed:         0,
    cancelled:         0,
    completed:         0,
    totalTables:       0,
    availableTables:   0,
    totalCustomers:    0,
  });

  // Últimas 5 reservaciones
  recentReservations = signal<ReservationResponse[]>([]);

  ngOnInit(): void {
    forkJoin({
      reservations: this.reservSvc.getAll(),
      tables:       this.tableSvc.getAll(),
      customers:    this.customerSvc.getAll(),
    }).subscribe({
      next: ({ reservations, tables, customers }) => {
        this.stats.set({
          totalReservations: reservations.length,
          pending:           reservations.filter(r => r.status === 'PENDING').length,
          confirmed:         reservations.filter(r => r.status === 'CONFIRMED').length,
          cancelled:         reservations.filter(r => r.status === 'CANCELLED').length,
          completed:         reservations.filter(r => r.status === 'COMPLETED').length,
          totalTables:       tables.length,
          availableTables:   tables.filter(t => t.status === 'AVAILABLE').length,
          totalCustomers:    customers.length,
        });
        // Últimas 5 ordenadas por fecha de creación descendente
        this.recentReservations.set(
          [...reservations]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
        );
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
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

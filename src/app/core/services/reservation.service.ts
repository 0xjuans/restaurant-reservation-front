// Servicio de reservaciones — crear, listar y cancelar reservas del usuario.
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ReservationRequest, ReservationResponse } from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {

  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reservations`;

  // Crea una nueva reserva
  create(payload: ReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(this.base, payload);
  }

  // Reservas de un cliente específico
  getByCustomer(customerId: number): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(`${this.base}/customer/${customerId}`);
  }

  // Todas las reservas (para administración)
  getAll(): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(this.base);
  }

  // Cancela una reserva cambiando su estado
  cancel(id: number): Observable<ReservationResponse> {
    return this.http.patch<ReservationResponse>(`${this.base}/${id}/status`, {
      status: 'CANCELLED',
    });
  }
}

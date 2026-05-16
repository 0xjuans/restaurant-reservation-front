// Servicio de mesas — consulta, crea, edita y elimina mesas del restaurante.
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { TableResponse } from '../models/table.model';

export interface TableRequest {
  zoneId:   number;
  number:   number;
  capacity: number;
}

@Injectable({ providedIn: 'root' })
export class TableService {

  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/tables`;

  // Todas las mesas
  getAll(): Observable<TableResponse[]> {
    return this.http.get<TableResponse[]>(this.base);
  }

  // Mesas disponibles con filtro opcional por capacidad mínima
  getAvailable(minCapacity?: number): Observable<TableResponse[]> {
    let params = new HttpParams();
    if (minCapacity) params = params.set('minCapacity', minCapacity);
    return this.http.get<TableResponse[]>(`${this.base}/available`, { params });
  }

  // Crea una nueva mesa
  create(payload: TableRequest): Observable<TableResponse> {
    return this.http.post<TableResponse>(this.base, payload);
  }

  // Actualiza los datos de una mesa
  update(id: number, payload: TableRequest): Observable<TableResponse> {
    return this.http.put<TableResponse>(`${this.base}/${id}`, payload);
  }

  // Cambia el estado de una mesa (AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE)
  updateStatus(id: number, status: string): Observable<TableResponse> {
    return this.http.patch<TableResponse>(`${this.base}/${id}/status`, { status });
  }

  // Elimina una mesa
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

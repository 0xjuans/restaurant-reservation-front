// Servicio de mesas — consulta las mesas disponibles del restaurante.
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { TableResponse } from '../models/table.model';

@Injectable({ providedIn: 'root' })
export class TableService {

  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/tables`;

  // Todas las mesas (para administración)
  getAll(): Observable<TableResponse[]> {
    return this.http.get<TableResponse[]>(this.base);
  }

  // Mesas disponibles, con filtro opcional por capacidad mínima
  getAvailable(minCapacity?: number): Observable<TableResponse[]> {
    let params = new HttpParams();
    if (minCapacity) {
      params = params.set('minCapacity', minCapacity);
    }
    return this.http.get<TableResponse[]>(`${this.base}/available`, { params });
  }
}

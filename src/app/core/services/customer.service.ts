// Servicio de clientes — obtiene y crea el perfil del usuario autenticado.
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CustomerRequest, CustomerResponse } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {

  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/customers`;

  // Lista todos los clientes (solo admin)
  getAll(): Observable<CustomerResponse[]> {
    return this.http.get<CustomerResponse[]>(this.base);
  }

  // Obtiene el perfil del cliente autenticado
  getProfile(): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.base}/profile`);
  }

  // Crea el perfil del cliente si aún no existe
  createProfile(payload: CustomerRequest): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(`${this.base}/profile`, payload);
  }

  // Actualiza el perfil del cliente autenticado
  updateProfile(payload: CustomerRequest): Observable<CustomerResponse> {
    return this.http.put<CustomerResponse>(`${this.base}/profile`, payload);
  }
}

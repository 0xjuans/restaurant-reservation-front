// Lista de clientes registrados para el administrador.
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CustomerService }  from '../../../core/services/customer.service';
import { CustomerResponse } from '../../../core/models/customer.model';

@Component({
  selector: 'app-admin-customers',
  imports: [FormsModule],
  templateUrl: './admin-customers.component.html',
})
export class AdminCustomersComponent implements OnInit {

  private readonly customerSvc = inject(CustomerService);

  isLoading   = signal(true);
  allCustomers = signal<CustomerResponse[]>([]);
  searchTerm   = signal('');

  // Filtra por nombre, apellido o teléfono
  filtered = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.allCustomers();
    return this.allCustomers().filter(c =>
      `${c.firstName} ${c.lastName} ${c.phone}`.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.customerSvc.getAll().subscribe({
      next: (list) => {
        this.allCustomers.set(
          [...list].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  // Formatea la fecha de registro
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }
}

// Gestión de mesas para el administrador.
// Permite listar, crear, editar, cambiar estado y eliminar mesas.
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TableService } from '../../../core/services/table.service';
import { TableResponse } from '../../../core/models/table.model';

@Component({
  selector: 'app-admin-tables',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-tables.component.html',
})
export class AdminTablesComponent implements OnInit {

  private readonly fb       = inject(FormBuilder);
  private readonly tableSvc = inject(TableService);

  isLoading   = signal(true);
  tables      = signal<TableResponse[]>([]);
  showForm    = signal(false);
  editingId   = signal<number | null>(null);
  isSaving    = signal(false);
  errorMsg    = signal('');
  updatingId  = signal<number | null>(null);

  // Zonas estáticas definidas en la migración Flyway del table-service
  readonly zones = [
    { id: 1, name: 'Interior' },
    { id: 2, name: 'Terraza'  },
    { id: 3, name: 'Bar'      },
    { id: 4, name: 'Privado'  },
  ];

  readonly statusOptions = [
    { value: 'AVAILABLE',   label: 'Disponible'   },
    { value: 'OCCUPIED',    label: 'Ocupada'       },
    { value: 'RESERVED',    label: 'Reservada'     },
    { value: 'MAINTENANCE', label: 'Mantenimiento' },
  ];

  readonly form = this.fb.nonNullable.group({
    zoneId:   [1, Validators.required],
    number:   [1, [Validators.required, Validators.min(1)]],
    capacity: [2, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.isLoading.set(true);
    this.tableSvc.getAll().subscribe({
      next: (list) => {
        this.tables.set([...list].sort((a, b) => a.zoneId - b.zoneId || a.number - b.number));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  // Abre el formulario para nueva mesa
  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ zoneId: 1, number: 1, capacity: 2 });
    this.errorMsg.set('');
    this.showForm.set(true);
  }

  // Abre el formulario precargado para editar
  openEdit(table: TableResponse): void {
    this.editingId.set(table.id);
    this.form.patchValue({ zoneId: table.zoneId, number: table.number, capacity: table.capacity });
    this.errorMsg.set('');
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.isSaving.set(true);
    this.errorMsg.set('');
    const payload = { ...this.form.getRawValue(), zoneId: Number(this.form.getRawValue().zoneId) };
    const id = this.editingId();

    const request$ = id
      ? this.tableSvc.update(id, payload)
      : this.tableSvc.create(payload);

    request$.subscribe({
      next: () => { this.showForm.set(false); this.isSaving.set(false); this.load(); },
      error: (err) => {
        this.errorMsg.set(err.status === 409 ? 'Ya existe esa mesa en la zona.' : 'Error al guardar.');
        this.isSaving.set(false);
      },
    });
  }

  changeStatus(id: number, status: string): void {
    this.updatingId.set(id);
    this.tableSvc.updateStatus(id, status).subscribe({
      next: (updated) => {
        this.tables.update(list => list.map(t => t.id === id ? updated : t));
        this.updatingId.set(null);
      },
      error: () => this.updatingId.set(null),
    });
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar esta mesa? Esta acción no se puede deshacer.')) return;
    this.tableSvc.delete(id).subscribe({ next: () => this.load() });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      AVAILABLE:   'bg-green-100 text-green-700',
      OCCUPIED:    'bg-red-100 text-red-700',
      RESERVED:    'bg-yellow-100 text-yellow-700',
      MAINTENANCE: 'bg-gray-100 text-gray-600',
    };
    return map[status] ?? '';
  }

  statusLabel(status: string): string {
    return this.statusOptions.find(s => s.value === status)?.label ?? status;
  }
}

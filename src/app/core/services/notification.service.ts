// Servicio global de notificaciones tipo toast.
// Cualquier componente puede inyectarlo para mostrar mensajes de éxito, error, advertencia e info.
import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id:      number;
  type:    ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private nextId = 0;

  // Signal con la lista de toasts activos — el componente de vista lo observa
  readonly toasts = signal<Toast[]>([]);

  success(message: string, duration = 4000): void {
    this.add('success', message, duration);
  }

  error(message: string, duration = 5000): void {
    this.add('error', message, duration);
  }

  warning(message: string, duration = 4500): void {
    this.add('warning', message, duration);
  }

  info(message: string, duration = 4000): void {
    this.add('info', message, duration);
  }

  // Cierra un toast manualmente por su id
  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  // Agrega el toast y programa su auto-cierre
  private add(type: ToastType, message: string, duration: number): void {
    const id = ++this.nextId;
    this.toasts.update(list => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), duration);
  }
}

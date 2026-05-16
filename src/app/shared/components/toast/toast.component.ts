// Contenedor global de notificaciones toast.
// Se coloca una única vez en app.html y renderiza todos los toasts activos.
import { Component, inject } from '@angular/core';

import { NotificationService, Toast } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.component.html',
})
export class ToastComponent {

  readonly notif = inject(NotificationService);

  // Devuelve las clases de color según el tipo de toast
  borderClass(type: Toast['type']): string {
    const map: Record<Toast['type'], string> = {
      success: 'border-l-green-500',
      error:   'border-l-red-500',
      warning: 'border-l-amber-400',
      info:    'border-l-gold',
    };
    return map[type];
  }

  iconPath(type: Toast['type']): string {
    const map: Record<Toast['type'], string> = {
      success: 'M5 13l4 4L19 7',
      error:   'M6 18L18 6M6 6l12 12',
      warning: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
      info:    'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    };
    return map[type];
  }

  iconClass(type: Toast['type']): string {
    const map: Record<Toast['type'], string> = {
      success: 'text-green-500',
      error:   'text-red-500',
      warning: 'text-amber-400',
      info:    'text-gold',
    };
    return map[type];
  }
}

// Página principal del restaurante Lumière.
// Incluye hero con video de fondo, secciones de presentación y CTA de reserva.
import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-landing',
  imports: [NavbarComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {

  // Links del footer — navegación secundaria
  readonly footerLinks = [
    { label: 'Inicio',   href: '/'            },
    { label: 'Menú',     href: '#menu'         },
    { label: 'Reservas', href: '/reservations' },
    { label: 'Nosotros', href: '#about'        },
  ];

  // Platos destacados que se muestran en la sección menú
  readonly dishes = [
    {
      name:        'Salmón Mediterráneo',
      category:    'Plato Principal',
      description: 'Salmón fresco con cuscús de hierbas, vegetales asados y reducción de limón.',
      price:       '$38.000',
      image:       'assets/images/dish-1.jpg',
    },
    {
      name:        'Selección Gourmet',
      category:    'Para Compartir',
      description: 'Degustación de especialidades de temporada sobre tabla de mármol.',
      price:       '$52.000',
      image:       'assets/images/dish-2.jpg',
    },
    {
      name:        'Fine Dining Signature',
      category:    'Chef\'s Special',
      description: 'Creación exclusiva del chef con ingredientes de temporada cuidadosamente seleccionados.',
      price:       '$65.000',
      image:       'assets/images/dish-3.jpg',
    },
  ];
}

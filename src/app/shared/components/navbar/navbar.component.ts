// Navbar fijo con efecto transparente → sólido al hacer scroll.
// Incluye menú hamburguesa para pantallas móviles.
import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {

  // Controla si el navbar tiene fondo sólido (true = usuario hizo scroll)
  isScrolled = signal(false);

  // Controla si el menú móvil está abierto
  isMenuOpen = signal(false);

  // Escucha el scroll de la ventana para cambiar el estilo del navbar
  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 50);
  }

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  // Links de navegación principal
  readonly navLinks = [
    { label: 'Inicio',    href: '/'             },
    { label: 'Menú',      href: '#menu'          },
    { label: 'Reservas',  href: '/reservations'  },
    { label: 'Nosotros',  href: '#about'         },
  ];
}

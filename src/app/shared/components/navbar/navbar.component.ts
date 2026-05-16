// Navbar fijo con efecto transparente → sólido al hacer scroll.
// Acepta input `solid` para forzar estilo sólido en páginas sin hero.
// Muestra login/registro o el nombre del usuario según la sesión activa.
import { Component, HostListener, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {

  readonly auth = inject(AuthService);

  // Cuando solid=true el navbar siempre muestra fondo sólido (páginas internas)
  solid = input(false);

  // Controla si el navbar tiene fondo sólido (true = usuario hizo scroll)
  isScrolled = signal(false);

  // Controla si el menú móvil está abierto
  isMenuOpen = signal(false);

  // Controla si el dropdown de usuario está abierto
  isUserMenuOpen = signal(false);

  // Devuelve true si debe mostrarse sólido: por prop o por scroll
  get isSolid(): boolean {
    return this.solid() || this.isScrolled();
  }

  // Escucha el scroll de la ventana para cambiar el estilo del navbar
  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 50);
    this.isUserMenuOpen.set(false);
  }

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
  }

  logout(): void {
    this.auth.logout();
    this.isUserMenuOpen.set(false);
    this.isMenuOpen.set(false);
  }

  // Links de navegación principal
  readonly navLinks = [
    { label: 'Inicio',   href: '/'            },
    { label: 'Menú',     href: '#menu'         },
    { label: 'Reservas', href: '/reservaciones' },
    { label: 'Nosotros', href: '#about'        },
  ];
}

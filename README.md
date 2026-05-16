# Restaurant Reservation — Frontend

SPA desarrollada en **Angular 19** que consume la API REST del sistema de reservas de restaurante. Se comunica exclusivamente con el `api-gateway` en `http://localhost:8080`.

## Tecnologías

- Angular 19
- TypeScript
- SCSS
- Angular Router

## Requisitos previos

- Node.js 18+
- npm 9+
- Angular CLI: `npm install -g @angular/cli`
- Backend corriendo ([restaurant-reservation-apiu](https://github.com/0xjuans/restaurant-reservation-apiu))

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/juans.quintoh/restaurant-reservation-front.git
cd restaurant-reservation-front

# Instalar dependencias
npm install
```

## Ejecutar en desarrollo

```bash
ng serve
```

Abre el navegador en `http://localhost:4200`.

## Build para producción

```bash
ng build
```

Los archivos compilados quedan en `dist/`.

## Estructura del proyecto

```
src/
├── app/
│   ├── core/           # Servicios globales, interceptores, guards
│   ├── features/       # Módulos por funcionalidad
│   │   ├── auth/       # Login y registro
│   │   ├── reservations/
│   │   ├── tables/
│   │   └── customers/
│   ├── shared/         # Componentes y utilidades reutilizables
│   ├── app.routes.ts
│   └── app.config.ts
└── environments/       # Variables de entorno
```

## Backend

Este frontend requiere que el backend esté corriendo. Consulta el repositorio [restaurant-reservation-apiu](https://github.com/0xjuans/restaurant-reservation-apiu) para instrucciones de instalación con Docker.

| Servicio | URL |
|---|---|
| API Gateway | http://localhost:8080 |
| Eureka | http://localhost:8761 |
| MailHog | http://localhost:8025 |
| pgAdmin | http://localhost:5050 |

// pages/components/sidebar.menus.ts
import type { SidebarItem } from './sidebar.component';
import { AppRoutes } from '../../routes/app.routes';

export const adminSidebarItems: Record<string, SidebarItem> = {
  clientes: { href: AppRoutes.admin.users, name: 'Clientes' },
  mascotas: { href: AppRoutes.admin.pets, name: 'Mascotas' },
  productos: { href: AppRoutes.admin.products, name: 'Productos' },
  facturacion: { href: AppRoutes.admin.billing, name: 'Facturación' },
  programacionCitas: {
    href: AppRoutes.admin.calendar,
    name: 'Programación de citas',
  },
  visualizarCitas: {
    href: AppRoutes.admin.externalCalendar,
    name: 'Visualizar citas',
    external: true,
  },
};

export const clientSidebarItems: Record<string, SidebarItem> = {
  servicios: { href: AppRoutes.client.catalog, name: 'Servicios Ofrecidos' },
  mascotas: { href: AppRoutes.client.pets, name: 'Mascotas' },
  visualizarCitas: {
    href: AppRoutes.client.appointments,
    name: 'Visualizar Citas',
  },
};

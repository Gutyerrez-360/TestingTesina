export const AppRoutes = {
  home: '/',
  login: '/login',
  admin: {
    base: '/admin',
    users: '/admin/users',
    pets: '/admin/userAndPets',
    petDetails: (petId: string | number) => `/admin/pets/${petId}`,
    products: '/admin/products',
    billing: '/admin/facturations',
    calendar: '/admin/calendar',
    externalCalendar: 'https://calendar.google.com/calendar/u/0/r',
  },
  client: {
    catalog: '/client/catalogo',
    pets: '/client/mascotas',
    appointments: '/client/visualizar',
  },
} as const;

export type AppRoutesDefinition = typeof AppRoutes;

export type AdminRouteKey = keyof AppRoutesDefinition['admin'];

export const isInternalRoute = (path: string) => path.startsWith('/');

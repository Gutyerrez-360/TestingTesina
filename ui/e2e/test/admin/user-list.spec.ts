import { test, expect } from '../../fixtures/auth.fixture';
import { UserListItem } from '../../pages/admin/component/user-card.component';
import { AppRoutes } from '../../routes/app.routes';
import { AdminUsersPage } from '../../pages/admin/users.page';

test.describe('Gestión de la lista de usuarios', () => {
  test('debería encontrar un usuario y verificar sus datos', async ({
    page,
  }) => {
    const users = new AdminUsersPage(page);
    await users.goto();
    // 1. Localiza el elemento <li> específico que contiene el correo del usuario.
    // Esta es la forma más robusta de encontrar el componente de un usuario en particular.
    const userItemLocator = page.locator('li.MuiListItem-root', {
      hasText: 'fabioflores021@gmail.com',
    });

    // 2. Crea una instancia de tu clase de componente con ese locator.
    const fabioUser = new UserListItem(userItemLocator);

    // 3. Ahora puedes usar los métodos y aserciones de la clase.
    const details = await fabioUser.getDetails();

    // Verificaciones
    expect(details.usuario).toBe('Fabio Flores');
    expect(details.role).toBe('Administrador');

    // O usar el método de aserción integrado
    await fabioUser.assertHasUsername('Fabio Flores');
  });
});

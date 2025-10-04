import { test, expect } from '../../fixtures/auth.fixture';
import { AdminUsersPage } from '../../pages/admin/users.page';
import { makeNewUser } from '../../factories/user.factory';
import { AppRoutes } from '../../routes/app.routes';
import { CreateUserModal } from '../../pages/admin/component/create-user-modal.component';

test.beforeEach(async ({ page, login }) => {
  await login();
  await page.waitForURL(AppRoutes.admin.base);
});

test('admin crea cliente y aparece en la lista', async ({ page }) => {
  const users = new AdminUsersPage(page);
  await users.goto();
  await users.clickAddUser();

  // Create user
  const modal = new CreateUserModal(page);
  const newUser = makeNewUser({
    roleName: 'client',
  });
  await modal.create(newUser);
  await page.waitForTimeout(500);
  await modal.close();

  // Check user is created and listed
  await users.search(newUser.email);
  await expect(users.totalUsersCounter).toContainText('1');
});

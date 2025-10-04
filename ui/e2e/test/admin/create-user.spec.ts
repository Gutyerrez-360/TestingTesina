import { test, expect } from '../../fixtures/auth.fixture';
import { CreateUserModal } from '../../pages/components/create-user-modal.component';
import { AdminUsersPage } from '../../pages/admin/users.page';
import { makeNewUser } from '../../factories/user.factory';
import { AppRoutes } from '../../routes/app.routes';

test.beforeEach(async ({ page, login }) => {
  await login();
  await page.waitForURL(AppRoutes.admin.base);
});

test('admin crea cliente y aparece en la lista', async ({ page }) => {
  const users = new AdminUsersPage(page);
  await users.goto();
  await users.clickAddUser();

  const modal = new CreateUserModal(page);
  const newUser = makeNewUser({
    roleName: 'client',
    birthDateDDMMYYYY: '01/01/2016',
  });
  await modal.create(newUser);
  await page.waitForTimeout(500);
  await modal.close();

  await users.searchInput.fill(newUser.email);
  await page.waitForTimeout(500);
  await expect(users.totalUsersCounter).toContainText('1');
});

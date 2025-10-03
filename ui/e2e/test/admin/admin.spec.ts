import { test, expect } from '../../fixtures/auth.fixture';
import { AdminDashboardPage } from '../../pages/admin/dashboard.page';
import { AppRoutes } from '../../routes/app.routes';

test.beforeEach(async ({ page, login }) => {
  await login();
  await page.waitForURL(AppRoutes.admin.base);
});

test('dashboard loads welcome message', async ({ page }) => {
  const dashboard = new AdminDashboardPage(page);
  await dashboard.goto();
  await dashboard.expectWelcomeVisible();
});

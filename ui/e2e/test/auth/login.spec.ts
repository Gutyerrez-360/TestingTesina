import { test, expect } from '../../fixtures/auth.fixture';

test('user can log in', async ({ page, login }) => {
  await login(); // uses default creds from env
  await expect(page).toHaveURL(/admin/);
});

import { test, expect } from '../../fixtures/auth.fixture';

test('user can log in', async ({ page, login }) => {
  await login(); // uses default creds from env
  await expect(page).toHaveURL(/admin/);
});

test('should fail with incorrect credentials', async ({ page, login }) => {
  await login({ email: 'other@example.com', password: 'secret123' });
  const messageAlert = await page.getByRole('alert');

  expect(messageAlert).toContainText('¡Fallo inicio de sesión!');
});

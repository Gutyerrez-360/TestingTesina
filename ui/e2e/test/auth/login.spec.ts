import { test as authedTest, expect } from '../../fixtures/auth.fixture';

const test = authedTest.extend({
  authenticatedContext: [
    async ({ browser }, use, workerInfo) => {
      const baseURL = workerInfo.project.use.baseURL;
      const context = await browser.newContext({
        ...(baseURL ? { baseURL } : {}),
      });
      await use(context);
      await context.close();
    },
    { scope: 'worker' },
  ],
});

test('user can log in', async ({ page, login }) => {
  await login();
  await expect(page).toHaveURL(/admin/);
});

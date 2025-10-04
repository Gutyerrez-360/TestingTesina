import { test as base, type BrowserContext } from '@playwright/test';
import { LoginPage } from '../pages/base/login.base';
import { requireEnv } from '../utils/require-env.util';
import { AppRoutes } from '../routes/app.routes';

type TestFixtures = {
  login: (user?: { email: string; password: string }) => Promise<void>;
};

type WorkerFixtures = {
  authenticatedContext: BrowserContext;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  authenticatedContext: [
    async ({ browser }, use, workerInfo) => {
      const baseURL = workerInfo.project.use.baseURL;
      const context = await browser.newContext({
        ...(baseURL ? { baseURL } : {}),
      });

      const page = await context.newPage();
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.loginAs(
        requireEnv('ADMIN_EMAIL'),
        requireEnv('ADMIN_PASSWORD')
      );
      await page.waitForURL(new RegExp(AppRoutes.admin.base));
      await page.close();

      await use(context);

      await context.close();
    },
    { scope: 'worker' },
  ],

  context: [
    async ({ authenticatedContext }, use) => {
      await use(authenticatedContext);
    },
    { scope: 'test' },
  ],

  page: [
    async ({ context }, use) => {
      const page = await context.newPage();
      await use(page);
      await page.close();
    },
    { scope: 'test' },
  ],

  login: async ({ page }, use) => {
    const loginFn = async (
      user = {
        email: requireEnv('ADMIN_EMAIL'),
        password: requireEnv('ADMIN_PASSWORD'),
      }
    ) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.loginAs(user.email, user.password);
      await page.waitForURL(new RegExp(AppRoutes.admin.base));
    };

    await use(loginFn);
  },
});

export const expect = test.expect;

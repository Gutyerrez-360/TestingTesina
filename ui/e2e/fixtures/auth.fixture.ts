import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { requireEnv } from '../utils/require-env.util';

type Fixtures = {
  login: (user?: { email: string; password: string }) => Promise<void>;
};

export const test = base.extend<Fixtures>({
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
    };

    await use(loginFn);
  },
});

export const expect = test.expect;

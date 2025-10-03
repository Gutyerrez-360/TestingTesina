import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;

  constructor(page: Page) {
    this.page = page;
    this.email = page.getByLabel('Correo electrónico');
    this.password = page.getByLabel('Contraseña');
    this.submit = page.getByRole('button', {
      name: 'Inicia sesión',
      exact: true,
    });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async loginAs(email: string, pwd: string) {
    await this.email.fill(email);
    await this.password.fill(pwd);
    await this.submit.click();
  }
}

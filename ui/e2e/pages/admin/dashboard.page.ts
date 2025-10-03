import { Page, Locator, expect } from '@playwright/test';
import { Sidebar } from '../components/sidebar.component';
import { adminSidebarItems } from '../components/sidebar.menus';
import { AppRoutes } from '../../routes/app.routes';

export class AdminDashboardPage {
  readonly page: Page;

  // --- App bar / header ---
  readonly menuButton: Locator; // hamburger (aria-label="open drawer")
  readonly logoutButton: Locator; // "Cerrar sesión" button

  // --- Sidebar (reusable component) ---
  readonly sidebar: Sidebar;

  // --- Main content / landmarks ---
  readonly main: Locator; // <main>
  readonly h1: Locator; // heading level 1
  readonly welcomeHero: Locator; // "¡Bienvenido a Clínica Veterinaria MISTUN!"
  readonly logoTop: Locator; // top logo in drawer
  readonly logoHero: Locator; // large logo in main

  constructor(page: Page) {
    this.page = page;

    // App bar
    this.menuButton = page.getByRole('button', { name: /open drawer/i });
    this.logoutButton = page.getByRole('button', { name: /cerrar sesi[oó]n/i });

    // Sidebar (scoped to the <ul> list to avoid accidental matches)
    this.sidebar = new Sidebar(page, {
      items: adminSidebarItems,
      // If you want to scope to a specific UL inside the drawer, pass a root:
      // root: page.locator('nav[aria-label="mailbox folders"]').locator('ul.MuiList-root'),
    });

    // Landmarks / content
    this.main = page.getByRole('main');
    this.h1 = page.getByRole('heading', { level: 1 });
    this.welcomeHero = page.getByRole('heading', {
      name: /bienvenido a cl[ií]nica veterinaria mistun/i,
    });
    this.logoTop = page.locator('nav img[alt="logo"]'); // drawer logo
    this.logoHero = page.locator('main img[alt="logo"]'); // main logo (big)
  }

  // --- Navigation ---
  async goto() {
    await this.page.goto(AppRoutes.admin.base);
    await this.waitLoaded();
  }

  async openUsers() {
    await this.sidebar.goTo('clientes');
    await this.sidebar.expectActive('clientes');
    await expect(this.page).toHaveURL(AppRoutes.admin.users);
  }

  async openPets() {
    await this.sidebar.goTo('mascotas');
    await this.sidebar.expectActive('mascotas');
    await expect(this.page).toHaveURL(AppRoutes.admin.pets);
  }

  async openProducts() {
    await this.sidebar.goTo('productos');
    await this.sidebar.expectActive('productos');
    await expect(this.page).toHaveURL(AppRoutes.admin.products);
  }

  async openBilling() {
    await this.sidebar.goTo('facturacion');
    await this.sidebar.expectActive('facturacion');
    await expect(this.page).toHaveURL(AppRoutes.admin.billing);
  }

  async openAppointments() {
    await this.sidebar.goTo('programacionCitas');
    await this.sidebar.expectActive('programacionCitas');
    await expect(this.page).toHaveURL(AppRoutes.admin.calendar);
  }

  async openExternalCalendar() {
    const popup = await this.sidebar.openExternal('visualizarCitas');
    return popup;
  }

  // --- App bar actions ---
  async openDrawer() {
    await this.menuButton.click();
  }

  async logout() {
    await this.logoutButton.click();
    // Add an assertion/URL if your app redirects to /login, for example:
    // await expect(this.page).toHaveURL(/\/login/);
  }

  // --- Page readiness & sanity checks ---
  async waitLoaded() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
    await expect(this.main).toBeVisible();
  }

  async expectWelcomeVisible() {
    await expect(this.welcomeHero).toBeVisible();
    await expect(this.logoHero).toBeVisible();
  }
}

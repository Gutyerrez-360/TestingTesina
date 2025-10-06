import { Page, Locator, expect } from '@playwright/test';
import { UserListItem } from './component/user-card.component';
import { Sidebar } from '../components/sidebar.component';
import { adminSidebarItems } from '../components/sidebar.menus';
import { AppRoutes } from '../../routes/app.routes';

type UserActionIcon =
  | 'VisibilityIcon'
  | 'ModeEditIcon'
  | 'DeleteIcon'
  | 'PetsIcon';

export class AdminUsersPage {
  readonly page: Page;

  // --- App bar / header ---
  readonly menuButton: Locator;
  readonly logoutButton: Locator;

  // --- Sidebar ---
  readonly sidebar: Sidebar;

  // --- Main content ---
  readonly container: Locator;
  readonly addUserButton: Locator;
  readonly tabList: Locator;
  readonly totalUsersCounter: Locator;
  readonly searchInput: Locator;
  readonly userItems: Locator;
  readonly loadMoreButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // App bar controls (shared layout with the dashboard)
    this.menuButton = page.getByRole('button', { name: /open drawer/i });
    this.logoutButton = page.getByRole('button', { name: /cerrar sesi[oó]n/i });

    // Shared sidebar component
    this.sidebar = new Sidebar(page, { items: adminSidebarItems });

    // Users page content
    this.container = page.locator('.users-page');
    this.addUserButton = this.container.getByRole('button', {
      name: /registrar usuario/i,
    });
    this.tabList = this.container.getByRole('tablist');
    this.totalUsersCounter = this.container.getByText(
      /total usuarios registrados/i
    );
    this.searchInput = this.container.getByRole('textbox', {
      name: /buscar/i,
    });
    this.userItems = this.container.locator('li.MuiListItem-root');
    this.loadMoreButton = this.container.getByRole('button', {
      name: /cargar más usuarios/i,
    });
  }

  // --- Navigation ---
  async goto() {
    await this.page.goto(AppRoutes.admin.users);
    await this.waitLoaded();
  }

  // --- Expectations ---
  async waitLoaded() {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.container).toBeVisible();
    await expect(this.tabList).toBeVisible();
  }

  async expectUsersCounterVisible() {
    await expect(this.totalUsersCounter).toBeVisible();
  }

  async expectUserVisible(email: string) {
    await expect(this.userCard(email)).toBeVisible();
  }

  // --- Interactions ---
  async openSidebarUsers() {
    await this.sidebar.goTo('clientes');
    await this.sidebar.expectActive('clientes');
  }

  async clickAddUser() {
    await this.addUserButton.click();
  }

  async search(term: string) {
    await this.searchInput.fill(term);
    await this.waitForSearchSpinner();
  }

  async clearSearch() {
    await this.searchInput.fill('');
  }

  async loadMore() {
    await this.loadMoreButton.click();
    await this.waitForSearchSpinner();
  }

  async loadMoreTimes(times: number) {
    if (times <= 0) {
      return;
    }

    for (let i = 0; i < times; i++) {
      if (!(await this.isLoadMoreEnabled())) {
        break;
      }

      await this.loadMore();
    }
  }

  async loadAllUsers(): Promise<void> {
    while (await this.isLoadMoreEnabled()) {
      await this.loadMore();
    }
  }

  async getVisibleUsers(): Promise<UserListItem[]> {
    await this.waitForAnyUser();
    const locators = await this.userItems.all();
    return locators.map((locator) => new UserListItem(locator));
  }

  async openUserDetails(email: string) {
    await this.userAction(email, 'VisibilityIcon').click();
  }

  async editUser(email: string) {
    await this.userAction(email, 'ModeEditIcon').click();
  }

  async deleteUser(email: string) {
    await this.userAction(email, 'DeleteIcon').click();
  }

  async openUserPets(email: string) {
    await this.userAction(email, 'PetsIcon').click();
  }

  // --- Helpers ---
  userCard(email: string): Locator {
    return this.userItems.filter({ hasText: email });
  }

  private userAction(email: string, icon: UserActionIcon): Locator {
    const card = this.userCard(email);
    return card
      .locator('button')
      .filter({ has: card.locator(`[data-testid="${icon}"]`) });
  }

  private async isLoadMoreEnabled(): Promise<boolean> {
    const visible = await this.loadMoreButton.isVisible().catch(() => false);
    if (!visible) {
      return false;
    }

    const disabled = await this.loadMoreButton.isDisabled().catch(() => true);
    return !disabled;
  }

  private async waitForAnyUser(timeout = 5000): Promise<boolean> {
    try {
      await this.userItems.first().waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  private async waitForSearchSpinner() {
    const spinner = this.container.locator('[role="progressbar"]').first();
    // Algunos renders activan el spinner después del fill, por lo que
    // esperamos primero a que aparezca y luego a que desaparezca.
    try {
      await spinner.waitFor({ state: 'visible', timeout: 1000 });
    } catch {
      // Si no apareció, continuamos; evita fallar en búsquedas instantáneas.
    }
    await spinner.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }
}

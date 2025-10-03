// pages/components/sidebar.component.ts
import { Page, Locator, expect } from '@playwright/test';

export type SidebarItem = {
  /** Stable route. Prefer href over visible text for i18n resilience. */
  href: string;
  /** Human label (used only as a fallback). Can be exact string or regex. */
  name?: string | RegExp;
  /** External links open new tab/window. */
  external?: boolean;
};

export type SidebarOptions = {
  /** Optional: UL container if there are multiple navs on the page. */
  root?: Locator;
  /** Dictionary of items (id -> config). */
  items: Record<string, SidebarItem>;
};

export class Sidebar {
  readonly page: Page;
  readonly container: Locator;
  readonly items: Record<string, SidebarItem>;

  constructor(page: Page, { root, items }: SidebarOptions) {
    this.page = page;
    this.container = root ?? page.locator('ul.MuiList-root'); // fallback to main UL
    this.items = items;
  }

  /** Primary locator strategy: href (most stable). */
  private linkByHref(href: string) {
    return this.container.locator(`a[href="${href}"]`);
  }

  /** Fallback strategy: role=link by accessible name. */
  private linkByName(name: string | RegExp) {
    return this.container.getByRole('link', {
      name,
      exact: typeof name === 'string',
    });
  }

  /** Resolve link locator by id using href first, then name. */
  link(id: keyof typeof this.items): Locator {
    const item = this.items[id as string];
    if (!item)
      throw new Error(`Sidebar item "${String(id)}" not found in config.`);
    const byHref = this.linkByHref(item.href);
    return item.name ? byHref.or(this.linkByName(item.name)) : byHref;
  }

  /** Navigate to internal routes (SPA). */
  async goTo(id: keyof typeof this.items) {
    const item = this.items[id as string];
    const link = this.link(id);

    if (item.external) {
      // Guard: user called goTo() on an external link
      throw new Error(
        `Item "${String(id)}" is external. Use openExternal("${String(
          id
        )}") instead.`
      );
    }

    await link.click();
    // Wait for SPA navigation (URL change or idle)
    await Promise.race([
      this.page.waitForURL((url) => url.pathname === item.href, {
        timeout: 10_000,
      }),
      this.page.waitForLoadState('networkidle'),
    ]);
  }

  /** For external links that open a new tab/window. */
  async openExternal(id: keyof typeof this.items) {
    const item = this.items[id as string];
    if (!item?.external)
      throw new Error(`Item "${String(id)}" is not marked external.`);
    const [popup] = await Promise.all([
      this.page.waitForEvent('popup'),
      this.link(id).click(),
    ]);
    await popup.waitForLoadState('domcontentloaded');
    return popup;
  }

  /** Detect active state using aria-current, class "active", or current URL. */
  async isActive(id: keyof typeof this.items): Promise<boolean> {
    const item = this.items[id as string];
    const link = this.link(id);
    const ariaCurrent = await link.getAttribute('aria-current');
    if (ariaCurrent === 'page' || ariaCurrent === 'true') return true;

    const className = (await link.getAttribute('class')) ?? '';
    if (/\bactive\b/.test(className)) return true;

    // URL-based heuristic (works when route highlights aren't set)
    const url = new URL(this.page.url());
    return url.pathname === item.href;
  }

  async expectActive(id: keyof typeof this.items) {
    await expect.poll(() => this.isActive(id)).toBeTruthy();
  }
}

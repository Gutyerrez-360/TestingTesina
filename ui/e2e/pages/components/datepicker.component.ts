import { expect, Locator, Page } from '@playwright/test';

const CALENDAR_HEADER_SELECTOR =
  'div[id$="-grid-label"].MuiPickersCalendarHeader-label, div[class*="MuiPickersCalendarHeader-label"]:not([class*="Container"])';

type DatepickerOptions = {
  trigger: () => Locator;
  dialog?: () => Locator;
};

export class DatepickerComponent {
  constructor(private page: Page, private options: DatepickerOptions) {}

  private get trigger() {
    return this.options.trigger();
  }

  private get dialog() {
    return this.options.dialog
      ? this.options.dialog()
      : this.page.getByRole('dialog');
  }

  private monthNameToIndex(name: string): number {
    const n = name.trim().toLowerCase();
    const map: Record<string, number> = {
      january: 1,
      febrero: 2,
      march: 3,
      marzo: 3,
      april: 4,
      abril: 4,
      may: 5,
      mayo: 5,
      june: 6,
      junio: 6,
      july: 7,
      julio: 7,
      august: 8,
      agosto: 8,
      september: 9,
      septiembre: 9,
      october: 10,
      octubre: 10,
      november: 11,
      noviembre: 11,
      december: 12,
      diciembre: 12,
    };
    const idx = map[n];
    if (!idx) throw new Error(`Mes no reconocido: "${name}"`);
    return idx;
  }

  private async readCalendarHeader(dialog = this.dialog): Promise<{
    month: number;
    year: number;
    label: string;
  }> {
    const header = dialog.locator(CALENDAR_HEADER_SELECTOR).first();
    await expect(header).toBeVisible();
    const text = (await header.textContent())?.trim() ?? '';
    const [monthStr, yearStr] = text.split(/\s+/);
    const month = this.monthNameToIndex(monthStr);
    const year = Number(yearStr);
    return { month, year, label: text };
  }

  private async openDialog(): Promise<Locator> {
    const dialog = this.dialog;
    await this.trigger.click();
    await dialog.waitFor({ state: 'visible' });
    return dialog;
  }

  async selectDate(day: number, month: number, year: number) {
    const dialog = await this.openDialog();

    const toggleToYear = dialog.getByRole('button', {
      name: /switch to year view|vista de a[ñn]o|calendar view is open/i,
    });
    if (await toggleToYear.isVisible().catch(() => false)) {
      await toggleToYear.click();
    } else {
      const headerLabel = dialog.locator(CALENDAR_HEADER_SELECTOR).first();
      await headerLabel.click();
    }

    const yearButtons = dialog.getByRole('button', { name: /^\d{4}$/ });
    try {
      await yearButtons.first().waitFor({ state: 'visible', timeout: 1500 });
    } catch {
      const headerLabel = dialog.locator(CALENDAR_HEADER_SELECTOR).first();
      await headerLabel.click();
      await yearButtons
        .first()
        .waitFor({ state: 'visible', timeout: 1500 })
        .catch(() => {});
    }

    let yearBtn = dialog.getByRole('button', { name: String(year) }).first();
    if (!(await yearBtn.isVisible().catch(() => false))) {
      yearBtn = this.page.getByRole('button', { name: String(year) }).first();
    }

    await yearBtn.scrollIntoViewIfNeeded();
    await yearBtn.click({ timeout: 5000 });

    const { month: currentMonth } = await this.readCalendarHeader(dialog);
    const prevBtn = dialog.getByRole('button', { name: /Previous month/i });
    const nextBtn = dialog.getByRole('button', { name: /Next month/i });

    const { month: headerMonth, year: headerYear } =
      await this.readCalendarHeader(dialog);
    if (headerYear !== year) {
      const targetIdx = year * 12 + (month - 1);
      const currentIdx = headerYear * 12 + (headerMonth - 1);
      const delta = targetIdx - currentIdx;
      const steps = Math.abs(delta);
      for (let i = 0; i < steps; i++) {
        if (delta > 0) {
          await nextBtn.click();
        } else {
          await prevBtn.click();
        }
      }
    }

    const diff = month - currentMonth;
    if (diff !== 0) {
      const clicks = Math.abs(diff);
      for (let i = 0; i < clicks; i++) {
        if (diff > 0) {
          await nextBtn.click();
        } else {
          await prevBtn.click();
        }
      }
    }

    await dialog
      .locator(
        '.MuiDayCalendar-monthContainer.MuiPickersSlideTransition-slideExit'
      )
      .waitFor({ state: 'detached' })
      .catch(() => {});

    const targetTs = new Date(year, month - 1, day)
      .setHours(0, 0, 0, 0)
      .toString();
    const byTimestamp = dialog.locator(
      `[role="gridcell"][type="button"][data-timestamp="${targetTs}"]`
    );

    if (await byTimestamp.count()) {
      await byTimestamp.first().click();
    } else {
      const candidates = dialog
        .locator('[role="gridcell"][type="button"]')
        .filter({ hasText: new RegExp(`^${day}$`) });

      const total = await candidates.count();
      let clicked = false;
      for (let i = 0; i < total; i++) {
        const element = candidates.nth(i);
        const tsAttr = await element.getAttribute('data-timestamp');
        if (!tsAttr) continue;
        const dateValue = new Date(Number(tsAttr));
        if (
          dateValue.getFullYear() === year &&
          dateValue.getMonth() === month - 1
        ) {
          await element.click();
          clicked = true;
          break;
        }
      }
      if (!clicked) {
        throw new Error(
          `No se encontró el día ${day} para ${month}/${year} en el datepicker.`
        );
      }
    }

    await dialog.waitFor({ state: 'hidden' }).catch(() => {});
  }

  async selectDateFromString(dateDDMMYYYY: string) {
    const [dd, mm, yyyy] = dateDDMMYYYY.split('/').map(Number);
    await this.selectDate(dd, mm, yyyy);
  }
}

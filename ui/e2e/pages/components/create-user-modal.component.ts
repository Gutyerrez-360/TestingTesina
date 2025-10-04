import { Page, Locator, expect } from '@playwright/test';

export type NewUser = {
  firstName: string;
  lastName: string;
  email: string;
  birthDateDDMMYYYY: string; // e.g. "07/03/1992"
  password: string;
  roleName: string; // e.g. "client" or "admin"
  phone: string; // e.g. "7234-5678"
  address: string;
  dui: string; // e.g. "01234567-8"
};

export class CreateUserModal {
  constructor(private page: Page) {}

  // Title is unique in this modal — good handle to detect open/closed state
  get modalTitle() {
    return this.page.getByRole('heading', { name: /crear nuevo usuario/i });
  }

  // Inputs by accessible label (stable, ignores MUI class churn)
  get firstName() {
    return this.page.getByLabel(/nombres/i);
  }
  get lastName() {
    return this.page.getByLabel(/apellidos/i);
  }
  get email() {
    return this.page.getByLabel(/^correo$/i);
  }
  get birthDate() {
    return this.page.getByLabel(/Fecha de Nacimiento/);
  }
  get password() {
    return this.page.getByLabel(/contraseña/i);
  }
  get phone() {
    return this.page.getByLabel(/tel[eé]fono/i);
  }
  get address() {
    return this.page.getByLabel(/direcci[oó]n/i);
  }
  get dui() {
    return this.page.getByLabel(/^dui$/i);
  }

  // MUI Autocomplete (role="combobox") for role
  get roleCombo() {
    return this.page.getByRole('combobox', { name: /selecciona un rol/i });
  }

  // Actions
  get submitBtn() {
    return this.page.getByRole('button', { name: /^registrar$/i });
  }
  get cancelBtn() {
    return this.page.getByRole('button', { name: /^cancelar$/i });
  }

  // Abre el popper del datepicker
  get openBirthDatePickerBtn() {
    // El botón tiene aria-label "Choose date, selected date is ..."
    // Soporta también texto en español.
    return this.page.getByRole('button', {
      name: /choose date|elegir fecha|elige fecha/i,
    });
  }

  // El diálogo del datepicker (Popper con role=dialog)
  get calendarDialog() {
    return this.page.getByRole('dialog');
  }

  // Mapa meses (en y es)
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

  // Lee "October 2025" / "Octubre 2025" del encabezado del calendario
  private async readCalendarHeader(
    dialog = this.calendarDialog
  ): Promise<{ month: number; year: number; label: string }> {
    const headerQuery =
      'div[id$="-grid-label"].MuiPickersCalendarHeader-label, div[class*="MuiPickersCalendarHeader-label"]:not([class*="Container"])';
    const header = dialog.locator(headerQuery).first();
    await expect(header).toBeVisible();
    const text = (await header.textContent())?.trim() ?? '';
    const [monthStr, yearStr] = text.split(/\s+/);
    const month = this.monthNameToIndex(monthStr);
    const year = Number(yearStr);
    return { month, year, label: text };
  }

  /** Abre el datepicker y selecciona una fecha concreta (día/mes/año). */
  async setBirthDateViaPicker(day: number, month: number, year: number) {
    // 1) Abrir el popper del calendario
    await this.openBirthDatePickerBtn.click();
    const dialog = this.calendarDialog;
    await dialog.waitFor({ state: 'visible' });

    // 2) Cambiar a vista de año (forma robusta)
    //    a) Si existe el toggle accesible, úsalo
    const toggleToYear = dialog.getByRole('button', {
      name: /switch to year view|vista de a[ñn]o|calendar view is open/i,
    });
    if (await toggleToYear.isVisible().catch(() => false)) {
      await toggleToYear.click();
    } else {
      //    b) Fallback universal: click en el label del header (MUI alterna vista)
      const headerLabel = dialog
        .locator(
          'div[id$="-grid-label"].MuiPickersCalendarHeader-label,' +
            ' div[class*="MuiPickersCalendarHeader-label"]:not([class*="Container"])'
        )
        .first();
      await headerLabel.click();
    }

    // 3) Elegir el año de forma compatible con runtimes
    //    Espera a que aparezcan botones de 4 dígitos (a veces tardan en Chromium por la transición)
    const yearButtons = dialog.getByRole('button', { name: /^\d{4}$/ });
    try {
      await yearButtons.first().waitFor({ state: 'visible', timeout: 1500 });
    } catch {
      // Si no asoman, intenta alternar nuevamente la vista desde el header
      const headerLabel = dialog
        .locator(
          'div[id$="-grid-label"].MuiPickersCalendarHeader-label,' +
            ' div[class*="MuiPickersCalendarHeader-label"]:not([class*="Container"])'
        )
        .first();
      await headerLabel.click();
      await yearButtons
        .first()
        .waitFor({ state: 'visible', timeout: 1500 })
        .catch(() => {});
    }

    //    Toma el botón del año deseado
    let yearBtn = dialog.getByRole('button', { name: String(year) }).first();

    //    Si no existe visible aún en Chromium, intenta fuera del scope del dialog por si el portal cambió el contenedor
    if (!(await yearBtn.isVisible().catch(() => false))) {
      yearBtn = this.page.getByRole('button', { name: String(year) }).first();
    }

    //    Asegura visibilidad en viewport y haz click
    await yearBtn.scrollIntoViewIfNeeded();
    await yearBtn.click({ timeout: 5000 });

    // 4) Ajustar el mes (ya estamos de vuelta en la vista de días para ese año)
    const { month: curMonth } = await this.readCalendarHeader(dialog);
    const prevBtn = dialog.getByRole('button', {
      name: /Previous month/i,
    });
    const nextBtn = dialog.getByRole('button', {
      name: /Next month/i,
    });

    // Verifica que el header refleje el año solicitado; si no, navega por meses hasta alcanzarlo
    const { month: headerMonth, year: headerYear } =
      await this.readCalendarHeader(dialog);
    if (headerYear !== year) {
      const prevBtn = dialog.getByRole('button', { name: /Previous month/i });
      const nextBtn = dialog.getByRole('button', { name: /Next month/i });
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

    const diff = month - curMonth; // + => next, - => prev
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

    // 5) Elegir el día (robusto ante meses duplicados por animación)
    // Espera a que termine cualquier transición de salida para evitar duplicados.
    await dialog
      .locator(
        '.MuiDayCalendar-monthContainer.MuiPickersSlideTransition-slideExit'
      )
      .waitFor({ state: 'detached' })
      .catch(() => {
        /* si no existe, seguimos */
      });

    // Intento 1: seleccionar por data-timestamp exacto (único)
    const targetTs = new Date(year, month - 1, day)
      .setHours(0, 0, 0, 0)
      .toString();
    const byTimestamp = dialog.locator(
      `[role="gridcell"][type="button"][data-timestamp="${targetTs}"]`
    );

    if (await byTimestamp.count()) {
      await byTimestamp.first().click();
    } else {
      // Intento 2: por texto del día pero filtrando por mes/año con data-timestamp
      const candidates = dialog
        .locator('[role="gridcell"][type="button"]')
        .filter({ hasText: new RegExp(`^${day}$`) });

      const total = await candidates.count();
      let clicked = false;
      for (let i = 0; i < total; i++) {
        const el = candidates.nth(i);
        const tsAttr = await el.getAttribute('data-timestamp');
        if (!tsAttr) continue;
        const d = new Date(Number(tsAttr));
        if (d.getFullYear() === year && d.getMonth() === month - 1) {
          await el.click();
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

    // Si el datepicker se cierra al seleccionar, espera el cierre (evita carreras).
    await this.calendarDialog.waitFor({ state: 'hidden' }).catch(() => {});
  }

  /** Atajo para fecha "DD/MM/YYYY". */
  async setBirthDateViaPickerFromString(dateDDMMYYYY: string) {
    const [dd, mm, yyyy] = dateDDMMYYYY.split('/').map(Number);
    await this.setBirthDateViaPicker(dd, mm, yyyy);
  }

  async waitOpen() {
    await expect(this.modalTitle).toBeVisible();
  }
  async waitClosed() {
    await expect(this.modalTitle).toBeHidden({ timeout: 1000 });
  }

  async selectRole(roleName: string) {
    await this.roleCombo.click();
    // Type to filter options, then click matching option
    await this.roleCombo.fill(roleName);
    await this.page
      .getByRole('option', { name: new RegExp(roleName, 'i') })
      .click();
  }

  async fillForm(user: NewUser) {
    await this.waitOpen();

    Promise.all([
      await this.firstName.fill(user.firstName),
      await this.lastName.fill(user.lastName),
      await this.email.fill(user.email),
      await this.password.fill(user.password),
      await this.selectRole(user.roleName),
      await this.phone.fill(user.phone),
      await this.address.fill(user.address),
      await this.dui.fill(user.dui),
    ]);
    await this.setBirthDateViaPickerFromString(user.birthDateDDMMYYYY);
  }

  async submit() {
    await this.submitBtn.click();
  }

  async create(user: NewUser) {
    await this.fillForm(user);
    await this.submit();
  }

  async close() {
    await this.cancelBtn.click();
  }
}

import { DatepickerComponent } from './../../components/datepicker.component';
import { Page, expect } from '@playwright/test';

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
  private readonly datepicker: DatepickerComponent;

  constructor(private page: Page) {
    this.datepicker = new DatepickerComponent(page, {
      trigger: () => this.openBirthDatePickerBtn,
      dialog: () => this.page.getByRole('dialog'),
    });
  }

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
  private get openBirthDatePickerBtn() {
    // El botón tiene aria-label "Choose date, selected date is ..."
    // Soporta también texto en español.
    return this.page.getByRole('button', {
      name: /choose date|elegir fecha|elige fecha/i,
    });
  }

  /** Abre el datepicker y selecciona una fecha concreta (día/mes/año). */
  async setBirthDateViaPicker(day: number, month: number, year: number) {
    await this.datepicker.selectDate(day, month, year);
  }

  /** Atajo para fecha "DD/MM/YYYY". */
  async setBirthDateViaPickerFromString(dateDDMMYYYY: string) {
    await this.datepicker.selectDateFromString(dateDDMMYYYY);
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

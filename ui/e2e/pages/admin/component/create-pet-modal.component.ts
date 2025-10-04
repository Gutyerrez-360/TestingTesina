import { Locator, Page } from '@playwright/test';
import { DatepickerComponent } from '../../components/datepicker.component';
import { Pet } from '../../../types/pet';

export class CreatePetModal {
  private readonly rootLocator: Locator;

  // Las propiedades de los locators no cambian
  public readonly title: Locator;
  public readonly nameInput: Locator;
  public readonly speciesAutocomplete: Locator;
  public readonly breedInput: Locator;
  public readonly colorInput: Locator;
  public readonly genderAutocomplete: Locator;
  public readonly hasTattoosCheckbox: Locator;
  public readonly hasPedigreeCheckbox: Locator;
  public readonly registerButton: Locator;
  public readonly cancelButton: Locator;

  // La propiedad para el datepicker ahora usará tu clase
  public readonly birthDatePicker: DatepickerComponent;

  constructor(page: Page) {
    this.rootLocator = page.getByLabel(
      /Crear Mascota para el cliente seleccionado./i
    );

    this.title = this.rootLocator.getByRole('heading', {
      name: /Crear Mascota/i,
    });
    this.nameInput = this.rootLocator.getByLabel('Nombre');
    this.speciesAutocomplete = this.rootLocator.getByLabel(
      'Seleccione una especie'
    );
    this.breedInput = this.rootLocator.getByLabel('Raza');
    this.colorInput = this.rootLocator.getByLabel('Color del pelaje');
    this.genderAutocomplete = this.rootLocator.getByLabel(
      'Seleccione el género'
    );
    this.hasTattoosCheckbox = this.rootLocator.getByLabel('¿Posee tatuajes?');
    this.hasPedigreeCheckbox = this.rootLocator.getByLabel('¿Posee pedigree?');

    this.registerButton = this.rootLocator.getByRole('button', {
      name: 'Registrar',
    });
    this.cancelButton = this.rootLocator.getByRole('button', {
      name: 'Cancelar',
    });

    this.birthDatePicker = new DatepickerComponent(page, {
      trigger: () =>
        this.rootLocator.getByRole('button', { name: 'Choose date' }),
    });
  }

  /**
   * Rellena el formulario completo del modal con los datos proporcionados.
   */
  async fillForm(data: Pet): Promise<void> {
    await Promise.all([
      await this.nameInput.fill(data.name),
      await this.breedInput.fill(data.breed),
      await this.colorInput.fill(data.color),
    ]);

    // Manejar Autocomplete para Especie
    await this.speciesAutocomplete.fill(data.species);
    await this.rootLocator
      .page()
      .getByRole('option', { name: data.species })
      .click();

    // Manejar Autocomplete para Género
    await this.genderAutocomplete.fill(data.gender);
    await this.rootLocator
      .page()
      .getByRole('option', { name: data.gender })
      .click();

    await this.birthDatePicker.selectDateFromString(data.birthDate);

    // El manejo de checkboxes no cambia
    if (data.hasTattoos) {
      await this.hasTattoosCheckbox.check();
    }
    if (data.hasPedigree) {
      await this.hasPedigreeCheckbox.check();
    }
  }

  async register(): Promise<void> {
    await this.registerButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}

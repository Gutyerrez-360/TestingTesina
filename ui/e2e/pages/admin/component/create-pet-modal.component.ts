import { type Locator, type Page } from '@playwright/test';
import { DatepickerComponent } from '../../components/datepicker.component';
import type { Pet } from '../../../types/pet';

// Definimos un tipo para el modo del modal para mayor claridad.
type ModalMode = 'create' | 'update';

export class PetFormModal {
  private readonly rootLocator: Locator;

  // --- Propiedades del formulario (la mayoría son iguales) ---
  public readonly title: Locator;
  public readonly nameInput: Locator;
  public readonly speciesAutocomplete: Locator;
  public readonly breedInput: Locator;
  public readonly colorInput: Locator;
  public readonly genderAutocomplete: Locator;
  public readonly hasTattoosCheckbox: Locator;
  public readonly hasPedigreeCheckbox: Locator;
  public readonly submitButton: Locator; // Renombrado de 'registerButton'
  public readonly cancelButton: Locator;
  public readonly birthDatePicker: DatepickerComponent;

  /**
   * @param page El objeto Page de Playwright.
   * @param mode El modo del modal: 'create' para crear o 'update' para actualizar.
   */
  constructor(page: Page, mode: ModalMode = 'create') {
    // MODIFICADO: Un selector más genérico que funciona para ambos modales.

    // MODIFICADO: Los locators para el título y el botón de envío ahora son dinámicos.
    if (mode === 'create') {
      this.rootLocator = page.getByLabel(
        /Crear Mascota para el cliente seleccionado./i
      );
      this.title = this.rootLocator.getByRole('heading', {
        name: /Crear Mascota para el cliente seleccionado/i,
      });
      this.submitButton = this.rootLocator.getByRole('button', {
        name: 'Registrar',
      });
    } else {
      this.rootLocator = page.getByLabel(/Actualizando datos de la Mascota:/i);
      // mode === 'update'
      this.title = this.rootLocator.getByRole('heading', {
        name: /Actualizando datos de la Mascota/i,
        exact: false,
      });
      this.submitButton = this.rootLocator.getByRole('button', {
        name: 'Actualizar',
      });
    }

    // El resto de los selectores de campos no cambian porque usan etiquetas (`getByLabel`).
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
    this.cancelButton = this.rootLocator.getByRole('button', {
      name: 'Cancelar',
    });

    this.birthDatePicker = new DatepickerComponent(page, {
      trigger: () =>
        this.rootLocator.getByRole('button', { name: /Choose date/i }),
    });
  }

  /**
   * Rellena o actualiza el formulario completo del modal con los datos proporcionados.
   */
  async fillForm(data: Partial<Pet>): Promise<void> {
    // Se llenan los campos de texto si se proporcionan en el objeto de datos.
    if (data.name) await this.nameInput.fill(data.name);
    if (data.breed) await this.breedInput.fill(data.breed);
    if (data.color) await this.colorInput.fill(data.color);

    if (data.species) {
      await this.speciesAutocomplete.fill(data.species);
      await this.rootLocator
        .page()
        .getByRole('option', { name: data.species })
        .click();
    }

    if (data.gender) {
      await this.genderAutocomplete.fill(data.gender);
      await this.rootLocator
        .page()
        .getByRole('option', { name: data.gender })
        .click();
    }

    if (data.birthDate) {
      await this.birthDatePicker.selectDateFromString(data.birthDate);
    }

    // MODIFICADO: Lógica de checkboxes mejorada para soportar tanto marcar como desmarcar.
    // setChecked es idempotente: solo actúa si el estado actual es diferente.
    if (data.hasTattoos !== undefined) {
      await this.hasTattoosCheckbox.setChecked(data.hasTattoos);
    }
    if (data.hasPedigree !== undefined) {
      await this.hasPedigreeCheckbox.setChecked(data.hasPedigree);
    }
  }

  /**
   * Envía el formulario haciendo clic en el botón 'Registrar' o 'Actualizar'.
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}

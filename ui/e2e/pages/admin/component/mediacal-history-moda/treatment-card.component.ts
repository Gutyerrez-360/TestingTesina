import { type Locator } from '@playwright/test';

// Tipo de datos para un solo tratamiento
export type TreatmentData = {
  name: string;
  quantity: string;
  frequency: string;
  days: number;
};

export class TreatmentCard {
  private readonly rootLocator: Locator;

  // --- Campos de la tarjeta ---
  public readonly nameInput: Locator;
  public readonly quantityInput: Locator;
  public readonly frequencyInput: Locator;
  public readonly daysInput: Locator;
  public readonly deleteButton: Locator;

  constructor(cardLocator: Locator) {
    this.rootLocator = cardLocator;
    this.nameInput = this.rootLocator.getByRole('textbox', {
      name: 'Nombre del tratamiento',
    });
    this.quantityInput = this.rootLocator.getByRole('textbox', {
      name: 'Cantidad del tratamiento',
    });
    this.frequencyInput = this.rootLocator.getByRole('textbox', {
      name: 'Frecuencia de aplicación',
    });
    this.daysInput = this.rootLocator.getByLabel('Días de aplicación');
    this.deleteButton = this.rootLocator.getByTestId('DeleteOutlineIcon');
  }

  /**
   * Rellena todos los campos de esta tarjeta de tratamiento.
   */
  async fill(data: TreatmentData): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.quantityInput.fill(data.quantity);
    await this.frequencyInput.fill(data.frequency);
    await this.daysInput.fill(data.days.toString());
  }
}

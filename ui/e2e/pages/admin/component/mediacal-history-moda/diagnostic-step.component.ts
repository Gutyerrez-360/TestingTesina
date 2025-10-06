import { expect, type Locator } from '@playwright/test';
import { TreatmentCard, TreatmentData } from './treatment-card.component';

// Tipo de datos para el paso de diagnóstico
export type DiagnosisData = {
  description: string;
  treatments?: TreatmentData[];
  // Se puede añadir 'interventions' aquí en el futuro
};

export class DiagnosisStep {
  private readonly rootLocator: Locator;

  // --- Locators del paso 3 ---
  public readonly descriptionInput: Locator;
  public readonly addTreatmentButton: Locator;
  public readonly addInterventionButton: Locator;
  private readonly treatmentsContainer: Locator;
  private readonly treatmentCards: Locator;

  constructor(formLocator: Locator) {
    this.rootLocator = formLocator;
    this.descriptionInput = this.rootLocator.getByRole('textbox', {
      name: 'Descripción del diagnóstico',
    });
    this.addTreatmentButton = this.rootLocator.getByRole('button', {
      name: 'Añadir tratamiento',
    });
    this.addInterventionButton = this.rootLocator.getByRole('button', {
      name: 'Añadir intervención médica',
    });
    this.treatmentCards = this.rootLocator.locator('.MuiCard-root');
    this.treatmentsContainer = this.rootLocator
      .locator('p:has-text("Tratamientos")')
      .locator('..');
  }

  /**
   * Obtiene un componente TreatmentCard por su índice (0 para el primero, 1 para el segundo, etc.).
   */
  getTreatmentCard(index: number): TreatmentCard {
    const cardLocator = this.treatmentCards.nth(index);
    return new TreatmentCard(cardLocator);
  }

  /**
   * Rellena la descripción y la lista dinámica de tratamientos.
   */
  async fillForm(data: DiagnosisData): Promise<void> {
    await this.descriptionInput.fill(data.description);

    if (data.treatments && data.treatments.length > 0) {
      for (let i = 0; i < data.treatments.length; i++) {
        // El primer tratamiento ya existe, para los demás hay que hacer clic en "Añadir"
        if (i > 0) {
          await this.addTreatmentButton.click();
        }
        const treatmentCard = this.getTreatmentCard(i);
        await expect(treatmentCard.nameInput).toBeVisible();
        await treatmentCard.fill(data.treatments[i]);
      }
    }
  }
}

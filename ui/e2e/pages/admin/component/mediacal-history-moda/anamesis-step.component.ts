import { type Locator } from '@playwright/test';

// Define a type for the data of this step for clarity
export type AnamnesisData = {
  foodQuantity: string;
  foodType: string;
  offspringInfo: string;
  isReproductive?: boolean;
  hasAllVaccines?: boolean;
  livesWithOtherPets?: boolean;
  whichPets?: string; // Only used if livesWithOtherPets is true
  illnessEvaluation: string;
  observations: string;
  habitat: string;
};

export class AnamnesisStep {
  private readonly rootLocator: Locator;

  // Form Fields
  public readonly foodQuantityInput: Locator;
  public readonly foodTypeInput: Locator;
  public readonly offspringInput: Locator;
  public readonly reproductionCheckbox: Locator;
  public readonly allVaccinesCheckbox: Locator;
  public readonly livesWithPetsCheckbox: Locator;
  public readonly whichPetsInput: Locator;
  public readonly illnessEvaluationTextArea: Locator;
  public readonly observationsTextArea: Locator;
  public readonly habitatTextArea: Locator;

  constructor(formLocator: Locator) {
    this.rootLocator = formLocator;

    // Use getByLabel for robust locators
    this.foodQuantityInput = this.rootLocator.getByLabel(
      'Cantidad de alimento'
    );
    this.foodTypeInput = this.rootLocator.getByLabel('Tipo de alimento');
    this.offspringInput = this.rootLocator.getByLabel('Descendencia');
    this.reproductionCheckbox = this.rootLocator.getByLabel('Reproducción:');
    this.allVaccinesCheckbox = this.rootLocator.getByLabel(
      '¿Posee todas sus vacunas?'
    );
    this.livesWithPetsCheckbox = this.rootLocator.getByLabel(
      '¿Vive con otras mascotas?'
    );
    this.whichPetsInput = this.rootLocator.getByLabel(
      'Si convive con otras mascotas, ¿Cuáles mascotas?'
    );
    this.illnessEvaluationTextArea = this.rootLocator.getByLabel(
      'Desarrollo/Evaluacion de la enfermedad'
    );
    this.observationsTextArea = this.rootLocator.getByLabel('Observaciones');
    this.habitatTextArea = this.rootLocator.getByLabel('Habitáculo');
  }

  /**
   * Fills the entire "Anamnesis" step form.
   */
  async fillForm(data: AnamnesisData): Promise<void> {
    await this.foodQuantityInput.fill(data.foodQuantity);
    await this.foodTypeInput.fill(data.foodType);
    await this.offspringInput.fill(data.offspringInfo);

    // setChecked handles both checking and unchecking idempotently
    if (data.isReproductive !== undefined) {
      await this.reproductionCheckbox.setChecked(data.isReproductive);
    }
    if (data.hasAllVaccines !== undefined) {
      await this.allVaccinesCheckbox.setChecked(data.hasAllVaccines);
    }

    // Handle the conditional logic for "which pets"
    if (data.livesWithOtherPets !== undefined) {
      await this.livesWithPetsCheckbox.setChecked(data.livesWithOtherPets);
      if (data.livesWithOtherPets && data.whichPets) {
        await this.whichPetsInput.fill(data.whichPets);
      }
    }

    await this.illnessEvaluationTextArea.fill(data.illnessEvaluation);
    await this.observationsTextArea.fill(data.observations);
    await this.habitatTextArea.fill(data.habitat);
  }
}

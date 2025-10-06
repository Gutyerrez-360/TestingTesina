import { type Locator, type Page } from '@playwright/test';
import { AnamnesisStep } from './anamesis-step.component';
import { PhysicalExamStep } from './phisical-exam-step.component';
import { DiagnosisStep } from './diagnostic-step.component';

export class CreateClinicalSheetModal {
  private readonly rootLocator: Locator;

  // Elementos generales del modal
  public readonly title: Locator;
  public readonly stepper: Locator;
  public readonly nextButton: Locator;
  public readonly backButton: Locator;
  public readonly finishButton: Locator;

  // Instancias para cada componente de paso
  public readonly anamnesisStep: AnamnesisStep;
  public readonly physicalExamStep: PhysicalExamStep;
  public readonly diagnosisStep: DiagnosisStep;

  constructor(page: Page) {
    this.rootLocator = page.getByLabel(/Crear nueva hoja clinica/i);

    this.title = this.rootLocator.getByRole('heading', {
      name: 'Crear nueva hoja clinica',
    });
    this.stepper = this.rootLocator.locator('.MuiStepper-root');
    this.nextButton = this.rootLocator.getByRole('button', {
      name: 'Siguiente',
    });
    this.backButton = this.rootLocator.getByRole('button', {
      name: 'Regresar',
    });
    this.finishButton = this.rootLocator.getByRole('button', {
      name: 'Finalizar',
    });

    // El elemento <form> parece ser compartido entre los pasos
    const formLocator = this.rootLocator.locator('form');

    // Componemos el modal con sus pasos
    this.anamnesisStep = new AnamnesisStep(formLocator);
    this.physicalExamStep = new PhysicalExamStep(formLocator);
    this.diagnosisStep = new DiagnosisStep(formLocator);
  }

  async goToNextStep(): Promise<void> {
    await this.nextButton.click();
  }

  async goToPreviousStep(): Promise<void> {
    await this.backButton.click();
  }

  async finish(): Promise<void> {
    await Promise.all([
      this.rootLocator.waitFor({ state: 'hidden' }),
      this.finishButton.click(),
    ]);
  }

  /**
   * Devuelve el texto del paso activo en el stepper.
   */
  async getActiveStep(): Promise<string | null> {
    return this.stepper.locator('.Mui-active.MuiStepLabel-label').textContent();
  }
}

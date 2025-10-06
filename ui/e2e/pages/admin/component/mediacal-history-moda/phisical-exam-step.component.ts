import { type Locator } from '@playwright/test';

// Tipo de datos para el segundo paso
export type PhysicalExamData = {
  weight: number;
  palpitations: string;
  temperature: number;
  respiratoryRate: number;
  heartRate: number;
  labExam: string;
  pulse: string;
  mucus: string;
  // La ruta al archivo que se va a subir. Puede ser una o varias.
  fileUploadPath?: string | string[];
};

export class PhysicalExamStep {
  private readonly rootLocator: Locator;

  // --- Locators para los campos del formulario ---
  public readonly weightInput: Locator;
  public readonly palpitationsInput: Locator;
  public readonly temperatureInput: Locator;
  public readonly respiratoryRateInput: Locator;
  public readonly heartRateInput: Locator;
  public readonly labExamInput: Locator;
  public readonly pulseInput: Locator;
  public readonly mucusInput: Locator;
  public readonly fileUploadInput: Locator; // El input oculto para subir archivos

  constructor(formLocator: Locator) {
    this.rootLocator = formLocator;

    // Usamos getByLabel para máxima robustez
    this.weightInput = this.rootLocator.getByLabel('Peso de la mascota (Kg)');
    this.palpitationsInput = this.rootLocator.getByLabel('Palpitaciones');
    this.temperatureInput = this.rootLocator.getByLabel(
      'Temperatura de la mascota (°C)'
    );
    this.respiratoryRateInput = this.rootLocator.getByLabel(
      'Frecuencia respiratoria (res/min)'
    );
    this.heartRateInput = this.rootLocator.getByLabel(
      'Frecuencia cardiaca (lat/min)'
    );
    this.labExamInput = this.rootLocator.getByLabel('Examen de laboratorio');
    this.pulseInput = this.rootLocator.getByLabel('Pulso');
    this.mucusInput = this.rootLocator.getByLabel('Mucus');

    // El input de tipo 'file' suele estar oculto, pero Playwright puede encontrarlo
    this.fileUploadInput = this.rootLocator.locator('input[type="file"]');
  }

  /**
   * Rellena el formulario completo del "Examen Físico".
   */
  async fillForm(data: PhysicalExamData): Promise<void> {
    // Playwright convierte los números a string automáticamente al llenar
    await this.weightInput.fill(data.weight.toString());
    await this.palpitationsInput.fill(data.palpitations);
    await this.temperatureInput.fill(data.temperature.toString());
    await this.respiratoryRateInput.fill(data.respiratoryRate.toString());
    await this.heartRateInput.fill(data.heartRate.toString());
    await this.labExamInput.fill(data.labExam);
    await this.pulseInput.fill(data.pulse);
    await this.mucusInput.fill(data.mucus);

    // Manejo de la carga de archivos
    if (data.fileUploadPath) {
      await this.fileUploadInput.setInputFiles(data.fileUploadPath);
    }
  }
}

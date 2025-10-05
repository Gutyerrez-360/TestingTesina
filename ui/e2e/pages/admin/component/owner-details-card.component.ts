import { Locator } from '@playwright/test';

export type OwnerDetails = {
  usuario: string;
  correo: string;
  role: string;
  fechaNacimiento: string;
};

export class OwnerDetailsCard {
  private readonly rootLocator: Locator;

  constructor(locator: Locator) {
    this.rootLocator = locator;
  }

  /**
   * Extrae los detalles del propietario desde el texto del panel.
   */
  async getDetails(): Promise<OwnerDetails> {
    const fullText = await this.rootLocator.innerText();

    const usuario = fullText.match(/Usuario: (.*)/)?.[1].trim() ?? '';
    const correo = fullText.match(/Correo: (.*)/)?.[1].trim() ?? '';
    const role = fullText.match(/Role: (.*)/)?.[1].trim() ?? '';
    const fechaNacimiento =
      fullText.match(/Fecha de nacimiento: (.*)/)?.[1].trim() ?? '';

    return { usuario, correo, role, fechaNacimiento };
  }
}

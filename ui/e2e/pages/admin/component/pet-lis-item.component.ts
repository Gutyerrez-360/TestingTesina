import { type Locator } from '@playwright/test';

// Tipo para estructurar los datos extraídos de cada mascota
export type PetDetails = {
  nombre: string;
  especie: string;
  raza: string;
  genero: string;
  nacimiento: string;
  colorPelaje: string;
  dueño: string;
};

export class PetListItem {
  public readonly rootLocator: Locator;

  // Botones de acción
  public readonly viewButton: Locator;
  public readonly editButton: Locator;
  public readonly deleteButton: Locator;

  constructor(locator: Locator) {
    this.rootLocator = locator;

    // Usamos botones accesibles expuestos con aria-label
    this.viewButton = this.rootLocator.getByRole('button', {
      name: /Details pet/i,
    });
    this.editButton = this.rootLocator.getByRole('button', {
      name: /edit pet/i,
    });
    this.deleteButton = this.rootLocator.getByRole('button', {
      name: /delete pet/i,
    });
  }

  /**
   * Extrae y devuelve los detalles de la mascota parseando el texto.
   */
  async getDetails(): Promise<PetDetails> {
    const textContent = await this.rootLocator
      .locator('.MuiListItemText-root')
      .innerText();

    const extract = (regex: RegExp) =>
      textContent.match(regex)?.[1].trim() ?? '';

    return {
      nombre: extract(/Nombre de la mascota: (.*)/),
      especie: extract(/Especie: (.*)/),
      raza: extract(/Raza: (.*)/),
      genero: extract(/Género: (.*)/),
      nacimiento: extract(/Nacimiento de la mascota o Adquisición: (.*)/),
      colorPelaje: extract(/Color del pelaje: (.*)/),
      dueño: extract(/Dueño: (.*)/),
    };
  }

  async clickView(): Promise<void> {
    await this.viewButton.click();
  }

  async clickEdit(): Promise<void> {
    await this.editButton.click();
  }

  async clickDelete(): Promise<void> {
    await this.deleteButton.click();
  }
}

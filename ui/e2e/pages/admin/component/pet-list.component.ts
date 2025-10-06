import { expect, Locator } from '@playwright/test';

export type PetDetails = {
  nombre: string;
  especie: string;
  raza: string;
  genero: string;
  nacimiento: string;
};

export class PetListItem {
  public readonly rootLocator: Locator;
  public readonly historyButton: Locator;

  constructor(locator: Locator) {
    this.rootLocator = locator;
    this.historyButton = this.rootLocator.getByTestId('HistoryEduIcon');
  }

  /**
   * Extrae y devuelve los detalles de la mascota desde el texto del componente.
   */
  async getDetails(): Promise<PetDetails> {
    const textLocator = this.rootLocator
      .locator('.MuiListItemText-root')
      .first();
    const fullText = await textLocator.innerText();

    // Usamos expresiones regulares para extraer cada dato de forma segura
    const nombre =
      fullText.match(/Nombre de la mascota: (.*)/)?.[1].trim() ?? '';
    const especie = fullText.match(/Especie: (.*)/)?.[1].trim() ?? '';
    const raza = fullText.match(/Raza: (.*)/)?.[1].trim() ?? '';
    const genero = fullText.match(/Género: (.*)/)?.[1].trim() ?? '';
    const nacimiento =
      fullText
        .match(/Nacimiento de la mascota o Adquisición: (.*)/)?.[1]
        .trim() ?? '';

    return { nombre, especie, raza, genero, nacimiento };
  }

  /**
   * Hace clic en el botón para ver el historial de la mascota.
   */
  async viewHistory(): Promise<void> {
    await this.historyButton.click();
  }
}

export class PetsListCard {
  public readonly rootLocator: Locator;

  constructor(locator: Locator) {
    this.rootLocator = locator;
  }

  /**
   * Encuentra una mascota específica por su nombre y devuelve su componente.
   * @param name - El nombre de la mascota a buscar.
   * @returns Una instancia de PetListItem.
   */
  async getPetByName(name: string): Promise<PetListItem> {
    const petLocator = this.rootLocator
      .locator('li.MuiListItem-root', {
        hasText: `Nombre de la mascota: ${name}`,
      })
      .first();
    return new PetListItem(petLocator);
  }

  /**
   * Devuelve un array con todos los componentes de mascotas en la lista.
   */
  async getAllPets(): Promise<PetListItem[]> {
    const locators = await this.rootLocator
      .locator('li.MuiListItem-root')
      .all();
    return locators.map((locator) => new PetListItem(locator));
  }
}

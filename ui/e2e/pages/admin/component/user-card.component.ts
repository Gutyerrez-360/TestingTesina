// /tests/components/UserListItem.ts
import { expect, type Locator, type Page } from '@playwright/test';

export class UserListItem {
  // El locator raíz del componente, el <li>
  private readonly rootLocator: Locator;

  // Locators para los elementos internos del componente
  public readonly avatarIcon: Locator;
  public readonly userInfoText: Locator;
  public readonly viewButton: Locator;
  public readonly editButton: Locator;
  public readonly deleteButton: Locator;
  public readonly petsButton: Locator;

  /**
   * @param locator El locator que apunta al elemento <li> raíz del componente.
   */
  constructor(locator: Locator) {
    this.rootLocator = locator;

    // Se definen los locators internos relativos al locator raíz
    this.avatarIcon = this.rootLocator.getByTestId('PersonIcon');
    this.userInfoText = this.rootLocator.locator('.MuiListItemText-root');
    this.viewButton = this.rootLocator.getByTestId('VisibilityIcon');
    this.editButton = this.rootLocator.getByTestId('ModeEditIcon');
    this.deleteButton = this.rootLocator.getByTestId('DeleteIcon');
    this.petsButton = this.rootLocator.getByTestId('PetsIcon');
  }

  /**
   * Hace clic en el botón para ver los detalles del usuario.
   */
  async viewUserDetails(): Promise<void> {
    await this.viewButton.click();
  }

  /**
   * Hace clic en el botón para editar el usuario.
   */
  async editUser(): Promise<void> {
    await this.editButton.click();
  }

  /**
   * Hace clic en el botón para eliminar el usuario.
   */
  async deleteUser(): Promise<void> {
    await this.deleteButton.click();
  }

  /**
   * Hace clic en el botón de mascotas (Pets).
   */
  async viewUserPets(): Promise<void> {
    await this.petsButton.click();
  }

  /**
   * Extrae y devuelve los detalles del usuario desde el texto del componente.
   * @returns Un objeto con los datos del usuario.
   */
  async getDetails(): Promise<{
    usuario: string;
    correo: string;
    role: string;
    fechaNacimiento: string;
  }> {
    const fullText = await this.userInfoText.innerText();

    // Usamos expresiones regulares para extraer cada dato de forma segura
    const usuario = fullText.match(/Usuario: (.*)/)?.[1].trim() ?? '';
    const correo = fullText.match(/Correo: (.*)/)?.[1].trim() ?? '';
    const role = fullText.match(/Role: (.*)/)?.[1].trim() ?? '';
    const fechaNacimiento =
      fullText.match(/Fecha de nacimiento: (.*)/)?.[1].trim() ?? '';

    return { usuario, correo, role, fechaNacimiento };
  }

  /**
   * Una aserción de ejemplo para verificar que el componente muestra el nombre de usuario esperado.
   * @param expectedName El nombre que se espera encontrar.
   */
  async assertHasUsername(expectedName: string): Promise<void> {
    const details = await this.getDetails();
    expect(details.usuario).toBe(expectedName);
  }
}

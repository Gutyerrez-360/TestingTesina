import { type Page, type Locator } from '@playwright/test';
import { PetListItem } from './component/pet-lis-item.component';
import { AppRoutes } from '../../routes/app.routes';

export class PetsPage {
  public readonly page: Page;

  // Controles principales de la página
  public readonly registerClientAndPetButton: Locator;
  public readonly searchInput: Locator;
  public readonly totalPetsText: Locator;
  public readonly loadMoreButton: Locator;
  private readonly petListContainer: Locator;
  private readonly petCards: Locator;
  private readonly allLoadedMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.registerClientAndPetButton = page.getByRole('button', {
      name: 'Registrar cliente y su mascota',
    });
    this.searchInput = page.getByLabel('Buscar');
    this.totalPetsText = page.locator('text=/Total mascotas registradas:/');
    this.loadMoreButton = page.getByRole('button', {
      name: /cargar más mascotas/i,
    });
    this.petListContainer = page.locator('.infinite-scroll-component');
    this.petCards = this.petListContainer.locator('[data-testid^="pet-card-"]');
    this.allLoadedMessage = page.locator(
      'text=Ya tienes todas las mascotas cargadas'
    );
  }

  /**
   * Navega a la página de mascotas.
   */
  public async visit(): Promise<void> {
    await this.page.goto(AppRoutes.admin.pets); // Ajusta la URL si es necesario
  }

  /**
   * Realiza una búsqueda en la lista de mascotas.
   */
  public async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.waitForProgressSpinner();
  }

  /**
   * Obtiene el número total de mascotas registradas desde el texto.
   */
  public async getTotalPetsCount(): Promise<number> {
    const text = await this.totalPetsText.textContent();
    const count = text?.split(':')[1].trim();
    return count ? parseInt(count, 10) : 0;
  }

  /**
   * Encuentra una mascota específica por su nombre y devuelve su componente.
   */
  public async getPetByName(name: string): Promise<PetListItem> {
    await this.waitForAnyPet();

    const petLocator = this.petCards
      .filter({ hasText: `Nombre de la mascota: ${name}` })
      .first();

    while (true) {
      if ((await petLocator.count()) > 0) {
        return new PetListItem(petLocator);
      }

      if (await this.isLoadMoreEnabled()) {
        await this.loadMoreButton.click();
        await this.waitForProgressSpinner();
        continue;
      }

      if (await this.allLoadedMessage.isVisible().catch(() => false)) {
        break;
      }

      break;
    }

    return new PetListItem(petLocator);
  }

  /**
   * Devuelve un array con todos los componentes de mascotas visibles en la lista.
   */
  public async getVisiblePets(): Promise<PetListItem[]> {
    await this.waitForAnyPet();
    const locators = await this.petCards.all();
    return locators.map((locator) => new PetListItem(locator));
  }

  private async loadAllPets(): Promise<void> {
    while (await this.isLoadMoreEnabled()) {
      await this.loadMoreButton.click();
      await this.waitForProgressSpinner();
    }
  }

  private async waitForAnyPet(timeout = 5000): Promise<boolean> {
    try {
      await this.petCards.first().waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      await this.allLoadedMessage
        .first()
        .waitFor({
          state: 'visible',
          timeout: 1000,
        })
        .catch(() => {});
      return false;
    }
  }

  private async isLoadMoreEnabled(): Promise<boolean> {
    const visible = await this.loadMoreButton.isVisible().catch(() => false);
    if (!visible) {
      return false;
    }
    const disabled = await this.loadMoreButton.isDisabled().catch(() => true);
    return !disabled;
  }

  private async waitForProgressSpinner() {
    const spinner = this.page
      .locator('span[role="progressbar"], [role="progressbar"]')
      .first();
    // Algunos renders activan el spinner después del fill, por lo que
    // esperamos primero a que aparezca y luego a que desaparezca.
    try {
      await spinner.waitFor({ state: 'visible', timeout: 1000 });
    } catch {
      // Si no apareció, continuamos; evita fallar en búsquedas instantáneas.
    }
    await spinner.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }
}

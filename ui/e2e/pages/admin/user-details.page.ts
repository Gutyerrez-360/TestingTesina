import { Page, type Locator } from '@playwright/test';
import { PetsListCard } from './component/pet-list.component';
import { OwnerDetailsCard } from './component/owner-details-card.component';

export class UserDetailsPage {
  private readonly page: Page;

  public readonly ownerCard: OwnerDetailsCard;
  public readonly petsCard: PetsListCard;

  constructor(page: Page) {
    this.page = page;

    // Localiza el panel del propietario por su heading
    const ownerCardLocator = page.locator('.MuiPaper-root', {
      has: page.getByRole('heading', { name: 'Propietario' }),
    });
    // Localiza el panel de mascotas por su heading
    const petsCardLocator = page.locator('.MuiPaper-root', {
      has: page.getByRole('heading', { name: 'Mascotas' }),
    });

    // Instancia los componentes con sus locators específicos
    this.ownerCard = new OwnerDetailsCard(ownerCardLocator);
    this.petsCard = new PetsListCard(petsCardLocator);
  }

  /**
   * Navega a la página de detalles de un usuario específico.
   */
  async visit(userId: string | number): Promise<void> {
    await this.page.goto(`/admin/users/${userId}`);
  }

  public async waitForSpinner() {
    const spinner = this.page.locator('[role="progressbar"]').first();
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

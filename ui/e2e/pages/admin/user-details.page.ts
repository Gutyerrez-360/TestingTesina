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
}

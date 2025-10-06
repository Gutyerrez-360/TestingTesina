import { expect, type Locator, type Page } from '@playwright/test';
import { AppRoutes } from '../../routes/app.routes';
import { Pet, PetDetailsTab, PetGeneralInfo } from '../../types/pet';

export class PetDetailsPage {
  readonly registerClinicalSheetButton: Locator;
  readonly generalInfoCard: Locator;
  readonly clinicalTabs: Locator;
  readonly clinicalHistoryEmptyMessage: Locator;

  private readonly petCardsList: Locator;
  private readonly clinicalHistoryEntries: Locator;

  constructor(private readonly page: Page) {
    this.registerClinicalSheetButton = page.getByRole('button', {
      name: /registrar hoja cl[ií]nica/i,
    });

    this.generalInfoCard = page
      .getByRole('heading', { name: /datos generales de la mascota/i })
      .locator('..');

    this.clinicalTabs = page.getByRole('tablist');

    this.clinicalHistoryEmptyMessage = page.getByText(
      /no dispone de hojas cl[ií]nicas registradas/i
    );

    // Reutilizamos el selector de tarjetas para sincronizar cuando se cargan
    this.petCardsList = page
      .locator('.infinite-scroll-component')
      .locator('[data-testid^="pet-card-"]');

    this.clinicalHistoryEntries = page
      .locator('li.MuiListItem-root')
      .filter({ has: page.locator('[data-testid="HistoryEduIcon"]') });
  }

  async goto(petId: string | number) {
    await this.page.goto(AppRoutes.admin.petDetails(petId));
    await this.waitForLoad();
  }

  async waitForLoad() {
    await expect(this.generalInfoCard).toBeVisible();
  }

  async getGeneralInfo(): Promise<PetGeneralInfo> {
    const paragraphs = await this.generalInfoCard
      .locator('p')
      .allTextContents();
    const normalized = paragraphs.map((text) =>
      text.replace(/\s+/g, ' ').replace(/:\s+/g, ': ').trim()
    );

    const getValue = (label: string) => {
      const entry = normalized.find((line) =>
        line.toLowerCase().startsWith(`${label.toLowerCase()}:`)
      );
      return entry ? entry.split(':').slice(1).join(':').trim() : '';
    };

    const parsePossession = (value: string) => /s[ií]\s*posee/i.test(value);

    return {
      name: getValue('Nombre'),
      gender: getValue('Género'),
      species: getValue('Especie'),
      breed: getValue('Raza'),
      color: getValue('Color'),
      hasTattoos: parsePossession(getValue('Tatuajes')),
      hasPedigree: parsePossession(getValue('Pedigree')),
      birthDate: getValue('Fecha de nacimiento'),
      owner: getValue('Dueño'),
    };
  }

  async openTab(tab: PetDetailsTab) {
    const tabButton = this.page.getByRole('tab', {
      name: new RegExp(tab, 'i'),
    });
    await tabButton.click();
    await expect(tabButton).toHaveAttribute('aria-selected', 'true');
  }

  async hasClinicalHistory(): Promise<boolean> {
    return !(await this.clinicalHistoryEmptyMessage
      .isVisible()
      .catch(() => false));
  }

  async waitForClinicalHistoryCards(timeout = 5000) {
    await this.petCardsList.first().waitFor({ state: 'visible', timeout });
  }

  async expectClinicalHistoryEntryContains(text: string) {
    const query = text.trim();
    await expect(
      this.clinicalHistoryEntries.filter({ hasText: query }).first()
    ).toBeVisible();
  }
}

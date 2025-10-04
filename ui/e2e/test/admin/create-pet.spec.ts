import { makeNewPet } from '../../factories/pet.factory';
import { test, expect } from '../../fixtures/auth.fixture';
import { CreatePetModal } from '../../pages/admin/component/create-pet-modal.component';
import { UserListItem } from '../../pages/admin/component/user-card.component';
import { UserDetailsPage } from '../../pages/admin/user-details.page';
import { AppRoutes } from '../../routes/app.routes';
import { Pet } from '../../types/pet';

test('debería crear una nueva mascota correctamente', async ({ page }) => {
  await page.goto(AppRoutes.admin.users);

  const userItemLocator = page.locator('li.MuiListItem-root', {
    hasText: 'fabioflores021@gmail.com',
  });
  const fabioUser = new UserListItem(userItemLocator);
  await fabioUser.createPet();

  const createPetModal = new CreatePetModal(page);
  await expect(createPetModal.title).toBeVisible();

  const newPet: Pet = makeNewPet();

  await createPetModal.fillForm(newPet);
  await createPetModal.register();

  await fabioUser.viewUserDetails();
  const userDetailsPage = new UserDetailsPage(page);
  const pet = userDetailsPage.petsCard.getPetByName(newPet.name);

  expect((await pet.getDetails()).nombre).toBe(newPet.name);
});

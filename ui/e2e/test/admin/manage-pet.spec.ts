import { test, expect } from '../../fixtures/auth.fixture';
import { makeNewPet } from '../../factories/pet.factory';
import { UserListItem } from '../../pages/admin/component/user-card.component';
import { UserDetailsPage } from '../../pages/admin/user-details.page';
import { AppRoutes } from '../../routes/app.routes';
import type { Pet } from '../../types/pet';
import { PetsPage } from '../../pages/admin/pets.page';
import { PetFormModal } from '../../pages/admin/component/create-pet-modal.component';

// Usamos test.describe.serial para asegurar que los tests se ejecuten en orden.
test.describe.serial('Flujo de creación y actualización de mascotas', () => {
  // Declaramos la variable aquí para compartirla entre los tests.

  test('debería crear una nueva mascota correctamente', async ({ page }) => {
    // 1. Generamos los datos de la mascota usando la fábrica
    const newPet = makeNewPet();

    await page.goto(AppRoutes.admin.users);

    const userItemLocator = page.locator('li.MuiListItem-root', {
      hasText: 'testuser@example.com',
    });
    const fabioUser = new UserListItem(userItemLocator);

    // Asumo que este método abre el modal de creación
    await fabioUser.createPet();

    // 2. Usamos el modal refactorizado en modo 'create'
    const petModal = new PetFormModal(page, 'create');
    await expect(petModal.title).toBeVisible();

    // 3. Rellenamos y enviamos el formulario
    await petModal.fillForm(newPet);
    await petModal.submit(); // Usamos el método genérico .submit()

    // 4. Verificamos que la mascota fue creada en la página de detalles del usuario
    await fabioUser.viewUserDetails();
    const userDetailsPage = new UserDetailsPage(page);
    const createdPet = userDetailsPage.petsCard.getPetByName(newPet.name);

    await expect(createdPet.rootLocator).toBeVisible();
    const details = await createdPet.getDetails();
    expect(details.nombre).toBe(newPet.name);
  });

  test('debería modificar una mascota', async ({ page }) => {
    // 1. Navegamos a la página principal de mascotas donde se puede editar
    const petsPage = new PetsPage(page);
    await petsPage.visit();
    const newPetname = makeNewPet();

    // 2. Tomamos la primera mascota visible en la lista

    const visiblePets = await petsPage.getVisiblePets();
    expect(visiblePets.length).toBeGreaterThan(0);

    // Generate a random index between 0 and 4 (or up to visiblePets.length - 1)
    const randomIndex = Math.floor(
      Math.random() * Math.min(visiblePets.length)
    );
    const petToUpdate = visiblePets[randomIndex];

    await expect(petToUpdate.rootLocator).toBeVisible();

    // 3. Hacemos clic en el botón de editar para abrir el modal
    await petToUpdate.clickEdit();

    // 4. Usamos el mismo modal refactorizado, pero ahora en modo 'update'
    const petModal = new PetFormModal(page, 'update');
    await expect(petModal.title).toBeVisible();

    // 5. Definimos los nuevos datos que queremos actualizar
    const updatedData = {
      name: `${newPetname.name} Actualizado`,
      hasPedigree: false, // Vamos a desmarcar esta opción
    };

    // 6. Rellenamos el formulario solo con los datos a cambiar y enviamos
    await petModal.fillForm(updatedData);
    await petModal.submit();
  });
});

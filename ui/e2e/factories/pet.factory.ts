import { fakerES as faker } from '@faker-js/faker';
import { Pet, type Specie } from '../types/pet';
import { formatDDMMYYYY } from '../utils/forma';

// Tipo para las opciones de la fábrica, permite overrides y opciones especiales.
type MakeNewPetOptions = Partial<Pet> & {
  seed?: number; // Para ejecuciones deterministas
};

/** * Crea un objeto de mascota con datos falsos, listo para ser usado en pruebas.
 * Sigue el patrón de la fábrica `makeNewUser`.
 */
export function makeNewPet(opts: MakeNewPetOptions = {}): Pet {
  // 1. Aplica la seed si se proporciona, para resultados consistentes.
  if (opts.seed != null) {
    faker.seed(opts.seed);
  }

  // 2. Genera valores dependientes primero.
  const species: Specie =
    opts.species ??
    faker.helpers.arrayElement<Specie>([
      'Felino',
      'Canino',
      'Cetoácidos',
      'Ofilio',
      'Roedor',
      'Saurio',
      'Quelonios',
    ]);

  // 3. Define cada propiedad usando el override (opts) o un valor de faker.
  const name = opts.name ?? faker.person.firstName();
  const breed = opts.breed ?? species;
  const color = opts.color ?? faker.color.human();
  const gender = opts.gender ?? faker.helpers.arrayElement(['Macho', 'Hembra']);
  const hasTattoos = opts.hasTattoos ?? faker.datatype.boolean();
  const hasPedigree = opts.hasPedigree ?? faker.datatype.boolean();

  const birthDateObj = faker.date.past({ years: 15 });
  const birthDate = opts.birthDate ?? formatDDMMYYYY(birthDateObj);

  // 4. Retorna el objeto final construido explícitamente.
  return {
    name,
    species,
    breed,
    color,
    gender,
    birthDate,
    hasTattoos,
    hasPedigree,
  };
}

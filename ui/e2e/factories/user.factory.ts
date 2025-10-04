import { fakerES as faker } from '@faker-js/faker';
import type { NewUser } from '../types/user';
import { formatDDMMYYYY } from '../utils/forma';

type MakeNewUserOptions = Partial<NewUser> & {
  seed?: number; // para runs deterministas si quieres
  emailDomain?: string; // por defecto 'example.com'
};

/** Crea un usuario listo para el modal "Crear Nuevo Usuario". */
export function makeNewUser(opts: MakeNewUserOptions = {}): NewUser {
  if (opts.seed != null) {
    faker.seed(opts.seed);
  }

  const firstName = opts.firstName ?? faker.person.firstName();
  const lastName = opts.lastName ?? faker.person.lastName();
  const emailDomain = opts.emailDomain ?? 'example.com';

  const email =
    opts.email ??
    faker.internet
      .email({ firstName, lastName, provider: emailDomain })
      .toLowerCase();

  const birthDateDDMMYYYY =
    opts.birthDateDDMMYYYY ??
    formatDDMMYYYY(faker.date.birthdate({ min: 18, max: 40, mode: 'age' }));

  const phone =
    opts.phone ?? `${faker.string.numeric(4)}-${faker.string.numeric(4)}`; // 0000-0000
  const dui =
    opts.dui ?? `${faker.string.numeric(8)}-${faker.string.numeric(1)}`; // ########-#
  const address = opts.address ?? faker.location.streetAddress();

  return {
    firstName,
    lastName,
    email,
    birthDateDDMMYYYY,
    password: opts.password ?? faker.internet.password({ length: 12 }),
    roleName: opts.roleName ?? 'client', // Debe matchear la opción del combobox
    phone,
    address,
    dui,
  };
}

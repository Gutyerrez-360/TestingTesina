import { faker } from '@faker-js/faker';
import { AnamnesisData } from '../pages/admin/component/mediacal-history-moda/anamesis-step.component';
import { PhysicalExamData } from '../pages/admin/component/mediacal-history-moda/phisical-exam-step.component';
import { TreatmentData } from '../pages/admin/component/mediacal-history-moda/treatment-card.component';
import { DiagnosisData } from '../pages/admin/component/mediacal-history-moda/diagnostic-step.component';

/**
 * --- Fábrica para el Paso 1: Anamnesis ---
 */
export function makeAnamnesisData(
  overrides: Partial<AnamnesisData> = {}
): AnamnesisData {
  const livesWithOtherPets = faker.datatype.boolean();

  const fakeData: AnamnesisData = {
    foodQuantity: `${faker.number.int({ min: 200, max: 800 })}g`,
    foodType: faker.helpers.arrayElement([
      'Concentrado',
      'Comida húmeda',
      'Dieta BARF',
    ]),
    offspringInfo: faker.lorem.sentence(),
    isReproductive: faker.datatype.boolean(),
    hasAllVaccines: faker.datatype.boolean(0.8), // 80% de probabilidad de ser true
    livesWithOtherPets: livesWithOtherPets,
    whichPets: livesWithOtherPets ? faker.lorem.words(3) : undefined,
    illnessEvaluation: faker.lorem.paragraph(),
    observations: faker.lorem.paragraph(),
    habitat: faker.lorem.words(5),
  };

  return { ...fakeData, ...overrides };
}

/**
 * --- Fábrica para el Paso 2: Examen Físico ---
 */
export function makePhysicalExamData(
  overrides: Partial<PhysicalExamData> = {}
): PhysicalExamData {
  const fakeData: PhysicalExamData = {
    weight: faker.number.float({ min: 1, max: 50, multipleOf: 0.1 }),
    palpitations: faker.helpers.arrayElement([
      'Normales',
      'Arrítmicas',
      'Fuertes',
    ]),
    temperature: faker.number.float({ min: 37.5, max: 39.5, multipleOf: 0.1 }),
    respiratoryRate: faker.number.int({ min: 15, max: 30 }),
    heartRate: faker.number.int({ min: 60, max: 140 }),
    labExam: faker.lorem.sentence(),
    pulse: `${faker.number.int({ min: 70, max: 120 })} pulsos/min`,
    mucus: faker.helpers.arrayElement([
      'Rosado y húmedo',
      'Pálido',
      'Cianótico',
    ]),
    // Deja fileUploadPath vacío por defecto, puedes sobreescribirlo en el test.
  };

  return { ...fakeData, ...overrides };
}

/**
 * --- Fábrica para el Paso 3: Diagnóstico ---
 */
export function makeDiagnosisData(
  overrides: Partial<DiagnosisData> = {}
): DiagnosisData {
  // Función auxiliar para crear un tratamiento falso
  const createFakeTreatment = (): TreatmentData => ({
    name: faker.commerce.productName(),
    quantity: `${faker.number.int({ min: 1, max: 10 })}ml`,
    frequency: `Cada ${faker.helpers.arrayElement([8, 12, 24])} horas`,
    days: faker.number.int({ min: 3, max: 14 }),
  });

  const fakeData: DiagnosisData = {
    description: faker.lorem.paragraph(),
    // Genera entre 1 y 3 tratamientos por defecto
    treatments: Array.from(
      { length: faker.number.int({ min: 1, max: 3 }) },
      createFakeTreatment
    ),
  };

  return { ...fakeData, ...overrides };
}

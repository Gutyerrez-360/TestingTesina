export type Specie =
  | 'Felino'
  | 'Canino'
  | 'Cetoácidos'
  | 'Ofilio'
  | 'Roedor'
  | 'Saurio'
  | 'Quelonios';

export type Pet = {
  name: string;
  species: string;
  breed: string;
  color: string;
  birthDate: string; // Formato 'DD/MM/YYYY'
  gender: string;
  hasTattoos?: boolean;
  hasPedigree?: boolean;
};

export type PetGeneralInfo = Pet & {
  owner: string;
};

export type PetDetailsTab =
  | 'Historial médico'
  | 'Tratamientos'
  | 'Intervenciones';

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
  species: Specie;
  breed: string;
  color: string;
  birthDate: string; // Formato 'DD/MM/YYYY'
  gender: string;
  hasTattoos?: boolean;
  hasPedigree?: boolean;
};

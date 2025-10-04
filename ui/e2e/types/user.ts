export type NewUser = {
  firstName: string;
  lastName: string;
  email: string;
  birthDateDDMMYYYY: string;
  password: string;
  roleName: 'client' | 'admin';
  phone: string;
  address: string;
  dui: string;
};

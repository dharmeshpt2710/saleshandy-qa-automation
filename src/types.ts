// The three account types the assignment is about.
export type AccountType = 'personal' | 'business' | 'clients';

// A test user for the sign-up form.
export interface TestUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

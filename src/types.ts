// The three account types the assignment is about.
export type AccountType = 'personal' | 'business' | 'clients';

// A test user for the sign-up form.
export interface TestUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Login credentials for a pre-created, long-lived account (one per account
// type). Read from .env and used once per run by auth.setup.ts.
export interface LoginCredentials {
  email: string;
  password: string;
}

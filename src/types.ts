// The three account types the assignment is about.
export type AccountType = 'personal' | 'business' | 'clients';

// A test user for the sign-up form. Phone is optional on the form itself, so
// only the tests that specifically cover it set one.
export interface TestUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

// Login credentials for a pre-created, long-lived account (one per account
// type). Read from .env and used once per run by auth.setup.ts.
export interface LoginCredentials {
  email: string;
  password: string;
}

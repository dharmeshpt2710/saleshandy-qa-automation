import { AccountType, TestUser } from '../types';

// A test user for the sign-up form.
//
// The email is intentionally left blank here. Generated addresses get rejected
// by Saleshandy intermittently ("enter a valid email", "sign-up limit reached"),
// so the email is typed by hand in the browser during the run and captured by
// SignUpPage.register (which fills this in with what the user actually typed).
export function createUser(accountType: AccountType): TestUser {
  return {
    firstName: 'QA',
    lastName: accountType,
    email: '',
    password: 'TestData@123',
  };
}

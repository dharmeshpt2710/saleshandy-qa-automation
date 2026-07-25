import { AccountType } from '../types';

// Shared paths, text and selectors, so a UI change is a one-line edit.

export const LOGIN_PATH = '/login';

// Post-login dashboard; match the path only, ignoring the query string.
export const DASHBOARD_URL = /\/sequence/;

// Heading on the Sequences dashboard, the landing page for every current flow.
export const SEQUENCE_HEADING = 'Sequence';

// Unique text on each account-type card (used to click it and to assert it's gone).
export const ACCOUNT_TYPE_CARD: Record<AccountType, string> = {
  personal: 'I want to do cold emailing for personal use',
  business: 'I want to grow my business using cold emails',
  clients: 'I want to reach out for my clients',
};

// Onboarding "next" arrow: icon-only button, no label.
export const ONBOARDING_NEXT_BUTTON = 'button:has(svg)';

/**
 * Sign-up form error messages. The first four render inline under the field as
 * you type or blur, so they cost nothing to assert. The last four come back from
 * the server in the alert banner, which means the form was actually submitted.
 */
export const SIGNUP_ERRORS = {
  firstNameRequired: 'First name is required.',
  lastNameRequired: 'Last name is required.',
  invalidEmail: 'Please enter a valid email',
  alphabeticOnly: 'Alphabetic characters only.',

  badEmail: 'Bad email address',
  previouslyDeleted:
    'Your account was previously deleted. If you believe this is a mistake, please contact support@saleshandy.com',
  blacklistedEmail: 'This email address is blacklisted',
  maxSignupLimit: 'You have hit max signup limit. Try again after some time.',
} as const;

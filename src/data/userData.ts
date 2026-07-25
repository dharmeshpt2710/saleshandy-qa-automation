import { AccountType, TestUser } from '../types';

/**
 * Builds a fresh Gmail dot-variant on each call. Gmail ignores dots, so
 * d.harmeshptpt, dh.armeshptpt etc all reach the same inbox but Saleshandy
 * treats each one as a new address. We need real variants because "name+tag" and
 * a random suffix both get rejected as bad email. Only the sign-up specs use
 * this, the reusable accounts are logged into and not created (see
 * credentials.ts).
 */
const BASE = 'dharmeshptpt';
const DOMAIN = 'gmail.com';

// 11 gaps between 12 letters, each a dot or not -> 2^11 possible variants.
const MAX_VARIANTS = 2 ** (BASE.length - 1);

// Treat the number's bits as a mask over the gaps: bit set -> dot before that letter.
function emailFor(pattern: number): string {
  let local = BASE[0]; // first letter never takes a leading dot
  for (let i = 1; i < BASE.length; i++) {
    if (pattern & (1 << (i - 1))) local += '.';
    local += BASE[i];
  }
  return `${local}@${DOMAIN}`;
}

// Start from a random pattern so two runs rarely reuse the same burnt address.
let next = 1 + Math.floor(Math.random() * (MAX_VARIANTS - 1));

export function uniqueEmail(): string {
  const pattern = next;
  next = (next % (MAX_VARIANTS - 1)) + 1; // cycle 1..MAX-1; skip 0 (no dots = base login account)
  return emailFor(pattern);
}

export function createUser(accountType: AccountType): TestUser {
  return {
    firstName: 'QA',
    lastName: accountType,
    email: uniqueEmail(),
    password: 'TestData@123',
  };
}

// Phone is optional on the form, so the happy path fills it to prove it is accepted.
export const VALID_PHONE = '+91 99256-42153';

// Under the 8 character minimum, so the sign-up button stays disabled.
export const SHORT_PASSWORD = '1234';

// Names the form rejects: the space makes them non-alphabetic.
export const INVALID_NAME = {
  firstName: 'Dharmesh Invalid',
  lastName: 'Last Name',
};

/**
 * Addresses the server is expected to reject, one per rule. These are only ever
 * submitted by the negative specs, which run serially because every submit costs
 * an attempt against the sign-up rate limit.
 */
export const INVALID_EMAILS = {
  // Gmail plus-addressing. A real inbox, but the form rejects the "+tag" form.
  plusTag: `${BASE}+invalid@${DOMAIN}`,
  // Known disposable-mail domain.
  disposable: 'dharmeshmailinator@mailinator.com',
} as const;

/**
 * An account that was created and then permanently deleted, so signing up with
 * it again is refused. It is a real personal inbox, so it comes from .env rather
 * than being committed here.
 */
export function deletedAccountEmail(): string {
  const email = process.env.DELETED_ACCOUNT_EMAIL;

  if (!email) {
    throw new Error(
      'Missing DELETED_ACCOUNT_EMAIL in .env. Set it to the address of an account ' +
        'that was signed up and then deleted (copy .env.example for the full list).',
    );
  }

  return email;
}

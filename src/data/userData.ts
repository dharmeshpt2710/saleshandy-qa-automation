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

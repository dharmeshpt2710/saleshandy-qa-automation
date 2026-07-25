import { AccountType, TestUser } from '../types';

// Base Gmail name we build test emails from.
//
// Gmail ignores dots in the name, so d.harmeshptpt, dh.armeshptpt, etc. all
// reach the same real inbox, but Saleshandy treats each one as a new address.
// We build unique users this way because:
//   - "name+tag@gmail.com" is rejected by the app as a bad email (BUG-09), and
//   - a plain unique suffix like "name.12345@gmail.com" is not a real Gmail
//     account, so the form also rejects it. A dot-variant is a real address.
const BASE = 'dharmeshptpt';
const DOMAIN = 'gmail.com';
const MAX_VARIANTS = 2 ** (BASE.length - 1); // 11 gaps between letters -> 2048 patterns

// Build one dot-variant. `pattern` decides where the dots go: reading it as
// bits, bit 0 puts a dot after the 1st letter, bit 1 after the 2nd, and so on.
//   pattern 1 -> d.harmeshptpt
//   pattern 2 -> dh.armeshptpt
//   pattern 3 -> d.h.armeshptpt
function emailFor(pattern: number): string {
  let local = BASE[0];
  for (let i = 1; i < BASE.length; i++) {
    if (pattern & (1 << (i - 1))) local += '.';
    local += BASE[i];
  }
  return `${local}@${DOMAIN}`;
}

// Hand out a different variant on each call.
//
// We start from a random pattern so separate test runs are unlikely to reuse an
// address that a previous run already burned. If two runs ever land on the same
// one, signup fails with a visible "account already exists" message rather than
// failing silently, so it is easy to spot. There is no cleanup step because a
// used address is gone for good (deleting the account does not free it, BUG-08).
let next = 1 + Math.floor(Math.random() * (MAX_VARIANTS - 1));

export function uniqueEmail(): string {
  const pattern = next;
  next = (next % (MAX_VARIANTS - 1)) + 1; // stay in 1..2047, never 0 (0 = no dots = the base account)
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

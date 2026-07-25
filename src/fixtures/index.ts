import { test as base } from '@playwright/test';
import { AccountType } from '../types';
import { sessionStatePath } from '../utils/helpers';

// Custom test fixtures for the account-specific specs.
//
// Without this, every spec would have to repeat the session file by hand:
//   test.use({ storageState: '.auth/business.json' });
// which duplicates the ".auth/<type>.json" path all over the suite and couples
// each test to where sessions are stored.
//
// Instead a test just declares which account it is:
//   test.use({ account: 'business' });
// and this fixture loads the matching saved session automatically. That keeps
// the "create once, reuse" strategy (assignment 4.3) in one place and out of
// the individual tests.
type AccountOptions = {
  account: AccountType;
};

export const test = base.extend<AccountOptions>({
  // The account under test. Defaults to 'personal'; specs override it with
  // `test.use({ account })`.
  account: ['personal', { option: true }],

  // Override Playwright's built-in storageState to point at the session that
  // auth.setup.ts saved for whichever account this test declared.
  storageState: async ({ account }, use) => {
    await use(sessionStatePath(account));
  },
});

export { expect } from '@playwright/test';
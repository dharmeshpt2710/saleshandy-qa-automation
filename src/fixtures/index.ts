import { test as base } from '@playwright/test';
import { AccountType } from '../types';
import { sessionStatePath } from '../utils/helpers';

/**
 * Custom fixture for the account-specific specs. Instead of every test repeating
 * the session file path, a test just says test.use({ account: 'business' }) and
 * this loads the matching saved session. Keeps the "create once, reuse" idea in
 * one place.
 */
type AccountOptions = {
  account: AccountType;
};

export const test = base.extend<AccountOptions>({
  account: ['personal', { option: true }],

  // Point Playwright's storageState at the session auth.setup saved for this account.
  storageState: async ({ account }, use) => {
    await use(sessionStatePath(account));
  },
});

export { expect } from '@playwright/test';

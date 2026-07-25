import { test, expect } from '../src/fixtures';
import { AccountType } from '../src/types';
import { ACCOUNT_TYPE_CARD } from '../src/utils/constants';

// Account-specific tests that reuse a saved session (assignment section 4.3).
//
// Each block declares its account with `test.use({ account })`; the fixture
// loads that account's saved session, so the test starts already signed in and
// already onboarded. No login happens here.
//
// The same assertion runs for all three account types, differing only by the
// account passed in — the same "one generic flow, data decides the rest" idea
// as the sign-up code.
const accountTypes: AccountType[] = ['personal', 'business', 'clients'];

for (const account of accountTypes) {
  test.describe(`${account} user`, () => {
    test.use({ account });

    test(`TC-OB-08: an onboarded ${account} user is not shown onboarding again`, async ({ page }) => {
      await page.goto('/');

      // Because this user already finished onboarding, its account-type card
      // does not appear again.
      await expect(page.getByText(ACCOUNT_TYPE_CARD[account])).toBeHidden();
    });
  });
}

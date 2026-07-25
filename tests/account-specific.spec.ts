import { test } from '../src/fixtures';
import { AccountType } from '../src/types';
import { ACCOUNT_TYPE_CARD, DASHBOARD_URL } from '../src/utils/constants';
import { GoToUrl, expectUrl, expectHidden } from '../src/utils/helpers';

/**
 * Account-specific tests that reuse a saved session (assignment 4.3). Each block
 * says test.use({ account }) and the fixture loads that account's session, so the
 * test starts already logged in and onboarded, no login here. The same check runs
 * for all three types, only the account changes.
 */
const accountTypes: AccountType[] = ['personal', 'business', 'clients'];

for (const account of accountTypes) {
  test.describe(`${account} user`, () => {
    test.use({ account });

    test(`TC-OB-08: an onboarded ${account} user is not shown onboarding again`, async ({ page }) => {
      await GoToUrl(page);

      // Reused session is logged in, we land on the dashboard and not back on
      // /login. This is what proves the reuse really worked, a stale session
      // would redirect here and fail.
      await expectUrl(page, DASHBOARD_URL);

      // Already onboarded, so the account-type card is not shown again.
      await expectHidden(page.getByText(ACCOUNT_TYPE_CARD[account]));
    });
  });
}

import { test } from '../src/fixtures';
import { DashboardPage } from '../src/pages/DashboardPage';
import { OnboardingPage } from '../src/pages/OnboardingPage';
import { AccountType } from '../src/types';
import { DASHBOARD_URL } from '../src/utils/constants';
import { goToUrl, expectUrl } from '../src/utils/helpers';

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
      await goToUrl(page);

      // A stale session would redirect to /login, so landing on the dashboard is
      // what proves the session reuse really worked.
      await expectUrl(page, DASHBOARD_URL);

      // A "Let's Start" screen may come first, clicking it opens the dashboard.
      const dashboard = new DashboardPage(page);
      await dashboard.dismissLetsStartIfShown();
      await dashboard.expectSequencesDashboard();

      await new OnboardingPage(page).expectAccountTypeScreenHidden(account);
    });
  });
}

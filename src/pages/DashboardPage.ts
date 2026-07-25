import { Locator, Page } from '@playwright/test';
import { expectVisible } from '../utils/helpers';

/**
 * Page object for the dashboards a user can land on after onboarding. Which one
 * shows up depends on the product choice and not the account type, "Lead Finder"
 * goes to Lead Finder and everything else goes to Sequences.
 */
export class DashboardPage {

  readonly btnLetsStart: Locator;
  readonly companiesTab: Locator;

  constructor(private page: Page) {

    this.btnLetsStart = this.page.getByRole('button', { name: /let'?s start/i });
    this.companiesTab = this.page.getByRole('tab', { name: 'Companies' });
  }

  async expectSequencesDashboard() {
    await expectVisible(this.btnLetsStart);
  }

  async expectLeadFinderDashboard() {
    await expectVisible(this.companiesTab);
  }
}

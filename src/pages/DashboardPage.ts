import { Locator, Page } from '@playwright/test';
import { SEQUENCE_HEADING } from '../utils/constants';
import { expectVisible } from '../utils/helpers';

/**
 * Page object for the dashboards a user can land on after onboarding. Which one
 * shows up depends on the product choice and not the account type, "Lead Finder"
 * goes to Lead Finder and everything else goes to Sequences.
 */
export class DashboardPage {
  // ── Locators ──────────────────────────────────────────────────────────────
  private readonly btnLetsStart: Locator;
  private readonly sequenceHeading: Locator;
  private readonly companiesTab: Locator;

  constructor(private page: Page) {
    this.btnLetsStart = this.page.getByRole('button', { name: /let'?s start/i });
    this.sequenceHeading = this.page.getByRole('heading', { name: SEQUENCE_HEADING });
    this.companiesTab = this.page.getByRole('tab', { name: 'Companies' });
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  // Some sessions land on a "Let's Start" screen first, and clicking it opens the
  // Sequences dashboard. It is not always shown, so only click it when it is.
  async dismissLetsStartIfShown() {
    const isShown = await this.btnLetsStart
      .waitFor({ state: 'visible', timeout: 5_000 })
      .then(() => true)
      .catch(() => false);

    if (isShown) {
      await this.btnLetsStart.click();
    }
  }

  // ── Assertions ──────────────────────────────────────────────────────────

  async expectSequencesDashboard() {
    await expectVisible(this.sequenceHeading);
  }

  async expectLeadFinderDashboard() {
    await expectVisible(this.companiesTab);
  }
}

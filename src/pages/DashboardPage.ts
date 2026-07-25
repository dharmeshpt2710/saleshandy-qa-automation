import { Page, expect } from '@playwright/test';

// Page object for the two dashboards a user can land on after onboarding.
// Which one you land on depends on the product choice, not the account type:
// "Lead Finder" lands on Lead Finder, everything else lands on Sequences.
// These selectors still need confirming against the live app.
export class DashboardPage {
  constructor(private page: Page) {}

  // Sequences is the default landing dashboard.
  async expectSequencesDashboard() {
    await expect(this.page.getByRole('button', { name: /let'?s start/i })).toBeVisible();
  }

  // Lead Finder dashboard, reached only when the product choice was "Lead Finder".
  async expectLeadFinderDashboard() {
    await expect(this.page.getByRole('tab', { name: 'Companies' })).toBeVisible();
  }
}

import { Locator, Page } from '@playwright/test';
import { DASHBOARD_URL } from '../utils/constants';
import { expectVisible, expectUrl } from '../utils/helpers';

// Page object for the log-in form.
export class LoginPage {
  // ── Locators ──────────────────────────────────────────────────────────────
  // Taken from a codegen recording of the live login.
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly verificationHeading: Locator;
  private readonly sequenceDashboardHeading: Locator;

  constructor(private page: Page) {
    this.emailInput = this.page.getByRole('textbox', { name: 'Enter your work email address' });
    this.passwordInput = this.page.getByRole('textbox', { name: 'Enter your password' });
    this.loginButton = this.page.getByRole('button', { name: 'Login' });
    this.verificationHeading = this.page.getByRole('heading', { name: 'Verification Code' });
    this.sequenceDashboardHeading = this.page.getByRole('heading', { name: 'Sequence' });
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  // Login always sends an OTP, so it does not finish here. The caller must run
  // completeOtpManually after this.
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * On every login Saleshandy emails a 4 digit OTP. We can't read the inbox, so a
   * person types it into the browser. Wait for the code screen, then wait until
   * the app reaches the Sequence dashboard.
   */
  async completeOtpManually() {
    await expectVisible(this.verificationHeading);
    console.log(
      '\n>>> Enter the 4-digit OTP emailed to this account in the browser. Waiting for login to finish...\n',
    );
    await this.page.waitForURL(DASHBOARD_URL, { timeout: 2 * 60_000 });
    await expectVisible(this.sequenceDashboardHeading);
    await expectUrl(this.page, DASHBOARD_URL);
  }
}

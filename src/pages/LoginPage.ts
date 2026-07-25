import { Locator, Page } from '@playwright/test';
import { DASHBOARD_URL } from '../utils/constants';
import { expectVisible, expectUrl } from '../utils/helpers';

/**
 * Page object for the log-in form. Selectors are taken from a codegen recording
 * of the live login.
 */
export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly verificationHeading: Locator;
  readonly sequenceDashboardHeading: Locator;

  constructor(private page: Page) {
    this.emailInput = this.page.getByRole('textbox', { name: 'Enter your work email address' });
    this.passwordInput = this.page.getByRole('textbox', { name: 'Enter your password' });
    this.loginButton = this.page.getByRole('button', { name: 'Login' });
    this.verificationHeading = this.page.getByRole('heading', { name: 'Verification Code' });
    this.sequenceDashboardHeading = this.page.getByRole('heading', { name: 'Sequence' });
  }

  // baseURL already points at the login url, so an empty path opens it.


  // Fill the credentials and submit. Login always send an OTP so it does not
  // finish here, the caller must run completeOtpManually after this.
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * On every login Saleshandy sends a 4 digit OTP on the email. We can't read
   * the inbox, so a person has to type it in the browser. Here we wait for the
   * code screen, then wait till the app reaches the Sequence dashboard.
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

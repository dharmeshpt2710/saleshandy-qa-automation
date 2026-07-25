import { Locator, Page } from '@playwright/test';
import { TestUser } from '../types';
import { GoToUrl } from '../utils/helpers';

/**
 * Page object for the "Create your account" sign-up form. The fields don't have
 * test ids, so we locate them by their placeholder text (selectors taken from a
 * codegen recording).
 */
export class SignUpPage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signUpButton: Locator;
  readonly signUpLink: Locator;

  constructor(private page: Page) {
    this.firstNameInput = this.page.getByRole('textbox', { name: 'John', exact: true });
    this.lastNameInput = this.page.getByRole('textbox', { name: 'Doe', exact: true });
    this.emailInput = this.page.getByRole('textbox', { name: 'johndoe@example.com' });
    this.passwordInput = this.page.getByRole('textbox', { name: 'Minimum 8 Characters' });
    this.signUpButton = this.page.getByRole('button', { name: 'Sign up', exact: true });
    this.signUpLink = this.page.getByRole('link', { name: 'Sign up!' });
  }

  async open() {
    await GoToUrl(this.page);
    await this.signUpLink.click();
  }

  /**
   * Fill the form and submit. The email is a generated address so every run
   * makes a fresh account. Only the sign-up specs use this, rest of the suite
   * reuse a saved session. Phone number is optional so we skip it.
   */
  async register(user: TestUser) {
    await this.open();
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.signUpButton.click();
  }
}

import { Locator, Page } from '@playwright/test';
import { TestUser } from '../types';

// Page object for the "Create your account" sign-up form.
// The fields have no test ids, so we find them by their placeholder text.
// These selectors are confirmed from a Playwright codegen recording.
export class SignUpPage {

  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signUpButton: Locator;
  
  constructor(private page: Page) {
    this.firstNameInput = this.page.getByRole('textbox', { name: 'John', exact: true });
    this.lastNameInput = this.page.getByRole('textbox', { name: 'Doe', exact: true });
    this.emailInput = this.page.getByRole('textbox', { name: 'johndoe@example.com' });
    this.passwordInput = this.page.getByRole('textbox', { name: 'Minimum 8 Characters' });
    this.signUpButton = this.page.getByRole('button', { name: 'Sign up', exact: true });
  }

  // Open the login page and click through to the sign-up form.
  async open() {
    await this.page.goto('/login');
    await this.page.getByRole('link', { name: 'Sign up!' }).click();
  }

  // Fill the form and submit. Phone number is optional, so we skip it.
  async register(user: TestUser) {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.signUpButton.click();
  }
}

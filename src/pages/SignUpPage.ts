import { Locator, Page } from '@playwright/test';
import { TestUser } from '../types';
import {
  expectContainsText,
  expectCount,
  expectDisabled,
  expectEnabled,
  expectVisible,
  goToUrl,
} from '../utils/helpers';

// Page object for the "Create your account" sign-up form.
export class SignUpPage {
  // ── Locators ──────────────────────────────────────────────────────────────
  // The form has no test ids, so everything is located by its placeholder text.
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly phoneInput: Locator;
  private readonly signUpButton: Locator;
  private readonly signUpLink: Locator;
  private readonly form: Locator;
  private readonly alert: Locator;

  // Field order is fixed here so filling the form is deterministic.
  private readonly fields: ReadonlyArray<readonly [keyof TestUser, Locator]>;

  constructor(private page: Page) {
    this.firstNameInput = this.page.getByRole('textbox', { name: 'John', exact: true });
    this.lastNameInput = this.page.getByRole('textbox', { name: 'Doe', exact: true });
    this.emailInput = this.page.getByRole('textbox', { name: 'johndoe@example.com' });
    this.passwordInput = this.page.getByRole('textbox', { name: 'Minimum 8 Characters' });
    this.phoneInput = this.page.getByRole('textbox', { name: '1 (702) 123-' });
    this.signUpButton = this.page.getByRole('button', { name: 'Sign up', exact: true });
    this.signUpLink = this.page.getByRole('link', { name: 'Sign up!' });
    this.form = this.page.locator('form');
    // Server rejections arrive in a banner, separate from the inline field errors.
    this.alert = this.page.getByRole('alert');

    this.fields = [
      ['firstName', this.firstNameInput],
      ['lastName', this.lastNameInput],
      ['email', this.emailInput],
      ['password', this.passwordInput],
      ['phone', this.phoneInput],
    ];
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async open() {
    await goToUrl(this.page);
    await this.signUpLink.click();
  }

  // ── Form actions ──────────────────────────────────────────────────────────

  // Fills only the fields provided, leaving the rest untouched.
  async fill(user: Partial<TestUser>) {
    let lastFilled: Locator | undefined;

    for (const [name, input] of this.fields) {
      const value = user[name];
      if (value === undefined) continue;

      await input.fill(value);
      lastFilled = input;
    }

    // Inline validation only renders once a field loses focus.
    await lastFilled?.blur();
  }

  // Touches every required field so an untouched form reveals its "is required" errors.
  async blurRequiredFields() {
    const required = this.fields.filter(([name]) => name !== 'phone');

    for (const [, input] of required) {
      await input.click();
    }

    await required[required.length - 1][1].blur();
  }

  async submit() {
    await this.signUpButton.click();
  }

  // Open, fill and submit in one go. Used by the generic sign-up flow.
  async register(user: TestUser) {
    await this.open();
    await this.fill(user);
    await this.submit();
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async expectSignUpBlocked() {
    await expectDisabled(this.signUpButton);
  }

  async expectSignUpAvailable() {
    await expectEnabled(this.signUpButton);
  }

  async expectFieldError(message: string) {
    await expectVisible(this.fieldError(message));
  }

  async expectFieldErrorCount(message: string, count: number) {
    await expectCount(this.fieldError(message), count);
  }

  async expectServerError(message: string) {
    await expectContainsText(this.alert, message);
  }

  // Non-blocking read, for flows that branch on whether the server refused.
  async hasServerError(message: string): Promise<boolean> {
    return (await this.alert.filter({ hasText: message }).count()) > 0;
  }

  private fieldError(message: string): Locator {
    return this.form.getByText(message);
  }
}

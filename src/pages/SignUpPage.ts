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

  // Fill the form, then hand over to the person running the test for the email.
  //
  // Generated addresses get rejected by Saleshandy intermittently ("enter a
  // valid email", "sign-up limit reached, please wait"), so we fill everything
  // else automatically and let a human type a real address they control. Once
  // the email is typed, the user presses Enter or clicks "Sign up" themselves.
  //
  // We then wait for the sign-up to go through: the email field stays on screen
  // until it succeeds, so its disappearance is our signal to continue. Phone
  // number is optional, so we skip it.
  async register(user: TestUser) {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.passwordInput.fill(user.password);

    // Put the cursor in the email field so the user can just start typing.
    await this.emailInput.click();
    console.log(
      '\n>>> Type the sign-up email in the browser, then press Enter or click "Sign up". Waiting...\n',
    );

    // Wait (up to 2 minutes) for the manual sign-up, capturing what was typed.
    const deadline = Date.now() + 2 * 60_000;
    while (Date.now() < deadline) {
      if (await this.emailInput.isHidden().catch(() => true)) break;
      const typed = await this.emailInput.inputValue().catch(() => '');
      if (typed) user.email = typed;
      await this.page.waitForTimeout(500);
    }
    return user.email;
  }
}

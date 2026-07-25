import { Page } from '@playwright/test';

// Page object for the log-in form.
// TODO: these selectors are best guesses. Confirm them with codegen on the
// login page: `npx playwright codegen https://my.saleshandy.com/login`.
export class LoginPage {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByRole('textbox', { name: 'Email' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Log in', exact: true }).click();
  }
}

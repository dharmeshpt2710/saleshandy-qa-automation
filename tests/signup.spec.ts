import { test } from '@playwright/test';
import { SignUpPage } from '../src/pages/SignUpPage';
import { createUser } from '../src/data/userData';
import { expectVisible } from '../src/utils/helpers';

// Sign-up form tests. No saved session because we are testing sign-up itself.
test.describe('Sign-up form', () => {
  test('TC-SU-01: a new user can sign up with valid data', async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    await signUpPage.register(createUser('personal'));

    // A good sign-up moves us to the account-type screen.
    await expectVisible(page.getByText('I want to do cold emailing for personal use'));
  });

  test('TC-SU-02: sign up is blocked when a required field is missing', async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    await signUpPage.open();

    await page.getByRole('button', { name: 'Sign up', exact: true }).click();

    // Empty form shows an inline error instead of submitting.
    await expectVisible(page.getByText('First name is required.'));
  });
});

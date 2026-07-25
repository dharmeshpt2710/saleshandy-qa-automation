import { test, expect } from '@playwright/test';
import { SignUpPage } from '../src/pages/SignUpPage';
import { createUser } from '../src/data/userData';

// Sign-up form tests. These run without a saved session because they are
// testing sign-up itself.
test.describe('Sign-up form', () => {
  test('TC-SU-01: a new user can sign up with valid data', async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    await signUpPage.open();
    await signUpPage.register(createUser('personal'));

    // A successful sign-up takes the user to the account-type screen.
    await expect(page.getByText('I want to do cold emailing for personal use')).toBeVisible();
  });

  test('TC-SU-02: sign up is blocked when a required field is missing', async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    await signUpPage.open();

    // Submit the empty form.
    await page.getByRole('button', { name: 'Sign up', exact: true }).click();

    // The form shows an inline validation error instead of submitting.
    await expect(page.getByText('First name is required.')).toBeVisible();
  });
});

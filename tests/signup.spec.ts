import { test } from '@playwright/test';
import { SignUpPage } from '../src/pages/SignUpPage';
import { OnboardingPage } from '../src/pages/OnboardingPage';
import {
  INVALID_EMAILS,
  INVALID_NAME,
  SHORT_PASSWORD,
  VALID_PHONE,
  createUser,
  deletedAccountEmail,
  uniqueEmail,
} from '../src/data/userData';
import { SIGNUP_ERRORS } from '../src/utils/constants';

/**
 * Sign-up form tests. No saved session, because sign-up is what is under test.
 * TC-SU-04 is retired: it was the combined recording these cases were split from.
 */
test.describe('Sign-up', () => {
  let signUpPage: SignUpPage;

  test.beforeEach(async ({ page }) => {
    signUpPage = new SignUpPage(page);
    await signUpPage.open();
  });

  test('TC-SU-01: a new user can sign up with valid data and an optional phone number', async ({
    page,
  }) => {
    await signUpPage.fill({ ...createUser('personal'), phone: VALID_PHONE });
    await signUpPage.submit();

    await new OnboardingPage(page).expectAccountTypeScreen('personal');
  });

  // ── Client-side validation ────────────────────────────────────────────────
  // Nothing here submits, so no account is created and no email address burned.
  test.describe('client-side validation', { tag: '@client' }, () => {
    test('TC-SU-02: required fields show inline errors and sign up stays disabled', async () => {
      await signUpPage.blurRequiredFields();

      await signUpPage.expectFieldError(SIGNUP_ERRORS.firstNameRequired);
      await signUpPage.expectFieldError(SIGNUP_ERRORS.lastNameRequired);
      await signUpPage.expectFieldError(SIGNUP_ERRORS.invalidEmail);
      await signUpPage.expectSignUpBlocked();
    });

    test('TC-SU-03: a password under 8 characters keeps sign up disabled', async () => {
      // Everything else is valid, so only the password can be blocking submission.
      await signUpPage.fill({ ...createUser('personal'), password: SHORT_PASSWORD });

      await signUpPage.expectSignUpBlocked();
    });

    test('TC-SU-05: non-alphabetic characters in the name fields are rejected', async () => {
      await signUpPage.fill(INVALID_NAME);

      // One error under first name, one under last name.
      await signUpPage.expectFieldErrorCount(SIGNUP_ERRORS.alphabeticOnly, 2);
      await signUpPage.expectSignUpBlocked();
    });
  });

  // ── Server-side rejection ─────────────────────────────────────────────────
  // Each test submits for real, costing one email address and one attempt against
  // the sign-up rate limit. Serial so they cannot race each other into it.
  test.describe('server-side rejection', { tag: '@server' }, () => {
    test.describe.configure({ mode: 'serial' });

    async function submitWithEmail(email: string) {
      await signUpPage.fill({ ...createUser('personal'), email });
      await signUpPage.submit();
    }

    test('TC-SU-06: a plus-addressed email is rejected', async () => {
      await submitWithEmail(INVALID_EMAILS.plusTag);

      await signUpPage.expectServerError(SIGNUP_ERRORS.badEmail);
    });

    test('TC-SU-07: the email of a previously deleted account is rejected', async () => {
      await submitWithEmail(deletedAccountEmail());

      await signUpPage.expectServerError(SIGNUP_ERRORS.previouslyDeleted);
    });

    test('TC-SU-08: a disposable email domain is rejected', async () => {
      await submitWithEmail(INVALID_EMAILS.disposable);

      await signUpPage.expectSignUpAvailable();
      await signUpPage.expectServerError(SIGNUP_ERRORS.blacklistedEmail);
    });

    /**
     * Skipped on purpose: tripping the limit is the point, and once tripped it
     * fails TC-SU-01 and the whole onboarding spec until it lifts. Un-skip and
     * run it in isolation with: npx playwright test --grep @ratelimit
     */
    test.skip(
      'TC-SU-09: sign-up is blocked once the max signup limit is hit',
      { tag: '@ratelimit' },
      async () => {
        const MAX_ATTEMPTS = 10;

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          // Each attempt creates a real account until the limit starts refusing them.
          await submitWithEmail(uniqueEmail());

          if (await signUpPage.hasServerError(SIGNUP_ERRORS.maxSignupLimit)) break;

          await signUpPage.open();
        }

        await signUpPage.expectServerError(SIGNUP_ERRORS.maxSignupLimit);
      },
    );
  });
});

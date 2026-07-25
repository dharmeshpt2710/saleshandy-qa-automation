import { test } from '@playwright/test';
import { signUp } from '../src/auth/signUp';
import { onboardingSteps } from '../src/data/onboardingData';
import { AccountType } from '../src/types';
import { expectHidden } from '../src/utils/helpers';

/**
 * Onboarding tests. These run a full fresh sign-up so no saved session is used.
 * The same test runs for all three types, which proves one generic flow handles
 * every type and we only change the account we pass in.
 */
const accountTypes: AccountType[] = ['personal', 'business', 'clients'];

for (const type of accountTypes) {
  test(`TC-OB: ${type} onboarding completes through all its steps`, async ({ page }) => {
    await signUp(page, type);

    // Onboarding is done, so the last question is not on screen anymore.
    const steps = onboardingSteps[type];
    const lastStep = steps[steps.length - 1];
    await expectHidden(page.getByRole('heading', { name: lastStep.heading }));
  });
}

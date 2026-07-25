import { test, expect } from '@playwright/test';
import { signUp } from '../src/auth/signUp';
import { onboardingSteps } from '../src/data/onboardingData';
import { AccountType } from '../src/types';

// Onboarding tests. These run a full fresh sign-up, so no saved session is used.
//
// The same test runs for all three account types. This is the proof that one
// generic flow handles every type: we only change the account type we pass in.
const accountTypes: AccountType[] = ['personal', 'business', 'clients'];

for (const type of accountTypes) {
  test(`TC-OB: ${type} onboarding completes through all its steps`, async ({ page }) => {
    // signUp walks every step and checks each heading along the way.
    await signUp(page, type);

    // After the last step the onboarding is finished, so the final question
    // is no longer on screen.
    const steps = onboardingSteps[type];
    const lastStep = steps[steps.length - 1];
    await expect(page.getByRole('heading', { name: lastStep.heading })).toBeHidden();
  });
}

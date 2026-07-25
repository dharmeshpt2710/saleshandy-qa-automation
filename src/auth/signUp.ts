import { Page } from '@playwright/test';
import { AccountType } from '../types';
import { createUser } from '../data/userData';
import { onboardingSteps } from '../data/onboardingData';
import { SignUpPage } from '../pages/SignUpPage';
import { OnboardingPage } from '../pages/OnboardingPage';

// The one generic sign-up flow the assignment asks for (section 3).
//
// Give it an account type and it does everything for that type:
//   1. fills the single sign-up form
//   2. picks the matching account-type card
//   3. answers the correct onboarding steps
//
// There is no separate script per account type. The only thing that changes is
// the data it reads from onboardingData.ts.
export async function signUp(page: Page, accountType: AccountType) {
  const user = createUser(accountType);
  const onboarding = new OnboardingPage(page);
  const signUpPage = new SignUpPage(page);

  await signUpPage.open();
  await signUpPage.register(user);

  await onboarding.chooseAccountType(accountType);
  await onboarding.completeSteps(onboardingSteps[accountType]);

  // Return the user so a caller can save or reuse the login.
  return user;
}

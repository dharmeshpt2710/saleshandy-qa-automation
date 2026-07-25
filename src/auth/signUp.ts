import { Page } from '@playwright/test';
import { AccountType } from '../types';
import { createUser } from '../data/userData';
import { onboardingSteps } from '../data/onboardingData';
import { SignUpPage } from '../pages/SignUpPage';
import { OnboardingPage } from '../pages/OnboardingPage';

/**
 * The one generic sign-up flow. Give it an account type and it fills the sign-up
 * form, picks the matching account card and answers that type's onboarding
 * steps. No separate script per type, only the data from onboardingData changes.
 */
export async function signUp(page: Page, accountType: AccountType) {
  const user = createUser(accountType);
  const onboarding = new OnboardingPage(page);
  const signUpPage = new SignUpPage(page);

  await signUpPage.register(user);

  await onboarding.chooseAccountType(accountType);
  await onboarding.completeSteps(onboardingSteps[accountType]);

  return user;
}

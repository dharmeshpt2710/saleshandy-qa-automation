import { Page, expect } from '@playwright/test';
import { AccountType } from '../types';
import { Step } from '../data/onboardingData';
import { ACCOUNT_TYPE_CARD, ONBOARDING_NEXT_BUTTON } from '../utils/constants';

// Page object for the onboarding screens (account-type choice and the steps).
// Every step looks the same: a heading, some option cards, and a forward arrow.
// So one set of methods handles all of them.
export class OnboardingPage {
  constructor(private page: Page) {}

  // First onboarding screen: pick the account type.
  async chooseAccountType(type: AccountType) {
    await this.page.getByText(ACCOUNT_TYPE_CARD[type]).click();
  }

  // Answer a single step: check the heading is right, click the answer,
  // then click the forward arrow to move on.
  async answerStep(step: Step) {
    await expect(this.page.getByRole('heading', { name: step.heading })).toBeVisible();
    await this.page.getByText(step.answer, { exact: true }).click();

    // The forward arrow is just an icon with no text label.
    // TODO: confirm this selector with `npx playwright codegen https://my.saleshandy.com/`.
    await this.page.locator(ONBOARDING_NEXT_BUTTON).last().click();
  }

  // Answer every step for this account type, in order.
  async completeSteps(steps: Step[]) {
    for (const step of steps) {
      await this.answerStep(step);
    }
  }
}

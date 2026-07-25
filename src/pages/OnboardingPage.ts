import { Page, expect } from '@playwright/test';
import { AccountType } from '../types';
import { Step } from '../data/onboardingData';

// The text on each account-type card. The description is unique per type and is
// the most reliable thing to click.
const ACCOUNT_TYPE_CARD: Record<AccountType, string> = {
  personal: 'I want to do cold emailing for personal use',
  business: 'I want to grow my business using cold emails',
  clients: 'I want to reach out for my clients',
};

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
    await this.page.locator('button:has(svg)').last().click();
  }

  // Answer every step for this account type, in order.
  async completeSteps(steps: Step[]) {
    for (const step of steps) {
      await this.answerStep(step);
    }
  }
}

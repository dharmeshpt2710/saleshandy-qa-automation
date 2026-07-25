import { Locator, Page } from '@playwright/test';
import { AccountType } from '../types';
import { Step } from '../data/onboardingData';
import { ACCOUNT_TYPE_CARD, ONBOARDING_NEXT_BUTTON } from '../utils/constants';
import { expectVisible } from '../utils/helpers';

// Page object for onboarding. Every step is the same shape (heading, option
// cards, forward arrow), so one set of methods drives all account types.
export class OnboardingPage {
  readonly accountTypeCard: (type: AccountType) => Locator;
  readonly nextButton: Locator;
  readonly stepHeading: (heading: string) => Locator;
  readonly stepOption: (option: string) => Locator;

  constructor(private page: Page) {
    this.accountTypeCard = (type) => this.page.getByText(ACCOUNT_TYPE_CARD[type]);
    this.nextButton = this.page.locator(ONBOARDING_NEXT_BUTTON).last();
    this.stepHeading = (heading) => this.page.getByRole('heading', { name: heading });
    this.stepOption = (option) => this.page.getByText(option, { exact: true });
  }

  async chooseAccountType(type: AccountType) {
    await this.accountTypeCard(type).click();
  }

  // Assert the heading and every option, then click the answer. The answer
  // auto-advances, so we only click the arrow (icon-only, matched by svg) when
  // needsNext is set.
  async answerStep(step: Step) {
  
    await expectVisible(this.stepHeading(step.heading));
    for (const option of step.options) {
      await expectVisible(this.stepOption(option));
    }
    await this.stepOption(step.answer).click();
    if (step.needsNext) {
      await this.nextButton.click();
    }
  }

  async completeSteps(steps: Step[]) {
    for (const step of steps) {
      await this.answerStep(step);
    }
  }
}

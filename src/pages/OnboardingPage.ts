import { Locator, Page } from '@playwright/test';
import { AccountType } from '../types';
import { Step, onboardingSteps } from '../data/onboardingData';
import { ACCOUNT_TYPE_CARD, ONBOARDING_NEXT_BUTTON } from '../utils/constants';
import { expectHidden, expectVisible } from '../utils/helpers';

// Page object for onboarding. Every step is the same shape (heading, option
// cards, forward arrow), so one set of methods drives all account types.
export class OnboardingPage {
  // ── Locators ──────────────────────────────────────────────────────────────
  private readonly accountTypeCard: (type: AccountType) => Locator;
  private readonly nextButton: Locator;
  private readonly stepHeading: (heading: string) => Locator;
  private readonly stepOption: (option: string) => Locator;

  constructor(private page: Page) {
    this.accountTypeCard = (type) => this.page.getByText(ACCOUNT_TYPE_CARD[type]);
    this.nextButton = this.page.locator(ONBOARDING_NEXT_BUTTON).last();
    this.stepHeading = (heading) => this.page.getByRole('heading', { name: heading });
    this.stepOption = (option) => this.page.getByText(option, { exact: true });
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async chooseAccountType(type: AccountType) {
    await this.accountTypeCard(type).click();
  }

  // Assert the heading and every option, then click the answer. The answer
  // auto-advances, so we only click the arrow when needsNext is set.
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

  // Full onboarding for a type: pick the account card, then answer its steps.
  // Same entry point whether onboarding runs right after sign-up or is resumed
  // on a later login.
  async completeOnboarding(type: AccountType) {
    await this.chooseAccountType(type);
    await this.completeSteps(onboardingSteps[type]);
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  // The screen a successful sign-up lands on, before any question is answered.
  async expectAccountTypeScreen(type: AccountType) {
    await expectVisible(this.accountTypeCard(type));
  }

  // An already-onboarded user is never asked to pick a type again.
  async expectAccountTypeScreenHidden(type: AccountType) {
    await expectHidden(this.accountTypeCard(type));
  }

  // Onboarding is finished once that type's last question is off screen.
  async expectOnboardingComplete(type: AccountType) {
    const steps = onboardingSteps[type];
    await expectHidden(this.stepHeading(steps[steps.length - 1].heading));
  }
}

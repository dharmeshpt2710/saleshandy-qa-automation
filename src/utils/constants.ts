import { AccountType } from '../types';

// Shared app paths, UI text and selectors used by more than one page object or
// spec. Keeping them here means a UI change is a one-line edit, not a hunt
// through every file.

// Entry path to the login / sign-up screen (baseURL in playwright.config.ts
// points at the app host).
export const LOGIN_PATH = '/login';

// The unique description text on each account-type onboarding card. It is the
// most reliable thing to click, and specs also use it to assert that an already
// onboarded user is not shown the card again.
export const ACCOUNT_TYPE_CARD: Record<AccountType, string> = {
  personal: 'I want to do cold emailing for personal use',
  business: 'I want to grow my business using cold emails',
  clients: 'I want to reach out for my clients',
};

// The onboarding "next" control is an unlabelled icon button (svg only), so we
// match it structurally.
export const ONBOARDING_NEXT_BUTTON = 'button:has(svg)';

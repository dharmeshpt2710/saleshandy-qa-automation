import { AccountType } from '../types';

// Shared paths, text and selectors, so a UI change is a one-line edit.

export const LOGIN_PATH = '/login';

// Post-login dashboard; match the path only, ignoring the query string.
export const DASHBOARD_URL = /\/sequence/;

// Unique text on each account-type card (used to click it and to assert it's gone).
export const ACCOUNT_TYPE_CARD: Record<AccountType, string> = {
  personal: 'I want to do cold emailing for personal use',
  business: 'I want to grow my business using cold emails',
  clients: 'I want to reach out for my clients',
};

// Onboarding "next" arrow: icon-only button, no label.
export const ONBOARDING_NEXT_BUTTON = 'button:has(svg)';

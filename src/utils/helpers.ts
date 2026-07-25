import fs from 'fs';
import { Locator, Page, expect } from '@playwright/test';
import { AccountType } from '../types';

// Go to the app's base URL (empty path resolves to baseURL in the config).
export async function GoToUrl(page: Page): Promise<void> {
  await page.goto('');
}

// Assert the current URL; auto-waits until it matches. Accepts a string or RegExp.
export async function expectUrl(page: Page, url: string | RegExp): Promise<void> {
  await expect(page).toHaveURL(url);
}

// Assert a locator is visible; auto-waits until it is.
export async function expectVisible(locator: Locator): Promise<void> {
  await expect(locator).toBeVisible();
}

// Assert a locator is hidden/absent; auto-waits until it is.
export async function expectHidden(locator: Locator): Promise<void> {
  await expect(locator).toBeHidden();
}

// One place for the saved session path, so the code that writes it (auth.setup)
// and the one that reads it (fixtures) can't drift apart.
export const AUTH_DIR = '.auth';

export function sessionStatePath(account: AccountType): string {
  return `${AUTH_DIR}/${account}.json`;
}

/*
* How long a saved session is trusted before we login again. Login sends a manual
* OTP so we don't want to repeat it every run, this is what keeps "login is not
* repeated" true across runs and not just inside one run.
*/
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

/**
 * True when a recent session file already exists for this account, so setup can
 * skip the login. Set FORCE_LOGIN=1 to login anyway, e.g. when the session has
 * expired and tests start bouncing to /login.
 */
export function hasFreshSession(account: AccountType): boolean {
  if (process.env.FORCE_LOGIN) return false;
  try {
    const ageMs = Date.now() - fs.statSync(sessionStatePath(account)).mtimeMs;
    return ageMs < SESSION_MAX_AGE_MS;
  } catch {
    return false; // no session file yet
  }
}

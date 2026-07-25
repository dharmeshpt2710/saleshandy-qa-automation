import { test as setup } from '@playwright/test';
import fs from 'fs';
import { signUp } from '../src/auth/signUp';
import { AccountType } from '../src/types';
import { AUTH_DIR, sessionStatePath } from '../src/utils/helpers';

// This is how we avoid logging in on every test (assignment section 4.3).
//
// It runs once, before the real tests. For each account type it creates a user,
// finishes onboarding, and saves that logged-in browser session to a file under
// .auth/. The real tests then load that file and start already logged in, so we
// never repeat sign-up or login.
//
// We need three separate users because the account type is permanent and cannot
// be changed after onboarding.
const accountTypes: AccountType[] = ['personal', 'business', 'clients'];

for (const type of accountTypes) {
  setup(`create ${type} user and save session`, async ({ page }) => {
    await signUp(page, type);

    fs.mkdirSync(AUTH_DIR, { recursive: true });
    await page.context().storageState({ path: sessionStatePath(type) });
  });
}

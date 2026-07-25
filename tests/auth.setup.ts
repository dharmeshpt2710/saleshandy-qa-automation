import { test as setup } from '@playwright/test';
import fs from 'fs';
import { LoginPage } from '../src/pages/LoginPage';
import { credentialsFor } from '../src/data/credentials';
import { AccountType } from '../src/types';
import { AUTH_DIR, GoToUrl, hasFreshSession, sessionStatePath } from '../src/utils/helpers';

/**
 * Login once per account and save the session, so the real tests don't login
 * again (assignment 4.3). Each type has one pre-created account, we log into it,
 * save the browser session under .auth/ and the tests reuse that file.
 *
 * Playwright re-runs setup every time, so we also skip the login when a recent
 * session file is already there, that keeps login from repeating run after run.
 * Use FORCE_LOGIN=1 to force it. We keep three accounts because the account type
 * can't be changed once onboarded.
 */
const accountTypes: AccountType[] = ['personal', 'business', 'clients'];

for (const type of accountTypes) {
  setup(`log in ${type} account and save session`, async ({ page }) => {
    setup.skip(hasFreshSession(type), 'A recent saved session already exists');

    // Login needs a manual OTP, so give it enough time.
    setup.setTimeout(3 * 60_000);

    const { email, password } = credentialsFor(type);

    const loginPage = new LoginPage(page);
    await GoToUrl(page);
    await loginPage.login(email, password);
    await loginPage.completeOtpManually();

    fs.mkdirSync(AUTH_DIR, { recursive: true });
    await page.context().storageState({ path: sessionStatePath(type) });
  });
}

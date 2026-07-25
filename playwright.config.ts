import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Sign-up waits for the email to be typed by hand, so allow up to 3 minutes
     (a minute more than the 2-minute manual wait in SignUpPage.register). */
  timeout: 3 * 60_000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/login')`. */
    baseURL: 'https://my.saleshandy.com/login',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    headless: false,
  },

  projects: [
    // "setup" runs first. It signs up the three users once and saves their
    // sessions under .auth/. This is our implementation of assignment 4.3
    // ("create a user once and reuse it") — the sessions it writes are what
    // every real test loads instead of logging in again.
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // The real tests. They depend on "setup" so the saved sessions exist before
    // they run, which is why `npx playwright test` is a single command: Playwright
    // runs "setup" first automatically. We test on Chromium only to keep runs
    // fast; adding more browsers is just another project entry. The setup file is
    // ignored here so it doesn't run twice.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: [/auth\.setup\.ts/],
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

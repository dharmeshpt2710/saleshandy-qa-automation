import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load the pre-created account credentials from .env (copy .env.example first).
// They are read in src/data/credentials.ts and used by tests/auth.setup.ts.
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  // A full sign-up + onboarding walk-through takes a while, so allow 90s a test.
  timeout: 90_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://my.saleshandy.com/login',
    trace: 'on-first-retry',
    headless: false,
  },

  projects: [
    // Runs first. Logs into the three accounts once and saves their sessions
    // under .auth/ (assignment 4.3). Those sessions are what the real tests load
    // instead of logging in again.
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // The real tests. They depend on "setup" so the sessions exist before they
    // run, that is why `npx playwright test` is a single command. Chromium only
    // to keep runs fast, and the setup file is ignored so it doesn't run twice.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: [/auth\.setup\.ts/],
    },
  ],
});

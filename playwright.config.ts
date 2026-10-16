import { defineConfig } from '@playwright/test';

// Start the local app with `yarn dev` (or `yarn build && yarn start`) before running.
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: 'list',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    channel: 'chrome',
    viewport: { width: 1440, height: 1000 },
    locale: 'en-GB',
    timezoneId: 'Asia/Amman',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});

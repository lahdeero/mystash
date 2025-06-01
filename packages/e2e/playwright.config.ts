import { defineConfig } from '@playwright/test'

export default defineConfig({
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
})

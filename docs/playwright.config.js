const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests/e2e',
  timeout: 30 * 1000,
  retries: 0,
  reporter: [['list'], ['junit', { outputFile: 'test-results/junit-e2e.xml' }]],
  use: {
    actionTimeout: 0,
    headless: true,
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

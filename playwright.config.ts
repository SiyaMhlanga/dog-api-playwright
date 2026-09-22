import { defineConfig } from '@playwright/test';
import * as os from 'os';
import * as path from 'path';

export default defineConfig({
  testDir: './tests',

  // Keep run artifacts out of the project folder. Cloud-synced folders (OneDrive, Dropbox)
  // can lock files while Playwright is still writing them.
  outputDir: path.join(os.tmpdir(), 'dog-api-playwright-results'),

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,

  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    // The trailing slash matters: it lets tests use relative paths such as 'breed/mastiff/list'.
    baseURL: 'https://dog.ceo/api/',
  },
});

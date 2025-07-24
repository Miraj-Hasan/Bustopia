import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    videosFolder: 'cypress/videos',
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    
    // CI/CD friendly settings
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    
    // Retry failed tests in CI
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Better for CI environments
    watchForFileChanges: false,
    chromeWebSecurity: false,
    
    setupNodeEvents(on, config) {
      // Handle uncaught exceptions from WebSocket errors
      on('task', {
        log(message) {
          console.log(message);
          return null;
        }
      });
      // Add Chrome flag to ignore certificate errors
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          launchOptions.args.push('--ignore-certificate-errors');
        }
        return launchOptions;
      });
    },
  },
});

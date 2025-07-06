# Testing Documentation

## Overview

This document describes the testing setup for the Bustopia Frontend, including unit tests, integration with CI/CD pipeline, and how to run tests locally.

## Test Structure

### Unit Tests
- **Location**: `src/Pages/__tests__/` and `src/Components/__tests__/`
- **Framework**: Vitest with React Testing Library
- **Coverage**: V8 coverage reporter
- **Environment**: jsdom for DOM simulation

### Test Files
```
src/
├── Pages/__tests__/
│   ├── BuyTicket.test.jsx
│   ├── Login.test.jsx
│   ├── Register.test.jsx
│   ├── Review.test.jsx
│   ├── TicketVerification.test.jsx
│   ├── Profile.test.jsx
│   ├── ForgotPassword.test.jsx
│   ├── ResetPassword.test.jsx
│   ├── LogOut.test.jsx
│   └── VerifyEmail.test.jsx
└── Components/__tests__/
    ├── Navbar.test.jsx
    ├── Navbar.user.test.jsx
    └── ChatWidget.test.jsx
```

## Running Tests Locally

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Specific Test File
```bash
npm test -- --run Profile.test.jsx
```

## CI/CD Pipeline Integration

### GitHub Actions Workflows

#### 1. Main CI Pipeline (`.github/workflows/ci.yml`)
- **Triggers**: Push to main, Pull requests
- **Jobs**:
  - Frontend Unit Tests
  - Backend Unit Tests
  - Build and Push Docker Images
  - E2E Tests with Cypress

#### 2. Dedicated Unit Tests (`.github/workflows/unit-tests.yml`)
- **Triggers**: Push to main/develop, Pull requests, Manual dispatch
- **Features**:
  - Separate frontend/backend testing
  - Coverage reporting
  - Test artifacts upload
  - Codecov integration

### Pipeline Stages

1. **Unit Testing** (Frontend & Backend)
   - Run all unit tests
   - Generate coverage reports
   - Upload results to Codecov
   - Store test artifacts

2. **Build & Push**
   - Build Docker images
   - Push to Docker Hub
   - Cache optimization

3. **E2E Testing**
   - Start containers
   - Run Cypress tests
   - Upload test results

## Coverage Configuration

### Vitest Configuration
```javascript
// vitest.config.js
export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.js',
      ],
    },
    testTimeout: 30000,
    environment: 'jsdom',
  },
});
```

### Coverage Reports
- **Text**: Console output
- **JSON**: Machine-readable format
- **HTML**: Detailed browser report
- **LCOV**: Codecov integration

## Test Utilities

### Setup File (`src/setupTests.js`)
- Global test configuration
- Custom matchers
- Mock implementations

### Common Test Patterns

#### Component Testing
```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

test('component renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

#### API Mocking
```javascript
vi.mock('../../Api/ApiCalls', () => ({
  myApiCall: vi.fn(),
}));

import { myApiCall } from '../../Api/ApiCalls';
```

#### User Interactions
```javascript
const user = userEvent.setup({ delay: null });
await user.click(screen.getByRole('button'));
await user.type(screen.getByInput(), 'test input');
```

## Test Best Practices

### 1. Test Structure
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent
- Mock external dependencies

### 2. Async Testing
- Use `waitFor` for async operations
- Properly handle promises
- Set appropriate timeouts

### 3. Coverage Goals
- Aim for >80% line coverage
- Focus on critical business logic
- Test error scenarios

### 4. Performance
- Use `--run` flag for CI
- Parallel test execution
- Efficient mocking

## Troubleshooting

### Common Issues

#### 1. Timeout Errors
```bash
# Increase timeout in vitest.config.js
testTimeout: 30000
```

#### 2. Mock Issues
```javascript
// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

#### 3. Async Warnings
```javascript
// Wrap async operations in act()
await act(async () => {
  // async operations
});
```

### Debug Mode
```bash
# Run tests with debug output
DEBUG=vitest npm test
```

## Coverage Reports

### Local Coverage
```bash
npm run test:coverage
# Open coverage/index.html in browser
```

### CI Coverage
- Available in GitHub Actions artifacts
- Uploaded to Codecov
- Summary in pull request comments

## E2E Testing

### Cypress Tests
- **Location**: `cypress/e2e/`
- **Command**: `npm run test:e2e`
- **CI**: Runs against Docker containers

### E2E vs Unit Tests
- **Unit Tests**: Fast, isolated, focused
- **E2E Tests**: Full integration, user workflows
- **Coverage**: Complementary, not overlapping

## Continuous Integration

### Pre-commit Hooks
```bash
# Install husky for git hooks
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm test"
```

### Branch Protection
- Require unit tests to pass
- Enforce coverage thresholds
- Block merges on test failures

## Monitoring

### Test Metrics
- Test execution time
- Coverage trends
- Failure rates
- Flaky test detection

### Alerts
- Test failures in CI
- Coverage drops
- Performance regressions

## Future Improvements

### Planned Enhancements
1. **Visual Regression Testing**
   - Screenshot comparisons
   - UI component testing

2. **Performance Testing**
   - Bundle size monitoring
   - Runtime performance tests

3. **Accessibility Testing**
   - Automated a11y checks
   - Screen reader testing

4. **Contract Testing**
   - API contract validation
   - Frontend-backend compatibility

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Codecov](https://codecov.io/) 
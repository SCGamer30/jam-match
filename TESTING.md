# JamMatch Testing Guide

This document provides comprehensive information about the testing strategy and implementation for the JamMatch application.

## Overview

The JamMatch application uses a multi-layered testing approach covering:

- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints and database operations
- **End-to-End Tests**: Complete user workflows
- **Performance Tests**: Matching algorithms and AI service
- **Security Tests**: Vulnerability scanning and audits

## Test Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/__tests__/     # Component unit tests
│   │   ├── lib/__tests__/           # Utility function tests
│   │   └── app/*/__tests__/         # Page component tests
│   ├── e2e/                         # End-to-end tests
│   ├── jest.config.js               # Jest configuration
│   ├── jest.setup.js                # Test setup
│   └── playwright.config.ts         # Playwright configuration
├── backend/
│   ├── src/
│   │   ├── __tests__/               # Test setup and performance tests
│   │   ├── routes/__tests__/        # API endpoint tests
│   │   ├── services/__tests__/      # Service layer tests
│   │   ├── middleware/__tests__/    # Middleware tests
│   │   └── utils/__tests__/         # Utility function tests
│   └── jest.config.js               # Jest configuration
├── ai-service/
│   ├── test_app.py                  # Basic functionality tests
│   ├── test_ai_service.py           # Unit tests
│   └── test_performance.py          # Performance tests
└── .github/workflows/test.yml       # CI/CD pipeline
```

## Running Tests

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run type checking
npm run type-check

# Run E2E tests
npm run e2e

# Run E2E tests with UI
npm run e2e:ui
```

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run performance tests
npm run test:performance

# Run type checking
npm run type-check
```

### AI Service Tests

```bash
cd ai-service

# Run unit tests
python -m pytest test_ai_service.py -v

# Run integration tests
python test_app.py

# Run performance tests
python test_performance.py

# Run with coverage
python -m pytest test_ai_service.py --cov=app --cov-report=html
```

## Test Categories

### 1. Unit Tests

**Frontend Unit Tests:**

- Component rendering and behavior
- Utility function logic
- Form validation
- Authentication helpers
- API client functions

**Backend Unit Tests:**

- Matching algorithm calculations
- JWT token handling
- Input validation
- Database query builders
- Service layer functions

**AI Service Unit Tests:**

- Model loading and initialization
- Compatibility calculation logic
- Input validation and sanitization
- Error handling

### 2. Integration Tests

**API Integration Tests:**

- Authentication endpoints
- Profile management
- Band formation
- Chat functionality
- Matching system
- Database operations

**Database Integration Tests:**

- CRUD operations
- Relationship handling
- Transaction management
- Data integrity

### 3. End-to-End Tests

**User Workflows:**

- Registration and login flow
- Profile setup wizard
- Dashboard navigation
- Band profile viewing
- Chat functionality
- Settings management

**Cross-browser Testing:**

- Chrome, Firefox, Safari
- Mobile responsive design
- Touch interactions

### 4. Performance Tests

**Matching Algorithm Performance:**

- Compatibility calculation speed
- Large dataset handling
- Memory usage optimization
- Concurrent request handling

**AI Service Performance:**

- Response time benchmarks
- Throughput testing
- Resource utilization
- Error handling speed

### 5. Security Tests

**Automated Security Scanning:**

- Dependency vulnerability checks
- Code quality analysis
- Authentication security
- Input validation testing

## Test Data Management

### Test Fixtures

**User Profiles:**

```typescript
const mockUser: User = {
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  primary_role: "guitarist",
  instruments: ["Guitar", "Piano"],
  genres: ["Rock", "Jazz"],
  experience: "intermediate",
  location: "New York, NY",
  profile_completed: true,
};
```

**Band Data:**

```typescript
const mockBand: Band = {
  id: "test-band-id",
  name: "Test Band",
  status: "active",
  members: [mockUser],
  compatibility_data: {
    average_score: 85,
  },
};
```

### Database Seeding

For integration tests, use isolated test databases with predictable data:

```sql
-- Test user data
INSERT INTO users (id, name, email, profile_completed)
VALUES ('test-user-1', 'Test User 1', 'test1@example.com', true);

-- Test band data
INSERT INTO bands (id, name, status, member_ids)
VALUES ('test-band-1', 'Test Band', 'active', ARRAY['test-user-1']);
```

## Mocking Strategy

### Frontend Mocks

**API Calls:**

```typescript
// Mock fetch globally
global.fetch = jest.fn();

// Mock Supabase client
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    },
  },
}));
```

**Next.js Router:**

```typescript
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));
```

### Backend Mocks

**Database Operations:**

```typescript
jest.mock("../config/supabase", () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));
```

**External Services:**

```typescript
jest.mock("../services/aiService", () => ({
  calculateAICompatibility: jest.fn().mockResolvedValue({
    score: 85,
    reasoning: "Mock compatibility analysis",
  }),
}));
```

## Coverage Requirements

### Minimum Coverage Targets

- **Frontend**: 80% line coverage
- **Backend**: 85% line coverage
- **AI Service**: 75% line coverage

### Coverage Reports

Coverage reports are generated automatically and uploaded to Codecov:

```bash
# View coverage locally
npm run test:coverage
open coverage/lcov-report/index.html
```

## Continuous Integration

### GitHub Actions Workflow

The CI pipeline runs on every push and pull request:

1. **Parallel Test Execution:**

   - Frontend tests
   - Backend tests
   - AI service tests
   - Security scans

2. **End-to-End Testing:**

   - Full application stack
   - Multiple browser testing
   - Mobile responsiveness

3. **Performance Benchmarks:**
   - Matching algorithm performance
   - AI service response times
   - Memory usage validation

### Test Environment Setup

**Environment Variables:**

```bash
# Test database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jamMatch_test

# JWT secret for testing
JWT_SECRET=test-jwt-secret-key-for-testing-purposes-only

# Supabase test configuration
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key

# Node environment
NODE_ENV=test
```

## Best Practices

### Writing Tests

1. **Descriptive Test Names:**

   ```typescript
   test("should calculate compatibility score correctly for users with shared genres", () => {
     // Test implementation
   });
   ```

2. **Arrange-Act-Assert Pattern:**

   ```typescript
   test("should validate profile data", () => {
     // Arrange
     const profileData = { name: "", email: "invalid" };

     // Act
     const result = validateProfile(profileData);

     // Assert
     expect(result.isValid).toBe(false);
     expect(result.errors).toContain("Name is required");
   });
   ```

3. **Test Isolation:**

   - Each test should be independent
   - Clean up after tests
   - Use fresh data for each test

4. **Mock External Dependencies:**
   - Database calls
   - API requests
   - File system operations
   - Time-dependent functions

### Performance Testing

1. **Set Realistic Benchmarks:**

   ```typescript
   test("should process 1000 users within 5 seconds", async () => {
     const startTime = performance.now();
     await processUsers(users);
     const endTime = performance.now();

     expect(endTime - startTime).toBeLessThan(5000);
   });
   ```

2. **Memory Usage Monitoring:**
   ```typescript
   test("should not cause memory leaks", () => {
     const initialMemory = process.memoryUsage().heapUsed;

     // Perform operations

     const finalMemory = process.memoryUsage().heapUsed;
     const memoryIncrease = finalMemory - initialMemory;

     expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 100MB
   });
   ```

### E2E Testing

1. **Page Object Pattern:**

   ```typescript
   class LoginPage {
     constructor(private page: Page) {}

     async login(email: string, password: string) {
       await this.page.fill('input[name="email"]', email);
       await this.page.fill('input[name="password"]', password);
       await this.page.click('button[type="submit"]');
     }
   }
   ```

2. **Wait for Elements:**

   ```typescript
   await expect(page.locator("text=Welcome")).toBeVisible();
   await page.waitForURL("/dashboard");
   ```

3. **Mobile Testing:**
   ```typescript
   test("should work on mobile", async ({ page }) => {
     await page.setViewportSize({ width: 375, height: 667 });
     // Test mobile-specific behavior
   });
   ```

## Debugging Tests

### Frontend Debugging

```bash
# Run specific test file
npm test -- ProfileSetupWizard.test.tsx

# Run tests in debug mode
npm test -- --detectOpenHandles --forceExit

# Debug with VS Code
# Add breakpoints and use "Debug Jest Tests" configuration
```

### Backend Debugging

```bash
# Run specific test
npm test -- --testNamePattern="should calculate compatibility"

# Debug with Node.js inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Run with verbose output
npm test -- --verbose
```

### E2E Debugging

```bash
# Run with headed browser
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Generate trace
npx playwright test --trace on
```

## Troubleshooting

### Common Issues

1. **Test Timeouts:**

   - Increase timeout in Jest/Playwright config
   - Check for unresolved promises
   - Ensure proper cleanup

2. **Flaky Tests:**

   - Add proper waits for async operations
   - Use deterministic test data
   - Avoid time-dependent assertions

3. **Memory Leaks:**

   - Clear timers and intervals
   - Close database connections
   - Clean up event listeners

4. **CI/CD Failures:**
   - Check environment variables
   - Verify service dependencies
   - Review resource limits

### Getting Help

- Check test logs for detailed error messages
- Use `--verbose` flag for more information
- Review CI/CD pipeline logs
- Consult team documentation and standards

## Maintenance

### Regular Tasks

1. **Update Test Dependencies:**

   ```bash
   npm update @testing-library/react @playwright/test
   ```

2. **Review Coverage Reports:**

   - Identify untested code paths
   - Add tests for new features
   - Remove obsolete tests

3. **Performance Monitoring:**

   - Track test execution times
   - Monitor resource usage
   - Update performance benchmarks

4. **Security Updates:**
   - Update vulnerable dependencies
   - Review security test results
   - Update security policies

This comprehensive testing strategy ensures the JamMatch application maintains high quality, performance, and reliability across all components.

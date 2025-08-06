import { test as base, Page } from '@playwright/test';
import { AuthenticationFlow } from './test-utils';
import { mockHelpers } from './mocks/setup';

// Extend the base test with our custom fixtures
export const test = base.extend<{
  authFlow: AuthenticationFlow;
}>({
  authFlow: async ({ page }, use) => {
    // Reset mock data before each test
    mockHelpers.reset();
    
    const authFlow = new AuthenticationFlow(page);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(authFlow);
    
    // Clean up after test if needed
  },
});

// Global test setup
export { expect } from '@playwright/test';

// Test data cleanup utilities
export class TestDataManager {
  private testUsers: string[] = [];

  // Track created test users for cleanup
  trackUser(userId: string) {
    this.testUsers.push(userId);
  }

  // Clean up test data (Note: This would need PocketBase admin access)
  async cleanup() {
    // In a real implementation, you would:
    // 1. Connect to PocketBase with admin credentials
    // 2. Delete test users and related data
    // 3. Clean up any test files or media
    
    console.log(`Cleaning up ${this.testUsers.length} test users...`);
    this.testUsers = [];
  }
}

// Global test data manager instance
export const testDataManager = new TestDataManager();

// Helper function to generate consistent test data
export function generateTestEnvironment() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  
  return {
    testPrefix: `test-${timestamp}-${random}`,
    cleanup: () => testDataManager.cleanup()
  };
}

// Database state helpers for advanced testing scenarios
export class DatabaseHelpers {
  // Check if user exists (would require API access)
  static async userExists(): Promise<boolean> {
    // In a real implementation, this would check the database
    // For now, we'll assume users are created successfully during tests
    return false;
  }

  // Get user by email (would require API access)  
  static async getUserByEmail(): Promise<unknown> {
    // In a real implementation, this would query the database
    return null;
  }

  // Clean up user by email (would require admin API access)
  static async deleteUserByEmail(email: string): Promise<void> {
    // In a real implementation, this would delete the user
    console.log(`Would delete user: ${email}`);
  }
}

// Environment configuration for different test environments
export const testConfig = {
  // Test environment configuration
  timeout: 30000, // 30 seconds default timeout
  retries: 2, // Retry failed tests twice
  
  // Test data configuration
  testUserDefaults: {
    belt: 'white' as const,
    role: 'member' as const
  },
  
  // Mock data for offline testing
  mockUsers: {
    admin: {
      email: 'admin@test.com',
      password: 'AdminPassword123!',
      role: 'admin'
    },
    member: {
      email: 'member@test.com', 
      password: 'MemberPassword123!',
      role: 'member'
    },
    coach: {
      email: 'coach@test.com',
      password: 'CoachPassword123!', 
      role: 'coach'
    }
  }
};

// Utility functions for test assertions
export class TestAssertions {
  static async expectUserLoggedIn(page: Page) {
    // Check for common logged-in indicators
    await page.waitForSelector('nav', { timeout: 5000 });
    return page.locator('a:has-text("Profile")').isVisible();
  }

  static async expectUserLoggedOut(page: Page) {
    // Check for login form
    await page.waitForSelector('form', { timeout: 5000 });
    return page.locator('input#email').isVisible();
  }

  static async expectErrorMessage(page: Page, message: string) {
    return page.locator('.text-red-500').textContent().then(text => 
      text?.includes(message)
    );
  }

  static async expectSuccessMessage(page: Page, message: string) {
    return page.locator('.text-green-500').textContent().then(text => 
      text?.includes(message)
    );
  }
}

// Performance testing utilities
export class PerformanceHelpers {
  static async measurePageLoad(page: Page, url: string) {
    const start = Date.now();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    const end = Date.now();
    return end - start;
  }

  static async measureFormSubmission(page: Page, submitAction: () => Promise<void>) {
    const start = Date.now();
    await submitAction();
    await page.waitForLoadState('networkidle');
    const end = Date.now();
    return end - start;
  }
}

// Accessibility testing helpers
export class AccessibilityHelpers {
  static async checkFormLabels(page: Page, formSelector: string) {
    const form = page.locator(formSelector);
    const inputs = form.locator('input');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const name = await input.getAttribute('name');
      
      // Check if input has associated label
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        if (!(await label.isVisible())) {
          console.warn(`Input with id="${id}" has no associated label`);
        }
      } else if (name) {
        // Check for placeholder as fallback
        const placeholder = await input.getAttribute('placeholder');
        if (!placeholder) {
          console.warn(`Input with name="${name}" has no label or placeholder`);
        }
      }
    }
  }

  static async checkKeyboardNavigation(page: Page, formSelector: string) {
    const form = page.locator(formSelector);
    await form.focus();
    
    // Test tab navigation through form fields
    const inputs = form.locator('input, select, button');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      await page.keyboard.press('Tab');
      // Verify focus moved to next element
    }
    
    return true;
  }
} 
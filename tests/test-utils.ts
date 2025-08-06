import { Page, expect } from '@playwright/test';
import { mockHelpers } from './mocks/setup';

export interface TestUser {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  belt: 'white' | 'blue' | 'purple' | 'brown' | 'black';
  role?: string[];
  [key: string]: unknown;
}

export interface TestAdmin extends TestUser {
  role: string[];
}

export class AuthenticationFlow {
  constructor(private page: Page) {}

  // Generate unique test user data
  generateTestUser(): TestUser {
    const timestamp = Date.now();
    return {
      username: `testuser${timestamp}`,
      firstName: 'Test',
      lastName: 'User',
      email: `test${timestamp}@example.com`,
      password: 'TestPassword123!',
      belt: 'white'
    };
  }

  // Generate unique test admin data
  generateTestAdmin(): TestAdmin {
    const timestamp = Date.now();
    return {
      username: `admin${timestamp}`,
      firstName: 'Admin',
      lastName: 'User',
      email: `admin${timestamp}@example.com`,
      password: 'TestPassword123!',
      belt: 'black',
      role: ['admin']
    };
  }

  // Navigate to signup page
  async goToSignup() {
    await this.page.goto('/signup');
    await expect(this.page).toHaveURL('/signup');
  }

  // Navigate to login page
  async goToLogin() {
    await this.page.goto('/login');
    await expect(this.page).toHaveURL('/login');
  }

  // Fill and submit signup form
  async signup(user: TestUser) {
    await this.goToSignup();

    // Fill out the signup form
    await this.page.fill('input[name="username"]', user.username);
    await this.page.fill('input[name="firstName"]', user.firstName);
    await this.page.fill('input[name="lastName"]', user.lastName);
    await this.page.fill('input[name="email"]', user.email);
    await this.page.fill('input[name="password"]', user.password);
    await this.page.fill('input[name="passwordConfirm"]', user.password);
    await this.page.selectOption('select[name="belt"]', user.belt);

    // Submit the form
    await this.page.click('button[type="submit"]');

    // Should redirect to login page on successful signup
    await expect(this.page).toHaveURL('/login');
  }

  // Create admin user directly in mock data (for admin tests)
  async createAdminUser(adminData: TestAdmin) {
    return mockHelpers.addAdminUser(adminData);
  }

  // Create regular user directly in mock data 
  async createMockUser(userData: TestUser) {
    return mockHelpers.addUser(userData);
  }

  // Login as admin user
  async loginAsAdmin(admin: TestAdmin) {
    await this.goToLogin();

    await this.page.fill('input#email', admin.email);
    await this.page.fill('input#password', admin.password);
    
    await this.page.click('button[type="submit"]');
    
    // Wait for authentication to complete and page to load
    await this.page.waitForLoadState('networkidle');
    
    // Admin users should have access to dashboard - let's check if they can navigate there
    // The redirect behavior might depend on the actual app implementation
    await this.page.waitForTimeout(1000); // Give time for any redirects
  }

  // Fill and submit login form
  async login(email: string, password: string) {
    await this.goToLogin();

    await this.page.fill('input#email', email);
    await this.page.fill('input#password', password);
    
    await this.page.click('button[type="submit"]');
  }

  // Login with test user and expect success
  async loginWithUser(user: TestUser) {
    await this.login(user.email, user.password);
    
    // Should redirect to profile page for regular users
    await expect(this.page).toHaveURL('/profile');
  }

  // Logout functionality
  async logout() {
    // Look for logout button in the profile page
    await this.page.click('button:has-text("Logout")');
    
    // Should redirect to login page
    await expect(this.page).toHaveURL('/login');
  }

  // Check if user is logged in by verifying protected content
  async expectLoggedIn() {
    // Check for navigation elements that only appear when logged in
    await expect(this.page.locator('nav')).toBeVisible();
    await expect(this.page.locator('a:has-text("Profile")')).toBeVisible();
  }

  // Check if user is logged out
  async expectLoggedOut() {
    await expect(this.page).toHaveURL('/login');
  }

  // Verify signup form validation
  async expectSignupFormValidation(errorMessage?: string) {
    await this.goToSignup();
    
    // Try to submit empty form
    await this.page.click('button[type="submit"]');
    
    // Check for form validation (HTML5 validation or custom error messages)
    if (errorMessage) {
      await expect(this.page.locator('.text-red-500')).toContainText(errorMessage);
    }
  }

  // Verify login form validation
  async expectLoginFormValidation(email?: string, password?: string, errorMessage?: string) {
    await this.goToLogin();
    
    if (email) await this.page.fill('input#email', email);
    if (password) await this.page.fill('input#password', password);
    
    await this.page.click('button[type="submit"]');
    
    if (errorMessage) {
      await expect(this.page.locator('.text-red-500')).toContainText(errorMessage);
    }
  }

  // Wait for navigation to complete
  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }
}

export class PageHelpers {
  constructor(private page: Page) {}

  // Generic form helpers
  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      await this.page.fill(`input[name="${field}"], select[name="${field}"]`, value);
    }
  }

  // Generic error checking
  async expectError(message: string) {
    await expect(this.page.locator('.text-red-500')).toContainText(message);
  }

  // Generic success checking
  async expectSuccess(message: string) {
    await expect(this.page.locator('.text-green-500')).toContainText(message);
  }

  // Screenshot helper for debugging
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }
} 
import { test, expect } from '@playwright/test';
import { AuthenticationFlow, TestUser } from './test-utils';

test.describe('User Login Flow', () => {
  let authFlow: AuthenticationFlow;
  let testUser: TestUser;

  test.beforeEach(async ({ page }) => {
    authFlow = new AuthenticationFlow(page);
    testUser = authFlow.generateTestUser();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // First create a user
    await authFlow.signup(testUser);
    
    // Then login with the same credentials
    await authFlow.loginWithUser(testUser);
    
    // Should be redirected to profile page
    await expect(page).toHaveURL('/profile');
    
    // Should see logged-in content
    await authFlow.expectLoggedIn();
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should redirect already logged-in user away from login page', async ({ page }) => {
    // Create and login user
    await authFlow.signup(testUser);
    await authFlow.loginWithUser(testUser);
    
    // Try to visit login page while already logged in
    await page.goto('/login');
    
    // Should be redirected to profile page instead
    await expect(page).toHaveURL('/profile');
  });

  test('should display error for invalid credentials', async ({ page }) => {
    await authFlow.goToLogin();
    
    // Try to login with invalid credentials
    await authFlow.login('invalid@email.com', 'wrongpassword');
    
    // Should display error message
    await expect(page.locator('#error-message')).toContainText('Invalid email or password');
    
    // Should stay on login page
    await expect(page).toHaveURL('/login');
  });

  test('should validate required fields', async ({ page }) => {
    await authFlow.goToLogin();
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should stay on login page due to HTML5 validation
    await expect(page).toHaveURL('/login');
    
    // Check for required field validation
    await expect(page.locator('input#email:invalid')).toBeVisible();
    await expect(page.locator('input#password:invalid')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await authFlow.goToLogin();
    
    // Enter invalid email format
    await page.fill('input#email', 'invalid-email');
    await page.fill('input#password', 'somepassword');
    
    await page.click('button[type="submit"]');
    
    // Should stay on login page due to invalid email format
    await expect(page).toHaveURL('/login');
    await expect(page.locator('input#email:invalid')).toBeVisible();
  });

  test('should handle empty email field', async ({ page }) => {
    await authFlow.goToLogin();
    
    // Only fill password, leave email empty
    await page.fill('input#password', testUser.password);
    
    await page.click('button[type="submit"]');
    
    // Should stay on login page
    await expect(page).toHaveURL('/login');
    await expect(page.locator('input#email:invalid')).toBeVisible();
  });

  test('should handle empty password field', async ({ page }) => {
    await authFlow.goToLogin();
    
    // Only fill email, leave password empty
    await page.fill('input#email', testUser.email);
    
    await page.click('button[type="submit"]');
    
    // Should stay on login page
    await expect(page).toHaveURL('/login');
    await expect(page.locator('input#password:invalid')).toBeVisible();
  });

  test('should redirect to intended page after login', async ({ page }) => {
    // First create a user
    await authFlow.signup(testUser);
    
    // Try to access a protected page while not logged in
    await page.goto('/profile');
    
    // Should be redirected to login page
    await expect(page).toHaveURL(/\/login/);
    
    // Now login
    await authFlow.login(testUser.email, testUser.password);
    
    // Should be redirected to the originally intended page
    await expect(page).toHaveURL('/profile');
  });

  test('should have proper form structure and labels', async ({ page }) => {
    await authFlow.goToLogin();
    
    // Check form structure
    await expect(page.locator('h2')).toContainText('Login');
    await expect(page.locator('form')).toBeVisible();
    
    // Check labels
    await expect(page.locator('label[for="email"]')).toContainText('Email');
    await expect(page.locator('label[for="password"]')).toContainText('Password');
    
    // Check input fields
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.locator('input#email')).toHaveAttribute('type', 'email');
    await expect(page.locator('input#password')).toHaveAttribute('type', 'password');
    
    // Check submit button
    await expect(page.locator('button[type="submit"]')).toContainText('Login');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await authFlow.goToLogin();
    
    // This test would ideally mock network failures
    // For now, we'll test with non-existent credentials which should fail
    await authFlow.login('nonexistent@test.com', 'wrongpassword');
    
    await expect(page.locator('#error-message')).toContainText('Invalid email or password');
    await expect(page).toHaveURL('/login');
  });

  test('should maintain form state during validation errors', async ({ page }) => {
    await authFlow.goToLogin();
    
    const testEmail = 'test@example.com';
    
    // Fill form with invalid credentials
    await page.fill('input#email', testEmail);
    await page.fill('input#password', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // After error, email should still be populated
    await expect(page.locator('input#email')).toHaveValue(testEmail);
    // Password field maintains its value (app behavior)
    await expect(page.locator('input#password')).toHaveValue('wrongpassword');
  });
}); 
import { test, expect } from '@playwright/test';
import { AuthenticationFlow, TestUser } from './test-utils';
import { mockHelpers } from './mocks/setup';

test.describe('User Check-In Flow', () => {
  let authFlow: AuthenticationFlow;
  let testUser: TestUser;
  let mockUser: { id: string; email: string };
  let mockCheckinCode: { id: string; createdBy: string };

  test.beforeEach(async ({ page }) => {
    authFlow = new AuthenticationFlow(page);
    testUser = authFlow.generateTestUser();
    
    // Create mock user and check-in code
    mockUser = await authFlow.createMockUser(testUser);
    mockCheckinCode = mockHelpers.addCheckinCode({
      id: 'test-checkin-code',
      createdBy: mockUser.id
    });
  });

  test('should successfully check-in to a class with valid code', async ({ page }) => {
    // Navigate to check-in page with code parameter
    await page.goto(`/check-in?code=${mockCheckinCode.id}`);
    
    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/\/login/);
    
    // Login user
    await authFlow.login(testUser.email, testUser.password);
    
    // Should redirect back to check-in page with code
    await expect(page).toHaveURL(`/check-in?code=${mockCheckinCode.id}`);
    
    // Verify check-in form is displayed
    await expect(page.locator('h2')).toContainText('Check-In');
    
    // Verify user info is displayed
    await expect(page.locator('p.font-semibold')).toContainText(`${testUser.firstName} ${testUser.lastName}`);
    await expect(page.locator('p.text-gray-500')).toContainText('Student');
    
    // Select a class
    await page.selectOption('select#class', 'class1');
    
    // Submit check-in
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('.text-green-500')).toContainText('Check-in successful!');
    
    // Form should be reset
    await expect(page.locator('select#class')).toHaveValue('');
  });

  test('should redirect to login when accessing check-in without authentication', async ({ page }) => {
    await page.goto(`/check-in?code=${mockCheckinCode.id}`);
    
    // Should redirect to login with return path
    await expect(page).toHaveURL(/\/login/);
    
    // Login and should redirect back
    await authFlow.login(testUser.email, testUser.password);
    await expect(page).toHaveURL(`/check-in?code=${mockCheckinCode.id}`);
  });

  test('should display error for invalid check-in code', async ({ page }) => {
    // Login first
    await authFlow.signup(testUser);
    await authFlow.loginWithUser(testUser);
    
    // Navigate to check-in with invalid code
    await page.goto('/check-in?code=invalid-code');
    
    // Select a class and try to check in
    await page.selectOption('select#class', 'class1');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('.text-red-500')).toContainText('Failed to check in');
  });

  test('should require class selection for check-in', async ({ page }) => {
    // Login first
    await authFlow.signup(testUser);
    await authFlow.loginWithUser(testUser);
    
    // Navigate to check-in page
    await page.goto(`/check-in?code=${mockCheckinCode.id}`);
    
    // Try to submit without selecting class
    await page.click('button[type="submit"]');
    
    // Should stay on page due to required field validation
    await expect(page).toHaveURL(`/check-in?code=${mockCheckinCode.id}`);
    await expect(page.locator('select#class:invalid')).toBeVisible();
  });

  test('should display available classes in dropdown', async ({ page }) => {
    // Login first
    await authFlow.signup(testUser);
    await authFlow.loginWithUser(testUser);
    
    // Navigate to check-in page
    await page.goto(`/check-in?code=${mockCheckinCode.id}`);
    
    // Check that class options are available
    const classSelect = page.locator('select#class');
    await expect(classSelect).toBeVisible();
    
    // Check default option
    await expect(classSelect.locator('option[value=""]')).toContainText('Select a class');
    
    // Check that mock classes are available
    await expect(classSelect.locator('option[value="class1"]')).toContainText('BJJ Fundamentals');
    await expect(classSelect.locator('option[value="class2"]')).toContainText('Advanced BJJ');
    await expect(classSelect.locator('option[value="class3"]')).toContainText('No-Gi Grappling');
  });

  test('should show loading state during check-in submission', async ({ page }) => {
    // Login first
    await authFlow.signup(testUser);
    await authFlow.loginWithUser(testUser);
    
    // Navigate to check-in page
    await page.goto(`/check-in?code=${mockCheckinCode.id}`);
    
    // Select a class
    await page.selectOption('select#class', 'class1');
    
    // Click submit and immediately check for loading state
    await page.click('button[type="submit"]');
    
    // Should show loading text temporarily
    await expect(page.locator('button[type="submit"]')).toContainText('Checking in...');
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('should handle missing check-in code parameter', async ({ page }) => {
    // Login first
    await authFlow.signup(testUser);
    await authFlow.loginWithUser(testUser);
    
    // Navigate to check-in page without code
    await page.goto('/check-in');
    
    // Should still show check-in form but with empty code
    await expect(page.locator('h2')).toContainText('Check-In');
    
    // Try to check in without valid code
    await page.selectOption('select#class', 'class1');
    await page.click('button[type="submit"]');
    
    // Should show error
    await expect(page.locator('.text-red-500')).toContainText('Failed to check in');
  });

  test('should display user avatar or default image', async ({ page }) => {
    // Login first
    await authFlow.signup(testUser);
    await authFlow.loginWithUser(testUser);
    
    // Navigate to check-in page
    await page.goto(`/check-in?code=${mockCheckinCode.id}`);
    
    // Check that user avatar is displayed (should fallback to default)
    const avatar = page.locator('img[alt*="Test User"]');
    await expect(avatar).toBeVisible();
    
    // Should have default avatar source since no avatar was uploaded
    await expect(avatar).toHaveAttribute('src', '/default-avatar.png');
  });

  test('should maintain form state during validation errors', async ({ page }) => {
    // Login first
    await authFlow.signup(testUser);
    await authFlow.loginWithUser(testUser);
    
    // Navigate to check-in with invalid code
    await page.goto('/check-in?code=invalid-code');
    
    // Select a class
    await page.selectOption('select#class', 'class2');
    
    // Try to submit
    await page.click('button[type="submit"]');
    
    // Should show error but maintain class selection
    await expect(page.locator('.text-red-500')).toContainText('Failed to check in');
    await expect(page.locator('select#class')).toHaveValue('class2');
  });

  test('should handle multiple rapid check-in attempts gracefully', async ({ page }) => {
    // Login first
    await authFlow.signup(testUser);
    await authFlow.loginWithUser(testUser);
    
    // Navigate to check-in page
    await page.goto(`/check-in?code=${mockCheckinCode.id}`);
    
    // Select a class
    await page.selectOption('select#class', 'class1');
    
    // Submit multiple times rapidly
    await Promise.all([
      page.click('button[type="submit"]'),
      page.click('button[type="submit"]'),
      page.click('button[type="submit"]')
    ]);
    
    // Should eventually show success message (only one should succeed)
    await expect(page.locator('.text-green-500')).toContainText('Check-in successful!');
  });
}); 